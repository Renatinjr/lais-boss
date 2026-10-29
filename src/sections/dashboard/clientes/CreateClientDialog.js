import PropTypes from 'prop-types';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
// material
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
// actions
import criarUsuario from 'src/actions/criarUsuario';
import { disabledBackground, disabledText, textSecondary } from 'src/theme/modeColor';

// ----------------------------------------------------------------------

const getProvedor = (provedor) => {
    return provedor === 'all' ? 'zapchat' : provedor;
};

const normalizeInput = (input) => {
    return input
        .toLowerCase() // Converte para letras minúsculas
        .normalize('NFD') // Normaliza o texto para decompor caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
        .replace(/[0-9]/g, '') // Remove os números
        .replace(/[^a-z]/g, ''); // Remove quaisquer caracteres que não sejam letras
};

CreateClientDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    listaServidores: PropTypes.array,
    user: PropTypes.object
};

// The form state lives here (not in the clients page) so typing only re-renders this dialog,
// not the whole client list behind it.
export default function CreateClientDialog({ open, onClose, listaServidores, user }) {
    const [newUserName, setNewUserName] = useState('');
    const [newUser, setNewUser] = useState('');
    const [newUserNumber, setNewUserNumber] = useState('');
    const [newUserServer, setNewUserServer] = useState('');

    const handleClose = onClose;

    const handleCreateUser = async () => {
        try {
            const response = await criarUsuario({
                scope: {
                    nome: newUserName,
                    usuario: newUser,
                    numero: newUserNumber,
                    isMarketplace: false,
                    provedor: getProvedor(user.provedor),
                    clienteIds: [],
                    clientePaiId: null,
                    server: newUserServer,
                    isHub: false
                }
            });

            if (response.status === 200) {
                onClose();
                toast.success('Usuário criado com sucesso!');
            }
        } catch (error) {
            toast.error('Erro ao criar usuário');
        }
    };

    return (
    <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
            paper: {
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
            }
        }}
    >
        <DialogTitle sx={{ 
            pb: 1,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.25rem'
        }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}>
                <Icon icon="mdi:account-plus" width={24} height={24} />
                Criar Novo Cliente
            </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
            <DialogContentText sx={{ mb: 3, color: textSecondary('#666'), fontSize: '0.95rem' }}>
                Preencha os dados abaixo para criar um novo cliente no sistema
            </DialogContentText>
            
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                autoFocus
                label="Nome do Cliente"
                type="text"
                fullWidth
                    variant="outlined"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                    slotProps={{
                        input: {
                            startAdornment: <Icon icon="mdi:account" width={20} height={20} style={{ marginRight: 8, color: '#666' }} />
                        }
                    }}
                />
                
            <TextField
                    label="Nome de Usuário"
                    helperText="Nome de usuário único (apenas letras minúsculas). Exemplo: lojadofulano"
                type="text"
                fullWidth
                    variant="outlined"
                value={newUser}
                    onChange={(e) => setNewUser(normalizeInput(e.target.value))}
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                    slotProps={{
                        input: {
                            startAdornment: <Icon icon="mdi:at" width={20} height={20} style={{ marginRight: 8, color: '#666' }} />
                        }
                    }}
                />
                
            <TextField
                label="Número do Cliente"
                type="text"
                fullWidth
                    variant="outlined"
                value={newUserNumber}
                onChange={(e) => setNewUserNumber(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                    slotProps={{
                        input: {
                            startAdornment: <Icon icon="mdi:phone" width={20} height={20} style={{ marginRight: 8, color: '#666' }} />
                        }
                    }}
                />
                
                <FormControl fullWidth variant="outlined">
                    <InputLabel>Servidor (POD)</InputLabel>
                    <Select
                value={newUserServer}
                onChange={(e) => setNewUserServer(e.target.value)}
                        label="Servidor (POD)"
                        startAdornment={<Icon icon="mdi:server" width={20} height={20} style={{ marginRight: 8, color: '#666' }} />}
                        sx={{
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderRadius: 2
                            }
                        }}
                    >
                {listaServidores && listaServidores.length > 0 ? (
                    listaServidores
                        .filter((server) => user?.provedor === 'eva' ? server.pod === 'eva' : true)
                        .map((server) => (
                                    <MenuItem key={server._id} value={server.pod}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1
                                            }}>
                                            <Chip 
                                                label={server.pod} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined"
                                            />
                                        </Box>
                                    </MenuItem>
                        ))
                ) : (
                            <MenuItem value="" disabled>
                        Nenhum servidor disponível
                            </MenuItem>
                )}
                    </Select>
                </FormControl>
            </Box>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
                onClick={handleClose} 
                variant="outlined"
                sx={{ borderRadius: 2, px: 3 }}
            >
                Cancelar
            </Button>
            <Button 
                onClick={handleCreateUser} 
                variant="contained"
                disabled={!newUserName || !newUser}
                sx={{ 
                    borderRadius: 2, 
                    px: 3,
                    color: 'white',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)'
                    },
                    '&:disabled': {
                        background: disabledBackground('#e0e0e0'),
                        color: disabledText('#9e9e9e')
                    }
                }}
            
          
            >
                <Icon icon="mdi:check" width={20} height={20} style={{ marginRight: 8 }} />
                Criar Painel
            </Button>
        </DialogActions>
    </Dialog>
    );
}
