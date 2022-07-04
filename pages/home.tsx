import type { NextPage } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router';

import styles from '../styles/Home.module.css'
import { Button } from '../components'
import { useAlertContext } from '../providers'
import { useEffect } from 'react';
import { ethers } from 'ethers'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Brazilian } from '../contracts'
import { Deposit, MatchesDisplay, Withdrawn } from '../screens'

const Home: NextPage = () => {
  const [screen, setScreen] = useState<string>('matches');
  const [balance, setBalance] = useState<string>('-');

  const router = useRouter()
  const { notify } = useAlertContext()

  const bet = async () => {

  }

  const logout = () => {
    localStorage.removeItem('identityCommitment')
    localStorage.removeItem('identity')
    router.push('/')
  }

  useEffect(() => {
    const init = async () => {
      try {
        const storedIdentityCommitment = localStorage.getItem('identityCommitment');
        const storedIdentity = localStorage.getItem('identity');

        if (!storedIdentity || !storedIdentityCommitment) {
          logout()
          return
        }

        const b = await Brazilian.getBalance(BigInt(storedIdentityCommitment), BigInt(storedIdentity))

        setBalance(ethers.utils.formatEther(b))
      } catch (e: any) { notify(e.message, 'error') }
    }
    init()
  }, [screen])

  return (
    <div className={styles.container}>
      <div className={styles.row} style={{ justifyContent: 'space-between' }}>
        <p>{balance}  one</p>
        <div className={styles.row} style={{ width: '60%', justifyContent: 'end', gap: 10 }}>
          <Button
            onClick={() => { setScreen('matches') }}
            label='MATCHES'
          />
          <Button
            onClick={() => { setScreen('deposit') }}
            label='DEPOSIT'
          />
          <Button
            onClick={() => { setScreen('withdrawn') }}
            label='WITHDRAWN'
          />
          <Button
            onClick={() => { logout() }}
            label='LOG OUT'
          />
        </div>
      </div>
      {screen === 'matches' && <MatchesDisplay logout={logout} />}
      {screen === 'deposit' && <Deposit logout={logout} />}
      {screen === 'withdrawn' && <Withdrawn logout={logout} />}
    </div>
  )
}

// Home.getInitialProps =async (ctx) => {
//   const res = await fetch('https://api.github.com/repos/vercel/next.js')
//   const json = await res.json()
//   return { teamNames: json.stargazers_count }
// }

export default Home
