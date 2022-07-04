import Base from './base';
import ContractJson from '../artifacts/contracts/Matches.sol/Matches.json'

const CONTRACT_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F'

class Contract extends Base {
    constructor() {
        super(CONTRACT_ADDRESS, ContractJson.abi)
    }

    async getChampionships(): Promise<any[]> {
        const contract = this.getContract()

        const championships = await contract.getChampionships()

        return championships
    }

    async getMatches(champId: number): Promise<any[]> {
        const contract = this.getContract()

        const matches = await contract.getMatches(champId)

        return matches
    }

    async getOpenChampIndex (): Promise<number> {
        const contract = this.getContract()

        const index = await contract.openChampionshipIndex()

        return index
    }
}

export default new Contract();
