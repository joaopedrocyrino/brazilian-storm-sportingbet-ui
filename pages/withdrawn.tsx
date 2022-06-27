import type { NextPage } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router';

import styles from '../styles/Deposit.module.css'
import { Input, Button } from '../components'
import { useCryptoContext } from '../providers'
import { grothProof, decryptGroth } from '../utils/groth';

const Withdrawn: NextPage = () => {
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { getSignerContract } = useCryptoContext()
  const router = useRouter()

  const withdrawn = async () => {
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

      await contract.withdrawn(a, b, c, input, { gasLimit: 210000 });

      router.push('/home')
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className={styles.container}>
      <p>WITHDRAWN</p>
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
        onClick={withdrawn}
        loading={loading}
      />
    </div>
  )
}

export default Withdrawn
