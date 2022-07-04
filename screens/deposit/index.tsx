import React, { useState } from 'react';
import { ethers } from 'ethers'

import styles from './deposit.module.css'
import { Brazilian } from '../../contracts'
import { Button, Input } from '../../components';

const Deposit: React.FC<{ logout: Function }> = ({ logout }) => {
    const [amount, setAmount] = useState<number>(0);

    const deposit = async () => {
        const storedIdentityCommitment = localStorage.getItem('identityCommitment');
        const storedIdentity = localStorage.getItem('identity');

        if (!storedIdentity || !storedIdentityCommitment) {
            logout()
            return
        }

        await Brazilian.deposit(
            BigInt(storedIdentityCommitment),
            BigInt(storedIdentity),
            ethers.utils.parseEther(amount.toString()).toBigInt()
        )
    }

    return (
        <div className={styles.deposit}>
            <div className={styles.inputWrapper}>
                <Input
                    type='number'
                    value={amount}
                    setValue={setAmount}
                    placeholder='Amount'
                />
            </div>
            <Button
                onClick={deposit}
                label='DEPOSIT FUNDS'
                width={200}
                height={35}
                variant="contained"
            />
        </div>
    );
}

export default Deposit
