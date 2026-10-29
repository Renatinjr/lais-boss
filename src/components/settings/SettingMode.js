import { Icon } from '@iconify/react';
import moonFill from '@iconify/icons-eva/moon-fill';
import sunFill from '@iconify/icons-eva/sun-fill';
import monitorFill from '@iconify/icons-eva/monitor-fill';
// material
import { Box, Grid, Radio, Paper, RadioGroup, CardActionArea, FormControlLabel } from '@mui/material';
// hooks
import useThemeMode from '../../hooks/useThemeMode';

// ----------------------------------------------------------------------

const MODE_ICONS = { light: sunFill, dark: moonFill, system: monitorFill };

export default function SettingMode() {
  const { mode: themeMode, setMode } = useThemeMode();

  return (
    <RadioGroup name="themeMode" value={themeMode} onChange={(event) => setMode(event.target.value)}>
      <Grid container spacing={2.5} dir="ltr">
        {['light', 'dark', 'system'].map((mode) => (
          <Grid key={mode} size={4}>
            <Paper
              sx={{
                width: 1,
                zIndex: 0,
                overflow: 'hidden',
                position: 'relative',
                bgcolor: mode === 'dark' ? 'grey.900' : 'common.white',
                ...(mode === 'system' && {
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.common.white} 50%, ${theme.palette.grey[900]} 50%)`
                }),
                ...(themeMode === mode && {
                  boxShadow: (theme) => theme.customShadows.z12
                })
              }}
            >
              <CardActionArea sx={{ color: 'primary.main' }}>
                <Box
                  sx={{
                    py: 4,
                    display: 'flex',
                    color: 'text.disabled',
                    justifyContent: 'center',
                    ...(themeMode === mode && {
                      color: 'primary.main'
                    })
                  }}
                >
                  <Icon icon={MODE_ICONS[mode]} width={24} height={24} />
                </Box>

                <FormControlLabel
                  label=""
                  value={mode}
                  control={<Radio sx={{ display: 'none' }} />}
                  sx={{
                    top: 0,
                    margin: 0,
                    width: '100%',
                    height: '100%',
                    position: 'absolute'
                  }}
                />
              </CardActionArea>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </RadioGroup>
  );
}
