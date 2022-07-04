import React, { useState } from 'react';
import { Button as MuiButton } from '@mui/material';


const Button: React.FC<{
    onClick: () => void | Promise<void>,
    label: string,
    variant?: 'contained' | 'outlined',
    width?: number | string,
    height?: number | string,
    loading?: boolean
}> = ({ label, onClick, variant, width, height, loading }) => {

    return (
        <MuiButton
            onClick={onClick}
            variant={variant}
            disabled={loading}
            style={{ width, height }}
        >
            {loading ? 'LOADING' : label}
        </MuiButton>
    );
}

export default Button
