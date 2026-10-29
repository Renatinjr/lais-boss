'use client';

import { filter } from 'lodash';


import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../components/_dashboard/user/list';
import v2_actionOrganizacoes from 'src/actions/admin/v2_actionOrgnaizacoes';
import Iconify from 'src/components/Iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', alignRight: false },
  { id: 'fase', label: 'Fase', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '', label: '' },
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

function applySortFilter(array, comparator, query, statusFilter, faseFilter) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredArray = [...array];

  // Filtro por nome
  if (query) {
    filteredArray = filteredArray.filter(
      (_item) => _item.nome.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  // Filtro por status
  if (statusFilter !== 'todos') {
    filteredArray = filteredArray.filter(
      (_item) => _item.status === (statusFilter === 'ativo')
    );
  }

  // Filtro por fase
  if (faseFilter !== 'todos') {
    filteredArray = filteredArray.filter(
      (_item) => _item.fase === faseFilter
    );
  }

  return filteredArray;
}

export default function Organizacoes() {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { userList } = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [faseFilter, setFaseFilter] = useState('todos');
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [listaUsuarios, setListaUsuarios] = useState([]);

  async function getOrganizacoes(){
    try {
        const res = await v2_actionOrganizacoes();
        setListaUsuarios(res.data.data);
    } catch(error){
        console.log(error);
    }
  }

  useEffect(() => {
    getOrganizacoes()
  }, [dispatch]);

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

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const handleFilterByStatus = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleFilterByFase = (event) => {
    setFaseFilter(event.target.value);
    setPage(0);
  };

  const handleDeleteUser = (userId) => {
    dispatch(deleteUser(userId));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - listaUsuarios.length) : 0;

  const filteredUsers = applySortFilter(
    listaUsuarios,
    getComparator(order, orderBy),
    filterName,
    statusFilter,
    faseFilter
  );

  const isUserNotFound = filteredUsers.length === 0;

  return (
    <Page title="User: List | Minimal-UI">
      <Container maxWidth={'md'}>
        <HeaderBreadcrumbs
          heading="Organizações"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Lais', href: PATH_DASHBOARD.plataforma.root },
            { name: 'Organizações   ' }
          ]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              href={PATH_DASHBOARD.plataforma.newUser}
            >
              New User
            </Button>
          }
        />

        <Card>
          <Stack spacing={2} direction="row" sx={{ p: 3 }}>
            <TextField
              fullWidth
              value={filterName}
              onChange={handleFilterByName}
              placeholder="Pesquisar por nome..."
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={handleFilterByStatus}>
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Fase</InputLabel>
              <Select value={faseFilter} onChange={handleFilterByFase}>
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="dev">Dev</MenuItem>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="onboarding">Onboarding</MenuItem>
              </Select>
            </FormControl>
          </Stack>
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
                    return (
                      <Accordion key={row._id}>
                        <AccordionSummary
                          expandIcon={<Iconify icon="mdi:chevron-down" />}
                          aria-controls={`panel-${row._id}-content`}
                          id={`panel-${row._id}-header`}
                        >
                          <Typography>{row.nome}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}>
                              <Typography variant="subtitle2">Fase:</Typography>
                              <Label color={row.fase === 'dev' ? 'info' : row.fase === 'ativo' ? 'success' : row.fase === 'onboarding' ? 'warning' : 'error'}>
                                {row.fase}
                              </Label>
                            </Stack>
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}>
                              <Typography variant="subtitle2">Status:</Typography>
                              <Label color={row.status ? 'success' : 'error'}>
                                {row.status ? 'Ativo' : 'Inativo'}
                              </Label>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{
                              justifyContent: "flex-end"
                            }}>
                              <Button variant="secondary">
                                <Iconify icon="mdi:edit" />
                              </Button>
                              <Button variant="secondary">
                                <Iconify icon="mdi:delete" />
                              </Button>
                              <Button variant="secondary">
                                <Iconify icon="mdi:eye" />
                              </Button>
                            </Stack>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
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
    </Page>
  );
}
