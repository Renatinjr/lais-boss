import { filter, set } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import { useTheme } from '@material-ui/core/styles';
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
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
  Divider,
  FormControlLabel,
  Switch,
  MenuItem,
  Autocomplete,
  Chip
} from '@material-ui/core';
import actionAdminActionCliente from 'src/actions/clientes/actionAdminActionCliente';
// redux
import { useDispatch, useSelector } from '../../redux/store';

import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { UserListHead } from '../../components/_dashboard/user/list';
import { getUsuariosList } from '../../redux/slices/user';

// actions NOVO
import cadastrarUsuario from '../../actions/clientes/cadastrarUsuario';
import editarUsuario from '../../actions/clientes/editarUsuario';
import { Select } from '@mui/material';
import v2_actionEditarUsuario from 'src/actions/v2/usuarios/v2_actionEditarUsuario';
import { useSnackbar } from 'notistack5';
import ModalImportarUsuarios from 'src/sections/usuarios/ModalImportarUsuarios';

import { ToastContainer, toast } from 'react-toastify';
import v2_actionConfigGlobal from 'src/actions/v2/admin/v2_actionConfigGlobal';

// --------------------

const TABLE_HEAD = [
  { id: 'nomeFantasia', label: 'Nome Fantasia', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },

  { id: 'nome_setor', label: 'Setor', alignRight: false },
  { id: 'ramal', label: 'Ramal', alignRight: false },
  { id: 'nome', label: 'Nome', alignRight: false },
  { id: 'sobrenome', label: 'Sobrenome', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'chat_interno', label: 'Chat Interno', alignRight: false },
  { id: 'level', label: 'Level', alignRight: false },
  { id: '' }
];

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

