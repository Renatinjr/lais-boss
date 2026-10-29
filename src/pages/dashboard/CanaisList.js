import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink, useParams } from 'react-router-dom';
// material
import { useTheme } from '@material-ui/core/styles';
import {
    Card,
    Table,
    Stack,
    Button,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    TableContainer,
    TablePagination,
    Grid,
    Dialog,
    TextField,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    Autocomplete,
    Chip,
    MenuItem,
    Select,
    InputLabel,
    ToggleButton,
    ToggleButtonGroup,
    TableHead,
    Paper,
    IconButton, 
    Slider, 
    Box,
    Tooltip,
    InputAdornment,
    Tabs,
    Tab,
} from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// redux
import { useDispatch } from '../../redux/store';
import { getListaCanaisPorCliente } from '../../redux/slices/user';
// routes
import useSettings from '../../hooks/useSettings';
// components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { UserListHead } from '../../components/_dashboard/user/list';
import { getRespostasList } from '../../redux/slices/user';
// actions novo
import actionEditarResposta from 'src/actions/clientes/actionEditarResposta';

import RespostaMoreMenu from '../../components/_dashboard/admin/clientes/respostas/list/RespostaMoreMenu';
import actionListaServidores from 'src/actions/admin/actionListaServidores';
import actionGerarTokenWhatsapp from 'src/actions/admin/actionGerarTokenWhatsapp';
import actionCriarCanal from 'src/actions/admin/actionCriarCanal';
import { LoadingButton } from '@material-ui/lab';
import actionDescontinuarCanal from 'src/actions/admin/actionDescontinuarCanal';
import ModalConfirmacao from 'src/components/_dashboard/admin/ModalConfirmacao';
import v2_actionEditarCanal from "src/actions/admin/v2_actionEditarCanal";
import v2_actionDetalhesCanal from "src/actions/admin/v2_actionDetalhesCanal";
import v1_actionCriarFluxoDireto from "src/actions/clientes/v1_actionCriarFluxoDireto";
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import v2_actionListaFluxosDiretos from "src/actions/clientes/v2_actionListaFluxosDiretos";
import v2_actionListaFlows from "src/actions/clientes/v2_actionListaFlows";
import v2_actionDeleteFlowDirect from "src/actions/clientes/v2_actionDeleteFlowDirect";
import v2_actionListSectorsByClient from "src/actions/clientes/v2_actionListSectorsByClient";
import v2_actionListUsersByClient from "src/actions/clientes/v2_actionListUsersByClient";
import v2_actionListaAgentesAi from "src/actions/v2/ai/v2_actionListaAgentesAi";
import v2_actionCriarAgente from "src/actions/v2/ai/v2_actionCriarAgente";
import v2_actionAgenteAi from "src/actions/v2/ai/v2_actionAgenteAi";
import v2_actionAiConfig from "src/actions/v2/ai/v2_actionAiConfig";
import v2_actionDeletarAgente from "src/actions/v2/ai/v2_actionDeletarAgente";
import v2_actionEditarAgenteAi from "src/actions/v2/ai/v2_actionEditarAgenteAi";
import v2_actionCalendarios from "src/actions/v2/ai/v2_actionCalendarios";
import v2_actionAgenteTreinamentos from "src/actions/v2/ai/v2_actionAgenteTreinamentos";
import v2_actionCriarTreinamento from "src/actions/v2/ai/v2_actionCriarTreinamento";
import v2_actionAiNodes from "src/actions/v2/ai/v2_actionAiNodes";
import v2_actionDeletarTreinamento from "src/actions/v2/ai/v2_actionDeletarTreinamento";
import apiClient from 'src/api/client';
import scraper from 'src/api/scraper';
import { array } from 'prop-types';
import { validate as uuidValidate, v4 as uuidv4 } from 'uuid';
import nodes from 'src/api/nodes';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'nome', label: 'nome', alignRight: false },
    { id: 'sessao', label: 'sessao', alignRight: false },
    { id: 'pod', label: 'pod', alignRight: false },
    { id: 'webhook_type', label: 'webhook_type', alignRight: false },
    { id: 'status', label: 'status', alignRight: false },
    { id: '' },

];

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

