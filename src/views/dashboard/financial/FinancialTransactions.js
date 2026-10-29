'use client';

import { filter } from 'lodash';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import RouterLink from 'next/link';
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
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem
} from '@mui/material';

// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import Page from '../../../components/Page';
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import SearchNotFound from '../../../components/SearchNotFound';
import { UserListHead } from '../../../components/_dashboard/user/list';

// Mock data
const MOCK_TRANSACTIONS = [
    { id: 1, name: 'Venda Website', description: 'Criação de site institucional', value: 2500.00, date: '2024-01-15', account: 'Banco Inter', type: 'entrada' },
    { id: 2, name: 'Servidor AWS', description: 'Pagamento mensal', value: 150.00, date: '2024-01-10', account: 'Nubank', type: 'saida' },
];

const TABLE_HEAD = [
    { id: 'name', label: 'Nome', alignRight: false },
    { id: 'description', label: 'Descrição', alignRight: false },
    { id: 'value', label: 'Valor', alignRight: false },
    { id: 'date', label: 'Data', alignRight: false },
    { id: 'account', label: 'Conta', alignRight: false },
    { id: 'type', label: 'Tipo', alignRight: false },
    { id: '' }
];

export default function FinancialTransactions() {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('date');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openDialog, setOpenDialog] = useState(false);

    // Form state
    const [newTransaction, setNewTransaction] = useState({
        name: '',
        description: '',
        value: '',
        date: '',
        account: '',
        type: 'entrada'
    });

    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = transactions.map((n) => n.name);
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
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactions.length) : 0;

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleSaveTransaction = () => {
        setTransactions([...transactions, { ...newTransaction, id: transactions.length + 1 }]);
        handleCloseDialog();
        setNewTransaction({ name: '', description: '', value: '', date: '', account: '', type: 'entrada' });
    };

    return (
        <Page title="Financeiro: Transações">
            <Container>
                <HeaderBreadcrumbs
                    heading="Movimentações Financeiras"
                    links={[
                        { name: 'Dashboard', href: PATH_DASHBOARD.root },
                        { name: 'Financeiro', href: PATH_DASHBOARD.financeiro.root },
                        { name: 'Transações' }
                    ]}
                    action={
                        <Button
                            variant="contained"
                            startIcon={<Icon icon={plusFill} />}
                            onClick={handleOpenDialog}
                        >
                            Nova Transação
                        </Button>
                    }
                />

                <Card>
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 2.5,
                            px: 3
                        }}>
                        <TextField
                            value={filterName}
                            onChange={handleFilterByName}
                            placeholder="Buscar transação..."
                            size="small"
                        />
                    </Stack>

                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800 }}>
                            <Table>
                                <UserListHead
                                    order={order}
                                    orderBy={orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={transactions.length}
                                    numSelected={selected.length}
                                    onRequestSort={handleRequestSort}
                                    onSelectAllClick={handleSelectAllClick}
                                />
                                <TableBody>
                                    {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                        const { id, name, description, value, date, account, type } = row;
                                        const isItemSelected = selected.indexOf(name) !== -1;

                                        return (
                                            <TableRow
                                                hover
                                                key={id}
                                                tabIndex={-1}
                                                role="checkbox"
                                                selected={isItemSelected}
                                                aria-checked={isItemSelected}
                                            >
                                                <TableCell padding="checkbox">
                                                    {/*  */}
                                                </TableCell>
                                                <TableCell align="left">{name}</TableCell>
                                                <TableCell align="left">{description}</TableCell>
                                                <TableCell align="left">{`R$ ${value}`}</TableCell>
                                                <TableCell align="left">{date}</TableCell>
                                                <TableCell align="left">{account}</TableCell>
                                                <TableCell align="left">
                                                    <Label
                                                        variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                        color={(type === 'saida' && 'error') || 'success'}
                                                    >
                                                        {type}
                                                    </Label>
                                                </TableCell>
                                                <TableCell align="right">
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
                        count={transactions.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Nova Transação</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
                            <TextField label="Nome" fullWidth value={newTransaction.name} onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })} />
                            <TextField label="Descrição" fullWidth value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} />
                            <TextField label="Valor" type="number" fullWidth value={newTransaction.value} onChange={(e) => setNewTransaction({ ...newTransaction, value: e.target.value })} />
                            <TextField label="Data Pagamento" type="date" fullWidth value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} slotProps={{
                                inputLabel: { shrink: true }
                            }} />
                            <TextField select label="Conta" fullWidth value={newTransaction.account} onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}>
                                <MenuItem value="Banco Inter">Banco Inter</MenuItem>
                                <MenuItem value="Nubank">Nubank</MenuItem>
                                <MenuItem value="Caixa">Caixa</MenuItem>
                            </TextField>
                            <TextField select label="Tipo" fullWidth value={newTransaction.type} onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}>
                                <MenuItem value="entrada">Entrada</MenuItem>
                                <MenuItem value="saida">Saída</MenuItem>
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button variant="contained" onClick={handleSaveTransaction}>Salvar</Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Page>
    );
}
