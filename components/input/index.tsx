import React, { useState } from 'react';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import styles from './Input.module.css'
import { IconButton, InputAdornment, TextField } from '@mui/material';

const Input: React.FC<{
    placeholder: string,
    type?: 'number' | 'password' | 'text',
    value: any,
    setValue: (v: any) => void,
}> = ({ value, setValue, type, placeholder }) => {
    const [focus, setFocus] = useState<boolean>(false)
    const [hide, setHide] = useState<boolean>(true)

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault();
        setValue(e.target.value)
    }

    return (
        <TextField
            className={styles.Input}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            type={type === 'password' && !hide ? 'text' : type}
            label={placeholder}
            value={value}
            onChange={onChange}
            InputProps={{
                endAdornment: type === 'password' && (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => setHide(!hide)}
                            onMouseDown={e => e.preventDefault()}
                            edge="end"
                        >
                            {hide ? (
                                <AiFillEye
                                    onClick={() => setHide(!hide)}
                                    className={`${styles.eye} ${focus ? styles.active : ''}`}
                                />
                            ) : (
                                <AiFillEyeInvisible
                                    onClick={() => setHide(!hide)}
                                    className={`${styles.eye} ${focus ? styles.active : ''}`}
                                />
                            )}
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
}

export default Input