export default function UsuariosList({ usuariosData, cliente, setoresData, clienteData, onCallback }) {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const [dadosFluxo, setDadosFluxo] = useState('');

  const [openDialogNewFlow, setOpenDialogNewFlow] = useState(false);
  const [openDialogEditFlow, setOpenDialogEditFlow] = useState(false);

  const [emailEdit, setEmailEdit] = useState('');
  const [usernameEdit, setUsernameEdit] = useState('');
  const [nomeEdit, setNomeEdit] = useState('');
  const [sobrenomeEdit, setSobrenomeEdit] = useState('');
  const [setorEdit, setSetorEdit] = useState(null);
  const [ramalEdit, setRamalEdit] = useState('');
  const [senhaEdit, setSenhaEdit] = useState('');
  const [confirmarSenhaEdit, setConfirmarSenhaEdit] = useState('');
  const [statusEdit, setStatusEdit] = useState(false);
  const [nomeFantasiaEdit, setNomeFantasiaEdit] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [nomeSetorEdit, setNomeSetorEdit] = useState('');

  const [statusAdminBoolean, setStatusAdminBoolean] = useState(false);
  const [isDisabledWhatsappBoolean, setIsDisabledWhatsappBoolean] = useState(false);
  const [isDisabledStaffBoolean, setIsDisabledStaffBoolean] = useState(true);
  const [isCampanha, setIsCampanha] = useState(true);
  const [statusAdmin, setStatusAdmin] = useState('');

  const [regras, setRegras] = useState([]);
  const [openImportModal, setOpenImportModal] = useState(false);

  const [config, setGlobalConfig] = useState(null);
  const [users, setUsers] = useState(usuariosData);
  const [listaRegras, setListaRegras] = useState([]);

  async function handleConfig() {
    try {
      const response = await v2_actionConfigGlobal();
      console.log('Levels disponíveis no backend:', response.data.global);
      setListaRegras(response.data.global.lista_regras);
      setGlobalConfig(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações do backend:', error);
    }
  }



  const handleClickOpenDialogNewFlow = () => {
    setOpenDialogNewFlow(true);
  };

  useEffect(() => {
    //dispatch(getUsuariosList(cliente));
  }, [usuariosData]);

  const handleCloseDialogNewFlow = () => {
    setOpenDialogNewFlow(false);
  };

  useEffect(() => {
    handleConfig();
  }, []);

  const handleClickOpenDialogEditFlow = (recebe, direciona) => {
    setOpenDialogEditFlow(true);
    let data = { recebe, direciona };
    setDadosFluxo(data);
  };

  const handleCloseDialogEditarUsuario = () => {
    setOpenDialogEditFlow(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = usuariosData.map((n) => n.name);
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

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      let data = {
        scope: {
          descontinuado: true
        }
      };

      try {
        await v2_actionEditarUsuario(userId, data);
        enqueueSnackbar('Usuário excluído com sucesso!', { variant: 'success' });
        dispatch(getUsuariosList(cliente)); // Atualiza a lista após exclusão
      } catch (err) {
        enqueueSnackbar('Erro ao excluir usuário!', { variant: 'error' });
      }


    }
  };

  const handleChangeStatus = (event) => {
    if (!setorEdit) return alert('Insira um setor para continuar');
    setStatusEdit(event.target.checked);
  };

  const handleChangeStatusAdmin = (event) => {
    setStatusAdminBoolean(event.target.checked);
    if (event.target.checked === true) {
      setStatusAdmin('root');
    } else {
      setStatusAdmin('standard');
    }
  };

  /////// ediçoes em inputs

  const changeUsername = (event) => {
    setUsernameEdit(event.target.value);
  };

  const changeNome = (event) => {
    setNomeEdit(event.target.value);
  };

  const changeSobrenome = (event) => {
    setSobrenomeEdit(event.target.value);
  };

  const changeEmail = (event) => {
    setEmailEdit(event.target.value);
  };

  const changeSenha = (event) => {
    setSenhaEdit(event.target.value);
  };

  const changeConfirmarSenha = (event) => {
    setConfirmarSenhaEdit(event.target.value);
  };

  const changeSetor = (event) => {
    setSetorEdit(event.target.value);
  };

  const changeRamal = (event) => {
    setRamalEdit(event.target.value);
  };

  const changeNomeFantasia = (event) => {
    setNomeFantasiaEdit(event.target.value);
  };

  const changeStatus = (event, usuario) => {
    setStatusEdit(event.target.value);
  };

  const handleChangeIsDisabledStaff = (event) => {
    setIsDisabledStaffBoolean(event.target.checked);
  };

  const handleChangeIsDisabledWhatsapp = (event) => {
    setIsDisabledWhatsappBoolean(event.target.checked);
  };

  const handleChangeIsCampanha = (event) => {
    setIsCampanha(event.target.checked);
  };

  const resetarCampos = () => {
    setEmailEdit('');
    setUsernameEdit('');
    setNomeEdit('');
    setSobrenomeEdit('');
    setRamalEdit('');
    setSetorEdit('');
    setSenhaEdit('');
    setConfirmarSenhaEdit('');
    setStatusEdit(false);
    setNomeFantasiaEdit('');
    setUsuarioId('');
    setRegras([]);
    setIsDisabledStaffBoolean(false);
    setIsDisabledWhatsappBoolean(false);
    setIsCampanha(false);
  };
  const handleUpdateUserLevel = (userId, newLevel) => {
    setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, level: newLevel } : user)));
    // Atualize o backend se necessário
    handle_v2_editarUsuario(userId, { level: newLevel });
  };
  ///// criar usuario
  const handleCriarUsuario = () => {
    cadastrarUsuario({
      idCliente: clienteData._id,
      cliente_id: clienteData._id,
      email: emailEdit,
      firstName: nomeEdit,
      lastName: sobrenomeEdit,
      password: senhaEdit,
      repeatPassword: confirmarSenhaEdit,
      nomeFantasia: nomeFantasiaEdit,
      setor_id: setorEdit,
      username: usernameEdit,
      ramal: ramalEdit,
      status: statusEdit,
      level: statusAdmin,
      marketplace_id: clienteData.marketplace_id,
      isDisabledWhatsapp: isDisabledWhatsappBoolean,
      isDisabledStaff: isDisabledStaffBoolean,
      isCampanha: isCampanha,
      rules: regras
    })
      .then((res) => {
        dispatch(getUsuariosList(cliente));
        setOpenDialogNewFlow(false);
        resetarCampos();
      })
      .catch((error) => console.log('error', error));
  };

  ///// editar usuario
  const hanldeEditarUsuario = () => {
    editarUsuario({
      idCliente: cliente,
      usuarioId: usuarioId,
      cliente_id: clienteData._id,
      email: emailEdit,
      firstName: nomeEdit,
      lastName: sobrenomeEdit,
      password: senhaEdit,
      repeatPassword: confirmarSenhaEdit,
      nomeFantasia: nomeFantasiaEdit,
      setor_id: setorEdit,
      username: usernameEdit,
      ramal: ramalEdit,
      status: statusEdit,
      level: statusAdmin,
      marketplace_id: clienteData.marketplace_id,
      isDisabledWhatsapp: isDisabledWhatsappBoolean,
      isDisabledStaff: isDisabledStaffBoolean,
      isCampanha: isCampanha,
      rules: regras
    })
      .then((res) => {
        dispatch(getUsuariosList(cliente));
        setOpenDialogEditFlow(false);
        resetarCampos();
      })
      .catch((error) => console.log('error', error));
  };

  async function handle_v2_editarUsuario(userId, scope) {
    console.log('scope', scope);
    console.log('userId', userId);
    try {
      let data = {
        scope: scope
      };
      console.log('data', data);
      await v2_actionEditarUsuario(userId, data);
      enqueueSnackbar('Alterado com sucesso', { variant: 'success' });
      dispatch(getUsuariosList(cliente));
    } catch (erro) {
      setTimeout(() => {
        enqueueSnackbar('Erro ao alterar perfil', { variant: 'error' });
      }, 1000);
    }
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - usuariosData.length) : 0;
  const filteredUsers = applySortFilter(
    usuariosData.filter((user) => !user.descontinuado),
    getComparator(order, orderBy),
    filterName
  );

  const lista = [
    { label: 'Admin', value: 'root' },
    { label: 'Supervisor', value: 'supervisao' },
    { label: 'Usuário', value: 'standard' }
  ];

  async function setRulesByLevel(level) {
    console.log('Level selecionado:', level);
    let rulesByLevel = config?.global?.rulesByLevel;

    if (rulesByLevel) {
      let newRules = [];
      if (level === 'root') {
        newRules = rulesByLevel.root || [];
      } else if (level === 'standard') {
        newRules = rulesByLevel.standard || [];
      } else if (level === 'supervisao') {
        newRules = rulesByLevel.supervisao || [];
      }

      console.log('Regras atualizadas para o nível:', newRules);
      setRegras(newRules);

      // Atualiza o nível também
      setStatusAdmin(level); // Define o nível no estado do componente
    } else {
      console.error('Regras não foram encontradas no backend!');
    }
  }

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <ToastContainer />
      <Dialog maxWidth={'lg'} open={openDialogNewFlow} onClose={handleCloseDialogNewFlow}>
        <DialogTitle>Criar Novo Usuário</DialogTitle>
        <DialogContent>
          <Typography style={{ marginTop: 10 }} color="textSecondary" display="block" variant="subtitle2">
            Dados pessoais
          </Typography>

          <Divider style={{ marginTop: 10 }} />

          <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 30 }}>
            <Grid item md={4}>
              <TextField
                autoFocus
                onChange={changeEmail}
                fullWidth
                type="text"
                value={emailEdit}
                margin="dense"
                variant="outlined"
                label="Email"
              />
            </Grid>
            <Grid item md={4}>
              <TextField
                autoFocus
                onChange={changeUsername}
                fullWidth
                type="text"
                value={usernameEdit}
                margin="dense"
                variant="outlined"
                label="Username"
              />
            </Grid>
            <Grid item md={4}>
              <TextField
                autoFocus
                onChange={changeNomeFantasia}
                fullWidth
                type="text"
                value={nomeFantasiaEdit}
                margin="dense"
                variant="outlined"
                label="Nome Fantasia"
              />
            </Grid>

            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeNome}
                fullWidth
                type="text"
                value={nomeEdit}
                margin="dense"
                variant="outlined"
                label="Nome"
              />
            </Grid>
            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeSobrenome}
                fullWidth
                type="text"
                value={sobrenomeEdit}
                margin="dense"
                variant="outlined"
                label="Sobrenome"
              />
            </Grid>
          </Grid>

          <Typography style={{ marginTop: 10 }} color="textSecondary" display="block" variant="subtitle2">
            Senha
          </Typography>

          <Divider style={{ marginTop: 10 }} />

          <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 30 }}>
            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeSenha}
                fullWidth
                type="text"
                value={senhaEdit}
                margin="dense"
                variant="outlined"
                label="Senha"
              />
            </Grid>
            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeConfirmarSenha}
                fullWidth
                type="text"
                value={confirmarSenhaEdit}
                margin="dense"
                variant="outlined"
                label="Confirmar Senha"
              />
            </Grid>
          </Grid>

          <Typography style={{ marginTop: 10 }} color="textSecondary" display="block" variant="subtitle2">
            Dados Setor
          </Typography>

          <Divider style={{ marginTop: 10 }} />

          <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 30 }}>
            <Grid item md={6}>
              <TextField
                select
                fullWidth
                label="Selecione o setor"
                value={setorEdit}
                onChange={changeSetor}
                variant="outlined"
              >
                {setoresData.map((option) => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.nome_setor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeRamal}
                fullWidth
                defaultValue={ramalEdit}
                type="text"
                value={ramalEdit}
                variant="outlined"
                label="Ramal"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 30 }}>
            <Grid item md={6}>
              <FormControlLabel
                value={statusEdit}
                name="status"
                label="Status"
                labelPlacement="start"
                control={<Switch />}
                checked={statusEdit}
                onChange={handleChangeStatus}
              />
              <FormControlLabel
                value={statusAdminBoolean}
                name="admin"
                label="Admin"
                labelPlacement="start"
                control={<Switch />}
                checked={statusAdminBoolean}
                onChange={handleChangeStatusAdmin}
              />
              <FormControlLabel
                value={isDisabledStaffBoolean}
                name="admin"
                label="Desativar Chat"
                labelPlacement="start"
                control={<Switch />}
                checked={isDisabledStaffBoolean}
                onChange={handleChangeIsDisabledStaff}
              />
              <FormControlLabel
                value={isDisabledWhatsappBoolean}
                name="admin"
                label="Desativar Whatsapp"
                labelPlacement="start"
                control={<Switch />}
                checked={isDisabledWhatsappBoolean}
                onChange={handleChangeIsDisabledWhatsapp}
              />
              <FormControlLabel
                value={isCampanha}
                name="admin"
                label="Desativar Campanhas"
                labelPlacement="start"
                control={<Switch />}
                checked={isCampanha}
                onChange={handleChangeIsCampanha}
              />
            </Grid>
          </Grid>

          <Stack direction={'row'} spacing={1} sx={{ mb: 4 }}>
            {lista.map((item) => (
              <Button
                key={item.value}
                sx={{ height: 20 }}
                variant={'outlined'}
                onClick={() => setRulesByLevel(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Stack>
            <Autocomplete
              multiple
              variant="outlined"
              fullWidth
              value={regras}
              options={listaRegras}
              getOptionLabel={(option) => option}
              defaultValue={regras}
              filterSelectedOptions
              onChange={(event, newValue) => {
                setRegras(newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Selecionar Regras" placeholder="Regras" />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogNewFlow} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleCriarUsuario} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialogEditFlow} maxWidth={'md'} fullWidth={true} onClose={handleCloseDialogEditarUsuario}>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <Typography style={{ marginTop: 10 }} color="textSecondary" display="block" variant="subtitle2">
            Dados pessoais
          </Typography>

          <Divider style={{ marginTop: 10 }} />

          <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 30 }}>
            <Grid item md={4}>
              <TextField
                autoFocus
                onChange={changeEmail}
                fullWidth
                type="text"
                value={emailEdit}
                margin="dense"
                variant="outlined"
                label="Email"
              />
            </Grid>
            <Grid item md={4}>
              <TextField
                autoFocus
                onChange={changeUsername}
                fullWidth
                type="text"
                value={usernameEdit}
                margin="dense"
                variant="outlined"
                label="Username"
              />
            </Grid>
            <Grid item md={4}>
              <TextField
                autoFocus
                onChange={changeNomeFantasia}
                fullWidth
                type="text"
                value={nomeFantasiaEdit}
                margin="dense"
                variant="outlined"
                label="Nome Fantasia"
              />
            </Grid>

            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeNome}
                fullWidth
                type="text"
                value={nomeEdit}
                margin="dense"
                variant="outlined"
                label="Nome"
              />
            </Grid>
            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeSobrenome}
                fullWidth
                type="text"
                value={sobrenomeEdit}
                margin="dense"
                variant="outlined"
                label="Sobrenome"
              />
            </Grid>
          </Grid>

          <Typography style={{ marginTop: 10 }} color="textSecondary" display="block" variant="subtitle2">
            Senha
          </Typography>

          <Divider style={{ marginTop: 10 }} />

          <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 30 }}>
            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeSenha}
                fullWidth
                type="text"
                value={senhaEdit}
                margin="dense"
                variant="outlined"
                label="Senha"
              />
            </Grid>
            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeConfirmarSenha}
                fullWidth
                type="text"
                value={confirmarSenhaEdit}
                margin="dense"
                variant="outlined"
                label="Confirmar Senha"
              />
            </Grid>
          </Grid>

          <Typography style={{ marginTop: 10 }} color="textSecondary" display="block" variant="subtitle2">
            Dados Setor
          </Typography>

          <Divider style={{ marginTop: 10 }} />

          <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 30 }}>
            <Grid item md={6}>
              <TextField
                select
                fullWidth
                label="Selecione o setor"
                value={setorEdit}
                defaultValue={setorEdit}
                onChange={changeSetor}
              >
                {setoresData.map((option) => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.nome_setor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item md={6}>
              <TextField
                autoFocus
                onChange={changeRamal}
                fullWidth
                type="text"
                value={ramalEdit}
                margin="dense"
                variant="outlined"
                label="Ramal"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 30 }}>
            <Stack direction={'row'}>
              <FormControlLabel
                value={statusEdit}
                name="status"
                label="Status"
                labelPlacement="start"
                control={<Switch />}
                checked={statusEdit}
                onChange={handleChangeStatus}
              />
              <FormControlLabel
                value={statusAdminBoolean}
                name="admin"
                label="Admin"
                labelPlacement="start"
                control={<Switch />}
                checked={statusAdminBoolean}
                onChange={handleChangeStatusAdmin}
              />
              <FormControlLabel
                value={isDisabledStaffBoolean}
                name="admin"
                label="Desativar Chat"
                labelPlacement="start"
                control={<Switch />}
                checked={isDisabledStaffBoolean}
                onChange={handleChangeIsDisabledStaff}
              />
              <FormControlLabel
                value={isDisabledWhatsappBoolean}
                name="admin"
                label="Desativar Whatsapp"
                labelPlacement="start"
                control={<Switch />}
                checked={isDisabledWhatsappBoolean}
                onChange={handleChangeIsDisabledWhatsapp}
              />
              <FormControlLabel
                value={isCampanha}
                name="admin"
                label="Desativar Campanhas"
                labelPlacement="start"
                control={<Switch />}
                checked={isCampanha}
                onChange={handleChangeIsCampanha}
              />
            </Stack>
          </Grid>

          <Stack direction={'row'} spacing={1} sx={{ mb: 4 }}>
            {lista.map((item) => (
              <Button sx={{ height: 20 }} variant={'outlined'} onClick={() => setRulesByLevel(item.value)}>
                {item.label}
              </Button>
            ))}
          </Stack>

          <Stack direction={'column'}>
            <Autocomplete
              multiple
              variant="outlined"
              fullWidth
              value={regras}
              options={listaRegras}
              getOptionLabel={(option) => option}
              defaultValue={regras}
              filterSelectedOptions
              onChange={(event, newValue) => {
                setRegras(newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Selecionar Regras" placeholder="Regras" />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogEditarUsuario} color="inherit">
            Cancelar
          </Button>
          <Button onClick={hanldeEditarUsuario} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ModalImportarUsuarios
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        cliente={clienteData}
        onCallback={() => {
          dispatch(getUsuariosList(cliente));
          setOpenImportModal(false);
        }}
      />

      <HeaderBreadcrumbs
        heading="Lista de Usuários 1"
        links={[{ name: '' }]}
        action={
          <Stack spacing={2} direction={'row'}>
            <Button onClick={() => setOpenImportModal(true)} variant="contained">
              Importar Usuários
            </Button>
            <Button
              variant="contained"
              // component={RouterLink}
              onClick={handleClickOpenDialogNewFlow}
              startIcon={<Icon icon={plusFill} />}
            >
              Novo Usuário
            </Button>
          </Stack>
        }
      />

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <UserListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={usuariosData.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const {
                    _id,
                    idCliente,
                    level,
                    nomeFantasia,
                    firstName,
                    lastName,
                    codigoCliente,
                    email,
                    status,
                    username,
                    ramal,
                    nome_setor,
                    setor_id,
                    isDisabledStaff,
                    isCampanha,
                    isDisabledWhatsapp,
                    rules
                  } = row;
                  const isItemSelected = selected.indexOf(_id) !== -1;
                  let dataUsuario = {
                    _id,
                    nomeFantasia,
                    level,
                    firstName,
                    isCampanha,
                    lastName,
                    codigoCliente,
                    email,
                    status,
                    username,
                    ramal,
                    nome_setor,
                    idCliente,
                    setor_id,
                    isDisabledStaff,
                    isDisabledWhatsapp,
                    rules
                  };

                  return (
                    <TableRow
                      hover
                      key={_id}
                      tabIndex={-1}
                      role="checkbox"
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      {/* <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, _id)} />
                        </TableCell> */}

                      <TableCell align="left">{nomeFantasia}</TableCell>
                      <TableCell align="left">{email}</TableCell>
                      <TableCell align="left">
                        {/* {nome_setor ? nome_setor : (
                            <Label
                              variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                              color={'error'}
                            >
                              Setor não encontrado
                            </Label>
                      
                        )} */}
                        <Select
                          fullWidth
                          value={setor_id}
                          size={'small'}
                          onChange={async (e) => {
                            const newLevel = e.target.value;
                            console.log('newLevel', newLevel);
                          //  handleUpdateUserLevel(_id, newLevel); // Atualiza no frontend
                            handle_v2_editarUsuario(_id, { setor_id: newLevel }); // Atualiza no backend
                            // atualizar lsita
                            dispatch(getUsuariosList(cliente));
                          }}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: !setor_id ? 'red' : 'gray.500'
                            }
                          }}
                        >
                          {setoresData.map((setor) => (
                            <MenuItem key={setor._id} value={setor._id}>
                              {setor.nome_setor}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="left">{ramal}</TableCell>
                      <TableCell align="left">{firstName}</TableCell>
                      <TableCell align="left">{lastName}</TableCell>

                      <TableCell align="left">
                        <Label
                          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                          color={(status === false && 'error') || 'success'}
                        >
                          {status === false ? 'Desativado' : 'Ativado'}
                        </Label>
                      </TableCell>

                      <TableCell align="left">
                        <Label
                          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                          color={(!isDisabledStaff === false && 'error') || 'success'}
                        >
                          {!isDisabledStaff === false ? 'Desativado' : 'Ativado'}
                        </Label>
                      </TableCell>

                      <TableCell align="left">
                        <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}>
                          {row.level === 'root' ? 'Admin' : row.level === 'supervisao' ? 'Supervisor' : 'Usuário'}
                        </Label>
                      </TableCell>

                      <TableCell align="right">
                        <Stack spacing={2} direction="row">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              setEmailEdit(dataUsuario.email);
                              setUsernameEdit(dataUsuario.username);
                              setNomeFantasiaEdit(dataUsuario.nomeFantasia);
                              setNomeEdit(dataUsuario.firstName);
                              setSobrenomeEdit(dataUsuario.lastName);
                              setSetorEdit(dataUsuario.setor);
                              setRamalEdit(dataUsuario.ramal);
                              setStatusEdit(dataUsuario.status);
                              setSetorEdit(dataUsuario.setor_id);
                              setUsuarioId(dataUsuario._id);
                              setNomeSetorEdit(dataUsuario.nome_setor);
                              setIsDisabledStaffBoolean(dataUsuario.isDisabledStaff);
                              setIsDisabledWhatsappBoolean(dataUsuario.isDisabledWhatsapp);
                              setIsCampanha(dataUsuario.isCampanha);
                              setRegras(dataUsuario.rules);
                              if (dataUsuario.level === 'root') {
                                setStatusAdmin(dataUsuario.level);
                                setStatusAdminBoolean(true);
                              } else if (dataUsuario.level === 'standard') {
                                setStatusAdmin(dataUsuario.level);
                                setStatusAdminBoolean(false);
                              }
                              handleClickOpenDialogEditFlow();
                            }}
                          >
                            <Icon icon="eva:edit-fill" />
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDeleteUser(dataUsuario._id)}
                          >
                            <Icon icon="eva:trash-2-outline" />
                          </Button>


                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              {/* {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )} */}
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={usuariosData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