function applySortFilter(array, comparator, query) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    if (query) {
        return filter(array, (_user) => _user.username.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return stabilizedThis.map((el) => el[0]);
}


export default function CanaisList({ usuariosData, setoresData, data, usuario, clienteData, changeDocLoaderNodeName, docLoaderNodeName }) {
    const { themeStretch } = useSettings();
    const theme = useTheme();
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('name');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [openModalNew, setOpenModalNew] = useState(false);
    const [openDialogEditarSetor, setOpenDialogEditarSetor] = useState(false);
    const [openModalNeww, setOpenModalNeww] = useState(true);
    ///// value fields
    const [tituloEdit, setTituloEdit] = useState('');
    const [respostaEdit, setRespostaEdit] = useState('');
    const [statusEdit, setStatusEdit] = useState(true);
    const [idResposta, setIdResposta] = useState('');

    /// novo
    const [canalId, setCanalId] = useState('');
    const [listaServidores, setListaServidores] = useState([]);
    const [webhookType, setWebhookType] = useState('dialogflow_basic');
    const [direcionaUsuarios, setDirecionaUsuarios] = useState([]);
    const [direcionaSetores, setDirecionaSetores] = useState([]);
    const [statusDirecionamento, setStatusDirecionamento] = useState('');
    const [nome, setNome] = useState('');
    const [pod, setPod] = useState('');
    const [canal, setCanal] = useState('whatsapp');
    const [token, setToken] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [projectId, setProjectId] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [mensagemAfterDirecionamento, setMensagemAfterDirecionamento] = useState('');
    const [loading, setLoading] = useState(false);
    const [openModalConfirmaExclusao, setOpenModalConfirmaExclusao] = useState(false);
    const [generateNewToken, setGenerateNewToken] = useState('antigo_token');

    ///// editar canal
    const [openModalEditar, setOpenModalEditar] = useState(false);

    useEffect(() => {
        if (openModalEditar && clienteData?._id) {
            console.log("🔄 Atualizando fluxos direcionados...");
            v2_actionListaFluxosDiretos(clienteData._id)
                .then(response => {
                    console.log("📌 Fluxos carregados no modal:", response.data);
                    setFluxosDiretos([...response.data]); // 🔥 Garante que a mudança seja detectada pelo React
                })
                .catch(error => console.error("❌ Erro ao buscar fluxos:", error));

                v2_actionListUsersByClient(clienteData._id)
                .then(response => {
                console.log("📌 Usuários carregados:", response.data);
                setListaUsuarios(Array.isArray(response.data.data) ? response.data.data : []);
                })
                .catch(error => console.error("❌ Erro ao buscar usuários:", error));

                v2_actionListSectorsByClient(clienteData._id)
                .then(response => {
                console.log("📌 Setores carregados:", response.data);
                setListaSetores(Array.isArray(response.data.data) ? response.data.data : []);
                })
                .catch(error => console.error("❌ Erro ao buscar setores:", error));
        }
    }, [openModalEditar, clienteData._id]);
    const [canais, setCanais] = useState(data);
    useEffect(() => {
        if (openModalEditar) {
            buscarListaAgentes();
        }
    }, [openModalEditar]);

    const [openModalAgentes, setOpenModalAgentes] = useState(false);
    const [selectAgentes, setSelectAgentes] = useState(false);
    const [openModalCriarAgente, setOpenModalCriarAgente] = useState(false);
    const [listaAgentes, setListaAgentes] = useState([]);
    const [nomeAgente, setNomeAgente] = useState('');
    const navigate = useNavigate();

    const [tabValue, setTabValue] = useState(0);
    const [agenteId, setAgenteId] = useState(null);


const [websites, setWebsites] = useState([]);
  







  // Exemplo de função para adicionar website (chamar API e atualizar a lista)


  const [documents, setDocuments] = useState([]);

   const optionsDocuments = [
    {
        value: 'pdfFile',
        label: 'PDF',
        fileType:'.pdf'
    },

    {
        value: 'docxFile',
        label: 'DOCX',
        fileType:'.docx'
    },
    {
        value: 'textFile',
        label: 'TXT',
        fileType:'.txt'
    },
    // {
    //     value: 'csvFile',
    //     label: 'CSV',
    //     fileType:'.csv'
    // }
]
   function getFileTypeByValue(value) {
    const file = optionsDocuments.find(file => file.value === value);
    return file ? file.fileType : null;
}
   

  
    useEffect(() => {
      if (selectAgentes && clienteData?._id) {
          v2_actionListaAgentesAi(clienteData?._id)
              .then((response) => {
                  setListaAgentes(response?.data?.data || []);
              })
              .catch((error) => console.error("Erro ao buscar agentes:", error));
      }
  }, [selectAgentes, clienteData]);
    
    const handleCriarAgente = async () => {
        if (!nomeAgente) {
            enqueueSnackbar('Informe um nome para o agente.', { variant: 'warning' });
            return;
        }
    
        setLoading(true);
        try {
            const response = await v2_actionCriarAgente(clienteData?._id, {
                scope: { name: nomeAgente }  // 🔥 Corrigindo o payload
            });
    
            if (response?.data?.status === 'success') {
                enqueueSnackbar('Agente criado com sucesso!', { variant: 'success' });
    
                const agenteId = response.data.data._id;
                
                // Chamando as outras ações necessárias
                await v2_actionAgenteAi(agenteId);
                await v2_actionAiConfig(agenteId);
                await v2_actionListaAgentesAi(clienteData?._id);
    
                setListaAgentes((prev) => [...prev, response.data.data]);
                setOpenModalCriarAgente(false);
                setNomeAgente('');
    
                navigate(`/admin/agentes/${agenteId}`);
            } else {
                enqueueSnackbar('Erro ao criar agente.', { variant: 'error' });
            }
        } catch (error) {
            console.error("Erro ao criar agente:", error);
            enqueueSnackbar('Erro ao criar agente.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const buscarListaAgentes = async () => {
        try {
            const response = await v2_actionListaAgentesAi(clienteData?._id);
            if (response?.data) {
              setListaAgentes(response.data?.data || []);
                console.log("📌 Agentes carregados:", response.data);
            }
        } catch (error) {
            console.error("❌ Erro ao buscar agentes:", error);
        }
    };
    const [editData, setEditData] = useState({
      nome: '',
      config: {
        direcionamento_direto: { fluxos: [] },
        dialogflow: {
          privateKey: '',
          projectId: '',
          clientEmail: '',
          status: true
        },
        laisGo: {
          status: false
        },
        general_config: {
          msgFinish: false, // <-- Toggle de finalização
          finish: ''        // <-- Mensagem de finalização
        }
      }
    });
    const { enqueueSnackbar } = useSnackbar();
    const location = useLocation();
    const [openModal, setOpenModal] = useState(false);
    useEffect(() => {
        if (openModal && clienteData?._id) {
            console.log("🔍 Buscando usuários e setores...");
    
            // Buscar usuários
            v2_actionListUsersByClient(clienteData._id)
            .then(response => {
                console.log("📌 Usuários carregados:", response.data);
                setListaUsuarios(Array.isArray(response.data.data) ? response.data.data : []);
            })
            .catch(error => console.error("❌ Erro ao buscar usuários:", error));
    
            // Buscar setores
            v2_actionListSectorsByClient(clienteData._id)
            .then(response => {
                console.log("📌 Setores carregados:", response.data);
                setListaSetores(Array.isArray(response.data.data) ? response.data.data : []);
            })
            .catch(error => console.error("❌ Erro ao buscar setores:", error));
        }
    }, [openModal, clienteData]);
    const [novoFluxo, setNovoFluxo] = useState({ recebe: '', direciona_usuarios: [], direciona_setores: [] });
    const [recebe, setRecebe] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [setores, setSetores] = useState([]);
    const [configuracao, setConfiguracao] = useState("dialogflow");
    const [fluxoChat, setFluxoChat] = useState("finalizacao"); 
    const handleChangeConfiguracao = (event, novaConfiguracao) => {
        if (novaConfiguracao !== null) {
            setConfiguracao(novaConfiguracao);
        }
    };
    const [fluxosDiretos, setFluxosDiretos] = useState([]);
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [listaSetores, setListaSetores] = useState([]);
    const [selecionadosSetores, setSelecionadosSetores] = useState([]);
    const [selecionadosUsuarios, setSelecionadosUsuarios] = useState([]);



useEffect(() => {
  // Carrega websites somente se a aba “Websites” for selecionada (ex.: tabValue === 1)
  // e se existir agenteId
  if (tabValue === 1 && agenteId) {
    v2_actionAgenteTreinamentos(agenteId)
      .then((res) => {
        console.log('Resposta de Treinamentos:', res.data);
        // Se a estrutura for: { data: { responseWebsites: [...] } }
        const array = res.data?.data?.responseWebsites;
        if (array && Array.isArray(array)) {
          setWebsites(array);
        } else {
          setWebsites([]);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar websites:', error);
        setWebsites([]);
      });
  }
}, [tabValue, agenteId]);
useEffect(() => {
    if (tabValue === 2 && agenteId) {
      v2_actionAgenteTreinamentos(agenteId)
        .then((res) => {
          console.log('Resposta de Treinamentos (docs):', res.data);
          const array = res.data?.data?.responseDocuments;
          if (array && Array.isArray(array)) {
            setDocuments(array);
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar documentos:', error);
          setDocuments([]);
        });
    }
  }, [tabValue, agenteId]);


   

    const [subConfig, setSubConfig] = useState('configuracoes'); // Alternar entre "Configurações" e "Direcionamentos"
    useEffect(() => {
        console.log("Estado do laisGo atualizado:", editData?.config?.laisGo?.status);
        
    }, [editData]);
    // Extrai o parâmetro de consulta "channel" da string de busca (search) da URL
    const params = new URLSearchParams(location.search);
    const channel = params.get('channelId');
    const isNew = params.get('new');
    const handleOpenModalEditarCanal = async (canalId) => {
        try {
            if (!canalId) {
                console.error("❌ Nenhum ID de canal foi fornecido.");
                return;
            }
    
            console.log("🔍 Buscando detalhes do canal para ID:", canalId);
    
            // Busca os detalhes do canal no backend
            const response = await v2_actionDetalhesCanal(canalId);
            
            const canalData = response?.data?.data;
    
            if (!canalData) {
                console.error("❌ Nenhum dado retornado para o canal.");
                return;
            }
    
            console.log("✅ Dados carregados do backend:", canalData);
    
            // Define os dados carregados no estado, garantindo que `laisGo` não fique undefined
            setEditData((prev) => ({
                ...prev,
                nome: canalData.nome || prev.nome,
                sessao: canalData.sessao || prev.sessao,
                pod: canalData.pod || prev.pod,
                webhook_type: canalData.webhook_type || prev.webhook_type,
                status: canalData.status ?? prev.status,
                config: {
                    ...prev.config, // 🔥 Mantém os valores já existentes no estado
                    ...canalData.config, // 🔥 Mantém os valores que vieram do backend
                    laisGo: {
                        status: canalData.config?.laisGo?.status ?? false, // 🔥 Garante que status sempre tenha um valor
                    },
                    dialogflow: {
                        privateKey: canalData.config?.dialogflow?.privateKey || '',
                        projectId: canalData.config?.dialogflow?.projectId || '',
                        clientEmail: canalData.config?.dialogflow?.clientEmail || '',
                        status: canalData.config?.dialogflow?.status ?? true,
                    },
                },
                general_config: {
                  // Se não vier nada do backend, default para false e string vazia
                  msgFinish: canalData.config?.general_config?.msgFinish ?? false,
                  finish:
                    canalData.config?.general_config?.finish || '',
                },
            }));
    
            console.log("✅ Estado atualizado com os dados do backend:", canalData);
    
            // Pequeno delay para garantir que o estado foi atualizado antes do modal abrir
            setTimeout(() => {
                setOpenModalEditar(true);
            }, 100);
        } catch (error) {
            console.error("❌ Erro ao buscar detalhes do canal:", error);
        }
    };
    const [loadDirecionamentos, setLoadDirecionamentos] = useState(false);
    const handleSubConfigChange = (event, newValue) => {
        if (newValue === "direcionamentos" && !loadDirecionamentos) {
            setLoadDirecionamentos(true); // Marca que a aba foi acessada
    
            console.log("🔄 Buscando fluxos direcionamentos...");
            v2_actionListaFluxosDiretos(clienteData._id)
                .then(response => {
                    console.log("📌 Fluxos Diretos da API:", response.data);
    
                    if (!response.data || response.data.length === 0) {
                        console.warn("⚠️ Nenhum fluxo retornado.");
                        return;
                    }
    
                    setEditData(prev => ({
                        ...prev,
                        config: {
                            ...prev.config,
                            direcionamento_direto: {
                                ...prev.config?.direcionamento_direto,
                                fluxos: response.data || []
                            }
                        }
                    }));
                })
                .catch(error => console.error("❌ Erro ao buscar fluxos:", error));
        }
    
        setSubConfig(newValue);
    };
    
      const handleCloseModalEditarCanal = () => {
        setOpenModalEditar(false);
      };

    useEffect(() => {
        console.log('Estado canalId atualizado:', canalId);
    }, [canalId]);

    useEffect(() => {
        console.log("📌 Estado atualizado - Usuários:", usuarios);
        console.log("📌 Estado atualizado - Setores:", setores);
    }, [usuarios, setores]);

    const handleCriarFluxo = async () => {
        try {
            let data = {
                clienteId: clienteData?._id || "ID_NAO_DEFINIDO",
                recebeField: recebe,  // Renomeado para seguir o padrão do código funcional
                direcionaUsuariosField: direcionaUsuarios || [], // 🚀 Evita undefined
                direcionaSetoresField: direcionaSetores || [],
            };
    
            console.log("📌 Enviando fluxo:", data);
    
            const response = await v1_actionCriarFluxoDireto(data);
    
            if (response.status === 200) {
                console.log("✅ Fluxo criado com sucesso:", response.data);
    
                // Resetar os estados
                setRecebe('');
                setUsuarios([]);
                setSelecionadosSetores([]);
    
                setOpenModal(false); // Fecha o modal
            }
        } catch (error) {
            console.error("❌ Erro ao criar fluxo:", error);
        }
    };
    
    useEffect(() => {
        console.log("🔄 Buscando fluxos direcionados...");
        v2_actionListaFluxosDiretos(clienteData._id)
            .then(response => {
                console.log("📌 Fluxos recebidos no frontend:", response.data);
                setFluxosDiretos(response.data?.data || []);
            })
            .catch(error => console.error("❌ Erro ao buscar fluxos:", error));
    }, [clienteData?._id]);

    const handleSave = async () => {
        try {
          if (!editData || !canalId) {
            console.error("Dados insuficientes para salvar.");
            return;
          }
      
          const payload = {
            action: "editar_canal_front",
            scope: {
              nome: editData.nome || '',
              platform: editData.platform || 'whatsapp',
              status: true,
              date: new Date().toISOString(),
              sessao: editData.sessao || 'default-sessao',
              pod: editData.pod || '',
              webhook_type: editData.webhook_type || 'dialogflow_basic',
              token: editData.token || '',
              usuario: editData.usuario || '',
              config: {
                ...editData.config,
                laisGo: {
                    status: editData.config?.laisGo?.status || false, // Adicionando o status do laisGo no payload
                },
                dialogflow: {
                  privateKey: editData.config?.dialogflow?.privateKey || '',
                  projectId: editData.config?.dialogflow?.projectId || '',
                  clientEmail: editData.config?.dialogflow?.clientEmail || '',
                  status: true,
                },
                direcionamento_direto: {
                  direcionado_para: editData.config?.direcionamento_direto?.direcionado_para || '',
                  direciona_setor: editData.config?.direcionamento_direto?.direciona_setor || [],
                  direciona_usuario: editData.config?.direcionamento_direto?.direciona_usuario || [],
                  statusRoom: editData.config?.direcionamento_direto?.statusRoom || '',
                  mensagem_apos_cadastro: editData.config?.direcionamento_direto?.mensagem_apos_cadastro || '',
                },
                ai: {
                  ...editData.config?.ai,
                  prompt: editData.config?.ai?.prompt || '',
                  provider: editData.config?.ai?.provider || '',
                },
                generalConfig: {
                  msgFinish: editData.config?.generalConfig?.msgFinish,
                  msgTransfer: editData.config?.generalConfig?.msgTransfer,
                  msgFeedback: editData.config?.generalConfig?.msgFeedback,
                  msgWelcome: editData.config?.generalConfig?.msgWelcome,
                  msgDirecionamento: editData.config?.generalConfig?.msgDirecionamento,
                  msgs: {
                    finish: editData.config?.generalConfig?.msgs?.finish,
                    transfer: editData.config?.generalConfig?.msgs?.transfer,
                    feedback: editData.config?.generalConfig?.msgs?.feedback,
                    welcome: editData.config?.generalConfig?.msgs?.welcome,
                    direcionamento: editData.config?.generalConfig?.msgs?.direcionamento
                  }
                },
              },
            },
          };
      
          console.log("Payload enviado:", payload);
      
          await v2_actionEditarCanal(canalId, payload);
      

          setEditData((prev) => ({
            ...prev,
            config: {
                ...prev.config,
                laisGo: {
                    status: payload.scope.config.laisGo.status, // Garantindo que o estado seja atualizado
                },
            },
        }));
          setCanais((prevCanais) =>
            prevCanais.map((canal) =>
              canal._id === canalId ? { ...canal, ...editData } : canal
            )
          );
      
          setOpenModalEditar(false);
          enqueueSnackbar("Canal editado com sucesso!", { variant: "success" });
        } catch (error) {
          console.error("Erro ao editar canal:", error);
          enqueueSnackbar("Erro ao editar canal.", { variant: "error" });
        }
      };


      

      ///--------- /////
    

    useEffect(() => {
        buscarListaServidores()
    }, [])


    const limparCampos = () => {
        setMensagemAfterDirecionamento('');
        setClientEmail('');
        setProjectId('');
        setPrivateKey('');
        setToken('');
        setNome('')
        setPod('');
        setStatusDirecionamento([]);
        setDirecionaSetores([]);
        setWebhookType('dialogflow_basic');
        setGenerateNewToken('');
    }

    const [tipoAcao, setTipoAcao] = useState('');


    const buscarListaServidores = async () => {
        try {
            const res = await actionListaServidores();
            setListaServidores(res.data.data)
        } catch (error) {

        }
    }

    const buscarTokenWhatsapp = async () => {
        try {
            const res = await actionGerarTokenWhatsapp(pod, clienteData.sessao)
            if (res.data.status === "success") {
                setToken(res.data.token);
            }
        } catch (error) {
            console.log('Erro ao buscar token', error)
        }
    }

    const onCriarCanal = async () => {
        setLoading(true);
        let data = {
            generateNewToken,
            nome: nome,
            clienteId: clienteData._id,
            platform: canal,
            pod: pod,
            webhookType: webhookType,
            sessao: clienteData.sessao,
            config: {
                token: token,
                sessao: clienteData.sessao,
                usuario: clienteData.usuario,
                dialogflow: {
                    privateKey: privateKey ? privateKey : "",
                    status: true,
                    projectId: projectId ? projectId : "",
                    clientEmail: clientEmail ? clientEmail : ""
                },
                direcionamento_direto: {
                    direcionar_para: "setor",
                    direciona_setor: direcionaSetores.length > 0 ? direcionaSetores.map(item => item.value) : [],
                    direciona_usuario: direcionaUsuarios.length > 0 ? direcionaUsuarios.map(item => item.value) : [],
                    statusRoom: statusDirecionamento ? statusDirecionamento : "",
                    mensagem_apos_cadastro: mensagemAfterDirecionamento ? mensagemAfterDirecionamento : ""
                },
                custom_webhook: false
            },
            usuario: clienteData.usuario,
        }
        try {
            await actionCriarCanal(data);
            setLoading(false);
            setOpenModalNew(false);
            dispatch(getListaCanaisPorCliente(clienteData._id));
            limparCampos('');
        } catch (error) {
            setLoading(false);
            console.log('erro ao criar canal');
        }
    }


    const handleChangeStatusDirecionamento = (event) => {
        setStatusDirecionamento(event.target.value);
    };



    const setValuesEdit = (item) => {
        const transformUsuarios = listaUsuarios.filter(objeto => item.config.direcionamento_direto.direciona_usuario.includes(objeto._id));
        const transformSetores = listaSetores.filter(objeto => item.config.direcionamento_direto.direciona_setor.includes(objeto._id));
        setDirecionaSetores(item.config.direcionamento_direto.direciona_setor.length > 0 ? transformSetores : []);
        setDirecionaUsuarios(item.config.direcionamento_direto.direciona_usuario.length > 0 ? transformUsuarios : []);

        setMensagemAfterDirecionamento('');
        setClientEmail(item.config.dialogflow.clientEmail ? item.config.direcionamento_direto.clientEmail : '');
        setProjectId(item.config.dialogflow.projectId ? item.config.direcionamento_direto.projectId : '');
        setPrivateKey(item.config.dialogflow.privateKey ? item.config.direcionamento_direto.privateKey : '');
        setToken(item.config.token);
        setCanal(item.platform);
        setNome(item.nome)
        setPod(item.pod);
        setStatusDirecionamento(item.config.direcionamento_direto.statusRoom ? item.config.direcionamento_direto.statusRoom : '');

        console.log('transformUsuarios', listaUsuarios, transformUsuarios);
        //   console.log('transformSetores', item.config.direcionamento_direto.direciona_usuario.length > 0 ? transformUsuarios : []);
    }

    const handleClickOpenModal = (value, item) => {
        switch (value) {
            case 'editar':
                setTipoAcao(value);
                setValuesEdit(item);
                break;
            case 'criar':
                limparCampos();
                break;

            default:
                break;
        }
        setOpenModalNew(true)
    };


    /////////// editar setor
    const handleEditarResposta = () => {
        actionEditarResposta({
            id: idResposta,
            titulo: tituloEdit,
            resposta: respostaEdit
        }).then(() => {
            setOpenDialogEditarSetor(false);
            dispatch(getRespostasList(clienteData._id));
        }).catch(error => console.log('error', error));
    }


    const onDescontinuarCanal = async (id) => {
        try {
            await actionDescontinuarCanal(id);
            setOpenModalConfirmaExclusao(false);
            dispatch(getListaCanaisPorCliente(clienteData._id));
            setCanalId('')
        } catch (error) {
            setCanalId('');
        }

    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = data.map((n) => n.name);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
    const filteredUsers = applySortFilter(data, getComparator(order, orderBy), filterName);





    return (
        <Container maxWidth={themeStretch ? false : 'lg'}>
<Stack spacing={2}>
            <ModalConfirmacao
                open={openModalConfirmaExclusao}
                onClose={() => setOpenModalConfirmaExclusao(false)}
                onConfirm={() => onDescontinuarCanal(canalId)}
                titulo="Deseja mesmo excluir o canal?"
            />

            <Dialog fullWidth maxWidth={'md'} open={openModalNew} onClose={() => {
                setOpenModalNew(false);
                limparCampos();

            }}>
                <DialogTitle sx={{ textTransform: 'capitalize' }}>{tipoAcao} Canal</DialogTitle>
                <DialogContent>
                    <Stack spacing={4}>
                        <Stack direction={"row"} spacing={2} alignItems={"center"} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                autoFocus
                                type="text"
                                value={nome}
                                margin="dense"
                                variant="outlined"
                                label="Nome"
                                onChange={e => setNome(e.target.value)}
                            />

                            <FormControl fullWidth >
                                <InputLabel id="demo-simple-select-label">Canal</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={canal}
                                    label="Status Direcionamento"
                                    onChange={handleChangeStatusDirecionamento}
                                >
                                    <MenuItem value={"whatsapp"}>Whatsapp</MenuItem>

                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack direction={"column"} spacing={1}>

                            <Stack >
                                <FormControl sx={{ width: 300 }}>
                                    <InputLabel id="demo-multiple-name-label">POD</InputLabel>
                                    <Select
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        value={pod}
                                        onChange={event => setPod(event.target.value)}
                                        input={<Select label="POD" />}
                                    //   MenuProps={MenuProps}
                                    >
                                        {listaServidores.map((name) => (
                                            <MenuItem
                                                key={name._id}
                                                value={name.pod}
                                            >
                                                {name.pod}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Stack sx={{mt:3}}>
                            <FormControl>
                                <FormLabel
                                    id="demo-controlled-radio-buttons-group"
                                    label="Top"
                                    labelPlacement="top"

                                >Token</FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    value={generateNewToken}
                                    onChange={e => setGenerateNewToken(e.target.value)}
                                >
                                    <FormControlLabel value="antigo_token" control={<Radio />} label="Manter Token" />
                                    <FormControlLabel value="novo_token" control={<Radio />} label="Gerar Novo Token" />
                                
                                </RadioGroup>
                            </FormControl>
                        </Stack>

                        {generateNewToken === 'novo_token' && (
                             <Stack spacing={2} direction={"row"} style={{ marginTop: 30 }}>
                             <TextField
                                 autoFocus
                                 type="text"
                                 value={token}
                                 margin="dense"
                                 variant="outlined"
                                 label="Token"
                                 fullWidth
                                 onChange={e => setToken(e.target.value)}
                             />
                             <Button onClick={buscarTokenWhatsapp} disabled={pod ? false : true} size="medium" variant="contained">Gerar Token</Button>
                         </Stack>
                        )}

                           
                        </Stack>

                        <Stack>
                            <FormControl>
                                <FormLabel
                                    id="demo-controlled-radio-buttons-group"
                                    label="Top"
                                    labelPlacement="top"

                                >Chatbot</FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    value={webhookType}
                                    onChange={e => setWebhookType(e.target.value)}
                                >
                                    <FormControlLabel value="direct" control={<Radio />} label="Direcionamento Direto" />
                                    <FormControlLabel value="dialogflow_basic" control={<Radio />} label="DialogFlow" />
                                </RadioGroup>
                            </FormControl>
                        </Stack>

                        {webhookType === "dialogflow_basic" && (

                            <Stack direction={"column"} sx={{ mt: 5 }} spacing={2}>
                              
                                <Typography>Dialogflow</Typography>
                                <TextField
                                    autoFocus
                                    type="text"
                                    value={privateKey}
                                    margin="dense"
                                    variant="outlined"
                                    label="Private Key"
                                    onChange={e => setPrivateKey(e.target.value)}
                                />

                                <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                    <TextField
                                        autoFocus

                                        type="text"
                                        value={clientEmail}
                                        margin="dense"
                                        variant="outlined"
                                        label="Client Email"
                                        onChange={e => setClientEmail(e.target.value)}
                                    />
                                    <TextField
                                        autoFocus
                                        type="text"
                                        value={projectId}
                                        margin="dense"
                                        variant="outlined"
                                        label="Project Id"
                                        onChange={e => setProjectId(e.target.value)}
                                    />
                                </Stack>
                            </Stack>
                        )}



                        {webhookType === "direct" && (

                            <Stack direction={"column"} sx={{ mt: 5 }} spacing={3}>
                                <Typography>Direcionamento Direto</Typography>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Status Direcionamento</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={statusDirecionamento}
                                        label="Status Direcionamento"
                                        onChange={handleChangeStatusDirecionamento}
                                    >
                                        <MenuItem value={"Atendendo"}>Atendendo</MenuItem>
                                        <MenuItem value={"Pendente"}>Pendente</MenuItem>

                                    </Select>
                                </FormControl>

                                <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                    <Grid spacing={2} container style={{ marginTop: 20 }}>
                                        <Grid item md={6}>
                                        <Autocomplete
    multiple
    options={listaUsuarios || []}
    getOptionLabel={(option) => `${option.nomeFantasia} - ${option.nome_setor}`}
    value={usuarios}
    onChange={(e, newValue) => {
        console.log("👤 Usuários selecionados antes do setUsuarios:", newValue);
        setUsuarios(newValue); // Armazena os objetos completos
    }}
    renderTags={(value, getTagProps) =>
        value.map((option, index) => (
            <Chip variant="outlined" label={option.nomeFantasia} {...getTagProps({ index })} />
        ))
    }
    renderInput={(params) => <TextField {...params} variant="outlined" label="Selecionar Usuários" />}
/>
                                        </Grid>
                                        <Grid item md={6}>
                                            <Autocomplete
                                                multiple
                                                variant="outlined"
                                                fullWidth
                                                options={listaSetores}
                                                getOptionLabel={(option) => option.nome}
                                                defaultValue={direcionaSetores}
                                                filterSelectedOptions
                                                onChange={(event, newValue) => {
                                                    setDirecionaSetores(newValue);
                                                }}
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => (<Chip variant="outlined" label={option.nome} {...getTagProps({ index })} />))
                                                }
                                                renderInput={(params) => (
                                                    <TextField {...params} variant="outlined" label="Selecionar Setores" placeholder="EntryPoints" />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </Stack>
                                <Stack>
                                    <TextField
                                        autoFocus

                                        type="text"
                                        value={mensagemAfterDirecionamento}
                                        margin="dense"
                                        variant="outlined"
                                        multiline
                                        rows={3}
                                        label="Mensagem após direcionamento"
                                        onChange={e => setMensagemAfterDirecionamento(e.target.value)}
                                    />

                                </Stack>
                            </Stack>
                        )}


                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModalNew(false)} color="inherit">
                        Cancelar
                    </Button>
                    <LoadingButton sx={{ textTransform: 'capitalize' }} loading={loading} onClick={onCriarCanal} variant="contained">
                        Criar Canal
                    </LoadingButton>
                </DialogActions>
            </Dialog>


            <HeaderBreadcrumbs
                heading="Canais"
                links={[
                    { name: '' }
                ]}
                action={
                    <Button
                        variant="contained"
                        onClick={() => handleClickOpenModal('criar', null)}
                        startIcon={<Icon icon={plusFill} />}
                    >
                        Criar Canal
                    </Button>
                }
            />

            <Card>
                {/* <Grid container>
            <Grid item>
            <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />
            </Grid>
          </Grid>
          */}


                <Scrollbar>
                    <TableContainer sx={{ minWidth: 400 }}>
                        <Table>
                            <UserListHead
                                order={order}
                                orderBy={orderBy}
                                headLabel={TABLE_HEAD}
                                rowCount={data.length}
                                numSelected={selected.length}
                                onRequestSort={handleRequestSort}
                                onSelectAllClick={handleSelectAllClick}
                            />
                            <TableBody>
                                {canais.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                    console.log(row);
                                    const {
                                        _id,
                                        nome,
                                        sessao,
                                        pod,
                                        webhook_type,
                                        status,
                                        ativo,
                                        platform,
                                        config
                                    } = row;
                                    const isItemSelected = selected.indexOf(_id) !== -1;
                                    let dataResposta = { _id, nome, status, ativo }
                                    

                                    return (
                                        <TableRow
                                            hover
                                            key={_id}
                                            tabIndex={-1}
                                            role="checkbox"
                                            selected={isItemSelected}
                                            aria-checked={isItemSelected}
                                        >


                                            <TableCell component="th" scope="row" padding="none">
                                                <Stack direction="row" alignItems="center" spacing={2}>

                                                    <Typography variant="subtitle2" noWrap>
                                                        {nome}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="left">{sessao}</TableCell>
                                            <TableCell align="left">{pod}</TableCell>
                                            <TableCell align="left">{webhook_type}</TableCell>


                                            <TableCell align="left">
                                                <Label
                                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                    color={(!status && 'error') || 'success'}
                                                >
                                                    {!status ? "Desativado" : "Ativado"}
                                                </Label>
                                            </TableCell>

                                            <TableCell align="right">
                                                <RespostaMoreMenu
                                                    onDelete={() => {
                                                        console.log('ID para excluir:', _id)
                                                        setCanalId(_id);
                                                        setOpenModalConfirmaExclusao(true);
                                                    }}
                                                    //onEdit={() => alert('Função ainda não disponível, Exclua e faça novamente!')}
                                                    onEdit={() => {
                                                        console.log('✏️ ID para editar:', _id);
                                                        setCanalId(_id);
                                                        handleOpenModalEditarCanal(_id); // 🔥 Agora buscamos os dados completos antes de abrir o modal
                                                    }}
                                                />
                                            </TableCell>
                                            <Dialog
                                                open={openModalEditar}
                                                onClose={handleCloseModalEditarCanal}
                                                fullWidth
                                                maxWidth="md"
                                            >
                                            <DialogTitle>Editar Canal</DialogTitle>
                                            <DialogContent>
                                            <TextField
                                                fullWidth
                                                autoFocus
                                                type="text"
                                                value={editData.nome || ''}
                                                margin="dense"
                                                variant="outlined"
                                                label="Nome"
                                                onChange={(e) =>  setEditData((prev) => ({...prev, nome: e.target.value, }))}
                                            />  
<FormControlLabel
    control={
        <Switch
            checked={Boolean(editData?.config?.laisGo?.status)} // 🔥 Evita undefined
            onChange={(e) => {
                console.log("🔄 Novo valor do switch:", e.target.checked);
                setEditData((prev) => ({
                    ...prev,
                    config: {
                        ...prev.config,
                        laisGo: {
                            ...prev.config?.laisGo, // Mantém outras propriedades do laisGo
                            status: e.target.checked,
                        },
                    },
                }));
            }}
        />
    }
    label="Silenciar IA com etiqueta"
/>
<div>
            {/* Toggle de Configuração */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Configuração do Canal
            </Typography>
            <ToggleButtonGroup
                value={configuracao}
                exclusive
                onChange={handleChangeConfiguracao}
                aria-label="configuração do canal"
                sx={{ mb: 3 }}
            >
                <ToggleButton
  value="agente_v2"
  onClick={() => {
    buscarListaAgentes([]); // <-- Chama a função
  }}
>
  Agente IA v2
</ToggleButton>
                <ToggleButton value="direcionamento">Direcionamento Direto</ToggleButton>
                <ToggleButton value="dialogflow">DialogFlow</ToggleButton>
                <ToggleButton value="customizado">Customizado</ToggleButton>
                <ToggleButton value="agente_v3">Agente IA (v3)</ToggleButton>
            </ToggleButtonGroup>

            {/* Conteúdo Condicional */}
            {configuracao === "dialogflow" && (
    <div>
        <Typography variant="h6" sx={{ mb: 2 }}>
            Configuração DialogFlow
        </Typography>
        <ToggleButtonGroup
        value={subConfig}
        exclusive
        onChange={handleSubConfigChange}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="configuracoes">Configurações</ToggleButton>
        <ToggleButton value="direcionamentos">Direcionamentos</ToggleButton>
      </ToggleButtonGroup>
      {subConfig === 'configuracoes' && (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <TextField
              label="Private Key"
              multiline
              rows={4}
              value={editData.config?.dialogflow?.privateKey || ''}
              onChange={(e) => setEditData((prev) => ({
                ...prev,
                config: {
                  ...prev.config,
                  dialogflow: { ...prev.config?.dialogflow, privateKey: e.target.value }
                }
              }))}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              label="Client Email"
              value={editData.config?.dialogflow?.clientEmail || ''}
              onChange={(e) => setEditData((prev) => ({
                ...prev,
                config: {
                  ...prev.config,
                  dialogflow: { ...prev.config?.dialogflow, clientEmail: e.target.value }
                }
              }))}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              label="Project ID"
              value={editData.config?.dialogflow?.projectId || ''}
              onChange={(e) => setEditData((prev) => ({
                ...prev,
                config: {
                  ...prev.config,
                  dialogflow: { ...prev.config?.dialogflow, projectId: e.target.value }
                }
              }))}
            />
          </FormControl>
        </Stack>
      )}
        {subConfig === "direcionamentos" && (
    <div>
        <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpenModal(true)}>
            Criar Direcionamento
        </Button>

        <TableContainer component={Paper}>
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Recebe</TableCell>
                <TableCell>Setores</TableCell>
                <TableCell>Usuários</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
    {fluxosDiretos.length > 0 ? (
        fluxosDiretos.map((fluxo) => (
            <TableRow key={fluxo._id}>
                {/* Recebe */}
                <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                    {fluxo?.recebe ? fluxo.recebe : <span style={{ color: 'red' }}>❌ Erro: valor indefinido</span>}
                    </Typography>
                </TableCell>

                {/* Setores */}
                <TableCell>
                    {fluxo.setores?.length > 0 
                        ? fluxo.setores.map((s) => s.nome_setor).join(', ') 
                        : 'Nenhum setor'}
                </TableCell>

                {/* Usuários */}
                <TableCell>
                    {fluxo.usuarios?.length > 0 
                        ? fluxo.usuarios.map((u) => u.nomeFantasia).join(', ') 
                        : 'Nenhum usuário'}
                </TableCell>

                {/* Ícone de exclusão */}
                <TableCell align="right">
                    <IconButton color="error" onClick={() => v2_actionDeleteFlowDirect(fluxo._id)}>
                        <DeleteIcon/>
                    </IconButton>
                </TableCell>
            </TableRow>
        ))
    ) : (
        <TableRow>
            <TableCell colSpan={4} align="center">Nenhum fluxo encontrado</TableCell>
        </TableRow>
    )}
</TableBody>
    </Table>
</TableContainer>
    </div>
)}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Adicionar Fluxo Direto</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
          <TextField
    label="Input"
    fullWidth
    getOptionLabel={(option) => `${option.nomeFantasia} - ${option.nome_setor}`}
    value={recebe}
    onChange={(e) => setRecebe(e.target.value)}
/>
<FormControl fullWidth>
    <InputLabel id="select-usuarios-label">Direciona Usuários</InputLabel>
    <Select
        labelId="select-usuarios-label"
        multiple
        value={direcionaUsuarios || []} // 🚀 Sempre um array
        onChange={(event) => {
            console.log("👤 Usuários selecionados:", event.target.value);
            setDirecionaUsuarios(event.target.value);
        }}
        displayEmpty
    >
        {listaUsuarios?.map((user) => (
            <MenuItem key={user._id} value={user._id}>
                {user.nomeFantasia}
            </MenuItem>
        ))}
    </Select>
</FormControl>

<FormControl fullWidth>
    <InputLabel id="select-setores-label">Direciona Setores</InputLabel>
    <Select
        labelId="select-setores-label"
        multiple
        value={direcionaSetores || []} // 🚀 Sempre um array
        onChange={(event) => {
            console.log("🏢 Setores selecionados:", event.target.value);
            setDirecionaSetores(event.target.value);
        }}
        displayEmpty
    >
        {listaSetores?.map((setor) => (
            <MenuItem key={setor._id} value={setor._id}>
                {setor.nome_setor}
            </MenuItem>
        ))}
    </Select>
</FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">Cancelar</Button>
          <Button onClick={handleCriarFluxo} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
                </div>
            )}

{configuracao === "agente_v2" && (
  <div>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Configuração Agente IA v2
    </Typography>

    <ToggleButtonGroup
      value={subConfig}
      exclusive
      onChange={handleSubConfigChange}
      sx={{ mb: 3 }}
    >
      <ToggleButton value="configuracoes">Configurações</ToggleButton>
      <ToggleButton value="direcionamentos">Direcionamentos</ToggleButton>
    </ToggleButtonGroup>
    {subConfig === "direcionamentos" && (
      <div>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => setOpenModal(true)}
        >
          Criar Direcionamento
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Recebe</TableCell>
                <TableCell>Setores</TableCell>
                <TableCell>Usuários</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fluxosDiretos.length > 0 ? (
                fluxosDiretos.map((fluxo) => (
                  <TableRow key={fluxo._id}>
                    {/* Recebe */}
                    <TableCell>{fluxo.recebe || 'Sem valor'}</TableCell>
                    {/* Setores */}
                    <TableCell>
                      {fluxo.setores?.map((s) => s.nome_setor).join(', ') || 'Nenhum setor'}
                    </TableCell>
                    {/* Usuários */}
                    <TableCell>
                      {fluxo.usuarios?.map((u) => u.nomeFantasia).join(', ') || 'Nenhum usuário'}
                    </TableCell>
                    {/* Excluir */}
                    <TableCell align="right">
                      <IconButton onClick={() => v2_actionDeleteFlowDirect(fluxo._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum fluxo encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    )}
  
        {/* Se a aba "Configurações" estiver ativa */}
        {subConfig === "configuracoes" && (
            <Stack spacing={2} direction="row" alignItems="center">
                {/* Select para escolha de agente */}
                <FormControl fullWidth>
                    <InputLabel value={editData.config?.departamentConfig?.defaultSector || ''} 
                    >Selecione um agente</InputLabel>
                    <Select
  value={editData.config?.ai?.provider || ''}
  onChange={(e) =>
    setEditData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ai: { ...prev.config?.ai, provider: e.target.value }
      }
    }))
  }
>
  {listaAgentes.length > 0 ? (
    listaAgentes.map((agente) => (
      <MenuItem key={agente._id} value={agente.name}>
        {agente.name}
      </MenuItem>
    ))
  ) : (
    <MenuItem disabled>Carregando...</MenuItem>
  )}
</Select>

                </FormControl>

                {/* Botão para ver agentes */}
                <Button
      variant="contained"
      onClick={() => {
        // Em vez de abrir modal, vamos trocar a aba via URL:
        navigate('?tab=agentes'); 
      }}
    >
      Ver agentes
    </Button>





            {/* 🔹 Modal de Criação de Agente */}
            <Dialog open={openModalCriarAgente} onClose={() => setOpenModalCriarAgente(false)} fullWidth maxWidth="sm">
                <DialogTitle>Criar agente</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            label="Nome do agente"
                            value={nomeAgente}
                            onChange={(e) => setNomeAgente(e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModalCriarAgente(false)} color="secondary">Cancelar</Button>
                    <Button onClick={handleCriarAgente} variant="contained" disabled={loading}>
                        {loading ? 'Criando...' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>
            </Stack>
        )}
    </div>
)}

{configuracao === "direcionamento" && (
    <div>
        <Typography variant="h6">Configuração Direcionamento Direto</Typography>

        <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
                value={editData.config?.direcionamento_direto?.statusRoom || ''}
                onChange={(e) => setEditData((prev) => ({
                    ...prev,
                    config: {
                        ...prev.config,
                        direcionamento_direto: {
                            ...prev.config?.direcionamento_direto,
                            statusRoom: e.target.value
                        }
                    }
                }))}
                label="Status"
            >
                <MenuItem value="Atendendo">Atendendo</MenuItem>
                <MenuItem value="Pendente">Pendente</MenuItem>
            </Select>
        </FormControl>
        <FormControl fullWidth>
    <InputLabel id="select-usuarios-label">Direciona Usuários</InputLabel>
    <Select
        labelId="select-usuarios-label"
        multiple
        value={direcionaUsuarios || []} // 🚀 Sempre um array
        onChange={(event) => {
            console.log("👤 Usuários selecionados:", event.target.value);
            setDirecionaUsuarios(event.target.value);
        }}
        displayEmpty
    >
        {listaUsuarios?.map((user) => (
            <MenuItem key={user._id} value={user._id}>
                {user.nomeFantasia}
            </MenuItem>
        ))}
    </Select>
</FormControl>
<FormControl fullWidth>
    <InputLabel id="select-setores-label">Direciona Setores</InputLabel>
    <Select
        labelId="select-setores-label"
        multiple
        value={direcionaSetores || []} // 🚀 Sempre um array
        onChange={(event) => {
            console.log("🏢 Setores selecionados:", event.target.value);
            setDirecionaSetores(event.target.value);
        }}
        displayEmpty
    >
        {listaSetores?.map((setor) => (
            <MenuItem key={setor._id} value={setor._id}>
                {setor.nome_setor}
            </MenuItem>
        ))}
    </Select>
</FormControl>
<FormControl fullWidth>
    <TextField
        label="Mensagem após direcionamento"
        multiline
        rows={3}
        value={editData.config?.direcionamento_direto?.mensagem_apos_cadastro || ''}
        onChange={(e) =>
            setEditData((prev) => ({
                ...prev,
                config: {
                    ...prev.config,
                    direcionamento_direto: {
                        ...prev.config?.direcionamento_direto,
                        mensagem_apos_cadastro: e.target.value
                    }
                }
            }))
        }
    />
</FormControl>
    </div>
)}

            {configuracao === "customizado" && (
                <Typography variant="h6">Configuração Customizado - Campos aqui.</Typography>
                
            )}

{configuracao === "agente_v3" && (
  <div>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Configuração Agente IA v3
    </Typography>

    {/* Botões para sub-aba (configurações/direcionamentos) */}
    <ToggleButtonGroup
      value={subConfig}
      exclusive
      onChange={(e, newValue) => setSubConfig(newValue)}
      sx={{ mb: 3 }}
    >
      <ToggleButton value="configuracoes">Configurações</ToggleButton>
      <ToggleButton value="direcionamentos">Direcionamentos</ToggleButton>
    </ToggleButtonGroup>

    {/* BLOCO 1 (v3): Configurações */}
    {subConfig === "configuracoes" && (
      <Stack spacing={2} direction="row" alignItems="center">
        {/* Select de agentes v3 */}
        <FormControl fullWidth>
          <InputLabel>Selecione um agente (v3)</InputLabel>
          <Select
            value={editData.config?.ai_v3?.provider || ""}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                config: {
                  ...prev.config,
                  ai_v3: {
                    ...prev.config?.ai_v3,
                    provider: e.target.value,
                  },
                },
              }))
            }
          >
            {listaAgentes.length > 0 ? (
              listaAgentes.map((agente) => (
                <MenuItem key={agente._id} value={agente.name}>
                  {agente.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Carregando...</MenuItem>
            )}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={() => {
            setOpenModalAgentes(true);
            buscarListaAgentes();
          }}
        >
          Ver agentes
        </Button>
      </Stack>
    )}

    {/* BLOCO 2 (v3): Direcionamentos */}
    {subConfig === "direcionamentos" && (
      <div>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => setOpenModal(true)}
        >
          Criar Direcionamento
        </Button>

        {/* Exemplo de tabela com fluxos */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Recebe</TableCell>
                <TableCell>Setores</TableCell>
                <TableCell>Usuários</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fluxosDiretos.length > 0 ? (
                fluxosDiretos.map((fluxo) => (
                  <TableRow key={fluxo._id}>
                    <TableCell>{fluxo.recebe || "Sem valor"}</TableCell>
                    <TableCell>
                      {fluxo.setores?.map((s) => s.nome_setor).join(", ") ||
                        "Nenhum setor"}
                    </TableCell>
                    <TableCell>
                      {fluxo.usuarios
                        ?.map((u) => u.nomeFantasia)
                        .join(", ") || "Nenhum usuário"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => v2_actionDeleteFlowDirect(fluxo._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum fluxo encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    )}
  </div>
)}
        </div>
        <div>
        <ToggleButtonGroup
  value={fluxoChat}
  exclusive
  onChange={(event, newValue) => {
    if (newValue !== null) setFluxoChat(newValue);
  }}
  aria-label="fluxo de chat"
>

  <ToggleButton value="finalizacao">Finalização</ToggleButton>
  <ToggleButton value="transferencia">Transferência de chat</ToggleButton>
  <ToggleButton value="pesquisa">Pesquisa de satisfação</ToggleButton>
  <ToggleButton value="boasVindas">Mensagem Boas Vindas</ToggleButton>
  <ToggleButton value="direcionamentoChat">Direcionamento</ToggleButton>
  
</ToggleButtonGroup>
{fluxoChat === "finalizacao" && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle1">Configurações de Finalização</Typography>

    {/* Toggle para habilitar/desabilitar */}
    <FormControlLabel
      control={
        <Switch
          checked={Boolean(editData.config?.generalConfig?.msgFinish)}
          onChange={(e) => {
            const newValue = e.target.checked;
            setEditData((prev) => ({
              ...prev,
              config: {
                ...prev.config,
                generalConfig: {
                  ...prev.config.generalConfig,
                  msgFinish: newValue
                }
              }
            }));
          }}
        />
      }
      label="Habilitar finalização de chat"
    />

    {/* TextField “fixo” sempre visível */}
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Mensagem de finalização do chat"
      value={editData.config?.generalConfig?.msgs?.finish || ''}
      onChange={(e) => {
        const newText = e.target.value;
        setEditData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            generalConfig: {
              ...prev.config.generalConfig,
              msgs: {
                ...prev.config.generalConfig.msgs,
                finish: newText
              }
            }
          }
        }));
      }}
      sx={{ mt: 2 }}
    />
  </Box>
  
)}

{/* TRANSFERÊNCIA */}
{fluxoChat === "transferencia" && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle1">Transferência de chat</Typography>

    <FormControlLabel
      control={
        <Switch
          checked={Boolean(editData.config?.generalConfig?.msgTransfer)}
          onChange={(e) => {
            const newValue = e.target.checked;
            setEditData((prev) => ({
              ...prev,
              config: {
                ...prev.config,
                generalConfig: {
                  ...prev.config.generalConfig,
                  msgTransfer: newValue
                }
              }
            }));
          }}
        />
      }
      label="Enviar mensagem de transferência de chat"
    />

    {/* TextField “fixo” sempre visível */}
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Mensagem de transferência de chat"
      value={editData.config?.generalConfig?.msgs?.transfer || ''}
      onChange={(e) => {
        const newText = e.target.value;
        setEditData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            generalConfig: {
              ...prev.config.generalConfig,
              msgs: {
                ...prev.config.generalConfig.msgs,
                transfer: newText
              }
            }
          }
        }));
      }}
      sx={{ mt: 2 }}
    />
  </Box>
)}

{/* PESQUISA */}
{fluxoChat === "pesquisa" && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle1">Pesquisa de satisfação</Typography>

    <FormControlLabel
      control={
        <Switch
          checked={Boolean(editData.config?.generalConfig?.msgFeedback)}
          onChange={(e) => {
            const newValue = e.target.checked;
            setEditData((prev) => ({
              ...prev,
              config: {
                ...prev.config,
                generalConfig: {
                  ...prev.config.generalConfig,
                  msgFeedback: newValue
                }
              }
            }));
          }}
        />
      }
      label="Enviar pesquisa de satisfação ao cliente"
    />

    {/* TextField “fixo” sempre visível */}
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Mensagem da pesquisa"
      value={editData.config?.generalConfig?.msgs?.feedback || ''}
      onChange={(e) => {
        const newText = e.target.value;
        setEditData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            generalConfig: {
              ...prev.config.generalConfig,
              msgs: {
                ...prev.config.generalConfig.msgs,
                feedback: newText
              }
            }
          }
        }));
      }}
      sx={{ mt: 2 }}
    />
  </Box>
)}

{/* BOAS-VINDAS */}
{fluxoChat === "boasVindas" && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle1">Mensagem Boas-Vindas</Typography>

    {/* TextField “fixo” sempre visível */}
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Mensagem de boas-vindas"
      value={editData.config?.generalConfig?.msgs?.welcome || ''}
      onChange={(e) => {
        const newText = e.target.value;
        setEditData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            generalConfig: {
              ...prev.config.generalConfig,
              msgs: {
                ...prev.config.generalConfig.msgs,
                welcome: newText
              }
            }
          }
        }));
      }}
      sx={{ mt: 2 }}
    />
  </Box>
)}

