import { Icon } from '@iconify/react';
import infoFill from '@iconify/icons-eva/info-fill';
import alertCircleFill from '@iconify/icons-eva/alert-circle-fill';
import alertTriangleFill from '@iconify/icons-eva/alert-triangle-fill';
import checkmarkCircle2Fill from '@iconify/icons-eva/checkmark-circle-2-fill';

// ----------------------------------------------------------------------

const SEVERITIES = ['info', 'success', 'warning', 'error'];

export default function Alert(theme) {
  const isLight = theme.palette.mode === 'light';

  const standardStyle = (color) => ({
    color: theme.palette[color][isLight ? 'darker' : 'lighter'],
    backgroundColor: theme.palette[color][isLight ? 'lighter' : 'darker'],
    '& .MuiAlert-icon': {
      color: theme.palette[color][isLight ? 'main' : 'light']
    }
  });

  const filledStyle = (color) => ({
    color: theme.palette[color].contrastText
  });

  const outlinedStyle = (color) => ({
    color: theme.palette[color][isLight ? 'darker' : 'lighter'],
    border: `solid 1px ${theme.palette[color][isLight ? 'light' : 'dark']}`,
    backgroundColor: theme.palette[color][isLight ? 'lighter' : 'darker'],
    '& .MuiAlert-icon': {
      color: theme.palette[color][isLight ? 'main' : 'light']
    }
  });

  return {
    MuiAlert: {
      defaultProps: {
        iconMapping: {
          error: <Icon icon={infoFill} />,
          info: <Icon icon={alertCircleFill} />,
          success: <Icon icon={checkmarkCircle2Fill} />,
          warning: <Icon icon={alertTriangleFill} />
        }
      },

      styleOverrides: {
        // MUI 9 removed compound slots (standardInfo, filledError, ...); they are variants now
        root: {
          variants: SEVERITIES.flatMap((severity) => [
            { props: { variant: 'standard', severity }, style: standardStyle(severity) },
            { props: { variant: 'filled', severity }, style: filledStyle(severity) },
            { props: { variant: 'outlined', severity }, style: outlinedStyle(severity) }
          ])
        },
        message: {
          '& .MuiAlertTitle-root': {
            marginBottom: theme.spacing(0.5)
          }
        },
        action: {
          '& button:not(:first-of-type)': {
            marginLeft: theme.spacing(1)
          }
        }
      }
    }
  };
}
