import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { kebabCase } from 'change-case';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import RouterLink from 'next/link';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
import CloseIcon from '@mui/icons-material/Close';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import axios from 'axios';
import actionAdminActionCliente from 'src/actions/clientes/actionAdminActionCliente';

import { ToastContainer, toast } from 'react-toastify';
// ----------------------------------------------------------------------

UserMoreMenu.propTypes = {
  userId: PropTypes.string,
  onDelete: PropTypes.func,
  userName: PropTypes.string,
  onBlock: PropTypes.func,  // Adicionando o prop onBlock para tratar o bloqueio
  onCallback: PropTypes.func, // Adicionando o prop onCallback como opcional
  clienteId: PropTypes.string
};

export default function UserMoreMenu({ onDelete, userId, onBlock, onCallback, userName }) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleBlock = (isBlock) => {
    if (onBlock) {
      onBlock(isBlock); // Executa a função de bloqueio passada como prop
    }
    if (onCallback) {
      onCallback(); // Executa o callback opcional
    }
    setIsOpen(false); // Fecha o menu
  };

  const handleDeleteUser = async () => {
      const data = {
        scope: {
          descontinuado: false
        }
      };
  
    console.log('Tentando excluir cliente:', userId);
    console.log('Payload enviado para API:', data);
  
    try {
      const response = await actionAdminActionCliente(userId, data); // Use o `userId` diretamente
      console.log('Resposta da API:', response);
  
      if (response.status === 200) {
        const status = response.data?.scope?.descontinuado; // Verifica o status retornado da API
        console.log(`Status de descontinuado para o cliente ${userId}:`, status);
  
        toast.success('Cliente excluído com sucesso!');
        if (onDelete) {
          onDelete(); // Opcionalmente, chama a função de callback passada como prop
        }
      } else {
        toast.error('Erro ao descontinuar cliente.');
      }
    } catch (error) {
      console.error('Erro ao descontinuar cliente:', error);
      toast.error('Erro ao descontinuar cliente.');
    }
  };
  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          component={RouterLink}
          href={`${PATH_DASHBOARD.plataforma.root}/${kebabCase(userName)}/editar`}
          sx={{ color: 'text.secondary' }}
        >
          <ListItemIcon>
            <Icon icon={editFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Editar" slotProps={{
            primary: { variant: 'body2' }
          }} />
        </MenuItem>
  
        <MenuItem onClick={() => handleBlock(true)} sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            <DoDisturbIcon width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Bloquear" slotProps={{
            primary: { variant: 'body2' }
          }} />
        </MenuItem>
  
        <MenuItem onClick={() => handleBlock(false)} sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            <TaskAltIcon width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Desbloquear" slotProps={{
            primary: { variant: 'body2' }
          }} />
        </MenuItem>
        {/* <MenuItem onClick={() => handleDeleteUser(userName)} sx={{ color: 'text.secondary' }}>
  <ListItemIcon>
    <CloseIcon width={24} height={24} />
  </ListItemIcon>
  <ListItemText primary="Excluir Cliente" primaryTypographyProps={{ variant: 'body2' }} />
</MenuItem> */}
      </Menu>
    </>
  );
}