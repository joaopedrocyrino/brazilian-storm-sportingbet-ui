import { ethers } from 'ethers'
const { groth16 } = require("snarkjs");

class Base {
    private readonly address: string
    private readonly abi: ethers.ContractInterface

    constructor(addr: string, abi: ethers.ContractInterface) {
        this.address = addr
        this.abi = abi
    }

    protected getProvider(): ethers.providers.Web3Provider {
        // @ts-ignore
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        return provider
    }

    protected getContract() {
        const provider = this.getProvider()
        const contract = new ethers.Contract(this.address, this.abi, provider)
        return contract
    }

    protected async getSignedContract() {
        const provider = this.getProvider()
        await provider.send('eth_requestAccounts', [])

        const signer = await provider.getSigner()

        const contract = new ethers.Contract(this.address, this.abi, signer)
        return contract
    }

    protected unstringifyBigInts (
        o: string | any[] | { [k: string]: any }
      ): any {
        if (o) {
          if (
            typeof o === "string" &&
            (/^[0-9]+$/.test(o) || /^0x[0-9a-fA-F]+$/.test(o))
          ) {
            return BigInt(o);
          } else if (Array.isArray(o)) {
            return o.map(i => this.unstringifyBigInts(i));
          } else if (typeof o === "object") {
            const res: { [k: string]: any } = {};
            const keys = Object.keys(o);
            keys.forEach((k) => {
              res[k] = this.unstringifyBigInts(o[k]);
            });
            return res;
          } else {
            return o;
          }
        } else {
          return null;
        }
      };
      
      protected async grothProof (
        Input: { [k: string]: any },
        wasm: string,
        zkey: string
      ) {
        const { proof, publicSignals } = await groth16.fullProve(Input, wasm, zkey);
      
        const editedPublicSignals = this.unstringifyBigInts(publicSignals);
        const editedProof = this.unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(
          editedProof,
          editedPublicSignals
        );
      
        const argv = calldata
          .replace(/["[\]\s]/g, "")
          .split(",")
          .map((x: any) => BigInt(x).toString());
      
        const a = [argv[0], argv[1]];
        const b = [
          [argv[2], argv[3]],
          [argv[4], argv[5]],
        ];
        const c = [argv[6], argv[7]];
        const input = argv.slice(8);
      
        return { a, b, c, input };
      };
      
      protected async decryptGroth (
        ciphertext: bigint,
        secret: bigint
      ): Promise<bigint> {
        const { publicSignals } = await groth16.fullProve(
          { ciphertext, secret },
          "./decrypt.wasm",
          "./decrypt.zkey"
        );
      
        const editedPublicSignals = this.unstringifyBigInts(publicSignals);
      
        return BigInt(editedPublicSignals[0]);
      };
}

export default Base
