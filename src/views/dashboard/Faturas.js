'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Box
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Page from '../../components/Page';
import { fDateTimeSuffix, fDate } from '../../utils/formatTime'; 
export default function Faturas() {
  const [tabIndex, setTabIndex] = useState(0);
  const [faturas, setFaturas] = useState([]);
  const [faturasFiltradas, setFaturasFiltradas] = useState([]);
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  const [countTodos, setCountTodos] = useState(0);
  const [countPagos, setCountPagos] = useState(0);
  const [countPendentes, setCountPendentes] = useState(0);
  const [countFaturados, setCountFaturados] = useState(0);
  const [countCancelados, setCountCancelados] = useState(0);

  useEffect(() => {
    const fetchFaturas = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // const faturasExibidas = [
      //   { 
      //     id: '#00001', 
      //     company: 'Katuxa Calçados', 
      //     date: '2024-10-01T18:00',  
      //     due_date: '2024-10-10', 
      //     payment_method: 'Cora', 
      //     payment_type: 'Boleto', 
      //     status: 'Pago', 
      //     amount: 'R$ 389,99' 
      //   },
      //   { 
      //     id: '#00002', 
      //     company: 'Agronova', 
      //     date: '2024-10-01T18:00', 
      //     due_date: '2024-10-10', 
      //     payment_method: 'Cora', 
      //     payment_type: 'Boleto', 
      //     status: 'Pendente', 
      //     amount: 'R$ 500,00' 
      //   }
      // ];

      const faturasExibidas = [

      ];

      setFaturas(faturasExibidas);
    };

    fetchFaturas();
  }, []);

  useEffect(() => {
    const filtrarFaturas = () => {
      let filtradas = [...faturas];

      if (dataInicial) {
        filtradas = filtradas.filter(fatura => new Date(fatura.date) >= new Date(dataInicial));
      }
      if (dataFinal) {
        filtradas = filtradas.filter(fatura => new Date(fatura.date) <= new Date(dataFinal));
      }

      setCountTodos(filtradas.length);
      setCountPagos(filtradas.filter(fatura => fatura.status === 'Pago').length);
      setCountPendentes(filtradas.filter(fatura => fatura.status === 'Pendente').length);
      setCountFaturados(filtradas.filter(fatura => fatura.status === 'Faturado').length);
      setCountCancelados(filtradas.filter(fatura => fatura.status === 'Cancelado').length);

      if (tabIndex === 0) {
        setFaturasFiltradas(filtradas); 
      } else if (tabIndex === 1) {
        setFaturasFiltradas(filtradas.filter(fatura => fatura.status === 'Pago'));
      } else if (tabIndex === 2) {
        setFaturasFiltradas(filtradas.filter(fatura => fatura.status === 'Pendente'));
      } else if (tabIndex === 3) {
        setFaturasFiltradas(filtradas.filter(fatura => fatura.status === 'Faturado'));
      } else if (tabIndex === 4) {
        setFaturasFiltradas(filtradas.filter(fatura => fatura.status === 'Cancelado'));
      }
    };

    filtrarFaturas();
  }, [tabIndex, faturas, dataInicial, dataFinal]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Page title="Faturas">
      <Container maxWidth fullWidth>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            
            <TextField
              size="small"
              label="Data Inicial"
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
            <TextField
              size="small"
              label="Data Final"
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
            <Button variant="contained">Filtrar</Button>
          </Stack>

          
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
                  <span>Todos</span>
                  <Badge badgeContent={countTodos} color="primary" sx={{ ml: 2 }} showZero />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
                  <span>Pago</span>
                  <Badge badgeContent={countPagos} color="success" sx={{ ml: 2 }} showZero/>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
                  <span>Pendente</span>
                  <Badge badgeContent={countPendentes} color="warning" sx={{ ml: 2 }} showZero />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
                  <span>Faturado</span>
                  <Badge badgeContent={countFaturados} color="info" sx={{ ml: 2 }} showZero />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
                  <span>Cancelado</span>
                  <Badge badgeContent={countCancelados} color="error" sx={{ ml: 2 }} showZero />
                </Box>
              } 
            />
          </Tabs>

          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fatura</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Emissão</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Conta</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {faturasFiltradas.map((fatura) => (
                  <TableRow key={fatura.id}>
                    <TableCell>{fatura.id}</TableCell>
                    <TableCell>{fatura.company}</TableCell>
                    <TableCell>{fDate(fatura.date)}</TableCell> {/* Formata a data de emissão */}
                    <TableCell>{fDateTimeSuffix(fatura.due_date)}</TableCell>  {/* Formata a data de vencimento */}
                    <TableCell>{fatura.payment_method}</TableCell>
                    <TableCell>{fatura.payment_type}</TableCell>
                    <TableCell>
                      <Chip
                        label={fatura.status}
                        color={fatura.status === 'Pago' ? 'success' : fatura.status === 'Pendente' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{fatura.amount}</TableCell>
                    <TableCell>
                      <IconButton color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </Page>
  );
}