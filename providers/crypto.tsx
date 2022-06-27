import React, { createContext, useContext } from "react";
import { ethers } from 'ethers'

import { poseidonHash, genPrivKey } from '../utils/encryption'
import { decryptGroth } from '../utils/groth'
import BrazilianStorm from "../artifacts/contracts/BrazilianStormSportingbet.sol/BrazilianStormSportingbet.json"

const contractAddress = '0xa115891Cae16388b84cb7a521A2032f6b354FE25'

const CryptoContext = createContext({})

export const CryptoProvider: React.FC<{ children: any }> = ({ children }) => {
    const getProvider = (): ethers.providers.Web3Provider => {
        // @ts-ignore
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        return provider
    }

    const getContract = (): ethers.Contract => {
        const provider = getProvider()
        const brazilianStorm = new ethers.Contract(contractAddress, BrazilianStorm.abi, provider)
        return brazilianStorm
    }

    const getSignerContract = async (): Promise<ethers.Contract> => {
        const provider = getProvider()
        await provider.send('eth_requestAccounts', [])

        const signer = await provider.getSigner()

        const brazilianStorm = new ethers.Contract(contractAddress, BrazilianStorm.abi, signer)
        return brazilianStorm
    }

    const decrypt = async (ciphertext: bigint, secret: bigint): Promise<bigint> => {
        const input = await decryptGroth(ciphertext, secret)
        return BigInt(input[0])
    }

    const genCredentials = async (username: string, password: string): Promise<[bigint, bigint]> => {
        const privKey = await genPrivKey(username, password)
        const ic = await poseidonHash([privKey])

        return [ic, privKey]
    }

    return (
        <CryptoContext.Provider
            value={{
                decrypt,
                getProvider,
                getContract,
                getSignerContract,
                genCredentials,
            }}
        >
            {children}
        </CryptoContext.Provider>
    )
}

export const useCryptoContext = (): {
    decrypt: (ciphertext: bigint, secret: bigint) => Promise<bigint>,
    getProvider: () => ethers.providers.Web3Provider,
    getContract: () => ethers.Contract,
    getSignerContract: () => Promise<ethers.Contract>,
    genCredentials: (username: string, password: string) => Promise<[bigint, bigint, Uint8Array[]]>,
} => {
    const c = useContext<{ [k: string]: any }>(CryptoContext)
    return {
        decrypt: c.decrypt,
        getProvider: c.getProvider,
        getContract: c.getContract,
        getSignerContract: c.getSignerContract,
        genCredentials: c.genCredentials,
    }
}
