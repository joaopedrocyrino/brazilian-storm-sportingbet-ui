import React, { useState } from 'react';

import styles from './button.module.css'

const Button: React.FC<{
    onClick: () => void | Promise<void>,
    label: string,
    sec?: boolean,
    width: number | string,
    height: number | string,
    loading: boolean
}> = ({ label, onClick, sec, width, height, loading }) => {
    const [isSec, setIsSec] = useState<boolean>(!!sec)

    return (
        <button
            onMouseEnter={() => setIsSec(!isSec)}
            onMouseLeave={() => setIsSec(!isSec)}
            className={`${styles.button} ${isSec ? styles.buttonSec : styles.buttonPrimary}`}
            onClick={onClick}
            style={{ width, height }}
            disabled={loading}
        >
            {loading ? 'LOADING' : label}
        </button>
    );
}

export default Button
