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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { 
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  DateRange as DateRangeIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon
} from '@material-ui/icons';
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

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  filterSection: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
  },
  tableCard: {
    borderRadius: theme.spacing(1),
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  tableHeader: {
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
  clientHeader: {
    backgroundColor: theme.palette.grey[100],
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    position: 'sticky',
    top: '48px',
    zIndex: 1,
    '& .MuiTableCell-root': {
      fontWeight: 700,
      fontSize: '1rem',
      color: '#333',
      padding: theme.spacing(2),
    },
  },
  modelRow: {
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.grey[50],
    },
  },
  modelCell: {
    paddingLeft: theme.spacing(4),
    fontWeight: 500,
    borderLeft: `3px solid ${theme.palette.primary.light}`,
  },
  numberCell: {
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  totalCell: {
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  custoCell: {
    fontWeight: 600,
    fontFamily: 'monospace',
    color: theme.palette.error.main,
  },
  vendaCell: {
    fontWeight: 600,
    fontFamily: 'monospace',
    color: theme.palette.success.main,
  },
  lucroCell: {
    fontWeight: 700,
    fontFamily: 'monospace',
    color: theme.palette.info.main,
  },
  searchButton: {
    marginLeft: theme.spacing(2),
  },
  summaryInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: 0,
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  summaryValue: {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  clientIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

export default function RelatorioConsumoTokens() {
  const classes = useStyles();
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
    <div className={classes.root}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        {/* <HeaderBreadcrumbs
          heading="Relatório de Consumo de Tokens"
          links={[{ name: 'Dashboard', href: '/' }, { name: 'Relatórios', href: '#' }, { name: 'Consumo de Tokens' }]}
        /> */}

        {/* Filtros */}
        <Box className={classes.filterSection}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <TextField
              label="Data Inicial"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              size="small"
            />
            <TextField
              label="Data Final"
              type="date"
              value={final}
              onChange={(e) => setFinal(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              size="small"
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBuscar}
              className={classes.searchButton}
              startIcon={<SearchIcon />}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>
        </Box>

        {/* Tabela Principal */}
        <Card className={classes.tableCard}>
          {/* Resumo compacto */}
          <Box className={classes.summaryInfo}>
            <div className={classes.summaryItem}>
              <TrendingUpIcon color="primary" fontSize="small" />
              <Typography variant="body2">Entrada:</Typography>
              <Typography className={classes.summaryValue}>
                {totalEntrada.toLocaleString()}
              </Typography>
            </div>
            <div className={classes.summaryItem}>
              <TrendingDownIcon color="secondary" fontSize="small" />
              <Typography variant="body2">Saída:</Typography>
              <Typography className={classes.summaryValue} style={{ color: theme.palette.secondary.main }}>
                {totalSaida.toLocaleString()}
              </Typography>
            </div>
            <div className={classes.summaryItem}>
              <AccountBalanceIcon color="primary" fontSize="small" />
              <Typography variant="body2">Total:</Typography>
              <Typography className={classes.summaryValue}>
                {totalGeral.toLocaleString()}
              </Typography>
            </div>
            <div className={classes.summaryItem}>
              <MoneyIcon color="error" fontSize="small" />
              <Typography variant="body2">Custo Total:</Typography>
              <Typography className={classes.summaryValue} style={{ color: theme.palette.error.main }}>
                R$ {totaisFinanceiros.custo.toFixed(2)}
              </Typography>
            </div>
            <div className={classes.summaryItem}>
              <MoneyIcon color="success" fontSize="small" />
              <Typography variant="body2">Venda Total:</Typography>
              <Typography className={classes.summaryValue} style={{ color: theme.palette.success.main }}>
                R$ {totaisFinanceiros.venda.toFixed(2)}
              </Typography>
            </div>
            <div className={classes.summaryItem}>
              <MoneyIcon color="info" fontSize="small" />
              <Typography variant="body2">Lucro Total:</Typography>
              <Typography className={classes.summaryValue} style={{ color: theme.palette.info.main }}>
                R$ {totaisFinanceiros.lucro.toFixed(2)}
              </Typography>
            </div>
          </Box>
          
          {list.length === 0 ? (
            <Box p={4} textAlign="center">
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
                <TableHead className={classes.tableHeader}>
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
                      <TableRow className={classes.clientHeader}>
                        <TableCell colSpan={7}>
                          <Box display="flex" alignItems="center">
                            <BusinessIcon className={classes.clientIcon} />
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
                            className={classes.modelRow}
                          >
                            <TableCell className={classes.modelCell}>
                              <Typography variant="body2" style={{ fontWeight: 500 }}>
                                {convertNameModel(modelo.modelo)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" className={classes.numberCell}>
                              {modelo.somaInput?.toLocaleString() || '0'}
                            </TableCell>
                            <TableCell align="right" className={classes.numberCell}>
                              {modelo.somaOutput?.toLocaleString() || '0'}
                            </TableCell>
                            <TableCell align="right" className={`${classes.numberCell} ${classes.totalCell}`}>
                              {(modelo.somaTotal || 0).toLocaleString()}
                            </TableCell>
                            <TableCell align="right" className={classes.custoCell}>
                              R$ {valores.custo.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" className={classes.vendaCell}>
                              R$ {valores.venda.toFixed(2)}
                            </TableCell>
                            <TableCell align="right" className={classes.lucroCell}>
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
    </div>
  );
}
