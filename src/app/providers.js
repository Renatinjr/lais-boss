'use client';

// i18n
import 'src/locales/i18n';

import PropTypes from 'prop-types';
import { useSyncExternalStore } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
// material
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// redux
import { persistor, store } from 'src/redux/store';
// contexts
import { SettingsProvider } from 'src/contexts/SettingsContext';
import { ThemeModeProvider } from 'src/contexts/ThemeModeContext';
import { CollapseDrawerProvider } from 'src/contexts/CollapseDrawerContext';
import { AuthProvider } from 'src/contexts/JWTContext';
// theme
import ThemeConfig from 'src/theme';
// hooks
import useAuth from 'src/hooks/useAuth';
// components
import Settings from 'src/components/settings';
import RtlLayout from 'src/components/RtlLayout';
import ScrollToTop from 'src/components/ScrollToTop';
import LoadingScreen from 'src/components/LoadingScreen';
import NotistackProvider from 'src/components/NotistackProvider';
import ThemePrimaryColor from 'src/components/ThemePrimaryColor';
import ThemeLocalization from 'src/components/ThemeLocalization';

// ----------------------------------------------------------------------

AppShell.propTypes = {
  children: PropTypes.node
};

function AppShell({ children }) {
  const { isInitialized } = useAuth();

  return (
    <ThemeConfig>
      <ThemePrimaryColor>
        <ThemeLocalization>
          <RtlLayout>
            <NotistackProvider>
              <Settings />
              <ToastContainer />
              <ScrollToTop />
              {isInitialized ? children : <LoadingScreen />}
            </NotistackProvider>
          </RtlLayout>
        </ThemeLocalization>
      </ThemePrimaryColor>
    </ThemeConfig>
  );
}

Providers.propTypes = {
  children: PropTypes.node
};

const noopSubscribe = () => () => {};

// The app keeps auth, settings and locale in localStorage and reads them while rendering,
// so it renders on the client only (as it did as a CRA single-page app).
export default function Providers({ children }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (!isClient) {
    return null;
  }

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SettingsProvider>
            <ThemeModeProvider>
              <CollapseDrawerProvider>
                <AuthProvider>
                  <AppShell>{children}</AppShell>
                </AuthProvider>
              </CollapseDrawerProvider>
            </ThemeModeProvider>
          </SettingsProvider>
        </LocalizationProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
