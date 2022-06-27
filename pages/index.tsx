import type { NextPage } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router';
const { buildEddsa } = require("circomlibjs");

import styles from '../styles/Login.module.css'
import { Input, Button } from '../components'
import { useCryptoContext } from '../providers'
import { sha512hex, poseidonHash, genPubKey } from '../utils/encryption'
import { grothProof } from '../utils/groth';

const Login: NextPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { getContract, genCredentials, getSignerContract } = useCryptoContext()
  const router = useRouter()

  const onLogin = async () => {
    if (username && password) {
      setLoading(true);
      try {
        const credentials = await genCredentials(username, password);

        const contract = getContract()
        const user = await contract.users(credentials[0])

        if (user.isActive) {
          localStorage.setItem('identityCommitment', credentials[0].toString())
          localStorage.setItem('identity', credentials[1].toString())

          router.push('/home')
        } else { alert('User does not exist') }
      } catch (e) { console.error(e) } finally { setLoading(false) }
    } else { alert('Username and password are required') }
  }

  const signup = async () => {
    if (username && password) {
      setLoading(true);
      try {
        const usernameHash = await sha512hex(username)
        const passwordHash = await sha512hex(password)

        const usernameCommitment = await poseidonHash([usernameHash])

        const contract = await getSignerContract()
        const user = await contract.usernames(usernameCommitment)

        if (user) {
          alert('Username is taken')
        } else {
          const { a, b, c, input } = await grothProof(
            { username: usernameHash, password: passwordHash },
            './createUser.wasm',
            './createUser.zkey'
          )

          const credentials = await genCredentials(username, password);

          const eddsa = await buildEddsa()

          const pub = genPubKey(eddsa, credentials[1])

          await contract.createUser(a, b, c, input,
            [
              Array.from(pub[0]),
              Array.from(pub[1]),
            ]
          );

          localStorage.setItem('identityCommitment', credentials[0].toString())
          localStorage.setItem('identity', credentials[1].toString())
          router.push('/home')
        }
      } catch (e) { console.error(e) } finally { setLoading(false) }
    } else { alert('Username and password are required') }
  }

  return (
    <div className={styles.container}>
      <p>BRAZILIAN STORM SPORTINGBET</p>
      <div className={styles.inputWrapper}>
        <Input
          placeholder='Username'
          type='password'
          value={username}
          setValue={setUsername}
        />
      </div>
      <div className={styles.inputWrapper}>
        <Input
          placeholder='Password'
          type='password'
          value={password}
          setValue={setPassword}
        />
      </div>
      <Button
        label="SIGN IN"
        onClick={onLogin}
        width={200}
        loading={loading}
        height={35}
      />
      <Button
        label="SIGN UP"
        onClick={signup}
        width={200}
        height={35}
        sec
        loading={loading}
      />
    </div>
  )
}

export default Login
