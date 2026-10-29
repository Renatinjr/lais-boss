import { useEffect } from 'react';
import { useDispatch, useSelector } from 'src/redux/store';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, Typography, TextField, Button, Box, IconButton, Divider  } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// hooks
import useSettings from 'src/hooks/useSettings';
// components
import Page from 'src/components/Page';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import { MoreVert } from '@material-ui/icons';
// redux actions

// ----------------------------------------------------------------------

export default function Extrato() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();

  const financialMovements = [
    {
      id: 1,
      date: '2024-11-16',
      description: 'Cartão de crédito',
      type: 'Entrada', // ou 'Saída'
      amount: 1500.0,
      balance: 29035.98,
      category: 'Outras entradas'
    },
    {
      id: 2,
      date: '2024-11-16',
      description: 'Supermercados BH',
      type: 'Saída',
      amount: 37.94,
      balance: 29035.98,
      category: 'Outras saídas'
    },
    {
      id: 3,
      date: '2024-11-15',
      description: 'Compra no débito',
      type: 'Saída',
      amount: 27.67,
      balance: 28223.92,
      category: 'Alimentação'
    }
  ];

  // Função para formatar valores monetários
  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  // Organizar as movimentações por data
  const groupedByDate = financialMovements.reduce((acc, movement) => {
    const { date } = movement;
    if (!acc[date]) acc[date] = [];
    acc[date].push(movement);
    return acc;
  }, {});

  return (
    <Page title="Extrato Financeiro">
      <Container maxWidth={themeStretch ? false : 'lg'}>


        {/* Extrato */}
        {Object.entries(groupedByDate).map(([date, movements]) => (
          <Box key={date} mb={4}>
            {/* Cabeçalho com data e saldo */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">
                {new Date(date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Saldo do dia: {formatCurrency(movements[0]?.balance)}
              </Typography>
            </Box>

            <Divider />

            {/* Lista de movimentações */}
            {movements.map((movement) => (
              <Box
                key={movement.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                py={2}
                borderBottom="1px solid #f0f0f0"
              >
                {/* Detalhes da movimentação */}
                <Box>
                  <Typography variant="body1" gutterBottom>
                    {movement.type === 'Entrada' ? 'Entrada' : 'Saida'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {movement.description || 'Descrição não disponível'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {movement.category || 'Outras entradas/saídas'}
                  </Typography>
                </Box>

                {/* Valor da movimentação */}
                <Typography
                  variant="body1"
                  style={{
                    color: movement.type === 'Entrada' ? 'green' : 'red'
                  }}
                >
                  {movement.type === 'Entrada'
                    ? `+ ${formatCurrency(movement.amount)}`
                    : `- ${formatCurrency(movement.amount)}`}
                </Typography>

                {/* Ações */}
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Box>
            ))}
          </Box>
        ))}
      </Container>
    </Page>
  );
}
