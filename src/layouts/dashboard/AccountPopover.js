import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';
import homeFill from '@iconify/icons-eva/home-fill';
import personFill from '@iconify/icons-eva/person-fill';
import settings2Fill from '@iconify/icons-eva/settings-2-fill';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
// material
import { alpha } from '@mui/material/styles';
import { Button, Box, Divider, MenuItem, Typography } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useAuth from '../../hooks/useAuth';
import useIsMountedRef from '../../hooks/useIsMountedRef';
// components
import { MIconButton } from '../../components/@material-extend';
import MyAvatar from '../../components/MyAvatar';
import MenuPopover from '../../components/MenuPopover';
import { Stack } from '@mui/material';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: homeFill,
    linkTo: '/'
  },
  {
    label: 'Profile',
    icon: personFill,
    linkTo: PATH_DASHBOARD.plataforma.profile
  },
  {
    label: 'Settings',
    icon: settings2Fill,
    linkTo: PATH_DASHBOARD.plataforma.account
  }
];

// ----------------------------------------------------------------------

export default function AccountPopover({show}) {
  const anchorRef = useRef(null);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      if (isMountedRef.current) {
        handleClose();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout', { variant: 'error' });
    }
  };

  return (
    <Stack direction="column" spacing={2}>
      {show && (
      <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
      {user.email}
    </Typography>
      )}

      <Button fullWidth variant="text" color="error" onClick={handleLogout}>
        Sair
      </Button>


    </Stack>
  );
}
