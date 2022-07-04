import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material'

import { sha512hex, poseidonHash, genPubKey, genPrivKey } from '../utils/encryption'
import styles from '../styles/Login.module.css';
import { useAlertContext } from '../providers'
import { Input, Button } from '../components'
import { Brazilian } from '../contracts'

const { buildEddsa } = require("circomlibjs");

const Login: NextPage = () => {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { notify } = useAlertContext()
  const router = useRouter()

  const request = async (func: () => Promise<any>) => {
    if (username && password) {
      setLoading(true)
      try { await func() }
      catch (e: any) {
        console.error(e);
        notify(e.message, 'error')
      } finally { setLoading(false) }
    } else { notify('Username and password are required', 'warning') }
  }

  const onLogin = async () => {
    await request(async () => {
      const privKey = await genPrivKey(username, password)
      const ic = await poseidonHash([privKey])

      const user = await Brazilian.getUser(ic)

      if (user.isActive) {
        localStorage.setItem('identityCommitment', ic.toString())
        localStorage.setItem('identity', privKey.toString())

        router.push('/home')
      } else { notify('User does not exist', 'error') }
    })
  }

  const signup = async () => {
    await request(async () => {
      const usernameHash = await sha512hex(username)
      const passwordHash = await sha512hex(password)

      const usernameCommitment = await poseidonHash([usernameHash])

      const privKey = await poseidonHash([usernameHash, passwordHash])
      const ic = await poseidonHash([privKey])

      const eddsa = await buildEddsa()

      const pub = genPubKey(eddsa, privKey)

      await Brazilian.createUser(
        usernameCommitment,
        usernameHash,
        passwordHash,
        pub
      )

      localStorage.setItem('identityCommitment', ic.toString())
      localStorage.setItem('identity', privKey.toString())
      router.push('/home')
    })
  }

  useEffect(() => {
    const storedIdentityCommitment = localStorage.getItem('identityCommitment');
    const storedIdentity = localStorage.getItem('identity');

    if (storedIdentity && storedIdentityCommitment) {
      router.push('/home')
      return
    }

    setShowForm(true)
  }, [])

  return (
    <div className={styles.container}>
      {showForm ?
        <>
          <p>BRAZILIAN STORM SPORTINGBET</p>
          <div className={styles.inputWrapper}>
            <Input
              type='password'
              value={username}
              setValue={setUsername}
              placeholder='Username'
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              type='password'
              value={password}
              setValue={setPassword}
              placeholder='Password'
            />
          </div>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Button
                variant="contained"
                onClick={onLogin}
                label="SIGN IN"
                width={200}
                height={35}
              />
              <Button
                variant="outlined"
                onClick={signup}
                label="SIGN UP"
                width={200}
                height={35}
              />
            </>
          )}
        </>
        :
        <CircularProgress />
      }
    </div>
  )
}

export default Login
