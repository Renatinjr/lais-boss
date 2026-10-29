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
  DialogContentText,
  Divider,
  Autocomplete,
  Chip,
  FormControlLabel,
  Switch,
  Stack
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
import { UserListHead, UserListToolbar } from '../../components/_dashboard/user/list';

import getListaTodosUsuarios from '../../actions/getListaTodosUsuarios';
import addSetor from '../../actions/addSetor';

import { getSetoresList } from '../../redux/slices/user';

// actions novo
import cadastrarSetor from '../../actions/clientes/cadastrarSetor';
import editarSetor from '../../actions/clientes/editarSetor';
import deletarSetor from '../../actions/clientes/deletarSetor';

import SetoresMoreMenu from '../../components/_dashboard/admin/clientes/setores/list/SetorMoreMenu';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id_cliente', label: 'ID Cliente', alignRight: false },
  { id: 'nome_setor', label: 'Nome Setor', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' }
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

export default function SetoresList({ setoresData, usuario, clienteData }) {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const { name } = useParams();

  const [dadosFluxo, setDadosFluxo] = useState('');

  const [openDialogNovoSetor, setOpenDialogNovoSetor] = useState(false);
  const [openDialogEditarSetor, setOpenDialogEditarSetor] = useState(false);

  const [value, setValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  
  ///// value fields
  const [setorEdit, setSetorEdit] = useState('');
  const [statusEdit, setStatusEdit] = useState(true);
  const [statusTransferenciaEdit, setStatusTransferenciaEdit] = useState(true);
  const [idSetor, setIdSetor] = useState('');

  const handleChangeStatus = (event) => {
    setStatusEdit(event.target.checked);
    console.log('foi alerado o status', event.target.checked);
  };
  const handleChangeStatusTransferencia = (event) => {
    setStatusTransferenciaEdit(event.target.checked);
    console.log('foi alerado o status', event.target.checked);
  };

  const handleClickOpenDialogNovoSetor = () => {
    setOpenDialogNovoSetor(true);
  };

  const handleCloseDialogNovoSetor = () => {
    setOpenDialogNovoSetor(false);
  };

  ////////////// salvar setor
  const handleAddSetor = () => {
    cadastrarSetor({
      idCliente: clienteData.idCliente,
      clienteId: clienteData._id,
      nomeSetor: setorEdit,
      status: statusEdit,
      statusTransferencia: statusTransferenciaEdit
    })
      .then((res) => {
        dispatch(getSetoresList({ clienteId: clienteData._id }));
        setOpenDialogNovoSetor(false);
      })
      .catch((error) => console.log('error', error));
  };

  /////////// editar setor
  const handleEditSetor = () => {
    console.log('Enviando dados para edição:', {
      id: idSetor,
      setorField: setorEdit,
      statusField: statusEdit,
      statusTransferenciaField: statusTransferenciaEdit
    });

    editarSetor({
      id: idSetor,
      setorField: setorEdit,
      statusField: statusEdit,
      statusTransferenciaField: statusTransferenciaEdit
    })
      .then(() => {
        dispatch(getSetoresList({ clienteId: clienteData._id }));
        setOpenDialogEditarSetor(false);
      })
      .catch((error) => console.log('Erro ao editar setor:', error));
  };

  const handleDeleteSetor = (id) => {
    deletarSetor({ id: id })
      .then((res) => {
        dispatch(getSetoresList({ clienteId: clienteData._id }));
      })
      .catch((err) => console.log(err));
  };

  const handleClickOpenDialogEditSetor = (recebe, direciona) => {
    setOpenDialogEditarSetor(true);
    let data = { recebe, direciona };
    setDadosFluxo(data);
  };

  const handleCloseDialogEditarSetor = () => {
    setOpenDialogEditarSetor(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = setoresData.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };


  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleChangeSetor = (event) => {
    setSetorEdit(event.target.value);
  };

  const handleDeleteUser = (userId) => {
    dispatch(deleteUser(userId));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - setoresData.length) : 0;

  const filteredUsers = applySortFilter(setoresData, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;
  const setores = setoresData.map((setor) => ({
    ...setor,
    statusTransferencia: setor.statusTransferencia !== undefined ? setor.statusTransferencia : false
  }));
  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <Dialog maxWidth={'lg'} open={openDialogNovoSetor} onClose={handleCloseDialogNovoSetor}>
        <DialogTitle>Criar Setor</DialogTitle>
        <DialogContent>
          <Grid container style={{ marginTop: 20 }}>
            <TextField
              autoFocus
              fullWidth
              type="text"
              value={setorEdit}
              margin="dense"
              variant="outlined"
              label="Nome Setor"
              onChange={handleChangeSetor}
            />
          </Grid>
          <Stack direction={'row'}>
            <FormControlLabel 
              value={statusEdit}
              name="Descontinuar" 
              label="Descontinuar" 
              labelPlacement="start" 
              control={<Switch />} 
              checked={statusEdit}
              onChange={handleChangeStatus}
            /> 
            <FormControlLabel 
              value={statusTransferenciaEdit}
              name="Transferência" 
              label="Transferência" 
              labelPlacement="start" 
              control={<Switch />} 
              checked={statusTransferenciaEdit}
              onChange={handleChangeStatusTransferencia}
            /> 
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogNovoSetor} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleAddSetor} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth={'lg'} open={openDialogEditarSetor} onClose={handleCloseDialogEditarSetor}>
        <DialogTitle>Editar Setor</DialogTitle>
        <DialogContent>
          <Grid container style={{ marginTop: 20 }}>
            <Grid item md={12}>
              <TextField
                autoFocus
                fullWidth
                type="text"
                value={setorEdit}
                margin="dense"
                variant="outlined"
                label="Setor"
                onChange={handleChangeSetor}
              />
            </Grid>
            <Grid item md={12}>
              <Stack direction={'row'}>
                <FormControlLabel
                  value={statusEdit}
                  name="Descontinuar"
                  label="Descontinuar"
                  labelPlacement="start"
                  control={<Switch />}
                  checked={statusEdit}
                  onChange={handleChangeStatus}
                />
                {typeof statusTransferenciaEdit === 'boolean' && (
                  <FormControlLabel
                    value={statusTransferenciaEdit}
                    name="Transferência"
                    label="Transferência"
                    labelPlacement="start"
                    control={<Switch />}
                    checked={statusTransferenciaEdit}
                    onChange={handleChangeStatusTransferencia}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogEditarSetor} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleEditSetor} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <HeaderBreadcrumbs
        heading="Lista de Setores"
        links={[{ name: '' }]}
        action={
          <Button
            variant="contained"
            onClick={handleClickOpenDialogNovoSetor}
            startIcon={<Icon icon={plusFill} />}
          >
            Criar Setor
          </Button>
        }
      />

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 400 }}>
            <Table>
              <UserListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={setoresData.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {setores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const { _id, id_cliente, nome_setor, status, idCliente, status_transferencia } = row;
                  const isItemSelected = selected.indexOf(_id) !== -1;
                  let dataSetor = { _id, idCliente, nome_setor, status, status_transferencia };
                  
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
                            {idCliente}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="left">{nome_setor}</TableCell>
                      <TableCell align="left">
                        <Label
                          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                          color={(status === false && 'error') || 'success'}
                        >
                          {status === false ? 'Desativado' : 'Ativado'}
                        </Label>
                      </TableCell>
                      <TableCell align="right">
                        <SetoresMoreMenu
                          onDelete={() => handleDeleteSetor(_id)}
                          onEdit={() => {
                            setIdSetor(dataSetor._id);
                            setSetorEdit(dataSetor.nome_setor);
                            setStatusEdit(dataSetor.status);
                            setStatusTransferenciaEdit(dataSetor.statusTransferencia);
                            handleClickOpenDialogEditSetor();
                          }}
                        />
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
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={setoresData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}