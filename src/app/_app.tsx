import '../globals.css';
import type { AppProps } from 'next/app';
import { LocaleProvider } from '../context/LocaleContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LocaleProvider>
      <Component {...pageProps} />
    </LocaleProvider>
  );
}

export default MyApp; 