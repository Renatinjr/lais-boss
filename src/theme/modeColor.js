// For colors that pages hard-code for light mode: keep the exact light value and use the theme's
// dark-mode equivalent when dark mode is on. Use them as sx values, e.g. sx={{ bgcolor: surface('grey.50') }}.

import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

// 'grey.50' -> theme.palette.grey[50]; anything else ('#666', 'white') is returned as is
function resolve(theme, color) {
  const [group, shade] = color.split('.');
  const value = shade !== undefined ? theme.palette[group]?.[shade] : undefined;
  return value ?? color;
}

const byMode = (light, dark) => (theme) => (theme.palette.mode === 'light' ? resolve(theme, light) : dark(theme));

// light-grey panels / boxes
export const surface = (light) => byMode(light, (theme) => theme.palette.background.neutral);
// white boxes that sit on top of a surface
export const paper = (light) => byMode(light, (theme) => theme.palette.background.paper);
// light borders and dividers
export const border = (light) => byMode(light, (theme) => theme.palette.divider);
// dark body text
export const textPrimary = (light) => byMode(light, (theme) => theme.palette.text.primary);
// grey secondary text
export const textSecondary = (light) => byMode(light, (theme) => theme.palette.text.secondary);
// tinted highlight of a palette color ('primary', 'error', ...): its .lighter shade in light mode
export const tint = (color) => byMode(`${color}.lighter`, (theme) => alpha(theme.palette[color].main, 0.16));
// disabled buttons
export const disabledBackground = (light) => byMode(light, (theme) => theme.palette.action.disabledBackground);
export const disabledText = (light) => byMode(light, (theme) => theme.palette.action.disabled);
