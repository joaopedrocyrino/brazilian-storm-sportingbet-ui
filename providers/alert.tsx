import React, { createContext, useContext, useState } from "react";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';

const AlertContext = createContext({})

export const AlertProvider: React.FC<{ children: any }> = ({ children }) => {
    const [open, setOpen] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [severity, setSeverity] = useState<'error' | 'warning' | 'info' | 'success'>()
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>(setTimeout(() => {}, 0))

    const handleClose = (event?: React.SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const notify = (message: string, severity?: 'error' | 'warning' | 'info'): void => {
        setOpen(true)
        setMessage(message)
        setSeverity(severity)
        clearTimeout(timeoutId)
        const id = setTimeout(() => { setOpen(false) }, 4000)
        setTimeoutId(id)
    }


    return (
        <AlertContext.Provider value={{ notify }}>
            {children}
            <Stack sx={{ width: '90%', position: 'absolute', bottom: 10, left: '5%' }} spacing={2}>
                {open && (
                    <Alert onClose={handleClose} severity={severity}>
                        <AlertTitle>{severity}</AlertTitle>
                        {message}
                    </Alert>
                )}
            </Stack>
        </AlertContext.Provider>
    )
}

export const useAlertContext = (): {
    notify: (message: string, severity?: 'error' | 'warning' | 'info') => void
} => {
    const c = useContext<{ [k: string]: any }>(AlertContext)
    return { notify: c.notify }
}
