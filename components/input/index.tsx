import React, { useState } from 'react';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import styles from './Input.module.css'

const Input: React.FC<{
    placeholder: string,
    type?: 'number' | 'password' | 'text',
    value: any,
    setValue: (v: any) => void,
}> = ({ value, setValue, type, placeholder }) => {
    const [hide, setHide] = useState<boolean>(true)

    return (
        <div className={styles.Input}>
            <input
                placeholder={placeholder}
                type={type === 'password' && !hide ? 'text' : type}
                value={value}
                onChange={({ target }) => setValue(target.value)}
            />
            {type === 'password' && (hide ?
                <AiFillEye
                    onClick={() => setHide(!hide)}
                    className={styles.eye}
                />
                :
                <AiFillEyeInvisible
                    onClick={() => setHide(!hide)}
                    className={styles.eye}
                />
            )
            }
        </div>
    );
}

export default Input
