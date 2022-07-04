import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AlertProvider } from '../providers'

const theme = createTheme({
  palette: {
    primary: {
      main: "#9333ea",
      light: "#b06bef",
      dark: "#5e12a5"
    }
  }
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <AlertProvider>
          <Component {...pageProps} />
      </AlertProvider>
    </ThemeProvider>
  )
}

export default MyApp
