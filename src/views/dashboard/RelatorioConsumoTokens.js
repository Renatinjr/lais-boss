'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Typography,
  Box,
  Grid,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  DateRange as DateRangeIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import useSettings from '../../hooks/useSettings';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import actionListaConsumoCreditos from 'src/actions/dashboard/actionListaConsumoCreditos';
import useAuth from 'src/hooks/useAuth';
import React from 'react';

// Configuração dos modelos com pesos e preços
const MODELOS_CONFIG = {
  'gpt-4o-mini': {
    peso: 10,
    custoPorMilhaoTokens: 1.70,
    markup: 2,
    nome: 'Laís Básica (GPT-4o-mini)'
  },
  'gpt-4o': {
    peso: 150,
    custoPorMilhaoTokens: 8.40,
    markup: 2,
    nome: 'Laís Avançada (GPT-4o)'
  },
  'whisper': {
    peso: 150,
    custoPorMilhaoTokens: 16.00,
    markup: 2,
    nome: 'Transcrição de Áudio (Whisper)'
  },
  'gpt-4o-mini-vision': {
    peso: 10,
    custoPorMilhaoTokens: 1.50,
    markup: 2,
    nome: 'Transcrição de Imagem (GPT-4o-mini)'
  },
  'lais-voice': {
    peso: 150,
    custoPorMilhaoTokens: 20.00, // Valor estimado
    markup: 2,
    nome: 'Geração de Áudio'
  }
};

// former makeStyles classes, now nested under the root element
const RootStyle = styled('div')(({ theme }) => {
  const isLight = theme.palette.mode === 'light';

  return {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    '& .rct-filterSection': {
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.spacing(1),
      border: `1px solid ${theme.palette.divider}`,
    },
    '& .rct-tableCard': {
      borderRadius: theme.spacing(1),
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    '& .rct-tableHeader': {
      backgroundColor: theme.palette.grey[800],
      position: 'sticky',
      top: 0,
      zIndex: 1,
      '& .MuiTableCell-head': {
        color: theme.palette.common.gey,
        fontWeight: 600,
        fontSize: '0.875rem',
      },
    },
    '& .rct-clientHeader': {
      backgroundColor: isLight ? theme.palette.grey[100] : theme.palette.background.neutral,
      borderBottom: `2px solid ${theme.palette.primary.main}`,
      position: 'sticky',
      top: '48px',
      zIndex: 1,
      '& .MuiTableCell-root': {
        fontWeight: 700,
        fontSize: '1rem',
        color: isLight ? '#333' : theme.palette.text.primary,
        padding: theme.spacing(2),
      },
    },
    '& .rct-modelRow': {
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:nth-of-type(even)': {
        backgroundColor: isLight ? theme.palette.grey[50] : theme.palette.background.neutral,
      },
    },
    '& .rct-modelCell': {
      paddingLeft: theme.spacing(4),
      fontWeight: 500,
      borderLeft: `3px solid ${theme.palette.primary.light}`,
    },
    '& .rct-numberCell': {
      fontWeight: 600,
      fontFamily: 'monospace',
    },
    '& .rct-totalCell': {
      fontWeight: 700,
      color: theme.palette.primary.main,
    },
    '& .rct-custoCell': {
      fontWeight: 600,
      fontFamily: 'monospace',
      color: theme.palette.error.main,
    },
    '& .rct-vendaCell': {
      fontWeight: 600,
      fontFamily: 'monospace',
      color: theme.palette.success.main,
    },
    '& .rct-lucroCell': {
      fontWeight: 700,
      fontFamily: 'monospace',
      color: theme.palette.info.main,
    },
    '& .rct-searchButton': {
      marginLeft: theme.spacing(2),
    },
    '& .rct-summaryInfo': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(2),
      backgroundColor: isLight ? theme.palette.grey[50] : theme.palette.background.neutral,
      borderBottom: `1px solid ${theme.palette.divider}`,
      marginBottom: 0,
    },
    '& .rct-summaryItem': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    '& .rct-summaryValue': {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
    '& .rct-clientIcon': {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    },
  };
});

