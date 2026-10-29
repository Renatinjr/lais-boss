import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { kebabCase } from 'change-case';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import RouterLink from 'next/link';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';

import { BsXCircle, BsGear } from "react-icons/bs";
import { FiPlayCircle } from "react-icons/fi";


// ----------------------------------------------------------------------


export default function ClientesMenuActions({ onStartSession, onCloseSession }) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
       <BsGear size={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        slotProps={{
          paper: {
            sx: { width: 200, maxWidth: '100%' }
          }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* <MenuItem onClick={onDelete} sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            <Icon icon={trash2Outline} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" slotProps={{ primary: { variant: 'body2' } }} />
        </MenuItem> */}

        <MenuItem
          onClick={onCloseSession}
          sx={{ color: 'text.secondary' }}
        >
          <ListItemIcon>
          <BsXCircle color="#f03" />
          </ListItemIcon>
          <ListItemText primary="Fechar Sessão" slotProps={{
            primary: { variant: 'body2' }
          }} />
        </MenuItem>

        <MenuItem
          onClick={onStartSession}
          sx={{ color: 'text.secondary' }}
        >
          <ListItemIcon>
              <FiPlayCircle color="#008000" />
          </ListItemIcon>
          <ListItemText primary="Iniciar Sessão" slotProps={{
            primary: { variant: 'body2' }
          }} />
        </MenuItem>
      </Menu>
    </>
  );
}
