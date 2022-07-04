import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AlertProvider } from '../providers'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache()
});

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
    <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <AlertProvider>
          <Component {...pageProps} />
      </AlertProvider>
    </ThemeProvider>
    </ApolloProvider>
  )
}

export default MyApp
