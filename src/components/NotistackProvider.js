import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { SnackbarProvider, MaterialDesignContent } from 'notistack';
import infoFill from '@iconify/icons-eva/info-fill';
import alertCircleFill from '@iconify/icons-eva/alert-circle-fill';
import alertTriangleFill from '@iconify/icons-eva/alert-triangle-fill';
import checkmarkCircle2Fill from '@iconify/icons-eva/checkmark-circle-2-fill';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

const StyledContent = styled(MaterialDesignContent)(({ theme }) => {
  const isLight = theme.palette.mode === 'light';

  const createStyle = {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper
  };

  return {
    width: '100%',
    padding: theme.spacing(1.5),
    margin: theme.spacing(0.25, 0),
    boxShadow: theme.customShadows.z8,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.grey[isLight ? 0 : 800],
    backgroundColor: theme.palette.grey[isLight ? 900 : 0],
    '& #notistack-snackbar': {
      padding: 0,
      fontWeight: theme.typography.fontWeightMedium
    },
    // action container (sibling after the message; it has no stable class name in notistack v3)
    '& #notistack-snackbar ~ div': {
      marginRight: -4,
      '& svg': {
        width: 20,
        height: 20,
        opacity: 0.48,
        '&:hover': { opacity: 1 }
      }
    },
    '&.notistack-MuiContent-info, &.notistack-MuiContent-success, &.notistack-MuiContent-warning, &.notistack-MuiContent-error': createStyle
  };
});

// ----------------------------------------------------------------------

SnackbarIcon.propTypes = {
  icon: PropTypes.object,
  color: PropTypes.string
};

function SnackbarIcon({ icon, color }) {
  return (
    <Box
      component="span"
      sx={{
        mr: 1.5,
        width: 40,
        height: 40,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        color: `${color}.main`,
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.16)
      }}
    >
      <Icon icon={icon} width={24} height={24} />
    </Box>
  );
}

NotistackProvider.propTypes = {
  children: PropTypes.node
};

export default function NotistackProvider({ children }) {
  return (
    <SnackbarProvider
      dense
      maxSnack={5}
      // preventDuplicate
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      iconVariant={{
        success: <SnackbarIcon icon={checkmarkCircle2Fill} color="success" />,
        error: <SnackbarIcon icon={infoFill} color="error" />,
        warning: <SnackbarIcon icon={alertTriangleFill} color="warning" />,
        info: <SnackbarIcon icon={alertCircleFill} color="info" />
      }}
      Components={{
        default: StyledContent,
        info: StyledContent,
        success: StyledContent,
        warning: StyledContent,
        error: StyledContent
      }}
    >
      {children}
    </SnackbarProvider>
  );
}
