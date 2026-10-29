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
  Switch
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
import addSetor from "../../actions/addSetor";
import cadastrarRespostaRapida from '../../actions/clientes/cadastrarRespostaRapida'
import deletarRespostaRapida from '../../actions/clientes/deletarRespostaRapida';

import { getSetoresList, getRespostasList, getFunilList } from '../../redux/slices/user';

// actions novo
import cadastrarFunil from '../../actions/clientes/cadastrarFunil';
import editarFunil from '../../actions/clientes/editarFunil';
import deletarSetor from '../../actions/clientes/deletarSetor';


import FunilMoreMenu from '../../components/_dashboard/admin/clientes/funis/list/FunilMoreMenu';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', alignRight: false },
  { id: 'ativo', label: 'Status', alignRight: false },
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


export default function FunilList({respostasData, usuario, clienteData}) {
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
    const [tituloEdit, setTituloEdit] = useState('');
    const [respostaEdit, setRespostaEdit] = useState('');

    const [nomeEdit, setNomeEdit] = useState('');

    const [statusEdit, setStatusEdit] = useState(true);

    const [idFunil, setIdFunil] = useState('');




    const handleChangeStatus = (event) => {
      setStatusEdit(event.target.checked);
      console.log('foi alerado o status', event.target.checked)
    };

  const handleClickOpenDialogNovoSetor = () => {
    setOpenDialogNovoSetor(true)  
  };

  const handleCloseDialogNovoSetor = () => {
    setOpenDialogNovoSetor(false);
  };

  ////////////// salvar setor
  const handleAddFunil = () => {
    cadastrarFunil({
      clienteId:clienteData._id,
      nome:nomeEdit,
      status:true
      }).then(() => {
      dispatch(getRespostasList(clienteData._id));
      setOpenDialogNovoSetor(false)
      setTituloEdit('');
      setRespostaEdit('');
    }).catch(error => console.log('error', error));
  }

  /////////// editar setor
  const handleEditFunil = () => {
    console.log('edit funil', idFunil, nomeEdit, statusEdit)
    editarFunil({id:idFunil, nome:nomeEdit, status:statusEdit }).then(() => {
      setOpenDialogEditarSetor(false);
      dispatch(getFunilList(clienteData._id));
    }).catch(error => console.log('error', error));
  }


  const handleClickOpenDialogEditSetor = (recebe, direciona) => {
    setOpenDialogEditarSetor(true)  
    let data = { recebe, direciona };
    setDadosFluxo(data);
  };

  const handleCloseDialogEditarSetor = () => {
     setOpenDialogEditarSetor(false)
   
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = respostasData.map((n) => n.name);
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


  const handleChangeNome = (event) => {
    setNomeEdit(event.target.value);
  };
  const handleChangeResposta = (event) => {
    setRespostaEdit(event.target.value);
  };

  const handleDeleteUser = (userId) => {
    dispatch(deleteUser(userId));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - respostasData.length) : 0;

  const filteredUsers = applySortFilter(respostasData, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return (
      <Container maxWidth={themeStretch ? false : 'lg'}>

      <Dialog maxWidth={'lg'} open={openDialogNovoSetor} onClose={handleCloseDialogNovoSetor}>
        <DialogTitle>Criar Resposta Rápida</DialogTitle>
          <DialogContent>
            <Grid container style={{marginTop:20}}>
              <TextField 
               autoFocus 
               fullWidth 
               type="text" 
               value={nomeEdit} 
               margin="dense" 
               variant="outlined" 
               label="Título"
               onChange={handleChangeNome}
              />
          
            </Grid>
          </DialogContent>
          <DialogActions>
                <Button onClick={handleCloseDialogNovoSetor} color="inherit">
                  Cancelar
                </Button>
                <Button onClick={handleAddFunil} variant="contained">
                  Salvar
                </Button>
          </DialogActions>
      </Dialog>


      <Dialog maxWidth={'lg'} open={openDialogEditarSetor} onClose={handleCloseDialogEditarSetor}>
        <DialogTitle>Editar Funil</DialogTitle>
          <DialogContent>
            <Grid container style={{marginTop:20}}>
              <Grid item md={12}>
              <TextField 
               autoFocus 
               fullWidth 
               type="text" 
               value={nomeEdit} 
               margin="dense" 
               variant="outlined" 
               label="Nome"
               onChange={handleChangeNome}
              />
              </Grid>
          
              <Grid item md={12}>
              <FormControlLabel 
                    value={statusEdit}
                    name="status" 
                    label="Status" 
                    labelPlacement="start" 
                    control={<Switch />} 
                    checked={statusEdit}
                    onChange={handleChangeStatus}
                  /> 

              </Grid>

  
            </Grid>
          </DialogContent>
          <DialogActions>
                <Button onClick={handleCloseDialogEditarSetor} color="inherit">
                  Cancelar
                </Button>
                <Button onClick={handleEditFunil} variant="contained">
                  Salvar
                </Button>
          </DialogActions>
      </Dialog>




                <HeaderBreadcrumbs
         heading="Funil de Vendas"
          links={[
            { name: '' }
          ]}
          action={
            <Button
              variant="contained"
             // component={RouterLink}
              onClick={handleClickOpenDialogNovoSetor}
              startIcon={<Icon icon={plusFill} />}
            >
              Criar Funil
            </Button>
          }
        />

        <Card>
             

          <Scrollbar>
            <TableContainer sx={{ minWidth:400 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={respostasData.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {

                    const { _id, nome_funil,  ativo } = row;
                    const isItemSelected = selected.indexOf(_id) !== -1;
                    let dataFunil = { _id, nome_funil, ativo } 
                   

                    return (
                      <TableRow
                        hover
                        key={_id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
          
                      
                      
                        <TableCell align="left">{nome_funil}</TableCell>
  

                        <TableCell align="left">
                          <Label
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                            color={(ativo !== true && 'error') || 'success'}
                          >
                             {ativo !== true ? "Desativado" : "Ativado"}
                          </Label>
                        </TableCell>
        
            

                        <TableCell align="right">
                        <FunilMoreMenu 
                        // onDelete={() => handleDeleteRespostas(_id)} 
                         //userName={codigoCliente} 
                         onEdit={() => {
                            setIdFunil(dataFunil._id);
                            setNomeEdit(dataFunil.nome_funil);
                            setStatusEdit(dataFunil.ativo);
                            handleClickOpenDialogEditSetor()
                    
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
            count={respostasData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

  );
}
