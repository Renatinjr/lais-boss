import { GlobalStyles as MUIGlobalStyles } from '@mui/material';

// ----------------------------------------------------------------------

const globalStyles = (theme) => ({
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box'
  },
  html: {
    width: '100%',
    height: '100%',
    msTextSizeAdjust: '100%',
    WebkitOverflowScrolling: 'touch'
  },
  body: {
    width: '100%',
    height: '100%'
  },
  input: {
    '&[type=number]': {
      MozAppearance: 'textfield',
      '&::-webkit-outer-spin-button': { margin: 0, WebkitAppearance: 'none' },
      '&::-webkit-inner-spin-button': { margin: 0, WebkitAppearance: 'none' }
    }
  },
  textarea: {
    '&::-webkit-input-placeholder': { color: theme.palette.text.disabled },
    '&::-moz-placeholder': { opacity: 1, color: theme.palette.text.disabled },
    '&:-ms-input-placeholder': { color: theme.palette.text.disabled },
    '&::placeholder': { color: theme.palette.text.disabled }
  },
  a: { color: theme.palette.primary.main },
  img: { display: 'block', maxWidth: '100%' },

  // Lazy Load Img
  '.blur-up': {
    WebkitFilter: 'blur(5px)',
    filter: 'blur(5px)',
    transition: 'filter 400ms, -webkit-filter 400ms'
  },
  '.blur-up.lazyloaded ': {
    WebkitFilter: 'blur(0)',
    filter: 'blur(0)'
  },

  // ApexCharts (moved from components/charts/BaseOptionChart)
  // Tooltip
  '.apexcharts-tooltip,.apexcharts-xaxistooltip': {
    border: '0 !important',
    boxShadow: `${theme.customShadows.z24} !important`,
    color: `${theme.palette.text.primary} !important`,
    borderRadius: `${theme.shape.borderRadiusSm}px !important`,
    backgroundColor: `${theme.palette.background.default} !important`
  },
  '.apexcharts-tooltip-title': {
    border: '0 !important',
    fontWeight: theme.typography.fontWeightBold,
    backgroundColor: `${theme.palette.grey[500_16]} !important`,
    color: theme.palette.text[theme.palette.mode === 'light' ? 'secondary' : 'primary']
  },
  '.apexcharts-xaxistooltip-bottom': {
    '&:before': {
      borderBottomColor: 'transparent !important'
    },
    '&:after': {
      borderBottomColor: `${theme.palette.background.paper} !important`
    }
  },

  // Legend
  '.apexcharts-legend': {
    padding: '0 !important'
  },
  '.apexcharts-legend-series': {
    alignItems: 'center',
    display: 'flex !important'
  },
  '.apexcharts-legend-marker': {
    marginTop: '-2px !important',
    marginRight: '8px !important'
  },
  '.apexcharts-legend-text': {
    lineHeight: '18px',
    textTransform: 'capitalize'
  }
});

export default function GlobalStyles() {
  return <MUIGlobalStyles styles={globalStyles} />;
}
