import { filter } from 'lodash';
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
  MenuItem
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
import { UserListHead, UserListToolbar, UserMoreMenu, UsuariosMoreMenu } from '../../components/_dashboard/user/list';
import { getUsuariosList } from '../../redux/slices/user';

// actions NOVO
import cadastrarUsuario from "../../actions/clientes/cadastrarUsuario";
import editarUsuario from "../../actions/clientes/editarUsuario";
import actionListaUsuariosAtivos from 'src/actions/dashboard/actionListaUsuariosAtivos';
import { RemoveDoneSharp } from '@material-ui/icons';
import useAuth from 'src/hooks/useAuth';
import actionListaUsuariosOnlineApp from 'src/actions/dashboard/actionListaUsuariosOnlineApp';


// --------------------

const TABLE_HEAD = [
  { id: '_id', label: 'Id Usuário', alignRight: false },
  { id: 'nome', label: 'Nome Usurio', alignRight: false },
  { id: 'setor', label: 'Setor', alignRight: false },
  { id: 'cliente', label: 'Cliente', alignRight: false }

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

export default function UsuariosAppOnline() {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [emailEdit, setEmailEdit] = useState('');
  const [usernameEdit, setUsernameEdit] = useState('');
  const [nomeEdit, setNomeEdit] = useState('');
  const [sobrenomeEdit, setSobrenomeEdit] = useState('');
  const [setorEdit, setSetorEdit] = useState('');
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

  const { user } = useAuth();

  /// apagar acima
  const [listaUsuarios, setListaUsuarios] = useState([]);

  const buscarListaUsuariosAtivos = async () => {
    try {
        const res = await actionListaUsuariosOnlineApp();
        if(res.data.data) {
          setListaUsuarios(res.data.data)
        }
    } catch (err) {
        
    }
  }

  useEffect(() => {
    buscarListaUsuariosAtivos()
  }, [])
  
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = listaUsuarios.map((n) => n.name);
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

 

  const resetarCampos = () => {
    setEmailEdit('');
    setUsernameEdit('');
    setNomeEdit('');
    setSobrenomeEdit('');
    setRamalEdit('');
    setSetorEdit('');
    setSenhaEdit('');
    setConfirmarSenhaEdit('');
    setStatusEdit('');
    setNomeFantasiaEdit('');
    setUsuarioId('');
    setIsDisabledStaffBoolean(false);
    setIsDisabledWhatsappBoolean(false)
    setIsCampanha(false)
    }




  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - listaUsuarios.length) : 0;

  const filteredUsers = applySortFilter(listaUsuarios, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return (
      <Container maxWidth={themeStretch ? false : 'lg'}>

    

                <HeaderBreadcrumbs
         heading="Usuários Online App"
          links={[
            { name: '' }
          ]}
          action={
            <Button
              variant="contained"
             // component={RouterLink}
              onClick={buscarListaUsuariosAtivos}
              startIcon={<Icon icon={'pepicons-pop:refresh'} />}
            >
              Atualizar
            </Button>
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
                  rowCount={listaUsuarios.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {_id, nomeUsuario, nomeSetor, nomeCliente } = row;
                    const isItemSelected = selected.indexOf(_id) !== -1;
                  
                    return (
                      <TableRow
                        hover
                        key={_id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        <TableCell align="left">{_id}</TableCell>
                        <TableCell align="left">{nomeUsuario}</TableCell>
                        <TableCell align="left">{nomeSetor}</TableCell>
                        <TableCell align="left">{nomeCliente}</TableCell>
                                    
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
            count={listaUsuarios.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

  );
}
