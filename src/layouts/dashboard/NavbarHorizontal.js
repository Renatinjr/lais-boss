import { memo } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Container, AppBar, ListItem, Stack, Box } from '@mui/material';
// config
// components
import  NavSectionHorizontal from 'src/components/nav-section/horizontal';
//
import navConfig from './NavConfig';
import AccountPopover from './AccountPopover';

// ----------------------------------------------------------------------

const RootStyle = styled(AppBar)(({ theme }) => ({
  transition: theme.transitions.create('top', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  width: '100%',
  position: 'fixed',
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.mode === 'light' ? '#ededed' : theme.palette.grey[800],
}));

// ----------------------------------------------------------------------

function NavbarHorizontal({user}) {
  return (
    <RootStyle>
      <Container maxWidth={false}>
        <Stack direction="row" spacing={2} sx={{
          alignItems: "center"
        }}>
        <NavSectionHorizontal user={user} navConfig={navConfig} />
        <AccountPopover />
        </Stack>

  

      </Container>
    </RootStyle>
  );
}

export default memo(NavbarHorizontal);
