'use client';

import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import RouterLink from 'next/link';
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
  Autocomplete,
  Chip
} from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getUserList, deleteUser, getFluxoList } from '../../redux/slices/user';
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
import { UserListHead, UserListToolbar, UserMoreMenu, ClientsMoreMenu } from '../../components/_dashboard/user/list';

import  FluxoMoreMenu  from '../../components/_dashboard/admin/clientes/fluxos/list/FluxoMoreMenu';

// actions
import cadastrarFluxo from '../../actions/clientes/cadastrarFluxo';
import deletarFluxo from '../../actions/clientes/deletarFluxo'

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'recebe', label: 'Recebe', alignRight: false },
  { id: 'setores', label: 'Setores', alignRight: false },
  { id: 'usuarios', label: 'Usuários', alignRight: false },
  { id: 'ativado', label: 'Status', alignRight: false },
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

const top100Films = ["Cartão Katuxa", "Crediário", "Marketing", "Cobrança", "Financeiro", "Integracao"];

const options = ['Option 1'];

export default function FlowList({fluxoData, usuariosData, setoresData, usuario, clienteData}) {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const [dadosFluxo, setDadosFluxo] = useState('');

  const [recebeEdit, setRecebeEdit] = useState(dadosFluxo.recebe);
  const [direcionaEdit, setDirecionaEdit] = useState(dadosFluxo.recebe);
  const [recebeNovo, setRecebeNovo] = useState('');

  const [openDialogNewFlow, setOpenDialogNewFlow] = useState(false);
  const [openDialogEditFlow, setOpenDialogEditFlow] = useState(false);


  const [direcionaUsuarios, setDirecionaUsuarios] = useState([]);
  const [direcionaSetores, setDirecionaSetores] = useState([]);
  const [recebe, setRecebe] = useState('');

  const [inputValue, setInputValue] = useState('');


  const listaUsuarios = usuariosData.map(function(i) {
    let data ={
      value:i._id,
      nome:i.nomeFantasia
    }
    return data;
  });

  const listaSetores = setoresData.map(function(i) {
    let data ={
      value:i._id,
      nome:i.nome_setor
    }
    return data;
  });
  

  const handleAddFluxo = () => {
    console.log('info', clienteData)
    cadastrarFluxo({
      clienteId:clienteData._id, 
      recebeField:recebe,
      direcionaUsuariosField:reduceId(direcionaUsuarios),
      direcionaSetoresField:reduceId(direcionaSetores)
    }).then(res => {
      dispatch(getFluxoList(clienteData._id));
      setOpenDialogNewFlow(false);
      setDirecionaUsuarios([]);
      setDirecionaSetores([]);
      setRecebe('')

    })
  }

  const handleChangeRecebe = (event) => {
    setRecebe(event.target.value);
  };
  const handleChangeRecebeEdit = (event) => {
    setRecebeEdit(event.target.value);
  };

  const handleClickOpenDialogNewFlow = () => {
    setOpenDialogNewFlow(true);
    console.log(usuariosData)
  };

  const handleCloseDialogNewFlow = () => {
    setOpenDialogNewFlow(false);

  };

  const handleClickOpenDialogEditFlow = (_id, recebe, direciona) => {
    setOpenDialogEditFlow(true)  
    let data = { recebe, direciona, _id };
    console.log('data edit', data)
    setDadosFluxo(data);
  };


  const handleDeleteFluxo = (id) => {
    deletarFluxo({id:id}).then(res => {
      dispatch(getFluxoList(clienteData._id));
    }).catch(err => console.log(err))
    
  };

  const handleCloseDialogEditFlow = () => {
    setOpenDialogEditFlow(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = fluxoData.map((n) => n.name);
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


  const reduceId = array => {
    if(array){
      let idsReduzidos = array.map(function(i) { return i.value; });
      return idsReduzidos;
    } else {
      return [""];
    }
  }



  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - fluxoData.length) : 0;

  const filteredUsers = applySortFilter(fluxoData, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return (
    <Container  maxWidth={'lg'}>

      <Dialog fullWidth maxWidth={'md'} open={openDialogNewFlow} onClose={handleCloseDialogNewFlow}>
              <DialogTitle>Novo Fluxo</DialogTitle>
              <DialogContent>

              <Grid spacing={2} container style={{marginTop:20}}>
                  <Grid
                    size={{
                      md: 4
                    }}>
                    <TextField autoFocus onChange={handleChangeRecebe} fullWidth type="text" value={recebe} margin="dense" variant="outlined" label="Recebe" />
                  </Grid>
              </Grid>

              <Grid spacing={2} container style={{marginTop:20}}>
                  <Grid
                    size={{
                      md: 6
                    }}>
                  <Autocomplete
                multiple
                variant="outlined"
                fullWidth
                options={listaUsuarios}
                getOptionLabel={(option) => option.nome}
                defaultValue={direcionaUsuarios}
                filterSelectedOptions
                onChange={(event, newValue) => {
                  setDirecionaUsuarios(newValue);
                  console.log('new value', newValue)
                  console.log('Direciona Usuarios', direcionaUsuarios);
                }}
                renderValue={(value, getItemProps) => 
                  value.map((option, index) => ( <Chip variant="outlined" label={option.nome} {...getItemProps({ index })} /> ))              
                }
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" label="Selecionar Usuarios" placeholder="EntryPoints" />
                )}
              />  
                  </Grid>  
                  <Grid
                    size={{
                      md: 6
                    }}>
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
                  console.log('Direciona setores', newValue);
                }}
                renderValue={(value, getItemProps) => 
                  value.map((option, index) => ( <Chip variant="outlined" label={option.nome} {...getItemProps({ index })} /> ))              
                }
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" label="Selecionar Setores" placeholder="EntryPoints" />
                )}
              />  
                  </Grid>                            
                </Grid>

                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseDialogNewFlow} color="inherit">
                  Cancelar
                </Button>
                <Button onClick={handleAddFluxo} variant="contained">
                  Salvar
                </Button>
              </DialogActions>
      </Dialog>

      <Dialog open={openDialogEditFlow} maxWidth={'sm'} fullWidth={true}  onClose={handleCloseDialogEditFlow}>
      <DialogTitle>Editar Fluxo</DialogTitle>
              <DialogContent>

              <Grid spacing={2} container style={{marginTop:20}}>
                  <Grid
                    size={{
                      md: 4
                    }}>
                    <TextField autoFocus onChange={handleChangeRecebe} fullWidth type="text" value={recebe} margin="dense" variant="outlined" label="Recebe" />
                  </Grid>
              </Grid>

              <Grid spacing={2} container style={{marginTop:20}}>
                  <Grid
                    size={{
                      md: 6
                    }}>
                  <Autocomplete
                multiple
                variant="outlined"
                fullWidth
                options={listaUsuarios}
                getOptionLabel={(option) => option.nome}
                defaultValue={direcionaUsuarios}
                filterSelectedOptions
                onChange={(event, newValue) => {
                  setDirecionaUsuarios(newValue);
                  console.log('new value', newValue)
                  console.log('Direciona Usuarios', direcionaUsuarios);
                }}
                renderValue={(value, getItemProps) => 
                  value.map((option, index) => ( <Chip variant="outlined" label={option.nome} {...getItemProps({ index })} /> ))              
                }
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" label="Selecionar Usuarios" placeholder="EntryPoints" />
                )}
              />  
                  </Grid>  
                  <Grid
                    size={{
                      md: 6
                    }}>
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
                  console.log('Direciona setores', newValue);
                }}
                renderValue={(value, getItemProps) => 
                  value.map((option, index) => ( <Chip variant="outlined" label={option.nome} {...getItemProps({ index })} /> ))              
                }
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" label="Selecionar Setores" placeholder="EntryPoints" />
                )}
              />  
                  </Grid>                            
                </Grid>

                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseDialogNewFlow} color="inherit">
                  Cancelar
                </Button>
                <Button onClick={handleAddFluxo} variant="contained">
                  Salvar
                </Button>
              </DialogActions>
      </Dialog>

      <HeaderBreadcrumbs
