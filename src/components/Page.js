import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';
import { forwardRef, useEffect, useCallback } from 'react';
// material
import { Box } from '@mui/material';
// utils
import track from '../utils/analytics';

// ----------------------------------------------------------------------

const Page = forwardRef(({ children, title = '', ...other }, ref) => {
  const pathname = usePathname();

  const sendPageViewEvent = useCallback(() => {
    track.pageview({
      page_path: pathname
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sendPageViewEvent();
  }, [sendPageViewEvent]);

  return (
    <Box ref={ref} {...other}>
      <title>{title}</title>
      {children}
    </Box>
  );
});

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string
};

export default Page;
