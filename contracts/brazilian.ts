import Base from './base';
import ContractJson from '../artifacts/contracts/BrazilianStorm.sol/BrazilianStormSportingbet.json'
const { buildEddsa } = require("circomlibjs");
import { genEcdhSharedKey } from '../utils/encryption'

const CONTRACT_ADDRESS = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'

class Contract extends Base {
    constructor() {
        super(CONTRACT_ADDRESS, ContractJson.abi)
    }

    async getUser(identityCommitment: bigint): Promise<any> {
        const contract = this.getContract()

        const user = await contract.users(identityCommitment)

        return user;
    }

    async getBalance(identityCommitment: bigint, identity: bigint): Promise<bigint> {
        const contract = this.getContract()

        const user = await contract.users(identityCommitment)

        if (!user.isActive) { throw new Error('User does not exist') }

        const plaintext = await this.decryptGroth(BigInt(user.balance), identity)

        return plaintext
    }

    async createUser(
        usernameCommitment: bigint,
        username: bigint,
        password: bigint,
        pub: Uint8Array[]
    ): Promise<void> {
        const contract = await this.getSignedContract()

        const user = await contract.usernames(usernameCommitment)

        if (user) { throw new Error('Username is taken') }

        const { a, b, c, input } = await this.grothProof(
            { username, password },
            './createUser.wasm',
            './createUser.zkey'
        )

        await contract.createUser(a, b, c, input,
            [
                Array.from(pub[0]),
                Array.from(pub[1]),
            ]
        );
    }

    async deposit(
        identityCommitment: bigint,
        identity: bigint,
        value: bigint
    ): Promise<void> {
        const contract = await this.getSignedContract()

        const user = await contract.users(identityCommitment)

        if (!user.isActive) { throw new Error('User does not exist') }

        const currentBalance = await this.decryptGroth(BigInt(user.balance), identity)

        const { a, b, c, input } = await this.grothProof(
            { identity, currentBalance, value },
            './deposit.wasm',
            './deposit.zkey'
        )

        await contract.deposit(a, b, c, input, {
            value,
            gasLimit: 2100000,
        });
    }

    async withdrawn(
        identityCommitment: bigint,
        identity: bigint,
        value: bigint
    ): Promise<void> {
        const contract = await this.getSignedContract()

        const user = await contract.users(identityCommitment)

        if (!user.isActive) { throw new Error('User does not exist') }

        const currentBalance = await this.decryptGroth(BigInt(user.balance), identity)

        const { a, b, c, input } = await this.grothProof(
            { identity, currentBalance, value },
            './withdrawn.wasm',
            './withdrawn.zkey'
        )

        await contract.withdrawn(a, b, c, input, {
            gasLimit: 2100000,
        });
    }

    async getCoordinatorPubKey(): Promise<Uint8Array[]> {
        const contract = this.getContract()

        const firstKey = [];
        const secondKey = [];

        for (var i = 0; i < 32; i++) {
            const partial = await contract.coordinatorPubKey(0, i)
            firstKey.push(partial)
        }
        for (var i = 0; i < 32; i++) {
            const partial = await contract.coordinatorPubKey(1, i)
            secondKey.push(partial)
        }


        return [new Uint8Array(firstKey), new Uint8Array(secondKey)];
    }

    async decrypt(cipher: bigint, sharedSecret: bigint): Promise<bigint> {
        const plaintext = await this.decryptGroth(cipher, sharedSecret)
        return plaintext
    }
}

export default new Contract();