export default function RelatorioConsumoTokens() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const {user} = useAuth();
  const [list, setList] = useState([]);
  const [inicio, setInicio] = useState(new Date().toISOString().split('T')[0]);
  const [final, setFinal] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const buscarConsumo = async () => {
    setLoading(true);
    try {
      let fields = `?inicio=${inicio}&final=${final}&provedor=${user.provedor}`;
      const res = await actionListaConsumoCreditos(fields);
      if (res.data.data) {
        setList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarConsumo();
  }, []);

  function convertNameModel(value) {
    return value;
  }

  const handleBuscar = () => {
    buscarConsumo();
  };

  // Função para calcular custo, venda e lucro
  const calcularValores = (modelo, tokens) => {
    const config = MODELOS_CONFIG[modelo] || MODELOS_CONFIG['gpt-4o-mini']; // fallback
    const milhoesTokens = tokens / 1000000;
    
    const custo = milhoesTokens * config.custoPorMilhaoTokens;
    const venda = custo * config.markup;
    const lucro = venda - custo;
    
    return { custo, venda, lucro };
  };

  // Calcular totais
  const totalEntrada = list.reduce((acc, item) => 
    acc + item.modelos.reduce((sum, modelo) => sum + (modelo.somaInput || 0), 0), 0
  );
  const totalSaida = list.reduce((acc, item) => 
    acc + item.modelos.reduce((sum, modelo) => sum + (modelo.somaOutput || 0), 0), 0
  );
  const totalGeral = totalEntrada + totalSaida;

  // Calcular totais financeiros
  const totaisFinanceiros = list.reduce((acc, item) => {
    const clienteTotais = item.modelos.reduce((sum, modelo) => {
      const valores = calcularValores(modelo.modelo, modelo.somaTotal || 0);
      return {
        custo: sum.custo + valores.custo,
        venda: sum.venda + valores.venda,
        lucro: sum.lucro + valores.lucro
      };
    }, { custo: 0, venda: 0, lucro: 0 });
    
    return {
      custo: acc.custo + clienteTotais.custo,
      venda: acc.venda + clienteTotais.venda,
      lucro: acc.lucro + clienteTotais.lucro
    };
  }, { custo: 0, venda: 0, lucro: 0 });

  return (
    <RootStyle>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        {/* <HeaderBreadcrumbs
          heading="Relatório de Consumo de Tokens"
          links={[{ name: 'Dashboard', href: '/' }, { name: 'Relatórios', href: '#' }, { name: 'Consumo de Tokens' }]}
        /> */}

        {/* Filtros */}
        <Box className="rct-filterSection">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap"
            }}>
            <TextField
              label="Data Inicial"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              variant="outlined"
              size="small"
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
            <TextField
              label="Data Final"
              type="date"
              value={final}
              onChange={(e) => setFinal(e.target.value)}
              variant="outlined"
              size="small"
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBuscar}
              className="rct-searchButton"
              startIcon={<SearchIcon />}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>
        </Box>

        {/* Tabela Principal */}
        <Card className="rct-tableCard">
          {/* Resumo compacto */}
          <Box className="rct-summaryInfo">
            <div className="rct-summaryItem">
              <TrendingUpIcon color="primary" fontSize="small" />
              <Typography variant="body2">Entrada:</Typography>
              <Typography className="rct-summaryValue">
                {totalEntrada.toLocaleString()}
              </Typography>
            </div>
            <div className="rct-summaryItem">
              <TrendingDownIcon color="secondary" fontSize="small" />
              <Typography variant="body2">Saída:</Typography>
              <Typography className="rct-summaryValue" style={{ color: theme.palette.secondary.main }}>
                {totalSaida.toLocaleString()}
              </Typography>
            </div>
            <div className="rct-summaryItem">
              <AccountBalanceIcon color="primary" fontSize="small" />
              <Typography variant="body2">Total:</Typography>
              <Typography className="rct-summaryValue">
                {totalGeral.toLocaleString()}
              </Typography>
            </div>
            <div className="rct-summaryItem">
              <MoneyIcon color="error" fontSize="small" />
              <Typography variant="body2">Custo Total:</Typography>
              <Typography className="rct-summaryValue" style={{ color: theme.palette.error.main }}>
                R$ {totaisFinanceiros.custo.toFixed(2)}
              </Typography>
            </div>
            <div className="rct-summaryItem">
              <MoneyIcon color="success" fontSize="small" />
              <Typography variant="body2">Venda Total:</Typography>
              <Typography className="rct-summaryValue" style={{ color: theme.palette.success.main }}>
                R$ {totaisFinanceiros.venda.toFixed(2)}
              </Typography>
            </div>
            <div className="rct-summaryItem">
              <MoneyIcon color="info" fontSize="small" />
              <Typography variant="body2">Lucro Total:</Typography>
              <Typography className="rct-summaryValue" style={{ color: theme.palette.info.main }}>
                R$ {totaisFinanceiros.lucro.toFixed(2)}
              </Typography>
            </div>
          </Box>
          
          {list.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center"
              }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Nenhum dado encontrado
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tente ajustar os filtros de data para encontrar resultados
              </Typography>
            </Box>
          ) : (
            <TableContainer style={{ maxHeight: '70vh', overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead className="rct-tableHeader">
                  <TableRow>
                    <TableCell>Cliente / Modelo</TableCell>
                    <TableCell align="right">Entrada</TableCell>
                    <TableCell align="right">Saída</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Custo (R$)</TableCell>
                    <TableCell align="right">Venda (R$)</TableCell>
                    <TableCell align="right">Lucro (R$)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((item, index) => (
                    <React.Fragment key={index}>
                      {/* Cabeçalho do Cliente */}
                      <TableRow className="rct-clientHeader">
                        <TableCell colSpan={7}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center"
                            }}>
                            <BusinessIcon className="rct-clientIcon" />
                            <Typography variant="h6">
                              {item.cliente}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={`${item.modelos.length} modelo${item.modelos.length > 1 ? 's' : ''}`}
                              color="primary"
                              variant="outlined"
                              style={{ marginLeft: 16 }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                      
                      {/* Modelos do Cliente */}
                      {item.modelos.map((modelo, modeloIndex) => {
                        const valores = calcularValores(modelo.modelo, modelo.somaTotal || 0);
                        return (
                          <TableRow 
                            key={`${index}-${modeloIndex}`} 
                            className="rct-modelRow"
                          >
                            <TableCell className="rct-modelCell">
                              <Typography variant="body2" style={{ fontWeight: 500 }}>
                                {convertNameModel(modelo.modelo)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" className="rct-numberCell">
                              {modelo.somaInput?.toLocaleString() || '0'}
                            </TableCell>
                            <TableCell align="right" className="rct-numberCell">
                              {modelo.somaOutput?.toLocaleString() || '0'}
                            </TableCell>
                            <TableCell align="right" className="rct-numberCell rct-totalCell">
                              {(modelo.somaTotal || 0).toLocaleString()}
                            </TableCell>
                            <TableCell align="right" className="rct-custoCell">
                              R$ {valores.custo.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" className="rct-vendaCell">
                              R$ {valores.venda.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" className="rct-lucroCell">
                              R$ {valores.lucro.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>
    </RootStyle>
  );
}
