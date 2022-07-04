import Base from './base';
import ContractJson from '../artifacts/contracts/Bets.sol/Bets.json'

const CONTRACT_ADDRESS = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'

class Contract extends Base {
    constructor() {
        super(CONTRACT_ADDRESS, ContractJson.abi)
    }

    async betWinner(
        identity: bigint,
        currentBalance: bigint,
        value: bigint,
        sharedSecret: bigint,
        champId: number,
        matchId: number,
        house: boolean
    ): Promise<void> {
        const { a, b, c, input } = await this.grothProof(
            { identity, currentBalance, value, sharedSecret },
            './bet.wasm',
            './bet.zkey'
        )

        const contract = await this.getSignedContract()

        await contract.betWinner(a, b, c, input, champId, matchId, house)
    }

    async betScore(
        identity: bigint,
        currentBalance: bigint,
        value: bigint,
        sharedSecret: bigint,
        champId: number,
        matchId: number,
        house: number,
        visitor: number
    ): Promise<void> {
        const { a, b, c, input } = await this.grothProof(
            { identity, currentBalance, value, sharedSecret },
            './bet.wasm',
            './bet.zkey'
        )

        const contract = await this.getSignedContract()

        await contract.betScore(a, b, c, input, champId, matchId, house, visitor)
    }

    async betGoals(
        identity: bigint,
        currentBalance: bigint,
        value: bigint,
        sharedSecret: bigint,
        champId: number,
        matchId: number,
        house: boolean,
        goals: number
    ): Promise<void> {
        const { a, b, c, input } = await this.grothProof(
            { identity, currentBalance, value, sharedSecret },
            './bet.wasm',
            './bet.zkey'
        )

        const contract = await this.getSignedContract()

        await contract.betGoals(a, b, c, input, champId, matchId, house, goals)
    }

    async claimWinnerBet(
        identity: bigint,
        currentBalance: bigint,
        value: bigint,
        sharedSecret: bigint,
        rate: number,
        champId: number,
        matchId: number,
        betId: number
    ): Promise<void> {
        const { a, b, c, input } = await this.grothProof(
            { identity, currentBalance, value, sharedSecret, rate },
            './claimBet.wasm',
            './claimBet.zkey'
        )

        const contract = await this.getSignedContract()

        await contract.claimWinnerBet(a, b, c, input, champId, matchId, betId)
    }

    async claimScoreBet(
        identity: bigint,
        currentBalance: bigint,
        value: bigint,
        sharedSecret: bigint,
        rate: number,
        champId: number,
        matchId: number,
        betId: number
    ): Promise<void> {
        const { a, b, c, input } = await this.grothProof(
            { identity, currentBalance, value, sharedSecret, rate },
            './claimBet.wasm',
            './claimBet.zkey'
        )

        const contract = await this.getSignedContract()

        await contract.claimScoreBet(a, b, c, input, champId, matchId, betId)
    }

    async claimGoalsBet(
        identity: bigint,
        currentBalance: bigint,
        value: bigint,
        sharedSecret: bigint,
        rate: number,
        champId: number,
        matchId: number,
        betId: number
    ): Promise<void> {
        const { a, b, c, input } = await this.grothProof(
            { identity, currentBalance, value, sharedSecret, rate },
            './claimBet.wasm',
            './claimBet.zkey'
        )

        const contract = await this.getSignedContract()

        await contract.claimGoalsBet(a, b, c, input, champId, matchId, betId)
    }
}

export default new Contract();
