
import { useState } from 'react';
import { useSnackbar } from 'notistack5';
import {useNavigate } from "react-router-dom";

import React from 'react'

import {
  Link,
  Stack,
  Alert,
  Checkbox,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Grid
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';

import { Icon } from '@iconify/react';

import jwtDecode from "jwt-decode";
import closeFill from '@iconify/icons-eva/close-fill';

// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
//
import { MIconButton } from '../../@material-extend';

// ----------------------------------------------------------------------

import loginAdmin from 'src/actions/admin/login';

export default function LoginForm() {
  const navigate = useNavigate ();
  const { login } = useAuth();
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = React.useState(false);

  const [email, setEmail] = useState('ojoaoteixeira@outlook.com');
  const [senha, setSenha] = useState('123456');


  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

async function onLogin() {
  setLoading(true);
 
  try {
       const resLogin = await login(email, senha);

       if(resLogin.data.password === 'Wrong password.') {
        setLoading(false);
        enqueueSnackbar('Sennha Incorreta', {
          variant: 'error',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
      }
    
      

  } catch(e) {
    setLoading(false);
    enqueueSnackbar('Sennha Incorreta', {
      variant: 'error',
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
      console.log(e)
  }
};

  return (
   <Stack>
        <Stack spacing={3}>
          <TextField
            fullWidth
            //autoComplete="username"
            type="email"
            label="Email"
            onChange={event => setEmail(event.target.value)}
   
          />

          <TextField
            fullWidth
           // autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="Senha"
            onChange={event => setSenha(event.target.value)}      
          />
        </Stack>


        <LoadingButton onClick={onLogin} sx={{mt:2}} loading={loading} fullWidth size="large" variant="contained" >
          Login
        </LoadingButton>
</Stack>
  );
}
