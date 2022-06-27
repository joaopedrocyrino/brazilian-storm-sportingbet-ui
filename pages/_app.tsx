import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { CryptoProvider } from '../providers'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CryptoProvider>
      <Component {...pageProps} />
    </CryptoProvider>
  )

}

export default MyApp
