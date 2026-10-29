import { useState } from 'react';
import { Outlet } from 'react-router-dom';
// material
import { styled, useTheme } from '@material-ui/core/styles';
// hooks
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import { MHidden } from 'src/components/@material-extend';
import Iconify from 'src/components/Iconify';
import { IconButton, Stack, Box } from '@mui/material';
import NavbarHorizontal from './NavbarHorizontal';
import useAuth from 'src/hooks/useAuth';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',

});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingBottom: theme.spacing(10),
  marginTop: APP_BAR_MOBILE + 20,

}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const theme = useTheme();
  const { collapseClick } = useCollapseDrawer();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <RootStyle>




      <MHidden width="lgUp">
        <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
        <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
      </MHidden>

      <MHidden width="lgDown">
        <NavbarHorizontal user={user} />
      </MHidden>



      <MainStyle>
        <Outlet />
      </MainStyle>





    </RootStyle>
  );
}