{/* DIRECIONAMENTO */}
{fluxoChat === "direcionamentoChat" && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle1">Direcionamento no chat</Typography>

    {/* TextField “fixo” sempre visível */}
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Mensagem de direcionamento do chat"
      value={editData.config?.generalConfig?.msgs?.direcionamento || ''}
      onChange={(e) => {
        const newText = e.target.value;
        setEditData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            generalConfig: {
              ...prev.config.generalConfig,
              msgs: {
                ...prev.config.generalConfig.msgs,
                direcionamento: newText
              }
            }
          }
        }));
      }}
      sx={{ mt: 2 }}
    />
  </Box>
)}
       </div>               
       <Box sx={{ mt: 2 }}>
  <Typography variant="h6" gutterBottom>
    Configurações de setor
  </Typography>

  {/* SELECIONAR O SETOR PADRÃO */}
  <FormControl fullWidth sx={{ mb: 3 }}>
    <InputLabel id="setor-padrao-label">Setor padrão</InputLabel>
    <Select
      labelId="setor-padrao-label"
      value={editData.config?.departamentConfig?.defaultSector || ''}
      label="Setor padrão"
      onChange={(e) => {
        const newValue = e.target.value;
        setEditData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            departamentConfig: {
              ...prev.config.departamentConfig,
              defaultSector: newValue
            }
          }
        }));
      }}
    >
      {listaSetores?.map((setor) => (
        <MenuItem key={setor._id} value={setor._id}>
          {setor.nome_setor}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  {/* TOGGLE PARA DISTRIBUIR ATENDIMENTOS */}
  <FormControlLabel
  control={
    <Switch
      checked={Boolean(editData.config?.departamentConfig?.allocate?.status)}
      onChange={(e) => {
        const newValue = e.target.checked;
        setEditData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            departamentConfig: {
              ...prev.config.departamentConfig,
              allocate: {
                ...prev.config.departamentConfig.allocate,
                status: newValue
              }
            }
          }
        }));
      }}
    />
  }
  label="Distribuir atendimentos entre usuários do setor"
