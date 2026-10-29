'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Button,
  MenuItem,
  TableSortLabel,
  InputAdornment
} from '@mui/material';
import { Icon } from '@iconify/react';
import { fCurrency, fNumber } from 'src/utils/formatNumber';
import Page from 'src/components/Page';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from 'src/routes/paths';
import actionListaConsumoCreditosTodos from 'src/actions/dashboard/actionListaConsumoCreditosTodos';
import useAuth from 'src/hooks/useAuth';

// Dados de exemplo baseados no JSON fornecido
const mockData = [
  {
    cliente_id: "61e1638610ca0d4f84949d51",
    cliente_nome: "Katuxa Calçados",
    channels: {
      use: 2,
      free: 1,
      paid: 1,
      limit: 2
    },
    credits: {
      uso: {},
      total: {
        use: 0,
        limit: 700,
        credits_add: 0
      }
    },
    users: {
      use: 7,
      free: 5,
      limit: 0
    }
  }
];

export default function RelatorioCreditosIa() {
  const [data, setData] = useState([]);
  const [resumo, setResumo] = useState({ total_creditos_ia: 0, total_creditos_conversas: 0, total_geral: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {user} = useAuth();
  const [orderBy, setOrderBy] = useState('total_use');
  const [order, setOrder] = useState('desc');
  const [filtroNome, setFiltroNome] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  });

  // Função para gerar lista de meses disponíveis (últimos 12 meses)
  const gerarMesesDisponiveis = () => {
    const meses = [];
    const agora = new Date();
    
    for (let i = 0; i < 12; i++) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const valor = `${ano}-${mes}`;
      const label = data.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      });
      meses.push({ valor, label });
    }
    
    return meses;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerar datas inicial e final baseadas no mês selecionado
      const [ano, mes] = mesSelecionado.split('-');
      const dataInicial = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      const dataFinal = new Date(parseInt(ano), parseInt(mes), 0); // Último dia do mês
      
      // Formatar datas para o formato esperado pela API (YYYY-MM-DD)
      const formatarData = (data) => {
        return data.toISOString().split('T')[0];
      };
      const provedor = user.provedor;
      // Construir query string com parâmetros de data
      const fields = `?data_inicial=${formatarData(dataInicial)}&data_final=${formatarData(dataFinal)}&provedor=${user?.provedor}&order_by=${orderBy}&order=${order}`;
      const response = await actionListaConsumoCreditosTodos(fields);
      
      if (response.data.error === false && response.data.data) {
        const clientes = response.data.data.clientes || [];
        setResumo(response.data.data.resumo || { total_creditos_ia: 0, total_creditos_conversas: 0, total_geral: 0 });
        // Filtrar e validar dados antes de ordenar
        const dadosValidos = clientes.filter(item =>
          item &&
          item.credits &&
          item.credits.total &&
          typeof item.credits.total.use === 'number'
        );

        // Ordenar dados por uso de créditos (maior para menor)
        const dadosOrdenados = dadosValidos.sort((a, b) => {
          return b.credits.total.use - a.credits.total.use;
        });
        setData(dadosOrdenados);
      } else {
        setError('Erro ao carregar dados de consumo de créditos');
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao conectar com o servidor');
      // Em caso de erro, usar dados mock para demonstração
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (used, limit) => {
    if (limit === 0) return 'default';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const getProgressColor = (used, limit) => {
    if (limit === 0) return 'primary';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const getStatusLabel = (used, limit) => {
    if (limit === 0) return 'Sem Pacotes';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'Crítico';
    if (percentage >= 70) return 'Atenção';
    return 'Normal';
  };

  const calculateProgress = (used, limit) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const getValorColuna = (item, coluna) => {
    switch (coluna) {
      case 'cliente_nome':
        return (item.cliente_nome || '').toLowerCase();
      case 'creditos_ia':
        return (item.credits?.uso?.automations || 0) + (item.credits?.uso?.agents || 0) + (item.credits?.uso?.copilot || 0) + (item.credits?.uso?.voice || 0);
      case 'creditos_conversas':
        return item.credits?.uso?.chats || 0;
      case 'marketing':
        return item.credits?.uso?.marketing || 0;
      case 'utility':
        return item.credits?.uso?.utility || 0;
      case 'total_use':
        return item.credits?.total?.use || 0;
      default:
        return 0;
    }
  };

  const dadosFiltrados = data
    .filter((item) => {
      if (!filtroNome) return true;
      const nome = (item.cliente_nome || '').toLowerCase();
      return nome.includes(filtroNome.toLowerCase());
    })
    .sort((a, b) => {
      const valA = getValorColuna(a, orderBy);
      const valB = getValorColuna(b, orderBy);
      if (typeof valA === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });

  if (loading) {
    return (
      <Page title="Relatório de Créditos IA">
        <Box sx={{ p: 3 }}>
          <LinearProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page title="Relatório de Créditos IA">
      <Box sx={{ p: 3 }}>
        <HeaderBreadcrumbs
          heading="Relatório de Créditos IA"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Relatórios' },
            { name: 'Créditos IA' }
          ]}
          action={
            <Tooltip title="Atualizar dados">
              <IconButton onClick={fetchData}>
                <Icon icon="eva:refresh-fill" />
              </IconButton>
            </Tooltip>
          }
        />

        {/* Filtros e Resumo */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} sx={{
            alignItems: "center"
          }}>
            <Grid
              size={{
                xs: 12,
                sm: 3
              }}>
              <TextField
                fullWidth
                select
                label="Mês"
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
                variant="outlined"
                size="small"
              >
                {gerarMesesDisponiveis().map((mes) => (
                  <MenuItem key={mes.valor} value={mes.valor}>
                    {mes.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3
              }}>
              <TextField
                fullWidth
                label="Buscar cliente"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                variant="outlined"
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="eva:search-fill" width={20} height={20} />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 2
              }}>
              <Button
                variant="contained"
                onClick={fetchData}
                disabled={loading}
                startIcon={<Icon icon="eva:search-fill" />}
                size="small"
                fullWidth
              >
                Buscar
              </Button>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <Grid container spacing={2}>
                <Grid size={3}>
                  <Box sx={{
                    textAlign: "center"
                  }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block"
                      }}>
                      Clientes
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {data.length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={3}>
                  <Box sx={{
                    textAlign: "center"
                  }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block"
                      }}>
                      Créditos IA
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'info.main' }}>
                      {resumo.total_creditos_ia}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={3}>
                  <Box sx={{
                    textAlign: "center"
                  }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block"
                      }}>
                      Créditos Conversas
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'warning.main' }}>
                      {resumo.total_creditos_conversas}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={3}>
                  <Box sx={{
                    textAlign: "center"
                  }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block"
                      }}>
                      Total Geral
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'success.main' }}>
                      {resumo.total_geral}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>

        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'cliente_nome'}
                      direction={orderBy === 'cliente_nome' ? order : 'asc'}
                      onClick={() => handleSort('cliente_nome')}
                    >
                      Cliente
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === 'creditos_ia'}
                      direction={orderBy === 'creditos_ia' ? order : 'asc'}
                      onClick={() => handleSort('creditos_ia')}
                    >
                      Créditos IA
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === 'creditos_conversas'}
                      direction={orderBy === 'creditos_conversas' ? order : 'asc'}
                      onClick={() => handleSort('creditos_conversas')}
                    >
                      Créditos Conversas
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === 'marketing'}
                      direction={orderBy === 'marketing' ? order : 'asc'}
                      onClick={() => handleSort('marketing')}
                    >
                      Marketing
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === 'utility'}
                      direction={orderBy === 'utility' ? order : 'asc'}
                      onClick={() => handleSort('utility')}
                    >
                      Utility
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === 'total_use'}
                      direction={orderBy === 'total_use' ? order : 'asc'}
                      onClick={() => handleSort('total_use')}
                    >
                      Total
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Progresso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dadosFiltrados.map((item) => (
                  <TableRow key={item.cliente_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {item.cliente_nome} {item.numero ? `- ${item.numero}` : ''}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: "text.secondary"
                      }}>
                        ID: {item.cliente_id}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: 'info.main'
                          }}>
                          {(item.credits?.uso?.automations || 0) + (item.credits?.uso?.agents || 0) + (item.credits?.uso?.copilot || 0) + (item.credits?.uso?.voice || 0)}
                        </Typography>
 
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: 'warning.main'
                          }}>
                          {item.credits?.uso?.chats || 0}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: 'secondary.main'
                        }}>
                        {item.credits?.uso?.marketing || 0}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: 'text.primary'
                        }}>
                        {item.credits?.uso?.utility || 0}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" sx={{
                          fontWeight: "bold"
                        }}>
                          {item.credits?.total?.use || 0} / {item.credits?.total?.limit || 0}
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: "text.secondary"
                        }}>
                          {item.credits?.total?.credits_add || 0} adicionais
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(item.credits?.total?.use || 0, item.credits?.total?.limit || 0)}
                        color={getStatusColor(item.credits?.total?.use || 0, item.credits?.total?.limit || 0)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ minWidth: 120 }}>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(item.credits?.total?.use || 0, item.credits?.total?.limit || 0)}
                          color={getProgressColor(item.credits?.total?.use || 0, item.credits?.total?.limit || 0)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            mt: 0.5,
                            display: 'block'
                          }}>
                          {calculateProgress(item.credits?.total?.use || 0, item.credits?.total?.limit || 0).toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && data.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Nenhum dado de consumo de créditos encontrado.
          </Alert>
        )}
      </Box>
    </Page>
  );
}
