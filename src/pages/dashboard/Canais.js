import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
// material

import {
    Card,
    Table,
    TableHead,
    Stack,
    Avatar,
    Button,
    Checkbox,
    TableRow,
    TableBody,
    TableCell,
    Container,
    TableContainer,
    TablePagination,
    IconButton,
    Switch,
    FormControlLabel
} from '@material-ui/core';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getUserList, deleteUser } from '../../redux/slices/user';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import {
    UserListHead,
    UserListToolbar,
    UserMoreMenu,
    ClientesMenuActions
} from '../../components/_dashboard/user/list';

//////// actions
import iniciarSessaoWhatsapp from '../../actions/clientes/iniciarSessaoWhatsapp';
import fecharSessaoWhatsapp from '../../actions/clientes/fecharSessaoWhatsapp';
import { Icon } from '@iconify/react';

import useAuth from '../../hooks/useAuth';
import actionDeletarCacheRedis from 'src/actions/admin/actionDeletarCacheRedis';
import actionEditarCliente from 'src/actions/clientes/actionEditarCliente';
import actionListaServidores from 'src/actions/admin/actionListaServidores';

///// Acordions

import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import AccordionSummary from '@mui/material/AccordionSummary';

///// Bloqueio de Cliente
import actionAdminActionCliente from 'src/actions/clientes/actionAdminActionCliente';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// ----------------------------------------------------------------------
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import criarUsuario from 'src/actions/criarUsuario';

import { v4 as uuidv4 } from 'uuid';
import { useDropzone } from 'react-dropzone';
import LoadingScreen from 'src/components/LoadingScreen';
import { Box, MenuItem, Select, Paper, Typography, Divider, Chip, FormControl, InputLabel } from '@mui/material';
import { useSnackbar } from 'notistack5';


// actions old
import listaTodosUsuariosBossByClienteId from 'src/actions/usuarios/listaTodosUsuariosBossByClienteId';

// v2 actions
import v2_actionListarClientesHub from 'src/actions/v2/admin/v2_actionListarClientesHub';
import v2_actionImportarContatos from '../../actions/v2/clientes/v2_importarContatos';

const TABLE_HEAD = [{ id: 'nome', label: 'Clientes', alignRight: false }, { id: '' }];

const TABLE_BODY = [
    { id: '_id', label: 'ID', alignRight: false },
    { id: 'nome', label: 'Nome', alignRight: false },
    { id: 'sessao', label: 'Sessão', alignRight: false },
    { id: 'pod', label: 'Pod', alignRight: false },

    { id: 'numero', label: 'Número', alignRight: false },
    { id: 'status', label: 'Sentinela', alignRight: false },
    { id: 'isBlock', label: 'Bloqueado', alignRight: false }, // Nova coluna
    { id: 'fase', label: 'Fase', alignRight: false }, // Nova coluna
    { id: '' }
];


// Estilos melhorados para o dropzone
const dropzoneStyle = {
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: '#c4c4c4',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    color: '#666',
    transition: 'all 0.3s ease',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
};

const dropzoneActiveStyle = {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    transform: 'scale(1.02)'
};

const dropzoneSelectedStyle = {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    color: '#2e7d32',
    borderStyle: 'solid'
};

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query, pod, userProvedor) {
    let filteredArray = [];
    let totalFilteredItems = 0;

    array.forEach((hub) => {
        const filteredItems = hub.items.filter((item) => {
            // Verifica se o nome corresponde ao query, se houver
            const matchesQuery = query
                ? item.nome.toLowerCase().includes(query.toLowerCase())
                : true;

            // Verifica se o pod corresponde, exceto se for "Todos"
            let matchesPod = pod !== 'Todos'
                ? String(item.pod) === String(pod) || item.isHub || String(item.cliente_pai_id) === String(pod)
                : true;

            // Se o provedor for "eva", filtra apenas pelo pod "eva"
            if (userProvedor === 'eva') {
                matchesPod = String(item.pod) === 'eva' || item.isHub || String(item.cliente_pai_id) === 'eva';
            }

            return matchesQuery && matchesPod;
        });

        // Adiciona apenas os hubs com items que correspondem aos critérios
        if (filteredItems.length > 0) {
            totalFilteredItems += filteredItems.length;
            filteredArray.push({
                ...hub,
                items: filteredItems, // Inclui apenas os items filtrados
            });
        }
    });

    console.log(`Filtro aplicado: ${totalFilteredItems} itens de ${array.reduce((total, hub) => total + hub.items.length, 0)} total`);
    return filteredArray;
}



