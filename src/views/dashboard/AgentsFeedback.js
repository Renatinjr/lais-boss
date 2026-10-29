'use client';

import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import RouterLink from 'next/link';
import v3_actionAgentsFeedback from '../../actions/v3/ai/v3_actionAgentsFeedback';
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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { IconButton as MuiIconButton } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
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
import { FeedbackListHead, FeedbackListToolbar } from '../../components/_dashboard/feedback/list';
import { border, surface, textSecondary, tint } from 'src/theme/modeColor';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'user', label: 'Usuário', alignRight: false },
  { id: 'agent', label: 'Agente', alignRight: false },
  { id: 'feedback_type', label: 'Tipo', alignRight: false },
  { id: 'priority', label: 'Prioridade', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'created_at', label: 'Data', alignRight: false },
  { id: '' }
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
    return filter(array, (_feedback) => 
      _feedback.userObj?.firstName?.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _feedback.userObj?.lastName?.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _feedback.userObj?.username?.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _feedback.agentObj?.name?.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _feedback.feedback_type?.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _feedback.status?.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

// ----------------------------------------------------------------------

// Componente para edição inline
const InlineEditCell = ({ 
  value, 
  options, 
  onSave, 
  onKeyPress, 
  getColor 
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        select
        size="small"
        value={value}
        onChange={(e) => onSave(e.target.value)}
        onKeyDown={onKeyPress}
        sx={{ 
          minWidth: 120,
          '& .MuiOutlinedInput-root': {
            backgroundColor: getColor(value) === 'error' ? tint('error') : 
                           getColor(value) === 'warning' ? tint('warning') : 
                           getColor(value) === 'success' ? tint('success') : 
                           surface('grey.100')
          }
        }}
        slotProps={{
          select: {
            native: true,
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </TextField>
    </Box>
  );
};

export default function AgentsFeedback() {
  const theme = useTheme();
  const { themeStretch } = useSettings();

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [chatContainerRef, setChatContainerRef] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    priority: '',
    feedback_type: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Opções para edição inline
  const statusOptions = [
    { value: 'reportado', label: 'Reportado' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'resolvido', label: 'Resolvido' },
    { value: 'fechado', label: 'Fechado' }
  ];

  const priorityOptions = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'media', label: 'Média' },
    { value: 'alta', label: 'Alta' }
  ];

  // Função para buscar dados da API
  const fetchFeedbackData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await v3_actionAgentsFeedback({
        // Parâmetros de query podem ser adicionados aqui conforme necessário
        // Exemplo: page, limit, status, etc.
      });
      
      if (response.data && response.data.status === 'success') {
        setFeedbackList(response.data.data || []);
      } else {
        setError('Erro ao carregar dados de feedback');
      }
    } catch (err) {
      console.error('Erro ao buscar feedbacks:', err);
      setError('Erro ao conectar com o servidor');
      // Manter dados mockados em caso de erro para desenvolvimento
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para carregar dados quando o componente for montado
  useEffect(() => {
    fetchFeedbackData();
  }, []);

  // Scroll automático para mensagens destacadas quando modal abrir
  useEffect(() => {
    if (openModal && selectedFeedback && chatContainerRef) {
      // Aguardar um pouco para o DOM ser renderizado
      setTimeout(() => {
        const highlightedMessages = chatContainerRef.querySelectorAll('[data-highlighted="true"]');
        if (highlightedMessages.length > 0) {
          // Scroll para a primeira mensagem destacada
          highlightedMessages[0].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [openModal, selectedFeedback, chatContainerRef]);

  // Dados mockados como fallback (serão removidos quando a API estiver funcionando)
  const [feedbackList, setFeedbackList] = useState([
    {
      _id: "68c0f8cb7dcc790913643a90",
      user_id: "657b569ffb311b7ea69bd1d4",
      cliente_id: "66644780d772683ed5e43191",
      agent_id: "689d621604a90c1452306ffd",
      prompt_current: "teste",
      scope: {
        messages: [
          "true_553798623638@c.us_3EB0E546B615F27F8A6A1D",
          "true_553798623638@c.us_3EB0D9A92F0C31E5E352BC",
          "true_553798623638@c.us_3EB0DE3570378C373593C4"
        ],
        msg_wrong: "so respondeu oi",
        msg_correct: "oi"
      },
      status: "reportado",
      deleted: false,
      ai_order_lead_id: null,
      chat_id: "68a49bd09d855ba182effb66",
      history: [],
      feedback_type: "outro",
      priority: "media",
      notes: "",
      date: "2025-09-10T04:04:27.323Z",
      created_at: "2025-09-10T04:04:27.323Z",
      updated_at: "2025-09-10T04:04:27.324Z",
      __v: 0
    },
    {
      _id: "68c0f8cb7dcc790913643a91",
      user_id: "657b569ffb311b7ea69bd1d5",
      cliente_id: "66644780d772683ed5e43192",
      agent_id: "689d621604a90c1452306ffe",
      prompt_current: "Como posso ajudar com seu pedido?",
      scope: {
        messages: [
          "true_553798623638@c.us_3EB0E546B615F27F8A6A1E",
          "true_553798623638@c.us_3EB0D9A92F0C31E5E352BD"
        ],
        msg_wrong: "Não entendi sua pergunta",
        msg_correct: "Poderia reformular sua pergunta de forma mais clara?"
      },
      status: "em_analise",
      deleted: false,
      ai_order_lead_id: null,
      chat_id: "68a49bd09d855ba182effb67",
      history: [],
      feedback_type: "resposta_incorreta",
      priority: "alta",
      notes: "Cliente relatou que a resposta foi muito genérica",
      date: "2025-09-09T14:30:15.123Z",
      created_at: "2025-09-09T14:30:15.123Z",
      updated_at: "2025-09-09T14:30:15.124Z",
      __v: 0
    },
    {
      _id: "68c0f8cb7dcc790913643a92",
      user_id: "657b569ffb311b7ea69bd1d6",
      cliente_id: "66644780d772683ed5e43193",
      agent_id: "689d621604a90c1452306fff",
      prompt_current: "Informações sobre produto",
      scope: {
        messages: [
          "true_553798623638@c.us_3EB0E546B615F27F8A6A1F"
        ],
        msg_wrong: "Produto disponível",
        msg_correct: "O produto X está disponível em 3 cores: azul, vermelho e verde. Preço: R$ 99,90"
      },
      status: "resolvido",
      deleted: false,
      ai_order_lead_id: null,
      chat_id: "68a49bd09d855ba182effb68",
      history: [],
      feedback_type: "resposta_incompleta",
      priority: "baixa",
      notes: "Resposta foi atualizada com informações completas",
      date: "2025-09-08T09:15:42.456Z",
      created_at: "2025-09-08T09:15:42.456Z",
      updated_at: "2025-09-08T10:30:22.789Z",
      __v: 0
    }
  ]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = feedbackList.map((n) => n._id);
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
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
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

  const handleOpenModal = (feedback) => {
    setSelectedFeedback(feedback);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFeedback(null);
  };

  const handleOpenEditModal = (feedback) => {
    setSelectedFeedback(feedback);
    setEditFormData({
      status: feedback.status,
      priority: feedback.priority,
      feedback_type: feedback.feedback_type,
      notes: feedback.notes || ''
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedFeedback(null);
    setEditFormData({
      status: '',
      priority: '',
      feedback_type: '',
      notes: ''
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveFeedback = () => {
    if (selectedFeedback) {
      setFeedbackList(prev => prev.map(feedback => 
        feedback._id === selectedFeedback._id 
          ? { 
              ...feedback, 
              ...editFormData,
              updated_at: new Date().toISOString()
            }
          : feedback
      ));
      handleCloseEditModal();
    }
  };

  const handleSaveEdit = (feedbackId, field, newValue) => {
    if (newValue !== '') {
      setFeedbackList(prev => prev.map(feedback => 
        feedback._id === feedbackId 
          ? { 
              ...feedback, 
              [field]: newValue,
              updated_at: new Date().toISOString()
            }
          : feedback
      ));
    }
  };

  const handleKeyPress = (event, feedbackId, field) => {
    if (event.key === 'Escape') {
      // Pode adicionar lógica de cancelamento se necessário
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reportado':
        return 'error';
      case 'em_analise':
        return 'warning';
      case 'resolvido':
        return 'success';
      case 'fechado':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baixa':
        return 'success';
      default:
        return 'default';
    }
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case 'resposta_incorreta':
        return 'error';
      case 'resposta_incompleta':
        return 'warning';
      case 'resposta_irrelevante':
        return 'info';
      case 'outro':
        return 'default';
      default:
        return 'default';
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - feedbackList.length) : 0;

  const filteredFeedbacks = applySortFilter(feedbackList, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredFeedbacks.length && !!filterName;

  return (
    <Page title="Análise de Feedbacks | Lais Boss">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Análise de Feedbacks"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Feedbacks' }
          ]}
        />

        <Card>
          <FeedbackListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <FeedbackListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={feedbackList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredFeedbacks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { _id, userObj, agentObj, feedback_type, priority, status, created_at } = row;
                      const isItemSelected = selected.indexOf(_id) !== -1;

                      return (
                        <TableRow
                          hover
                          key={_id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClick(event, _id)}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" spacing={2} sx={{
                              alignItems: "center"
                            }}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {userObj?.firstName?.charAt(0) || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" noWrap>
                                  {userObj?.firstName} {userObj?.lastName}
                                </Typography>
                                <Typography variant="caption" sx={{
                                  color: "text.secondary"
                                }}>
                                  @{userObj?.username}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">
                            <Box>
                              <Typography variant="subtitle2" noWrap>
                                {agentObj?.name || 'Agente não encontrado'}
                              </Typography>
                              <Typography variant="caption" sx={{
                                color: "text.secondary"
                              }}>
                                {agentObj?.description || 'Sem descrição'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={getFeedbackTypeColor(feedback_type)}
                            >
                              {sentenceCase(feedback_type)}
                            </Label>
                          </TableCell>
                          <TableCell align="left">
                            <InlineEditCell
                              value={priority}
                              options={priorityOptions}
                              onSave={(newValue) => handleSaveEdit(_id, 'priority', newValue)}
                              onKeyPress={(e) => handleKeyPress(e, _id, 'priority')}
                              getColor={getPriorityColor}
                            />
                          </TableCell>
                          <TableCell align="left">
                            <InlineEditCell
                              value={status}
                              options={statusOptions}
                              onSave={(newValue) => handleSaveEdit(_id, 'status', newValue)}
                              onKeyPress={(e) => handleKeyPress(e, _id, 'status')}
                              getColor={getStatusColor}
                            />
                          </TableCell>
                          <TableCell align="left">
                            {new Date(created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Ver detalhes">
                                <MuiIconButton
                                  onClick={() => handleOpenModal(row)}
                                  color="primary"
                                  size="small"
                                >
                                  <Icon icon="eva:eye-fill" />
                                </MuiIconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <MuiIconButton
                                  onClick={() => handleOpenEditModal(row)}
                                  color="secondary"
                                  size="small"
                                >
                                  <Icon icon="eva:edit-fill" />
                                </MuiIconButton>
                              </Tooltip>
                            </Stack>
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

                {isNotFound && (
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
                count={feedbackList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Card>

              {/* Modal de Detalhes */}
              <Dialog
                open={openModal}
                onClose={handleCloseModal}
                fullScreen
              >
                <DialogTitle sx={{ pb: 1 }}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1
                    }}>
                    <Stack direction="row" spacing={2} sx={{
                      alignItems: "center"
                    }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(selectedFeedback?.status) === 'error' ? 'error.main' :
                                 getStatusColor(selectedFeedback?.status) === 'warning' ? 'warning.main' :
                                 getStatusColor(selectedFeedback?.status) === 'success' ? 'success.main' : 'grey.500'
                      }} />
                      <Typography variant="h6">Detalhes do Feedback</Typography>
                    </Stack>
                    
                    {/* Botões no cabeçalho */}
                    <Stack direction="row" spacing={1}>
                      <Button 
                        onClick={handleCloseModal} 
                        variant="outlined"
                        size="small"
                        startIcon={<Icon icon="eva:close-fill" />}
                      >
                        Fechar
                      </Button>
                      <Button 
                        onClick={() => {
                          handleCloseModal();
                          handleOpenEditModal(selectedFeedback);
                        }}
                        variant="contained"
                        size="small"
                        startIcon={<Icon icon="eva:edit-fill" />}
                      >
                        Editar
                      </Button>
                    </Stack>
                  </Stack>
                  
            
                </DialogTitle>
                <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
            {selectedFeedback && (
              <Box sx={{ height: '100%', display: 'flex' }}>
                {/* Coluna Esquerda - Informações do Feedback */}
                <Box sx={{ 
                  width: '50%', 
                  p: 2, 
                  overflowY: 'auto',
                  borderRight: '1px solid',
                  borderColor: border('grey.200')
                }}>
                  {/* Informações principais compactas */}
                  <Box sx={{ p: 1.5, mb: 1.5, bgcolor: surface('grey.50'), borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                      Informações do Feedback
                    </Typography>
                    
                    <Grid container spacing={1}>
                      <Grid
                        size={{
                          xs: 6,
                          md: 3
                        }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.7rem'
                          }}>
                          Usuário
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.2 }}>
                          {selectedFeedback.userObj?.firstName} {selectedFeedback.userObj?.lastName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.65rem'
                          }}>
                          @{selectedFeedback.userObj?.username}
                        </Typography>
                      </Grid>
                      
                      <Grid
                        size={{
                          xs: 6,
                          md: 3
                        }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.7rem'
                          }}>
                          Agente
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.2 }}>
                          {selectedFeedback.agentObj?.name || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid
                        size={{
                          xs: 6,
                          md: 3
                        }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.7rem'
                          }}>
                          Canal
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.2 }}>
                          {selectedFeedback.canalObj?.nome || 'N/A'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.65rem'
                          }}>
                          {selectedFeedback.canalObj?.platform || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid
                        size={{
                          xs: 6,
                          md: 3
                        }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.7rem'
                          }}>
                          Data
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.2 }}>
                          {new Date(selectedFeedback.created_at).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Grid>
                      
                      <Grid
                        size={{
                          xs: 4,
                          md: 4
                        }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.7rem'
                          }}>
                          Status
                        </Typography>
                        <Label
                          variant="filled"
                          color={getStatusColor(selectedFeedback.status)}
                          sx={{ 
                            fontSize: '0.65rem', 
                            px: 0.75, 
                            py: 0.125,
                            fontWeight: 600,
                            borderRadius: 0.5,
                            height: 18
                          }}
                        >
                          {sentenceCase(selectedFeedback.status)}
                        </Label>
                      </Grid>
                      
                      <Grid
                        size={{
                          xs: 4,
                          md: 4
                        }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.7rem'
                          }}>
                          Prioridade
                        </Typography>
                        <Label
                          variant="filled"
                          color={getPriorityColor(selectedFeedback.priority)}
                          sx={{ 
                            fontSize: '0.65rem', 
                            px: 0.75, 
                            py: 0.125,
                            fontWeight: 600,
                            borderRadius: 0.5,
                            height: 18
                          }}
                        >
                          {sentenceCase(selectedFeedback.priority)}
                        </Label>
                      </Grid>
                      
                      <Grid
                        size={{
                          xs: 4,
                          md: 4
                        }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: '0.7rem'
                          }}>
                          Tipo
                        </Typography>
                        <Label
                          variant="filled"
                          color={getFeedbackTypeColor(selectedFeedback.feedback_type)}
                          sx={{ 
                            fontSize: '0.65rem', 
                            px: 0.75, 
                            py: 0.125,
                            fontWeight: 600,
                            borderRadius: 0.5,
                            height: 18
                          }}
                        >
                          {sentenceCase(selectedFeedback.feedback_type)}
                        </Label>
                      </Grid>
                    </Grid>
                  </Box>


                {/* Prompt do Agente */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" gutterBottom sx={{
                    color: "text.secondary"
                  }}>
                    Prompt do Agente no envio do feedback
                  </Typography>
                  <Box sx={{ 
                    p: 1, 
                    bgcolor: surface('grey.50'), 
                    borderRadius: 1, 
                    border: '1px solid', 
                    borderColor: border('grey.200'),
                    maxHeight: 300,
                    overflowY: 'auto'
                  }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                      {selectedFeedback.agentObj?.config?.promptFree?.prompt || 
                       selectedFeedback.agentObj?.config?.promptGuide?.prompt || 
                       'Prompt não disponível'}
                    </Typography>
                  </Box>
                </Box>

                {/* Escopo do Feedback */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" gutterBottom sx={{
                    color: "text.secondary"
                  }}>
                    Escopo do Feedback
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6
                      }}>
                      <Box sx={{ 
                        p: 1, 
                        bgcolor: 'red.100', 
                        borderRadius: 1, 
                        border: '1px solid', 
                        borderColor: border('grey.200'),
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}>
                        <Typography variant="caption" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Mensagem Incorreta
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                          {selectedFeedback.scope.msg_wrong}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid
                      size={{
                        xs: 12,
                        md: 6
                      }}>
                      <Box sx={{ 
                        p: 1, 
                        bgcolor: 'green.100', 
                        borderRadius: 1, 
                        border: '1px solid', 
                        borderColor: border('grey.200'),
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}>
                        <Typography variant="caption" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Mensagem Correta
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                          {selectedFeedback.scope.msg_correct}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  

                </Box>

                {/* Observações */}
                {selectedFeedback.notes && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" gutterBottom sx={{
                      color: "text.secondary"
                    }}>
                      Observações
                    </Typography>
                    <Box sx={{ 
                      p: 1, 
                      bgcolor: surface('grey.50'), 
                      borderRadius: 1, 
                      border: '1px solid', 
                      borderColor: border('grey.200') 
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {selectedFeedback.notes}
                      </Typography>
                    </Box>
                  </Box>
                )}

                </Box>

                {/* Coluna Direita - Conversa Relacionada */}
                <Box sx={{ 
                  width: '50%', 
                  p: 1.5, 
                  overflowY: 'auto',
                  bgcolor: '#f0f2f5',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1, 
                    fontWeight: 600, 
                    fontSize: '0.9rem',
                    color: '#667781'
                  }}>
                    Conversa Relacionada
                  </Typography>
                  
                  {selectedFeedback.mensagens_relacionadas && selectedFeedback.mensagens_relacionadas.length > 0 ? (
                    <Box 
                      ref={setChatContainerRef}
                      sx={{ 
                        flex: 1,
                        bgcolor: '#e5ddd5',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        borderRadius: 1,
                        overflowY: 'auto',
                        p: 1,
                        position: 'relative'
                      }}
                    >
                      {selectedFeedback.mensagens_relacionadas
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .map((msg, index) => {
                        const isFromMe = msg.fromMe;
                        // Agora exibe data e hora no formato DD/MM/YYYY HH:MM
                        const dateObj = new Date(msg.timestamp * 1000);
                        const dia = String(dateObj.getDate()).padStart(2, '0');
                        const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const ano = dateObj.getFullYear();
                        const hora = String(dateObj.getHours()).padStart(2, '0');
                        const minuto = String(dateObj.getMinutes()).padStart(2, '0');
                        const messageTime = `${dia}/${mes}/${ano} ${hora}:${minuto}`;

                        // Verificar se esta mensagem está destacada (está em scope.messages)
                        const isHighlighted = selectedFeedback.scope && selectedFeedback.scope.messages && 
                          selectedFeedback.scope.messages.includes(msg.id);

                        const getMessageContent = () => {
                          switch (msg.type) {
                            case 'image':
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon icon="eva:image-fill" width={14} />
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Imagem</Typography>
                                </Box>
                              );
                            case 'video':
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon icon="eva:video-fill" width={14} />
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Vídeo</Typography>
                                </Box>
                              );
                            case 'audio':
                            case 'ptt':
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon icon="eva:volume-up-fill" width={14} />
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Áudio</Typography>
                                </Box>
                              );
                            case 'document':
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon icon="eva:file-fill" width={14} />
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Documento</Typography>
                                </Box>
                              );
                            case 'sticker':
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Icon icon="eva:smile-fill" width={14} />
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Sticker</Typography>
                                </Box>
                              );
                            default:
                              return (
                                <Typography variant="body2" sx={{ 
                                  fontSize: '0.8rem',
                                  lineHeight: 1.3,
                                  wordBreak: 'break-word'
                                }}>
                                  {msg.body || 'Mensagem sem conteúdo'}
                                </Typography>
                              );
                          }
                        };

                        return (
                          <Box
                            key={index}
                            data-highlighted={isHighlighted}
                            sx={{
                              mb: 0.5,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isFromMe ? 'flex-end' : 'flex-start'
                            }}
                          >
                            {/* Label do remetente */}
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.65rem',
                                fontWeight: 500,
                                color: textSecondary('#666'),
                                mb: 0.25,
                                px: 0.5
                              }}
                            >
                              {isFromMe ? 'Agente' : 'Usuário'}
                            </Typography>
                            
                            <Box sx={{
                              maxWidth: '75%',
                              px: 1.5,
                              py: 0.75,
                              borderRadius: isFromMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              bgcolor: isHighlighted 
                                ? (isFromMe ? '#ff9800' : '#fff3cd')
                                : (isFromMe ? '#dcf8c6' : '#ffffff'),
                              color: isHighlighted 
                                ? (isFromMe ? 'white' : '#333')
                                : (isFromMe ? '#000' : '#333'),
                              position: 'relative',
                              border: isHighlighted ? '2px solid #ff9800' : 'none',
                              boxShadow: isHighlighted ? '0 2px 8px rgba(255, 152, 0, 0.4)' : '0 1px 2px rgba(0,0,0,0.1)',
                              minWidth: '60px'
                            }}>
                              {isHighlighted && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: -6,
                                  right: -6,
                                  bgcolor: '#ff9800',
                                  borderRadius: '50%',
                                  width: 12,
                                  height: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '2px solid white'
                                }}>
                                  <Icon icon="eva:star-fill" width={8} color="white" />
                                </Box>
                              )}
                              {getMessageContent()}
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                mt: 0.25,
                                gap: 0.25
                              }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.65rem',
                                    opacity: 0.7,
                                    color: isFromMe ? '#4a4a4a' : '#999'
                                  }}
                                >
                                  {messageTime}
                                </Typography>
                                {isFromMe && (
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <Icon icon="eva:checkmark-fill" width={10} color="#4a4a4a" />
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#e5ddd5',
                      borderRadius: 1,
                      border: '1px solid #d1c7b7'
                    }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: '0.8rem',
                          textAlign: 'center'
                        }}>
                        Nenhuma conversa relacionada encontrada
                      </Typography>
                    </Box>
                  )}
                </Box>

              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog
          open={openEditModal}
          onClose={handleCloseEditModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">Editar Feedback</Typography>
          </DialogTitle>
          <DialogContent>
            {selectedFeedback && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid
                    size={{
                      xs: 12,
                      md: 6
                    }}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      value={editFormData.status}
                      onChange={(e) => handleEditFormChange('status', e.target.value)}
                      slotProps={{
                        select: {
                          native: true,
                        }
                      }}
                    >
                      <option value="reportado">Reportado</option>
                      <option value="em_analise">Em Análise</option>
                      <option value="resolvido">Resolvido</option>
                      <option value="fechado">Fechado</option>
                    </TextField>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6
                    }}>
                    <TextField
                      select
                      fullWidth
                      label="Prioridade"
                      value={editFormData.priority}
                      onChange={(e) => handleEditFormChange('priority', e.target.value)}
                      slotProps={{
                        select: {
                          native: true,
                        }
                      }}
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </TextField>
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      select
                      fullWidth
                      label="Tipo de Feedback"
                      value={editFormData.feedback_type}
                      onChange={(e) => handleEditFormChange('feedback_type', e.target.value)}
                      slotProps={{
                        select: {
                          native: true,
                        }
                      }}
                    >
                      <option value="resposta_incorreta">Resposta Incorreta</option>
                      <option value="resposta_incompleta">Resposta Incompleta</option>
                      <option value="resposta_irrelevante">Resposta Irrelevante</option>
                      <option value="outro">Outro</option>
                    </TextField>
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Observações"
                      value={editFormData.notes}
                      onChange={(e) => handleEditFormChange('notes', e.target.value)}
                      placeholder="Adicione observações sobre o feedback..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Cancelar</Button>
            <Button onClick={handleSaveFeedback} variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}
