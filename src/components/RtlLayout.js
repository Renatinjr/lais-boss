import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
// rtl
import rtlPlugin from 'stylis-plugin-rtl';
// emotion
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
// material
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

RtlLayout.propTypes = {
  children: PropTypes.node
};

export default function RtlLayout({ children }) {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  useEffect(() => {
    document.dir = theme.direction;
  }, [theme.direction]);

  // LTR uses the app-wide emotion cache from AppRouterCacheProvider; RTL needs its own cache with the rtl plugin
  const cacheRtl = useMemo(() => (isRtl ? createCache({ key: 'rtl', stylisPlugins: [rtlPlugin] }) : null), [isRtl]);

  if (!isRtl) {
    return <>{children}</>;
  }

  return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
}
