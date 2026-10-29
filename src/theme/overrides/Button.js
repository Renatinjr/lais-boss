// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'];

export default function Button(theme) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            boxShadow: 'none'
          },
          // MUI 9 removed compound slots (containedPrimary, outlinedInherit, ...); they are variants now
          variants: [
            // contained
            {
              props: { variant: 'contained', color: 'inherit' },
              style: {
                color: theme.palette.grey[800],
                boxShadow: theme.customShadows.z8,
                '&:hover': {
                  backgroundColor: theme.palette.grey[400]
                }
              }
            },
            ...COLORS.map((color) => ({
              props: { variant: 'contained', color },
              style: { boxShadow: theme.customShadows[color] }
            })),
            // outlined
            {
              props: { variant: 'outlined', color: 'inherit' },
              style: {
                border: `1px solid ${theme.palette.grey[500_32]}`,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }
            },
            {
              props: { variant: 'text', color: 'inherit' },
              style: {
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }
            }
          ]
        },
        sizeLarge: {
          height: 48
        }
      }
    }
  };
}
