import NProgress from 'nprogress';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
// material
import { styled } from '@mui/material/styles';
import { CircularProgress, GlobalStyles } from '@mui/material';

// ----------------------------------------------------------------------

const nprogressStyles = (theme) => ({
  '#nprogress': {
    pointerEvents: 'none',
    '& .bar': {
      top: 0,
      left: 0,
      height: 2,
      width: '100%',
      position: 'fixed',
      zIndex: theme.zIndex?.snackbar,
      backgroundColor: theme.palette?.primary.main,
      boxShadow: `0 0 2px ${theme.palette?.primary.main}`
    },
    '& .peg': {
      right: 0,
      opacity: 1,
      width: 100,
      height: '100%',
      display: 'block',
      position: 'absolute',
      transform: 'rotate(3deg) translate(0px, -4px)',
      boxShadow: `0 0 10px ${theme.palette?.primary.main}, 0 0 5px ${theme.palette?.primary.main}`
    }
  }
});

const RootStyle = styled('div')(({ theme }) => ({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background?.default
}));

// ----------------------------------------------------------------------

function ProgressBar() {

  useMemo(() => {
    NProgress.start();
  }, []);

  useEffect(() => {
    NProgress.done();
  }, []);

  return <GlobalStyles styles={nprogressStyles} />;
}

export default function LoadingScreen({ ...other }) {
  return (
    <RootStyle {...other}>
      <ProgressBar />
      
      <CircularProgress 
        size={60} 
        thickness={4}
        sx={{ 
          color: 'primary.main'
        }} 
      />
    </RootStyle>
  );
}
