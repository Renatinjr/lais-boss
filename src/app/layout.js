import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
// scroll bar
import 'simplebar-react/dist/simplebar.min.css';
// slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// toast
import 'react-toastify/dist/ReactToastify.css';
// background before the app mounts, per theme mode
import './theme-mode.css';

import Providers from './providers';
import { themeModeScript } from './theme-mode-script';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Boss',
  authors: [{ name: 'Minimal UI Kit' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: { url: '/favicon/apple-touch-icon.png', sizes: '180x180' }
  }
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeModeScript }} />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