/>

  {/* GRUPO DE BOTÕES PARA ESCOLHER O TIPO DE DISTRIBUIÇÃO */}
  {/* Só mostra se allocate.status === true, por exemplo */}
  {editData.config?.departamentConfig?.allocate?.status && (
  <>
    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
      Tipo
    </Typography>
    <ToggleButtonGroup
      exclusive
      color="primary"
      value={editData.config?.departamentConfig?.allocate?.type || "uniform"}
      onChange={(e, newValue) => {
        if (newValue) {
          setEditData((prev) => ({
            ...prev,
            config: {
              ...prev.config,
              departamentConfig: {
                ...prev.config.departamentConfig,
                allocate: {
                  ...prev.config.departamentConfig.allocate,
                  type: newValue
                }
              }
            }
          }));
        }
      }}
    >
      <ToggleButton value="uniform">Distribuição uniforme</ToggleButton>
      <ToggleButton value="random">Aleatório</ToggleButton>
      <ToggleButton value="sequential">Distribuição sequencial</ToggleButton>
    </ToggleButtonGroup>

    {/* Se for “sequential”, exibe também o período */}
    {editData.config?.departamentConfig?.allocate?.type === "sequential" && (
      <>
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Período de distribuição
        </Typography>
        <ToggleButtonGroup
          exclusive
          color="primary"
          value={editData.config?.departamentConfig?.allocate?.period || "day"}
          onChange={(e, newValue) => {
            if (newValue) {
              setEditData((prev) => ({
                ...prev,
                config: {
                  ...prev.config,
                  departamentConfig: {
                    ...prev.config.departamentConfig,
                    allocate: {
                      ...prev.config.departamentConfig.allocate,
                      period: newValue
                    }
                  }
                }
              }));
            }
          }}
        >
          <ToggleButton value="day">Diário</ToggleButton>
          <ToggleButton value="month">Mensal</ToggleButton>
        </ToggleButtonGroup>
      </>
    )}
  </>
)}
</Box>
                                            </DialogContent>
                                            
                                            
                                            
                                            <DialogActions>
    <Button onClick={handleCloseModalEditarCanal} color="secondary">
        Cancelar
    </Button>
    <LoadingButton
        loading={loading}
        onClick={handleSave} // Certifique-se de usar handleSave aqui
        color="primary"
        variant="contained"
    >
        Salvar
    </LoadingButton>
</DialogActions>
                                             </Dialog>
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 53 * emptyRows }}>
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
            </Stack>
        </Container>

    );
}
