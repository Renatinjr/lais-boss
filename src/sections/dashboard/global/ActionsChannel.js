import {
    Box,
    Card,
    Grid,
    Stack,
    Switch,
    TextField,
    Typography,
    FormControlLabel,
    Container,
    Menu,
    MenuItem,
    Button
} from '@mui/material';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import Iconify from 'src/components/Iconify';

// actions
import fecharSessaoWhatsapp from 'src/actions/clientes/fecharSessaoWhatsapp';
import iniciarSessaoWhatsapp from 'src/actions/clientes/iniciarSessaoWhatsapp';
import actionDeletarCacheRedis from 'src/actions/admin/actionDeletarCacheRedis';

export default function ActionsChannel({data}) {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleStartSession = async () => {
        try {
            iniciarSessaoWhatsapp(data?.pod, data?.sessao, data?.token)     
           } catch(error) {
            alert('Erro ao fechar sessão!');
        }
        
    };

    const handleCloseSession = async () => {
        try {
            await fecharSessaoWhatsapp(data?.pod, data?.sessao, data?.token)
        } catch(error) {
            alert('Erro ao fechar sessão!');
        }
    };

    const handleDeleteCacheRedis = async () => {
        try {
            const response = await actionDeletarCacheRedis(data?.sessao);
            if (response.status === 200) {
                alert('Cache deletado com sucesso!');
            }
        } catch (error) {
            alert('Erro ao deletar cache!');
        }
    };



    return (
        <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
        }}>
            <div>
                <Button
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <Iconify icon="bi:three-dots" sx={{ color: (theme) => (theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.text.primary) }} />
                </Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                        list: {
                            'aria-labelledby': 'basic-button',
                        }
                    }}
                >
                    <MenuItem onClick={handleCloseSession}>Fechar Sessao</MenuItem>
                    <MenuItem onClick={handleStartSession}>Iniciar Sessao</MenuItem>
                    <MenuItem onClick={handleDeleteCacheRedis}>Limpar cache</MenuItem>
                </Menu>
            </div>
        </Stack>
    );
}