import type { NextPage } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router';

import styles from '../styles/Home.module.css'
import { Input } from '../components'
import { useCryptoContext } from '../providers'
import { useEffect } from 'react';
import { ethers } from 'ethers'

const Home: NextPage = () => {
  const [balance, setBalance] = useState<bigint>(0n);
  const [matches, setmatches] = useState<any[]>([]);
  const { getContract, decrypt } = useCryptoContext()
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('identityCommitment')
    localStorage.removeItem('identity')
    router.push('/')
  }

  useEffect(() => {
    const init = async () => {
      const storedIdentityCommitment = localStorage.getItem('identityCommitment');
      const storedIdentity = localStorage.getItem('identity');

      if (!storedIdentity || !storedIdentityCommitment) {
        logout()
        return
      }

      const contract = getContract()

      const user = await contract.users(storedIdentityCommitment)
      if (!user.isActive) {
        logout()
        return
      }

      const plaintext = await decrypt(BigInt(user.balance), BigInt(storedIdentity))

      setBalance(plaintext)

      const m = await contract.getMatches();

      setmatches(m)
    }
    init()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.row} style={{ justifyContent: 'space-between' }}>
        <p>{ethers.utils.parseEther(balance.toString()).toString()} one</p>
        <div className={styles.row} style={{ width: '50%', justifyContent: 'space-between' }}>
          <p onClick={() => router.push('/deposit')} className={styles.link}>DEPOSIT</p>
          <p onClick={() => router.push('/withdrawn')} className={styles.link}>WITHDRAWN</p>
          <p onClick={logout} className={styles.logout}>LOG OUT</p>
        </div>
      </div>
      <div className={styles.content}>
        {matches.map((match, i) => {
          return (
            <div className={styles.match} key={i}>
              <p>{match.house}</p>
              <p>{match.visitor}</p>
              <p>{new Date(Number(match.limitTime)).toLocaleDateString()}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Home