heading="Fluxo de Ramais"
links={[
  { name: '' }
]}
action={
  <Button
    variant="contained"
   // component={RouterLink}
    onClick={handleClickOpenDialogNewFlow}
    startIcon={<Icon icon={plusFill} />}
  >
   Criar Fluxo
  </Button>
}
/>

      <Card>
        {/* <Grid container>
          <Grid item>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />
          </Grid>
        </Grid> */}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <UserListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={fluxoData.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const { _id, recebe, status, direciona_setores, direciona_usuarios, setores, usuarios } = row;
                  const isItemSelected = selected.indexOf(_id) !== -1;

                  let dataFluxo = { _id, recebe, status, direciona_setores, direciona_usuarios, setores, usuarios   } 

                  const setoresReduce = setores.map(function(i) {
                    return i.nome_setor;
                    });

                    const usuariosReduce = usuarios.map(function(i) {
                      return i.firstName;
                      });
                           

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
                            <TableCell align="left">{recebe}</TableCell>
                            <TableCell align="left">{setoresReduce.toString()}</TableCell>
                            <TableCell align="left">{usuariosReduce.toString()}</TableCell>
                            <TableCell align="left">{status === true ? "Ativado" : "Desativado"}</TableCell>
                            <TableCell align="right">
                            <FluxoMoreMenu
                              onDelete={() =>  handleDeleteFluxo(_id)} 
                              // onEdit={() => {
                              //   setDirecionaSetores(dataFluxo.direciona_setores);
                              //   setDirecionaUsuarios(dataFluxo.direciona_usuarios);
                              //   setRecebe(dataFluxo.recebe)                  
                              //   handleClickOpenDialogEditFlow()
                              // }}
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
          count={fluxoData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
