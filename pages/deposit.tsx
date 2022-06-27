import type { NextPage } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router';

import styles from '../styles/Deposit.module.css'
import { Input, Button } from '../components'
import { useCryptoContext } from '../providers'
import { useEffect } from 'react';
import { grothProof, decryptGroth } from '../utils/groth';
import { ethers } from 'ethers'

const Deposit: NextPage = () => {
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const {  getSignerContract } = useCryptoContext()
  const router = useRouter()

  const deposit = async () => {
    try {
      setLoading(true)
      const contract = await getSignerContract()

      const user = await contract.users(localStorage.getItem('identityCommitment'))

      if (!user.isActive) { throw new Error() }

      const identity = BigInt(localStorage.getItem('identity') ?? 0)

      const currentBalance = (await decryptGroth(BigInt(user.balance), BigInt(identity)))[0]

      const { a, b, c, input } = await grothProof(
        { identity, currentBalance, value: value },
        './deposit.wasm',
        './deposit.zkey'
      )

      await contract.deposit(a, b, c, input, {
        value: value,
        gasLimit: 2100000,
      });

      router.push('/home')
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className={styles.container}>
      <p>DEPOSIT</p>
      <div className={styles.inputWrapper}>
        <Input
          placeholder='amount one'
          value={value}
          setValue={setValue}
        />
      </div>
      <Button
        label="TRANSFER FUNDS"
        width={200}
        height={35}
        sec
        onClick={deposit}
        loading={loading}
      />
    </div>
  )
}

export default Deposit
