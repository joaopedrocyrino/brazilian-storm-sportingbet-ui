// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import BrazilianStorm from "../../artifacts/contracts/BrazilianStormSportingbet.sol/BrazilianStormSportingbet.json"
import { Contract, providers, utils } from "ethers"
import { unstringifyBigInts } from '../../utils/groth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = JSON.parse(req.body)
  console.log("req.body: ", req.body)

  const contract = new Contract("0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", BrazilianStorm.abi)
  const provider = new providers.JsonRpcProvider("http://localhost:8545")

  const contractOwner = contract.connect(provider.getSigner())

  try {
    const prevUser: boolean = await contractOwner.usernames(BigInt(username))

    res.status(200).json({ prevUser })
  } catch (error: any) {
    console.log(error)
    const { message } = JSON.parse(error.body).error
    const reason = message.substring(message.indexOf("'") + 1, message.lastIndexOf("'"))

    res.status(500).send(reason || "Unknown error!")
  }
}
