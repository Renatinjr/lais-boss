import { useState } from 'react';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
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
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@material-ui/core';

// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import Page from '../../../components/Page';
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import { UserListHead } from '../../../components/_dashboard/user/list';

// Mock data
const MOCK_ACCOUNTS = [
    { id: 1, name: 'Banco Inter', initialValue: 1000.00 },
    { id: 2, name: 'Nubank', initialValue: 500.00 },
];

const TABLE_HEAD = [
    { id: 'name', label: 'Nome da Conta', alignRight: false },
    { id: 'initialValue', label: 'Saldo Inicial', alignRight: false },
    { id: '' }
];

export default function FinancialAccounts() {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('name');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openDialog, setOpenDialog] = useState(false);

    // Form state
    const [newAccount, setNewAccount] = useState({
        name: '',
        initialValue: ''
    });

    const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        // Logic for select all
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

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - accounts.length) : 0;

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleSaveAccount = () => {
        setAccounts([...accounts, { ...newAccount, id: accounts.length + 1 }]);
        handleCloseDialog();
        setNewAccount({ name: '', initialValue: '' });
    };

    return (
        <Page title="Financeiro: Contas">
            <Container>
                <HeaderBreadcrumbs
                    heading="Gerenciar Contas"
                    links={[
                        { name: 'Dashboard', href: PATH_DASHBOARD.root },
                        { name: 'Financeiro', href: PATH_DASHBOARD.financeiro.root },
                        { name: 'Contas' }
                    ]}
                    action={
                        <Button
                            variant="contained"
                            startIcon={<Icon icon={plusFill} />}
                            onClick={handleOpenDialog}
                        >
                            Nova Conta
                        </Button>
                    }
                />

                <Card>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2.5, px: 3 }}>
                        <TextField
                            value={filterName}
                            onChange={handleFilterByName}
                            placeholder="Buscar conta..."
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
                                    rowCount={accounts.length}
                                    numSelected={selected.length}
                                    onRequestSort={handleRequestSort}
                                    onSelectAllClick={handleSelectAllClick}
                                />
                                <TableBody>
                                    {accounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                        const { id, name, initialValue } = row;
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
                                                </TableCell>
                                                <TableCell align="left">{name}</TableCell>
                                                <TableCell align="left">{`R$ ${initialValue}`}</TableCell>
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
                        count={accounts.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Nova Conta</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
                            <TextField label="Nome da Conta" fullWidth value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} />
                            <TextField label="Saldo Inicial" type="number" fullWidth value={newAccount.initialValue} onChange={(e) => setNewAccount({ ...newAccount, initialValue: e.target.value })} />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button variant="contained" onClick={handleSaveAccount}>Salvar</Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Page>
    );
}
