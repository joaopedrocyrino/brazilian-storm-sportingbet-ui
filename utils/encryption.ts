import * as crypto from "crypto";
const { buildBabyjub, buildPoseidon } = require("circomlibjs");

const createBlakeHash = require("blake-hash");
const ff = require("ffjavascript");
const F1Field = require("ffjavascript").F1Field;
// const Scalar = require("ffjavascript").Scalar;

export const SNARK_FIELD_SIZE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
// exports.p = Scalar.fromString(SNARK_FIELD_SIZE.toString());

export const Fr = new F1Field(SNARK_FIELD_SIZE);

export type PrivKey = bigint;
export type PubKey = Uint8Array[];
export type EcdhSharedKey = bigint;

export interface Keypair {
  privKey: PrivKey;
  pubKey: PubKey;
}

// An EdDSA signature.
export interface Signature {
  R8: BigInt[];
  S: BigInt;
}

export interface EdDSA {
  prv2pub: (prv: string) => Uint8Array[];
  pruneBuffer: () => Uint8Array;
  signPoseidon: (privKey: PrivKey, msg: bigint[]) => Signature;
  verifyPoseidon: (
    msg: bigint[],
    signature: Signature,
    pubKey: PubKey
  ) => boolean;
}

/**
 * A TypedArray object describes an array-like view of an underlying binary data buffer.
 */
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

/**
 * Convert TypedArray object(like data buffer) into bigint
 */
export const buf2Bigint = (buf: ArrayBuffer | TypedArray | Buffer): bigint => {
  let bits = 8n;
  if (ArrayBuffer.isView(buf)) bits = BigInt(buf.BYTES_PER_ELEMENT * 8);
  else buf = new Uint8Array(buf);

  let ret = 0n;
  for (const i of (buf as TypedArray | Buffer).values()) {
    const bi = BigInt(i);
    ret = (ret << bits) + bi;
  }
  return ret;
};

export const poseidonHash = async (elements: any[]): Promise<bigint> => {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  return F.toObject(poseidon(elements));
};

export const sha512hex = async (secret: string): Promise<bigint> => {
  return await poseidonHash([
    `0x${crypto.createHash("sha512").update(secret).digest("hex")}`,
  ]);
};

export const genPrivKey = async (
  username: string,
  password: string
): Promise<PrivKey> => {
  const usernameHash = await sha512hex(username);

  const passwordHash = await sha512hex(password);

  return await poseidonHash([usernameHash, passwordHash]);
};

export const formatPrivKey = (eddsa: any, privKey: PrivKey) => {
  const sBuff = eddsa.pruneBuffer(
    createBlakeHash("blake512")
      .update(Buffer.from(privKey.toString()))
      .digest()
      .slice(0, 32)
  );
  const s = ff.utils.leBuff2int(sBuff);
  return ff.Scalar.shr(s, 3);
};

export const genPubKey = (eddsa: EdDSA, privKey: PrivKey): Uint8Array[] => {
  return eddsa.prv2pub(privKey.toString());
};

export const genKeypair = async (
  eddsa: EdDSA,
  username: string,
  password: string
): Promise<Keypair> => {
  const privKey = await genPrivKey(username, password);
  const pubKey = genPubKey(eddsa, privKey);

  const Keypair: Keypair = { privKey, pubKey };

  return Keypair;
};

/*
 * Generates an Elliptic-curve Diffie–Hellman shared key given a private key
 * and a public key.
 */
export const genEcdhSharedKey = async ({
  eddsa,
  privKey,
  pubKey,
}: {
  eddsa: EdDSA;
  privKey: PrivKey;
  pubKey: PubKey;
}): Promise<EcdhSharedKey> => {
  const babyJub = await buildBabyjub();

  return buf2Bigint(
    babyJub.mulPointEscalar(pubKey, formatPrivKey(eddsa, privKey))[0]
  );
};
