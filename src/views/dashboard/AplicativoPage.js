import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import RouterLink from 'next/link';
import { useParams } from 'next/navigation';
// material
import { useTheme } from '@mui/material/styles';
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
    OutlinedInput,
    Divider,
    Box,
    Tabs,
    Tab
} from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getUserList, deleteUser, getListaCanaisPorCliente } from '../../redux/slices/user';
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
import { UserListHead, UserListToolbar } from '../../components/_dashboard/user/list';

import getListaTodosUsuarios from '../../actions/getListaTodosUsuarios';
import addSetor from "../../actions/addSetor";
import cadastrarRespostaRapida from '../../actions/clientes/cadastrarRespostaRapida'
import deletarRespostaRapida from '../../actions/clientes/deletarRespostaRapida';

import { getSetoresList, getRespostasList } from '../../redux/slices/user';

// actions novo
import cadastrarSetor from '../../actions/clientes/cadastrarSetor';
import editarSetor from '../../actions/clientes/editarSetor';
import deletarSetor from '../../actions/clientes/deletarSetor';
import actionEditarResposta from 'src/actions/clientes/actionEditarResposta';


import RespostaMoreMenu from '../../components/_dashboard/admin/clientes/respostas/list/RespostaMoreMenu';
import actionListaServidores from 'src/actions/admin/actionListaServidores';
import actionGerarTokenWhatsapp from 'src/actions/admin/actionGerarTokenWhatsapp';
import actionCriarCanal from 'src/actions/admin/actionCriarCanal';
import actionDescontinuarCanal from 'src/actions/admin/actionDescontinuarCanal';
import ModalConfirmacao from 'src/components/_dashboard/admin/ModalConfirmacao';
import { ForcaVendaComponent } from 'src/sections/dashboard/clientes/aplicativo';

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

function applySortFilter(array, comparator, query, pod) {
    console.log("Original Array:", array);
  
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
  
    let filteredArray = stabilizedThis.map((el) => el[0]);
  
    if (query) {
      filteredArray = filter(
        filteredArray,
        (_user) =>
          _user.nome.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          _user.sessao.toLowerCase().indexOf(query.toLowerCase()) !== -1
      );
    }
  
    if (pod && pod !== 'Todos') {
      filteredArray = filter(filteredArray, (_user) => _user.pod === pod);
    }
  
    console.log("Filtered Array:", filteredArray);
    return filteredArray;
  }


export default function AplicativoPage({
    usuariosData,
    setoresData,
    data,
    usuario,
    clienteData,
    changeStatusPesquisa,
    statusPesquisa,
    mensagemPesquisa,
    changeMensagemPesquisa,
    submitPesquisaConfig
}) {
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

    ///// value fields
    const [tituloEdit, setTituloEdit] = useState('');
    const [respostaEdit, setRespostaEdit] = useState('');
    const [statusEdit, setStatusEdit] = useState(true);
    const [idResposta, setIdResposta] = useState('');
    const [tabsApp, setTabsApp] = useState('forca_vendas');

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

    //const [mensagemPesquisa, setMensagemPesquisa] = useState('');

    useEffect(() => {
        buscarListaServidores()
    }, []);



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
        setWebhookType('dialogflow_basic')
    }

    const [tipoAcao, setTipoAcao] = useState('');

    const listaUsuarios = usuariosData.map(function (i) {
        let data = {
            value: i._id,
            nome: i.nomeFantasia
        }
        return data;
    });

    const listaSetores = setoresData.map(function (i) {
        let data = {
            value: i._id,
            nome: i.nome_setor
        }
        return data;
    });

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

 
    const handleChangeStatus = (event) => {
        setStatusEdit(event.target.checked);
        console.log('foi alerado o status', event.target.checked)
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

    const handleChangeTabsApp = (event, newValue) => {
        setTabsApp(newValue);
    };


    const TABS_APLICATIVO_PAGE = [
        {
            value: 'configuracoes_gerais',
            label:"Configurações Gerais",
            //icon: <Icon  width={20} height={20} />,
            component: <Box></Box>
        },
        {
            value: 'forca_vendas',
            label:"Força de Vendas",
            //icon: <Icon width={20} height={20} />,
            component: <Box sx={{width:'100%', mt:4}}><ForcaVendaComponent
            submitPesquisaConfig={submitPesquisaConfig}
            changeMensagemPesquisa={event => changeMensagemPesquisa(event)}
            changeStatusPesquisa={event => changeStatusPesquisa(event)}
            statusPesquisa={statusPesquisa}
            mensagemPesquisa={mensagemPesquisa}
            />
            </Box> 
        },

    ];



    return (
     
            <Box sx={{width:'100%'}}>
                <Tabs
                    value={tabsApp}
                    scrollButtons="auto"
                    variant="scrollable"
                    allowScrollButtonsMobile
                    onChange={handleChangeTabsApp}
                >
                    {TABS_APLICATIVO_PAGE.map((tab) => (
                        <Tab
                            disableRipple
                            key={tab.value}
                            label={tab.label}
                            icon={tab.icon}
                            value={tab.value}
                        />
                    ))}
                </Tabs>

                {TABS_APLICATIVO_PAGE.map((tab) => {
                    const isMatched = tab.value === tabsApp;
                    return isMatched && <Box key={tab.value}>{tab.component}</Box>;
                })}
            </Box>



    );
}
