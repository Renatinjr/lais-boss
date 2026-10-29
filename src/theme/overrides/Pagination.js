import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Pagination(theme) {
  return {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            fontWeight: theme.typography.fontWeightBold
          },
          // MUI 9 removed the textPrimary/outlinedPrimary slots; they are variants now
          variants: [
            {
              props: { variant: 'text', color: 'primary' },
              style: {
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover, &.Mui-focusVisible': {
                    backgroundColor: `${alpha(theme.palette.primary.main, 0.24)} !important`
                  }
                }
              }
            },
            {
              props: { variant: 'outlined', color: 'primary' },
              style: {
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`
                }
              }
            }
          ]
        },
        outlined: {
          border: `1px solid ${theme.palette.grey[500_32]}`
        }
      }
    }
  };
}
