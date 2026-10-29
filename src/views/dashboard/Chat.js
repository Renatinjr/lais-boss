'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Card,
  Container,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormLabel,
  DialogActions,
  Box,
  Autocomplete,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  Checkbox
} from '@mui/material';
import Iconify from 'src/components/Iconify';
import { useDispatch } from '../../redux/store';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import todosUsuarios from 'src/actions/clientes/todosUsuarios';
import listaSetores from 'src/actions/clientes/listaSetores';
import listaTodosUsuariosBossByClienteId from 'src/actions/usuarios/listaTodosUsuariosBossByClienteId';
import criarChat from 'src/actions/criarChat';
import actionAdminActionCliente from 'src/actions/clientes/actionAdminActionCliente';
import actionListaServidores from 'src/actions/admin/actionListaServidores';
import actionAlterarPodCliente from 'src/actions/clientes/actionAlterarPodCliente';
import actionConfigurarCanalMeta from 'src/actions/admin/actionConfigurarCanalMeta';
import actionTransformarChatsWppBusiness from 'src/actions/admin/actionTransformarChatsWppBusiness';

// React-Toastify imports
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from 'src/hooks/useAuth';

export default function Chat() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();

  const {user} = useAuth();

  const [clienteId, setClientId] = useState('');
  const [numero, setNumero] = useState('');
  const [nomeChat, setNomeChat] = useState('');
  const [listaClientes, setListaClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [statusDirecionamento, setStatusDirecionamento] = useState('');
  const [webhookType, setWebhookType] = useState('');
  const [open, setOpen] = useState(false);

  const [usuarioId, setUsuarioId] = useState('');
  const [setorId, setSetorId] = useState('');

  // Estados para alterar pod
  const [openAlterarPod, setOpenAlterarPod] = useState(false);

  // Estados para configurar canal Meta
  const [openMetaConfig, setOpenMetaConfig] = useState(false);
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [metaWabaId, setMetaWabaId] = useState('');
  const [metaPin, setMetaPin] = useState('');
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaTransformarChats, setMetaTransformarChats] = useState(false);
  const [showCurl, setShowCurl] = useState(false);
  const [clienteSelecionadoPod, setClienteSelecionadoPod] = useState('');
  const [servidorSelecionadoPod, setServidorSelecionadoPod] = useState('');
  const [listaServidores, setListaServidores] = useState([]);

  useEffect(() => {
    todosUsuarios({ provedor: user?.provedor }).then(res => {
      setListaClientes(res.data.clientes);
    });

    // Buscar lista de servidores
    actionListaServidores().then(res => {
      setListaServidores(res.data.data || []);
    }).catch(error => {
      console.error('Erro ao buscar servidores:', error);
      setListaServidores([]);
    });
  }, []);

  useEffect(() => {
    if (clienteId) {
      listaTodosUsuariosBossByClienteId(clienteId)
        .then(response => {
          const data = response.data;
          console.log('Dados retornados pela API de usuários:', data);
          setUsuarios(data.usuarios || []);
        })
        .catch(error => {
          console.error('Erro ao buscar usuários:', error);
          setUsuarios([]);
        });

      listaSetores({ clienteId })
        .then(response => {
          const data = response.data;
          console.log('Dados retornados pela API de setores:', data);
          setSetores(data.setores || []);
        })
        .catch(error => {
          console.error('Erro ao buscar setores:', error);
          setSetores([]);
        });
    }
  }, [clienteId]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClearFields = () => {
    setClientId('');
    setNumero('');
    setNomeChat('');
    setUsuarioId('');
    setSetorId('');
    setStatusDirecionamento('');
    setWebhookType('');
    toast.info('Campos limpos');
  };

  const handleSubmit = async () => {
    try {
      // Verificar se os dados necessários estão disponíveis
      if (!clienteId || !numero) {
        toast.error('Selecione um cliente e informe um número');
        return;
      }
      
      let data = {
        statusRoom: statusDirecionamento,
        chatbot: webhookType === "ativado",
        numeroCliente: numero,
        clienteId: clienteId,
        direcionaUsuarios: [usuarioId],
        direcionaSetores: setorId ? [setorId] : [],
        nomeChat: nomeChat || listaClientes.find(cliente => cliente._id === clienteId)?.nome || '',
        fotoPerfil: "",
        lastMessage: "",
      };
      
      // Criar uma cópia limpa dos dados para evitar referências circulares
      const cleanData = JSON.parse(JSON.stringify(data));
      
      const response = await criarChat(cleanData);
      toast.success('Chat criado com sucesso!');
      console.log('Resposta da API:', response.data);
      handleClose();
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error);
      toast.error('Erro ao criar o chat. Tente novamente.');
    }
  };

  const handleChangeStatusDirecionamento = (event) => {
    setStatusDirecionamento(event.target.value);
    console.log('Status Direcionamento selecionado:', event.target.value);
  };

  async function handleAdminAction(action) {
    try {
      let data = {
        scope: {
          action: action,
          numero: numero,
        }
      };
      await actionAdminActionCliente(clienteId, data);
      toast.success('Sucesso');
    } catch (error) {
      toast.error('Erro ao executar ação');
    }
  }

 const handleAlterarPod = async (action) => {
    try {
      let data = {
        scope: {
          action: action,
          pod: servidorSelecionadoPod,
        }
      };
      await actionAdminActionCliente(clienteSelecionadoPod, data);
      toast.success('Sucesso');
    } catch (error) {
      console.error('Erro ao alterar pod:', error);
      //toast.error('Erro ao executar ação');
    }
  }

  // Funções para configurar canal Meta
  const handleOpenMetaConfig = () => setOpenMetaConfig(true);
  const handleCloseMetaConfig = () => {
    setOpenMetaConfig(false);
    setMetaPhoneId('');
    setMetaWabaId('');
    setMetaPin('');
    setMetaTransformarChats(false);
    setShowCurl(false);
  };
  const handleSubmitMetaConfig = async () => {
    if (!metaPhoneId || !metaWabaId || !metaPin) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (!clienteId) {
      toast.error('Selecione um cliente para vincular o canal');
      return;
    }
    setMetaLoading(true);
    try {
      await actionConfigurarCanalMeta({ phoneId: metaPhoneId, wabaId: metaWabaId, pin: metaPin, clienteId });

      if (metaTransformarChats) {
        if (!clienteId) {
          toast.error('Selecione um cliente para transformar os chats');
          setMetaLoading(false);
          return;
        }
        const res = await actionTransformarChatsWppBusiness({ clienteId });
        toast.success(`Canal configurado! ${res.data.modificados} chat(s) atualizados para whatsapp_business.`);
      } else {
        toast.success('Canal Meta configurado com sucesso!');
      }

      handleCloseMetaConfig();
    } catch (err) {
      toast.error(err?.response?.data?.mensagem || 'Erro ao configurar canal Meta');
    } finally {
      setMetaLoading(false);
    }
  };

  // Funções para alterar pod
  const handleClickOpenAlterarPod = () => {
    setOpenAlterarPod(true);
  };

  const handleCloseAlterarPod = () => {
    setOpenAlterarPod(false);
    setClienteSelecionadoPod('');
    setServidorSelecionadoPod('');
  };


  return (
    <Page title="Chat">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ height: '72vh', display: 'flex', p: 2 }}>
          <Stack spacing={4} direction={"column"}>
            <Stack spacing={2} direction={"row"}>
              <TextField size="small" label="Número" value={numero} onChange={e => setNumero(e.target.value)} />

              <FormControl sx={{ width: 300 }} size="small">
                <InputLabel id="demo-multiple-name-label">Cliente</InputLabel>
                <Select
                  labelId="demo-multiple-name-label"
                  id="demo-multiple-name"
                  value={clienteId}
                  onChange={event => setClientId(event.target.value)}
                >
                  {listaClientes
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((cliente) => (
                      <MenuItem key={cliente._id} value={cliente._id}>
                        {cliente.nome}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={"row"} spacing={1}>
              <Button onClick={handleClickOpen} variant='contained'>Criar chat</Button>
              <Button onClick={() => handleAdminAction('apagar_mensagens')} variant='contained'>Apagar mensagens</Button>
              <Button onClick={() => handleAdminAction('bloquear_numero')} variant='contained'>Bloquear número</Button>
              <Button onClick={() => handleAdminAction('deletar_chat')} variant='contained'>Excluir chat</Button>
            </Stack>
            <Divider />
                         <Stack direction={"row"} spacing={1} >
               <Tooltip title="Alterar Pod (Servidor) do Cliente" placement="top">
                 <Button
                   onClick={handleClickOpenAlterarPod}
                   sx={{
                     width: 120,
                     height: 60,
                     backgroundColor: 'secondary.main',
                     color: 'white',
                     '&:hover': {
                       backgroundColor: 'secondary.dark',
                     },
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 0.5
                   }}
                 >
                   <Iconify icon="mdi:server" width={24} height={24} />
                   <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                     Alterar Servidor
                   </Typography>
                 </Button>
               </Tooltip>
               <Tooltip title="Registrar número na Meta e inscrever WABA no webhook" placement="top">
                 <Button
                   onClick={handleOpenMetaConfig}
                   sx={{
                     width: 120,
                     height: 60,
                     backgroundColor: '#1877F2',
                     color: 'white',
                     '&:hover': {
                       backgroundColor: '#1565c0',
                     },
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 0.5
                   }}
                 >
                   <Iconify icon="ic:round-whatsapp" width={24} height={24} />
                   <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                     Configurar Canal Meta
                   </Typography>
                 </Button>
               </Tooltip>
             </Stack>
          </Stack>
        </Card>
      </Container>

      {/* Modal para criar chat */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Criar Chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Preencha as informações para criar um novo chat.
          </DialogContentText>
          <Stack spacing={2} sx={{
            mt: 2
          }}>
            <TextField
              size="small"
              label="Número"
              value={numero}
              onChange={e => {
                setNumero(e.target.value);
                console.log('Número atualizado:', e.target.value);
              }}
            />
            <TextField
              size="small"
              label="Nome do Chat"
              value={nomeChat}
              onChange={e => {
                setNomeChat(e.target.value);
                console.log('Nome do Chat:', e.target.value);
              }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="demo-multiple-name-label">Cliente</InputLabel>
              <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                value={clienteId}
                onChange={event => {
                  setClientId(event.target.value);
                  console.log('Cliente selecionado:', event.target.value);
                }}
              >
                {listaClientes
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .map((cliente) => (
                    <MenuItem key={cliente._id} value={cliente._id}>
                      {cliente.nome}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <Autocomplete
                multiple
                id="autocomplete-usuarios"
                options={usuarios}
                getOptionLabel={(usuario) => usuario.nomeFantasia}
                value={usuarios.filter((usuario) => usuarioId.includes(usuario._id)) || []}
                onChange={(event, newValue) => {
                  setUsuarioId(newValue.map((usuario) => usuario._id));
                  console.log('Usuários selecionados:', newValue.map((usuario) => usuario._id));
                }}
                renderInput={(params) => <TextField {...params} label="Selecionar Usuários" />}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <Autocomplete
                multiple
                id="autocomplete-setores"
                options={setores}
                getOptionLabel={(setor) => setor.nome_setor}
                value={setores.filter((setor) => setorId.includes(setor._id)) || []}
                onChange={(event, newValue) => {
                  setSetorId(newValue.map((setor) => setor._id));
                }}
                renderInput={(params) => <TextField {...params} label="Selecionar Setores" />}
                disabled={statusDirecionamento === 'Atendendo'} // Desabilitar o campo se o status for "Atendendo"
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel id="demo-simple-select-label">Status Direcionamento</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={statusDirecionamento}
                onChange={handleChangeStatusDirecionamento}
              >
                <MenuItem value={"Pendente"}>Pendente</MenuItem>
                <MenuItem value={"Geral"}>Geral</MenuItem>
                <MenuItem value={"Atendendo"}>Atendendo</MenuItem>
                <MenuItem value={"Finalizado"}>Finalizado</MenuItem>
              </Select>
            </FormControl>


            {(statusDirecionamento === 'Geral' || statusDirecionamento === 'Finalizado') && (
              <FormControl component="fieldset">
                <FormLabel component="legend">Chatbot</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={webhookType}
                  onChange={e => {
                    setWebhookType(e.target.value);
                    console.log('Chatbot Webhook Type selecionado:', e.target.value);
                  }}
                >
                  <FormControlLabel value="ativado" control={<Radio />} label="Ativado" />
                  <FormControlLabel value="desativado" control={<Radio />} label="Desativado" />
                </RadioGroup>
              </FormControl>
            )}

          </Stack>
        </DialogContent>
        <DialogActions>
          <Box sx={{ flex: '1 1 auto' }}>
            <Button onClick={handleClearFields} variant='outlined'>
              Limpar Campos
            </Button>
          </Box>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para alterar pod */}
      <Dialog open={openAlterarPod} onClose={handleCloseAlterarPod} fullWidth maxWidth="sm">
                 <DialogTitle sx={{ 
           pb: 1,
           display: 'flex', 
           alignItems: 'center', 
           gap: 1 
         }}>
           <Iconify icon="mdi:server-network" color="primary.main" width={24} height={24} />
           <Typography variant="h6" component="span">
             Alterar Pod (Servidor) do Cliente
           </Typography>
         </DialogTitle>
         <DialogContent>
           <DialogContentText sx={{ mb: 3, color: 'text.secondary' }}>
             Selecione um cliente e o novo servidor (pod) para realizar a alteração. Esta ação irá desconectar a sessão atual.
           </DialogContentText>
                     <Stack spacing={3}>
             <Box>
               <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                 Selecionar Cliente
               </Typography>
               <FormControl fullWidth>
                 <InputLabel id="cliente-pod-label">Cliente</InputLabel>
                 <Select
                   labelId="cliente-pod-label"
                   id="cliente-pod-select"
                   value={clienteSelecionadoPod}
                   onChange={(event) => setClienteSelecionadoPod(event.target.value)}
                   label="Cliente"
                   sx={{ 
                     '& .MuiSelect-select': { 
                       py: 1.5 
                     } 
                   }}
                 >
                {listaClientes
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .map((cliente) => (
                                         <MenuItem key={cliente._id} value={cliente._id}>
                       <Stack
                         direction="row"
                         spacing={2}
                         sx={{
                           alignItems: "center",
                           width: '100%'
                         }}>
                         <Box sx={{ flex: 1 }}>
                           <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                             {cliente.nome}
                           </Typography>
                           <Typography
                             variant="caption"
                             sx={{
                               color: "text.secondary",
                               display: "block"
                             }}>
                             {cliente.numero} • {cliente.usuario}
                           </Typography>
                         </Box>
                         <Box sx={{ textAlign: 'right' }}>
                           <Typography variant="caption" color="primary" sx={{ fontWeight: 'medium' }}>
                             Pod: {cliente.pod || 'Não definido'}
                           </Typography>
                           <Typography
                             variant="caption"
                             color={cliente.sentinela ? "success.main" : "text.secondary"}
                             sx={{
                               display: "block",
                               fontWeight: 'medium'
                             }}>
                             {cliente.sentinela ? "✓ Ativado" : "○ Desativado"}
                           </Typography>
                         </Box>
                       </Stack>
                     </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Selecionar Novo Servidor
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="servidor-pod-label">Novo Servidor (Pod)</InputLabel>
              <Select
                labelId="servidor-pod-label"
                id="servidor-pod-select"
                value={servidorSelecionadoPod}
                onChange={(event) => setServidorSelecionadoPod(event.target.value)}
                label="Novo Servidor (Pod)"
              >
                {listaServidores.map((servidor) => (
                  <MenuItem key={servidor._id} value={servidor.pod}>
                    {servidor.pod}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {clienteSelecionadoPod && servidorSelecionadoPod && (
               <Box sx={{ 
                 p: 3, 
                 bgcolor: 'grey.50', 
                 borderRadius: 2, 
                 border: '1px solid',
                 borderColor: 'grey.200'
               }}>
                 <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                   Resumo da Alteração
                 </Typography>
                 <Stack spacing={2}>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="body2" sx={{
                       color: "text.secondary"
                     }}>
                       Cliente:
                     </Typography>
                     <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                       {listaClientes.find(c => c._id === clienteSelecionadoPod)?.nome}
                     </Typography>
                   </Box>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="body2" sx={{
                       color: "text.secondary"
                     }}>
                       Pod atual:
                     </Typography>
                     <Typography
                       variant="body2"
                       sx={{
                         color: "warning.main",
                         fontWeight: 'medium'
                       }}>
                       {listaClientes.find(c => c._id === clienteSelecionadoPod)?.pod || 'Não definido'}
                     </Typography>
                   </Box>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="body2" sx={{
                       color: "text.secondary"
                     }}>
                       Novo pod:
                     </Typography>
                     <Typography
                       variant="body2"
                       sx={{
                         color: "success.main",
                         fontWeight: 'bold'
                       }}>
                       {servidorSelecionadoPod}
                     </Typography>
                   </Box>
                 </Stack>
               </Box>
             )}

                     <Box sx={{ 
             p: 2, 
             bgcolor: 'error.50', 
             borderRadius: 2, 
             border: '1px solid',
             borderColor: 'error.200',
             mt: 2
           }}>
             <Stack direction="row" spacing={1} sx={{
               alignItems: "center"
             }}>
               <Iconify icon="mdi:alert-circle" color="error.main" width={20} height={20} />
               <Typography
                 variant="body2"
                 sx={{
                   color: "error.main",
                   fontWeight: 'medium'
                 }}>
                 <strong>Atenção:</strong> Ao alterar o Pod, a sessão será desconectada da plataforma, mas no aparelho ainda continuará conectado.
               </Typography>
             </Stack>
           </Box>
          </Stack>
        </DialogContent>
                 <DialogActions sx={{ p: 3, pt: 2 }}>
           <Button 
             onClick={handleCloseAlterarPod} 
             variant="outlined"
             sx={{ minWidth: 100 }}
           >
             Cancelar
           </Button>
           <Button 
             onClick={() => handleAlterarPod('trocar_servidor')} 
             color="primary" 
             variant="contained"
             disabled={!clienteSelecionadoPod || !servidorSelecionadoPod}
             sx={{ 
               minWidth: 140,
               background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
               '&:hover': {
                 background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
               }
             }}
             startIcon={<Iconify icon="mdi:server" />}
           >
             Alterar Pod
           </Button>
         </DialogActions>
      </Dialog>
      {/* Modal para configurar canal Meta */}
      <Dialog open={openMetaConfig} onClose={handleCloseMetaConfig} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="ic:round-whatsapp" color="#1877F2" width={24} height={24} />
          <Typography variant="h6" component="span">Configurar Canal Meta</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.light', borderRadius: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{
              alignItems: "flex-start"
            }}>
              <Iconify icon="eva:alert-triangle-outline" color="warning.dark" width={20} sx={{ mt: 0.2, flexShrink: 0 }} />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "warning.dark",
                    mb: 0.5
                  }}>Pré-requisito obrigatório</Typography>
                <Typography variant="body2" sx={{
                  color: "warning.dark"
                }}>
                  O usuário de sistema <strong>LaisUser</strong> deve estar adicionado à conta do WhatsApp Business (WABA) antes de prosseguir. Sem isso, o registro e a inscrição no webhook irão falhar.
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Stack spacing={2} sx={{
            mt: 1
          }}>
            <FormControl fullWidth>
              <Autocomplete
                options={listaClientes}
                getOptionLabel={(o) => [o.nome, o.sessao, o.numero].filter(Boolean).join(' - ')}
                onChange={(_, val) => setClientId(val?._id || '')}
                renderInput={(params) => <TextField {...params} label="Cliente" size="small" />}
              />
            </FormControl>
            <TextField
              label="Phone Number ID"
              fullWidth
              size="small"
              value={metaPhoneId}
              onChange={(e) => setMetaPhoneId(e.target.value)}
            />
            <TextField
              label="WABA ID"
              fullWidth
              size="small"
              value={metaWabaId}
              onChange={(e) => setMetaWabaId(e.target.value)}
            />
            <TextField
              label="PIN (código de verificação)"
              fullWidth
              size="small"
              value={metaPin}
              onChange={(e) => setMetaPin(e.target.value)}
              slotProps={{
                htmlInput: { maxLength: 6 }
              }}
            />
            <Box sx={{ border: '1px solid', borderColor: metaTransformarChats ? 'primary.main' : 'grey.300', borderRadius: 1.5, p: 1.5, bgcolor: metaTransformarChats ? 'primary.lighter' : 'transparent', transition: 'all 0.2s' }}>
              <Stack direction="row" spacing={1} sx={{
                alignItems: "flex-start"
              }}>
                <Checkbox
                  size="small"
                  checked={metaTransformarChats}
                  onChange={(e) => setMetaTransformarChats(e.target.checked)}
                  sx={{ mt: -0.5 }}
                />
                <Box>
                  <Typography variant="subtitle2" color={metaTransformarChats ? 'primary.dark' : 'text.primary'}>
                    Transformar chats
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: "text.secondary"
                  }}>
                    Atualiza todos os chats do cliente selecionado definindo <code>canal = "whatsapp_business"</code>. Requer que o cliente esteja selecionado acima.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Button
              size="small"
              onClick={() => setShowCurl(v => !v)}
              startIcon={<Iconify icon={showCurl ? 'eva:chevron-up-outline' : 'eva:code-outline'} />}
              sx={{ alignSelf: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0 }}
            >
              {showCurl ? 'Ocultar comandos cURL' : 'Ver comandos cURL (execução manual)'}
            </Button>

            <Collapse in={showCurl}>
              <Stack spacing={1.5}>
                {[
                  {
                    label: '1. Registrar número',
                    code: `curl --location --globoff \\\n  'https://graph.facebook.com/v24.0/${metaPhoneId || '<Phone-Number-ID>'}/register' \\\n  --header 'Content-Type: application/json' \\\n  --header 'Authorization: Bearer $LAIS_SYSTEM_USER_TOKEN' \\\n  --data '{"messaging_product":"whatsapp","pin":"${metaPin || '<PIN>'}"}'`
                  },
                  {
                    label: '2. Inscrever WABA no webhook',
                    code: `curl --location --globoff --request POST \\\n  'https://graph.facebook.com/v24.0/${metaWabaId || '<WABA-ID>'}/subscribed_apps' \\\n  --header 'Authorization: Bearer $LAIS_SYSTEM_USER_TOKEN'`
                  }
                ].map(({ label, code }) => (
                  <Box key={label} sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1.5, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.5, bgcolor: 'grey.100', borderBottom: '1px solid', borderColor: 'grey.300' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{label}</Typography>
                      <Tooltip title="Copiar">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(code);
                            toast.info('Comando copiado!');
                          }}
                        >
                          <Iconify icon="eva:copy-outline" width={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box
                      component="pre"
                      sx={{ m: 0, p: 1.5, fontSize: '0.7rem', fontFamily: 'monospace', bgcolor: '#1e1e1e', color: '#d4d4d4', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                    >
                      {code}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Collapse>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMetaConfig} variant="outlined">Cancelar</Button>
          <Button
            onClick={handleSubmitMetaConfig}
            variant="contained"
            disabled={metaLoading}
            sx={{ backgroundColor: '#1877F2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            {metaLoading ? 'Configurando...' : 'Configurar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Page>
  );
}