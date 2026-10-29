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
} from '@mui/material';
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

import { getSetoresList, getRespostasList } from '../../redux/slices/user';

// actions novo
import cadastrarSetor from '../../actions/clientes/cadastrarSetor';
import editarSetor from '../../actions/clientes/editarSetor';
import deletarSetor from '../../actions/clientes/deletarSetor';
import actionEditarResposta from 'src/actions/clientes/actionEditarResposta';


import RespostaMoreMenu from '../../components/_dashboard/admin/clientes/respostas/list/RespostaMoreMenu';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'titulo', label: 'Título', alignRight: false },
  { id: 'resposta', label: 'Resposta', alignRight: false },
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


export default function RespostasList({respostasData, usuario, clienteData}) {
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

    const [statusEdit, setStatusEdit] = useState(true);

    const [idResposta, setIdResposta] = useState('');




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
  const handleAddRespostaRapida = () => {
    cadastrarRespostaRapida({
      clienteId:clienteData._id,
      titulo:tituloEdit,
      respostaField:respostaEdit
      }).then(() => {
      dispatch(getRespostasList(clienteData._id));
      setOpenDialogNovoSetor(false)
      setTituloEdit('');
      setRespostaEdit('');
    }).catch(error => console.log('error', error));
  }

  /////////// editar setor
  const handleEditarResposta = () => {
    actionEditarResposta({
      id:idResposta, 
      titulo:tituloEdit,
      resposta:respostaEdit
     }).then(() => {
      setOpenDialogEditarSetor(false);
      dispatch(getRespostasList(clienteData._id));
    }).catch(error => console.log('error', error));
  }


  const handleDeleteRespostas = (id) => {
    deletarRespostaRapida({id:id}).then(res => {
        dispatch(getRespostasList(clienteData._id));
    }).catch(err => console.log(err))
  };




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


  const handleChangeTitulo = (event) => {
    setTituloEdit(event.target.value);
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
               value={tituloEdit} 
               margin="dense" 
               variant="outlined" 
               label="Título"
               onChange={handleChangeTitulo}
              />
               <TextField 
               autoFocus 
               fullWidth 
               multiline
               rows={4}
               type="text" 
               value={respostaEdit} 
               margin="dense" 
               variant="outlined" 
               label="Resposta"
               onChange={handleChangeResposta}
              />
            </Grid>
          </DialogContent>
          <DialogActions>
                <Button onClick={handleCloseDialogNovoSetor} color="inherit">
                  Cancelar
                </Button>
                <Button onClick={handleAddRespostaRapida} variant="contained">
                  Salvar
                </Button>
          </DialogActions>
      </Dialog>

      <Dialog maxWidth={'lg'} open={openDialogEditarSetor} onClose={handleCloseDialogEditarSetor}>
        <DialogTitle>Editar Setor</DialogTitle>
          <DialogContent>
            <Grid container style={{marginTop:20}}>
              <Grid
                size={{
                  md: 12
                }}>
              <TextField 
               autoFocus 
               fullWidth 
               type="text" 
               value={tituloEdit} 
               margin="dense" 
               variant="outlined" 
               label="Setor"
               onChange={handleChangeTitulo}
              />
              </Grid>
              <Grid
                size={{
                  md: 12
                }}>
              <TextField 
               autoFocus 
               fullWidth 
               type="text" 
               value={respostaEdit} 
               margin="dense" 
               variant="outlined" 
               label="Setor"
               onChange={handleChangeResposta}
              />
              </Grid>
              <Grid
                size={{
                  md: 12
                }}>
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
                <Button onClick={handleEditarResposta} variant="contained">
                  Salvar
                </Button>
          </DialogActions>
      </Dialog>

      <HeaderBreadcrumbs
heading="Respostas Rápidas"
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
    Criar Resposta Rápida
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

                  const { _id, titulo, resposta, ativo } = row;
                  const isItemSelected = selected.indexOf(_id) !== -1;
                  let dataResposta = { _id, titulo, resposta, ativo } 
                 

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
                        <Stack direction="row" spacing={2} sx={{
                          alignItems: "center"
                        }}>
                       
                          <Typography variant="subtitle2" noWrap>
                            {titulo}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="left">{resposta}</TableCell>

                      <TableCell align="left">
                        <Label
                          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                          color={(ativo !== "1" && 'error') || 'success'}
                        >
                           {ativo !== "1" ? "Desativado" : "Ativado"}
                        </Label>
                      </TableCell>

                      <TableCell align="right">
                      <RespostaMoreMenu 
                       onDelete={() => handleDeleteRespostas(_id)} 
                       //userName={codigoCliente} 
                       onEdit={() => {
                          setIdResposta(dataResposta._id);
                          setTituloEdit(dataResposta.titulo);
                          setRespostaEdit(dataResposta.resposta);
                          setStatusEdit(dataResposta.ativo);

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