export default function Canais() {
    const { themeStretch } = useSettings();
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('nome');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(200);
    const [listaClientes, setListaClientes] = useState([]);
    const [listaServidores, setListaServidores] = useState([]);
    const [clientesPorHub, setClientesPorHub] = useState([]);
    const { user } = useAuth();
    const [pod, setPod] = useState(user?.provedor === 'eva' ? 'eva' : 'Todos');
    const filteredUsers = applySortFilter(listaClientes, getComparator(order, orderBy), filterName, pod, user?.provedor);
    const [open, setOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUser, setNewUser] = useState('');
    const [newUserNumber, setNewUserNumber] = useState('');
    const [openImportModal, setOpenImportModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [replaceContacts, setReplaceContacts] = useState(false);
    const [linkChats, setLinkChats] = useState(false);
    const [ignoreErrors, setIgnoreErrors] = useState(false);
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');
    const [newUserServer, setNewUserServer] = useState(''); // Adicionar estado para o servidor
    const [totalItems, setTotalItems] = useState(0);
    const { enqueueSnackbar } = useSnackbar();
    const cliente = useSelector((state) => state.user.cliente);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        setLoading(false);
    }, [loading]);

    //criar usuario


    const getProvedor = (provedor) => {
        return provedor === 'all' ? 'zapchat' : provedor;
    };
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
                setOpen(false);
                toast.success('Usuário criado com sucesso!');
            }
        } catch (error) {
            toast.error('Erro ao criar usuário');
        }
    };

    const handleOpenImportModal = () => {
        setOpenImportModal(true);
    };

    const handleCloseImportModal = () => {
        setOpenImportModal(false);
        setCsvFile(null);
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            console.log('Arquivo selecionado:', acceptedFiles[0]);
            setCsvFile(acceptedFiles[0]);
        }
    };

    const handleImportUsers = async () => {
        if (!csvFile) {
            toast.error('Por favor, selecione um arquivo CSV.');
            return;
        }

        const formData = new FormData();
        formData.append('file', csvFile);

        formData.append(
            'options',
            JSON.stringify({
                replace_contacts: replaceContacts,
                link_chats: linkChats,
                ignore_errors: ignoreErrors
            })
        );

        console.log('FormData para envio:', formData);
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        try {
            const clienteId = uuidv4();
            const response = await v2_actionImportarContatos(clienteId, formData);

            console.log('Resposta da API:', response);

            if (response.status === 200) {
                toast.success('Usuários importados com sucesso!');
                handleCloseImportModal();
            }
        } catch (error) {
            console.error('Erro ao importar usuários:', error);
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
            }
            toast.error('Erro ao importar usuários.');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: '.csv'
    });


    // Definir o estilo do dropzone com base no estado
    const currentDropzoneStyle = csvFile
        ? { ...dropzoneStyle, ...dropzoneSelectedStyle }
        : isDragActive
            ? { ...dropzoneStyle, ...dropzoneActiveStyle }
            : dropzoneStyle;

    async function handleClientesHub() {
        try {
            console.log('Buscando clientes...');
            // Query otimizada para buscar apenas os campos necessários para a tabela
            let query = `?provedor=${user.provedor}&fields=_id,nome,sessao,pod,numero,sentinela,isBlock,fase,token,isDelete,cliente_pai_id,isHub,config`;
            setLoading(true);
            const response = await v2_actionListarClientesHub(query);
            if (response?.data?.data?.[0]) {
                console.log('[debug] primeiro hub retornado:', response.data.data[0]);
            }
            setListaClientes(response.data.data);
            setLoading(false);
  
            
            // // Filtra apenas os dados necessários para reduzir o peso
            // const dadosOtimizados = response.data.data.map(hub => ({
            //     ...hub,
            //     items: hub.items.map(item => ({
            //         _id: item._id,
            //         nome: item.nome,
            //         sessao: item.sessao,
            //         pod: item.pod,
            //         numero: item.numero,
            //         sentinela: item.sentinela,
            //         isBlock: item.isBlock,
            //         fase: item.fase,
            //         token: item.token,
            //         isDelete: item.isDelete,
            //         cliente_pai_id: item.cliente_pai_id,
            //         isHub: item.isHub
            //     }))
            // }));
            
            // setListaClientes(dadosOtimizados);
            
            // Conta o total de itens para debug de performance
            // const totalItens = dadosOtimizados.reduce((total, hub) => total + hub.items.length, 0);
            // setTotalItems(totalItens);
            
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            alert('Erro ao buscar clientes');
            setLoading(false);
        }
    }

    // async function handleBuscarClientes() {
    //   try {
    //     setLoading(true)
    //     const response = await todosUsuarios({ provedor: user.provedor });
    //     const sortedClients = response.data.clientes.sort((a, b) => {
    //       if (a.isHub && !b.isHub) return -1;
    //       if (!a.isHub && b.isHub) return 1;
    //       return 0;
    //     });
    //     setListaClientes(sortedClients);
    //     setLoading(false)
    //   } catch (error) {
    //     setLoading(false)
    //     console.error('Erro ao buscar clientes:', error);
    //   }
    // }



    const buscarListaServidores = async () => {
        try {
            console.log('Buscando servidores...');
            const res = await actionListaServidores();
            
            // Filtra apenas os campos necessários para o select
            const servidoresOtimizados = res.data.data.map(server => ({
                _id: server._id,
                pod: server.pod
            }));
            
            setListaServidores(servidoresOtimizados);
            console.log('Servidores carregados (otimizados):', servidoresOtimizados.length);
        } catch (error) {
            console.error('Erro ao buscar servidores:', error);
        }
    };


    useEffect(() => {
        buscarListaServidores();
        handleClientesHub();
    }, []);


    const handleDeleteCacheRedis = async (sessao) => {
        try {
            const response = await actionDeletarCacheRedis(sessao);
            if (response.status === 200) {
                alert('Cache deletado com sucesso!');
            }
        } catch (error) {
            alert('Erro ao deletar cache!');
        }
    };


    const handleFilterByName = (event) => {
        setFilterName(event.target.value);
    };

    const handleDeleteUser = (userId) => {
        actionAdminActionCliente(userId, { scope: { descontinuado: true } })
            .then(() => {
                enqueueSnackbar("Usuário excluído com sucesso!", { variant: "success" });
    
                if (userId) {
                    listaTodosUsuariosBossByClienteId(userId)
                        .then(response => console.log("Lista carregada:", response.data))
                        .catch(error => console.error("Erro ao buscar usuários:", error));
                }
            })
            .catch((error) => {
                enqueueSnackbar("Erro ao excluir usuário!", { variant: "error" });
                console.error("Erro ao excluir usuário:", error);
            });
    };
    const handleStartSession = (pod, sessao, token) => {
        iniciarSessaoWhatsapp(pod, sessao, token)
    };

    const handleCloseSession = (pod, sessao, token) => {
        fecharSessaoWhatsapp(pod, sessao, token)
            .then(() => alert('Sessão Fechada, aguarde alguns segundos pra Iniciar'))
            .catch(() => alert('Erro ao iniciar sessão'));
    };

    const handleChangeSentinelaStatus = async (clienteId, event) => {
        try {
            await actionEditarCliente(clienteId, {
                scope: {
                    status: event.target.checked
                },
                action: 'editar_status_sentinela'
            });
            await handleClientesHub();
            toast.success(`Status da sentinela ${event.target.checked ? 'ativado' : 'desativado'} com sucesso!`);
        } catch (error) {
            toast.error('Erro ao alterar status da sentinela');
        }
    };

    const handleBlockClient = async (clienteId, isBlock) => {
        console.log('Tentando bloquear cliente:', clienteId, 'Novo estado:', isBlock);
        try {
            const data = {
                scope: {
                    action: 'bloquear_cliente',
                    isBlock: isBlock
                }
            };

            const response = await actionAdminActionCliente(clienteId, data);
            console.log('Resposta da API:', response);

            if (response.status === 200) {
                await handleClientesHub();
                toast.success(`Cliente ${isBlock ? 'bloqueado' : 'desbloqueado'} com sucesso!`);
            } else {
                toast.error(`Erro ao ${isBlock ? 'bloquear' : 'desbloquear'} cliente`);
            }
        } catch (error) {
            toast.error(`Erro ao ${isBlock ? 'bloquear' : 'desbloquear'} cliente: ${error.message}`);
        }
    };


    const MENSAGEM_INADIMPLENCIA_PADRAO = 'Atenção: há pendências financeiras em sua conta. Entre em contato com o suporte para regularizar o acesso.';

    const applyInadimplenciaState = (clienteId, ativo) => {
        setListaClientes((prev) =>
            prev.map((hub) => {
                if (!hub.items?.some((item) => item._id === clienteId)) return hub;
                return {
                    ...hub,
                    items: hub.items.map((item) =>
                        item._id === clienteId
                            ? {
                                  ...item,
                                  config: {
                                      ...(item.config || {}),
                                      inadimplencia: {
                                          ...(item.config?.inadimplencia || {}),
                                          ativo,
                                          mensagem: ativo ? MENSAGEM_INADIMPLENCIA_PADRAO : ''
                                      }
                                  }
                              }
                            : item
                    )
                };
            })
        );
    };

    const handleToggleInadimplencia = async (clienteId, ativo) => {
        applyInadimplenciaState(clienteId, ativo);
        try {
            console.log('[inadimplencia] enviando', { clienteId, ativo });
            const response = await actionAdminActionCliente(clienteId, {
                scope: {
                    action: 'marcar_inadimplencia',
                    ativo,
                    mensagem: ativo ? MENSAGEM_INADIMPLENCIA_PADRAO : ''
                }
            });
            console.log('[inadimplencia] resposta', response?.status, response?.data);
            toast.success(`Cliente ${ativo ? 'marcado como inadimplente' : 'regularizado'} com sucesso!`);
        } catch (error) {
            console.error('[inadimplencia] erro:', error?.response?.status, error?.response?.data || error?.message || error);
            applyInadimplenciaState(clienteId, !ativo);
            toast.error(`Erro ao atualizar inadimplência: ${error?.response?.data?.mensagem || error.message || 'verifique o backend'}`);
        }
    };

    const handleChangeFase = async (clienteId, newValue) => {
        try {
            const data = {
                scope: {
                    action: 'editar_fase',
                    fase: newValue
                }
            };

            const response = await actionAdminActionCliente(clienteId, data);
            console.log('Resposta da API:', response);

            if (response.status === 200) {
                await handleClientesHub();
                toast.success(`Cliente alterado com sucesso!`);
            } else {
                toast.error(`Erro ao alterar cliente`);
            }
        } catch (error) {
            toast.error(`Erro ao alterar cliente: ${error.message}`);
        }
    };

    const normalizeInput = (input) => {
        return input
            .toLowerCase() // Converte para letras minúsculas
            .normalize('NFD') // Normaliza o texto para decompor caracteres acentuados
            .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
            .replace(/[0-9]/g, '') // Remove os números
            .replace(/[^a-z]/g, ''); // Remove quaisquer caracteres que não sejam letras
    };

    return (
        <Page title="Lais - Clientes">
            <Container maxWidth={'xl'}>
                <HeaderBreadcrumbs
                    heading={`Lista de Clientes ${totalItems > 0 ? `(${totalItems} clientes)` : ''}`}
                    links={[
                        { name: 'Dashboard', href: PATH_DASHBOARD.root },
                        { name: 'Lais', href: PATH_DASHBOARD.plataforma.root },
                        { name: 'Lista de Clientes' }
                    ]}
                    action={
                        <>
                            <Button onClick={handleClickOpen} variant="contained" sx={{ mr: 2 }}>
                                Criar Cliente
                            </Button>
                            {/* <Button onClick={handleOpenImportModal} variant="contained">
                                Importar Usuários
                            </Button> */}
                        </>
                    }
                />
                <ToastContainer />

                { loading ? (
                    <Box sx={{ flex: 1, width: '100%', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
                        <LoadingScreen />
                        <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
                            Debug: {debugInfo}
                        </Typography>
                    </Box>
                ) : (
                    <Card>
                        <UserListToolbar
                            numSelected={selected.length}
                            filterName={filterName}
                            onFilterName={handleFilterByName}
                            listaServidores={listaServidores}
                            pod={pod}
                            changePod={(event) => setPod(event.target.value)}
                        />

                        <Dialog 
                            open={open} 
                            onClose={handleClose}
                            maxWidth="sm"
                            fullWidth
                            PaperProps={{
                                sx: {
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
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
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Icon icon="mdi:account-plus" width={24} height={24} />
                                    Criar Novo Cliente
                                </Box>
                            </DialogTitle>
                            
                            <DialogContent sx={{ pt: 3, pb: 2 }}>
                                <DialogContentText sx={{ mb: 3, color: '#666', fontSize: '0.95rem' }}>
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
                                        InputProps={{
                                            startAdornment: <Icon icon="mdi:account" width={20} height={20} style={{ marginRight: 8, color: '#666' }} />
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2
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
                                        InputProps={{
                                            startAdornment: <Icon icon="mdi:at" width={20} height={20} style={{ marginRight: 8, color: '#666' }} />
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2
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
                                        InputProps={{
                                            startAdornment: <Icon icon="mdi:phone" width={20} height={20} style={{ marginRight: 8, color: '#666' }} />
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2
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
                                                            <Box display="flex" alignItems="center" gap={1}>
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
                                            background: '#e0e0e0',
                                            color: '#9e9e9e'
                                        }
                                    }}
                                
                              
                                >
                                    <Icon icon="mdi:check" width={20} height={20} style={{ marginRight: 8 }} />
                                    Criar Painel
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog 
                            open={openImportModal} 
                            onClose={handleCloseImportModal}
                            maxWidth="md"
                            fullWidth
                            PaperProps={{
                                sx: {
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                                }
                            }}
                        >
                            <DialogTitle sx={{ 
                                pb: 1,
                                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1.25rem'
                            }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Icon icon="mdi:upload" width={24} height={24} />
                                    Importar Usuários
                                </Box>
                            </DialogTitle>
                            
                            <DialogContent sx={{ pt: 3, pb: 2 }}>
                                <DialogContentText sx={{ mb: 3, color: '#666', fontSize: '0.95rem' }}>
                                    Selecione um arquivo CSV contendo os dados dos usuários que você deseja importar para o sistema.
                                </DialogContentText>
                                
                                <Paper 
                                    {...getRootProps()} 
                                    sx={{
                                        ...currentDropzoneStyle,
                                        border: '2px dashed',
                                        borderColor: csvFile ? '#4caf50' : isDragActive ? '#1976d2' : '#c4c4c4',
                                        backgroundColor: csvFile ? '#e8f5e8' : isDragActive ? '#e3f2fd' : '#fafafa',
                                        color: csvFile ? '#2e7d32' : isDragActive ? '#1976d2' : '#666',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: '#1976d2',
                                            backgroundColor: '#e3f2fd',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    <input {...getInputProps()} />
                                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                    {isDragActive ? (
                                            <>
                                                <Icon icon="mdi:cloud-upload" width={48} height={48} />
                                                <Typography variant="h6" color="primary">
                                                    Solte o arquivo aqui...
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    O arquivo será processado automaticamente
                                                </Typography>
                                            </>
                                    ) : csvFile ? (
                                            <>
                                                <Icon icon="mdi:file-check" width={48} height={48} />
                                                <Typography variant="h6" color="success.main">
                                                    Arquivo Selecionado
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {csvFile.name}
                                                </Typography>
                                                <Chip 
                                                    label={`${(csvFile.size / 1024).toFixed(1)} KB`} 
                                                    size="small" 
                                                    color="success" 
                                                    variant="outlined"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="mdi:cloud-upload-outline" width={48} height={48} />
                                                <Typography variant="h6">
                                                    Arraste um arquivo CSV aqui
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ou clique para selecionar um arquivo
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={1} mt={1}>
                                                    <Icon icon="mdi:file-document-outline" width={20} height={20} />
                                                    <Typography variant="caption">
                                                        Formatos aceitos: .csv
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                </Paper>
                                
                                {csvFile && (
                                    <Box mt={2}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Opções de Importação:
                                        </Typography>
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={replaceContacts}
                                                        onChange={(e) => setReplaceContacts(e.target.checked)}
                                                        size="small"
                                                    />
                                                }
                                                label="Substituir contatos existentes"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={linkChats}
                                                        onChange={(e) => setLinkChats(e.target.checked)}
                                                        size="small"
                                                    />
                                                }
                                                label="Vincular chats existentes"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={ignoreErrors}
                                                        onChange={(e) => setIgnoreErrors(e.target.checked)}
                                                        size="small"
                                                    />
                                                }
                                                label="Ignorar erros de validação"
                                            />
                                        </Box>
                                    </Box>
                                )}
                            </DialogContent>
                            
                            <Divider />
                            
                            <DialogActions sx={{ p: 2, gap: 1 }}>
                                <Button 
                                    onClick={handleCloseImportModal} 
                                    variant="outlined"
                                    sx={{ borderRadius: 2, px: 3 }}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleImportUsers} 
                                    variant="contained" 
                                    disabled={!csvFile}
                                    sx={{ 
                                        borderRadius: 2, 
                                        px: 3,
                                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)'
                                        },
                                        '&:disabled': {
                                            background: '#e0e0e0',
                                            color: '#9e9e9e'
                                        }
                                    }}
                                >
                                    <Icon icon="mdi:import" width={20} height={20} style={{ marginRight: 8 }} />
                                    Importar Usuários
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Scrollbar>
                            <TableContainer sx={{ minWidth: 400 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {TABLE_HEAD.map((column) => (
                                                <TableCell key={column.id} align={column.alignRight ? 'right' : 'left'}>
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                </Table>
                            </TableContainer>

                            {filteredUsers
                                .map((hub) => {
                                    const hubCliente = hub.items?.find((item) => item.isHub) || hub.items?.[0];
                                    const hubKey = hubCliente?._id || hub.hub;
                                    return (
                                        <Accordion key={`hub-${hubKey}`}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={`panel-${hubKey}-content`}
                                                id={`panel-${hubKey}-header`}
                                            >
                                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 2 }}>
                                                    <Typography>{hub.hub}</Typography>
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={1}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onFocus={(e) => e.stopPropagation()}
                                                    >
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Inadimplência
                                                        </Typography>
                                                        <Switch
                                                            size="small"
                                                            disabled={!hubCliente?._id}
                                                            onChange={(event) => handleToggleInadimplencia(hubCliente._id, event.target.checked)}
                                                            checked={!!hubCliente?.config?.inadimplencia?.ativo}
                                                        />
                                                    </Stack>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                {TABLE_BODY.map((column) => (
                                                                    <TableCell key={column.id} align={column.alignRight ? 'right' : 'left'}>
                                                                        {column.label}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {hub.items
                                                                .map((cliente) => (
                                                                    <TableRow key={cliente._id} style={{ display: cliente.isDelete ? 'none' : 'table-row' }}>

                                                                        <TableCell align="left">
                                                                            <Typography
                                                                                variant="caption"
                                                                                sx={{ fontFamily: 'monospace', cursor: 'pointer' }}
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(cliente._id);
                                                                                    toast.success('ID copiado!');
                                                                                }}
                                                                                title={cliente._id}
                                                                            >
                                                                                {cliente._id}
                                                                            </Typography>
                                                                        </TableCell>
                                                                        <TableCell align="left">{cliente.nome}</TableCell>
                                                                        <TableCell align="left">{cliente.sessao}</TableCell>
                                                                        <TableCell align="left">{cliente.pod}</TableCell>
                                                                        <TableCell align="left">{cliente.numero}</TableCell>
                                                                        <TableCell align="left">
                                                                            <Switch
                                                                                onChange={(event) => handleChangeSentinelaStatus(cliente._id, event)}
                                                                                checked={cliente.sentinela}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell align="left">
                                                                            <Switch
                                                                                onChange={(event) => handleBlockClient(cliente._id, event.target.checked)}
                                                                                checked={cliente.isBlock || false}
                                                                            />
                                                                        </TableCell>

                                                                        <TableCell >
                                                                            <Stack direction={"row"} justifyContent={"center"}>
                                                                            <Select
                                                                                fullWidth
                                                                                value={cliente.fase}
                                                                                size={"small"}
                                                                                onChange={e => handleChangeFase(cliente._id, e.target.value)}
                                                                            >
                                                                                <MenuItem value={"onboarding"}>Onboarding</MenuItem>
                                                                                <MenuItem value={"ativo"}>Ativo</MenuItem>
                                                                                <MenuItem value={"inativo"}>Inativo</MenuItem>
                                                                                <MenuItem value={"dev"}>Dev</MenuItem>
                                                                                <MenuItem value={"demo"}>Demonstração</MenuItem>
                                                                                <MenuItem value={"suporte"}>Suporte</MenuItem>

                                                                            </Select>
                                                                            </Stack>

                                                       
                                                                        </TableCell>

                                                                        <TableCell align="right">
                                                                            <IconButton onClick={() => handleDeleteCacheRedis(cliente.sessao)}>
                                                                                <Icon icon={'ant-design:clear-outlined'} width={20} height={20} />
                                                                            </IconButton>
                                                                            <ClientesMenuActions
                                                                                onStartSession={() =>
                                                                                    handleStartSession(cliente.pod, cliente.sessao, cliente.token)
                                                                                }
                                                                                onCloseSession={() =>
                                                                                    handleCloseSession(cliente.pod, cliente.sessao, cliente.token)
                                                                                }
                                                                            />
                                                                            <UserMoreMenu
                                                                                userId={cliente._id}
                                                                                onDelete={() => {
                                                                                    console.log("Chamando handleDeleteUser com:", cliente._id);
                                                                                    handleDeleteUser(cliente._id);
                                                                                }}
                                                                                userName={cliente._id}
                                                                                onBlock={(isBlock) => handleBlockClient(cliente._id, isBlock)}
                                                                            />
                                                                        </TableCell>

                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}


                        </Scrollbar>
                    </Card>
                )}



            </Container>
        </Page>
    );
}
