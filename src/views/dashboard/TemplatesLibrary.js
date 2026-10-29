'use client';

import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import eyeFill from '@iconify/icons-eva/eye-fill';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Fill from '@iconify/icons-eva/trash-2-fill';
import copyFill from '@iconify/icons-eva/copy-fill';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  TableHead,
  TableSortLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
// actions
import actionListarTemplates from '../../actions/library/actionListarTemplates';
import actionObterTemplate from '../../actions/library/actionObterTemplate';
import actionCriarTemplate from '../../actions/library/actionCriarTemplate';
import actionEditarTemplate from '../../actions/library/actionEditarTemplate';
import actionDeletarTemplate from '../../actions/library/actionDeletarTemplate';
// toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Nome', alignRight: false },
  { id: 'description', label: 'Descrição', alignRight: false },
  { id: 'category', label: 'Categoria', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'createdAt', label: 'Criado em', alignRight: false },
  { id: '' }
];

const CATEGORIES = [
  { value: 'AUTHENTICATION', label: 'Autenticação' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'UTILITY', label: 'Utilitário' }
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'ARCHIVED', label: 'Arquivado' }
];

const HEADER_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'image', label: 'Imagem' },
  { value: 'video', label: 'Vídeo' },
  { value: 'document', label: 'Documento' }
];

const BUTTON_TYPES = [
  { value: 'QUICK_REPLY', label: 'Resposta Rápida' },
  { value: 'URL', label: 'URL' },
  { value: 'PHONE_NUMBER', label: 'Telefone' }
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
    return filter(array, (_template) =>
      _template.name?.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _template.description?.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _template._id?.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

function getStatusColor(status) {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'warning';
    case 'ARCHIVED':
      return 'error';
    default:
      return 'default';
  }
}

function getCategoryLabel(category) {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? cat.label : category;
}

// Transformar template da API para formato do formulário
const transformarTemplateParaFormulario = (template) => {
  const components = template.components || [];
  
  // Extrair componentes
  const bodyComponent = components.find(c => c.type === 'body' || c.type === 'BODY');
  const headerComponent = components.find(c => c.type === 'header' || c.type === 'HEADER');
  const footerComponent = components.find(c => c.type === 'footer' || c.type === 'FOOTER');
  const buttonsComponent = components.find(c => c.type === 'buttons' || c.type === 'BUTTONS');
  
  // Determinar tipo de header
  let headerType = 'none';
  let headerText = '';
  if (headerComponent) {
    if (headerComponent.format === 'TEXT' || headerComponent.format === 'text') {
      headerType = 'text';
      headerText = headerComponent.text || '';
    } else if (headerComponent.format) {
      headerType = headerComponent.format.toLowerCase();
      headerText = headerComponent.text || '';
    }
  }
  
  return {
    nome: template.name || '',
    descricao: template.description || '',
    categoria: template.category || 'UTILITY',
    language: template.language || 'pt_BR',
    headerType: headerType,
    headerText: headerText,
    conteudo: bodyComponent?.text || '',
    footerText: footerComponent?.text || '',
    buttons: buttonsComponent?.buttons || [],
    variaveisExemplo: {},
    status: template.status || 'ACTIVE'
  };
};

// Transformar dados do formulário para formato da API
const transformarFormularioParaAPI = (formData) => {
  const components = [];
  
  // Header
  if (formData.headerType && formData.headerType !== 'none') {
    const headerComponent = {
      type: 'header'
    };
    
    if (formData.headerType === 'text') {
      headerComponent.format = 'TEXT';
      headerComponent.text = formData.headerText || '';
    } else {
      headerComponent.format = formData.headerType.toUpperCase();
      headerComponent.text = formData.headerText || '';
    }
    
    components.push(headerComponent);
  }
  
  // Body
  if (formData.conteudo) {
    components.push({
      type: 'body',
      text: formData.conteudo
    });
  }
  
  // Footer
  if (formData.footerText) {
    components.push({
      type: 'footer',
      text: formData.footerText
    });
  }
  
  // Buttons
  if (formData.buttons && formData.buttons.length > 0) {
    components.push({
      type: 'buttons',
      buttons: formData.buttons
    });
  }
  
  return {
    name: formData.nome,
    description: formData.descricao || '',
    category: formData.categoria,
    language: formData.language,
    components: components,
    status: formData.status,
    tags: []
  };
};

// Componente de Preview do Template
function TemplatePreview({ template }) {
  const theme = useTheme();
  
  // Substitui variáveis por exemplos
  const replaceVariables = (text) => {
    if (!text || !template.variaveisExemplo) return text;
    let result = text;
    Object.keys(template.variaveisExemplo).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, template.variaveisExemplo[key]);
    });
    return result;
  };

  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: 'grey.100',
        borderRadius: 2,
        maxWidth: 400,
        mx: 'auto'
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 2,
          boxShadow: 2
        }}
      >
        {/* Header */}
        {template.headerText && (
          <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {replaceVariables(template.headerText)}
            </Typography>
          </Box>
        )}

        {/* Conteúdo */}
        {template.conteudo && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {replaceVariables(template.conteudo)}
            </Typography>
          </Box>
        )}

        {/* Botões */}
        {template.buttons && template.buttons.length > 0 && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {template.buttons.map((button, index) => (
              <Button
                key={index}
                variant="outlined"
                fullWidth
                size="small"
                sx={{ textTransform: 'none' }}
              >
                {button.text}
              </Button>
            ))}
          </Stack>
        )}

        {/* Footer */}
        {template.footerText && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              {replaceVariables(template.footerText)}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// Função para extrair variáveis do texto
const extrairVariaveisDoTexto = (texto) => {
  const variaveis = {};
  if (!texto) return variaveis;
  
  const matches = texto.match(/\{\{(\d+)\}\}/g);
  if (matches) {
    matches.forEach((match) => {
      const numero = match.replace(/\{\{|\}\}/g, '');
      if (!variaveis[numero]) {
        variaveis[numero] = '';
      }
    });
  }
  
  return variaveis;
};

// Função para substituir variáveis no texto
const replaceVariables = (text, variaveisExemplo) => {
  if (!text || !variaveisExemplo) return text;
  let result = text;
  Object.keys(variaveisExemplo).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, variaveisExemplo[key] || `{{${key}}}`);
  });
  return result;
};

// Componente Editor Visual com Preview em Tempo Real
function VisualEditor({ formData, onChange }) {
  const theme = useTheme();

  // Extrair variáveis automaticamente quando o conteúdo muda
  useEffect(() => {
    const variaveis = extrairVariaveisDoTexto(formData.conteudo || '');
    const variaveisHeader = extrairVariaveisDoTexto(formData.headerText || '');
    const variaveisFooter = extrairVariaveisDoTexto(formData.footerText || '');
    
    // Combinar todas as variáveis
    const todasVariaveis = { ...variaveis, ...variaveisHeader, ...variaveisFooter };
    
    // Manter valores existentes
    const variaveisAtualizadas = { ...formData.variaveisExemplo };
    Object.keys(todasVariaveis).forEach(key => {
      if (!variaveisAtualizadas.hasOwnProperty(key)) {
        variaveisAtualizadas[key] = '';
      }
    });
    
    // Remover variáveis que não estão mais no texto
    Object.keys(variaveisAtualizadas).forEach(key => {
      if (!todasVariaveis.hasOwnProperty(key)) {
        delete variaveisAtualizadas[key];
      }
    });
    
    onChange('variaveisExemplo', variaveisAtualizadas);
  }, [formData.conteudo, formData.headerText, formData.footerText]);

  const handleAddButton = () => {
    const newButtons = [...(formData.buttons || []), { type: 'QUICK_REPLY', text: '' }];
    onChange('buttons', newButtons);
  };

  const handleRemoveButton = (index) => {
    const newButtons = formData.buttons.filter((_, i) => i !== index);
    onChange('buttons', newButtons);
  };

  const handleButtonChange = (index, field, value) => {
    const newButtons = [...formData.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    onChange('buttons', newButtons);
  };

  const handleVariableChange = (key, value) => {
    const newVars = { ...formData.variaveisExemplo };
    newVars[key] = value;
    onChange('variaveisExemplo', newVars);
  };

  // Inserir variável no cursor
  const inserirVariavel = (numero) => {
    const textarea = document.querySelector('[data-textarea-conteudo]');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textoAntes = formData.conteudo.substring(0, start);
    const textoDepois = formData.conteudo.substring(end);
    const novaVariavel = `{{${numero}}}`;
    const novoTexto = textoAntes + novaVariavel + textoDepois;
    
    onChange('conteudo', novoTexto);
    
    setTimeout(() => {
      textarea.focus();
      const novaPosicao = start + novaVariavel.length;
      textarea.setSelectionRange(novaPosicao, novaPosicao);
    }, 0);
  };

  const adicionarProximaVariavel = () => {
    const variaveisExistentes = Object.keys(formData.variaveisExemplo || {});
    let proximoNumero = 1;
    
    if (variaveisExistentes.length > 0) {
      const numeros = variaveisExistentes.map(v => parseInt(v)).sort((a, b) => b - a);
      proximoNumero = numeros[0] + 1;
    }
    
    inserirVariavel(proximoNumero);
  };

  // Aplicar formatação
  const aplicarFormatacao = (tipo) => {
    const textarea = document.querySelector('[data-textarea-conteudo]');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textoSelecionado = formData.conteudo.substring(start, end);
    
    let textoFormatado = '';
    switch (tipo) {
      case 'bold':
        textoFormatado = textoSelecionado ? `*${textoSelecionado}*` : '**';
        break;
      case 'italic':
        textoFormatado = textoSelecionado ? `_${textoSelecionado}_` : '__';
        break;
      case 'strikethrough':
        textoFormatado = textoSelecionado ? `~${textoSelecionado}~` : '~~';
        break;
      case 'code':
        textoFormatado = textoSelecionado ? `\`${textoSelecionado}\`` : '``';
        break;
      default:
        return;
    }
    
    const textoAntes = formData.conteudo.substring(0, start);
    const textoDepois = formData.conteudo.substring(end);
    const novoTexto = textoAntes + textoFormatado + textoDepois;
    
    onChange('conteudo', novoTexto);
    
    setTimeout(() => {
      textarea.focus();
      let novaPosicao;
      if (textoSelecionado) {
        novaPosicao = start + textoFormatado.length;
      } else {
        novaPosicao = start + (textoFormatado.length / 2);
      }
      textarea.setSelectionRange(novaPosicao, novaPosicao);
    }, 0);
  };

  return (
    <Grid container spacing={3}>
      {/* Editor - Lado Esquerdo */}
      <Grid
        size={{
          xs: 12,
          md: 7
        }}>
        <Scrollbar>
          <Stack spacing={3}>
            {/* Header */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Tipo de Header
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={formData.headerType || 'none'}
                  onChange={(e) => onChange('headerType', e.target.value)}
                >
                  <MenuItem value="none">Nenhum</MenuItem>
                  {HEADER_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {formData.headerType === 'text' && (
              <TextField
                fullWidth
                label="Texto do Header"
                value={formData.headerText || ''}
                onChange={(e) => onChange('headerText', e.target.value)}
                placeholder="Ex: Bem-vindo à {{1}}!"
                helperText="Use {{1}}, {{2}}, etc. para variáveis"
              />
            )}

            {/* Conteúdo */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Conteúdo da Mensagem *
              </Typography>
              <TextField
                data-textarea-conteudo
                fullWidth
                multiline
                rows={8}
                value={formData.conteudo || ''}
                onChange={(e) => onChange('conteudo', e.target.value)}
                placeholder="Ex: Olá {{1}}, tudo bem? Podemos conversar sobre o seu problema?"
                helperText="Use {{1}}, {{2}}, etc. para variáveis"
              />
              
              {/* Barra de ferramentas */}
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  onClick={() => aplicarFormatacao('bold')}
                  sx={{ fontWeight: 'bold', minWidth: 'auto', px: 1 }}
                >
                  B
                </Button>
                <Button
                  size="small"
                  onClick={() => aplicarFormatacao('italic')}
                  sx={{ fontStyle: 'italic', minWidth: 'auto', px: 1 }}
                >
                  I
                </Button>
                <Button
                  size="small"
                  onClick={() => aplicarFormatacao('strikethrough')}
                  sx={{ textDecoration: 'line-through', minWidth: 'auto', px: 1 }}
                >
                  S
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  size="small"
                  startIcon={<Icon icon={plusFill} />}
                  onClick={adicionarProximaVariavel}
                >
                  Adicionar variável
                </Button>
              </Box>
            </Box>

            {/* Variáveis */}
            {formData.variaveisExemplo && Object.keys(formData.variaveisExemplo).length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Amostras de Variáveis *
                </Typography>
                <Stack spacing={2}>
                  {Object.keys(formData.variaveisExemplo)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map((key) => (
                      <Box key={key} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                          label={`{{${key}}}`}
                          sx={{ minWidth: 80, fontFamily: 'monospace' }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          value={formData.variaveisExemplo[key]}
                          onChange={(e) => handleVariableChange(key, e.target.value)}
                          placeholder={`Valor para variável ${key}`}
                        />
                      </Box>
                    ))}
                </Stack>
              </Box>
            )}

            {/* Footer */}
            <TextField
              fullWidth
              label="Texto do Footer"
              value={formData.footerText || ''}
              onChange={(e) => onChange('footerText', e.target.value)}
              placeholder="Ex: Atenciosamente, Equipe {{1}}"
              helperText="Use {{1}}, {{2}}, etc. para variáveis"
            />

            {/* Botões */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">Botões</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Icon icon={plusFill} />}
                  onClick={handleAddButton}
                  disabled={(formData.buttons || []).length >= 3}
                >
                  Adicionar Botão
                </Button>
              </Box>

              {(formData.buttons || []).map((button, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Botão {index + 1}: {button.text || '(sem texto)'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Botão</InputLabel>
                        <Select
                          value={button.type || 'QUICK_REPLY'}
                          onChange={(e) => handleButtonChange(index, 'type', e.target.value)}
                          label="Tipo de Botão"
                        >
                          {BUTTON_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Texto do Botão"
                        value={button.text || ''}
                        onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                        required
                      />

                      {button.type === 'URL' && (
                        <TextField
                          fullWidth
                          label="URL"
                          value={button.url || ''}
                          onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
                          placeholder="https://exemplo.com/{{2}}"
                        />
                      )}

                      {button.type === 'PHONE_NUMBER' && (
                        <TextField
                          fullWidth
                          label="Número de Telefone"
                          value={button.phone_number || ''}
                          onChange={(e) => handleButtonChange(index, 'phone_number', e.target.value)}
                          placeholder="+5511999999999"
                        />
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          color="error"
                          size="small"
                          startIcon={<Icon icon={trash2Fill} />}
                          onClick={() => handleRemoveButton(index)}
                        >
                          Remover
                        </Button>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Stack>
        </Scrollbar>
      </Grid>

      {/* Preview - Lado Direito */}
      <Grid
        size={{
          xs: 12,
          md: 5
        }}>
        <Box sx={{ position: 'sticky', top: 20 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Preview em Tempo Real
          </Typography>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#efeae2',
              borderRadius: 3,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a7a7a7' fill-opacity='0.12'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3Cpath d='M30 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 42c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm20-22c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM10 28c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
              minHeight: 400
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Paper
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 2,
                  maxWidth: '85%',
                  boxShadow: 3,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -8,
                    top: 0,
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid white',
                    borderTop: '8px solid transparent'
                  }
                }}
              >
                {/* Header */}
                {formData.headerType === 'text' && formData.headerText && (
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {replaceVariables(formData.headerText, formData.variaveisExemplo)}
                  </Typography>
                )}

                {/* Conteúdo */}
                {formData.conteudo && (
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      mb: 1
                    }}
                  >
                    {replaceVariables(formData.conteudo, formData.variaveisExemplo)
                      .split('\n')
                      .map((line, idx) => (
                        <span key={idx}>
                          {line.split(/(\*[^*]+\*|_[^_]+_|~[^~]+~|`[^`]+`)/).map((part, partIdx) => {
                            if (part.startsWith('*') && part.endsWith('*')) {
                              return <strong key={partIdx}>{part.slice(1, -1)}</strong>;
                            }
                            if (part.startsWith('_') && part.endsWith('_')) {
                              return <em key={partIdx}>{part.slice(1, -1)}</em>;
                            }
                            if (part.startsWith('~') && part.endsWith('~')) {
                              return <span key={partIdx} style={{ textDecoration: 'line-through' }}>{part.slice(1, -1)}</span>;
                            }
                            return <span key={partIdx}>{part}</span>;
                          })}
                          {idx < formData.conteudo.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                  </Typography>
                )}

                {/* Botões */}
                {formData.buttons && formData.buttons.length > 0 && (
                  <Stack spacing={1} sx={{ mb: 1 }}>
                    {formData.buttons.map((button, index) => (
                      <Button
                        key={index}
                        variant="contained"
                        fullWidth
                        size="small"
                        sx={{
                          textTransform: 'none',
                          bgcolor: button.type === 'URL' ? 'primary.main' : 'success.main',
                          '&:hover': {
                            bgcolor: button.type === 'URL' ? 'primary.dark' : 'success.dark'
                          }
                        }}
                      >
                        {button.text}
                      </Button>
                    ))}
                  </Stack>
                )}

                {/* Footer */}
                {formData.footerText && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography
                      variant="caption"
                      align="center"
                      sx={{
                        color: "text.secondary",
                        display: "block"
                      }}>
                      {replaceVariables(formData.footerText, formData.variaveisExemplo)}
                    </Typography>
                  </Box>
                )}

                {/* Timestamp */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <Iconify icon="eva:checkmark-circle-2-fill" width={12} sx={{ color: 'success.main' }} />
                  <Typography variant="caption" sx={{
                    color: "text.secondary"
                  }}>
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
}

// ----------------------------------------------------------------------

export default function TemplatesLibrary() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { user } = useAuth();

  // Estados da tabela
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [loading, setLoading] = useState(false);

  // Estados dos templates
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 50
  });

  // Filtros
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modais
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalView, setOpenModalView] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  // Template selecionado
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: 'UTILITY',
    language: 'pt_BR',
    headerType: 'none',
    headerText: '',
    conteudo: '',
    footerText: '',
    buttons: [],
    variaveisExemplo: {},
    status: 'ACTIVE'
  });

  // Carregar templates
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(filterStatus && { status: filterStatus }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterName && { search: filterName })
      };

      const response = await actionListarTemplates(params);
      if (response.data.status === 'success') {
        setTemplates(response.data.data.templates || []);
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [page, rowsPerPage, filterStatus, filterCategory, filterName]);

  // Handlers de ordenação
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handlers de filtros
  const handleFilterStatus = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleFilterCategory = (event) => {
    setFilterCategory(event.target.value);
    setPage(0);
  };

  // Handlers de modais
  const handleOpenModalCreate = () => {
    resetForm();
    setOpenModalCreate(true);
  };

  const handleCloseModalCreate = () => {
    setOpenModalCreate(false);
    resetForm();
  };

  const handleOpenModalEdit = (template) => {
    setSelectedTemplate(template);
    const formDataTransformed = transformarTemplateParaFormulario(template);
    setFormData(formDataTransformed);
    setOpenModalEdit(true);
  };

  const handleCloseModalEdit = () => {
    setOpenModalEdit(false);
    resetForm();
  };

  const handleOpenModalView = async (templateId) => {
    try {
      const response = await actionObterTemplate(templateId);
      if (response.data.status === 'success') {
        setSelectedTemplate(response.data.data);
        setOpenModalView(true);
      }
    } catch (error) {
      toast.error('Erro ao carregar template');
    }
  };

  const handleCloseModalView = () => {
    setOpenModalView(false);
    setSelectedTemplate(null);
  };

  const handleOpenModalDelete = (template) => {
    setSelectedTemplate(template);
    setOpenModalDelete(true);
  };

  const handleCloseModalDelete = () => {
    setOpenModalDelete(false);
    setSelectedTemplate(null);
  };

  // Handlers de formulário
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: 'UTILITY',
      language: 'pt_BR',
      headerType: 'none',
      headerText: '',
      conteudo: '',
      footerText: '',
      buttons: [],
      variaveisExemplo: {},
      status: 'ACTIVE'
    });
  };

  // Handlers de ações
  const handleCreateTemplate = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.conteudo.trim()) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const data = transformarFormularioParaAPI(formData);
      
      if (user?._id || user?.id) {
        data.createdBy = user._id || user.id;
      }
      
      const response = await actionCriarTemplate(data);
      if (response.data.status === 'success') {
        toast.success('Template criado com sucesso!');
        handleCloseModalCreate();
        loadTemplates();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao criar template';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.conteudo.trim()) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const data = transformarFormularioParaAPI(formData);
      
      const response = await actionEditarTemplate(selectedTemplate._id, data);
      if (response.data.status === 'success') {
        toast.success('Template atualizado com sucesso!');
        handleCloseModalEdit();
        loadTemplates();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao atualizar template';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    setLoading(true);
    try {
      const response = await actionDeletarTemplate(selectedTemplate._id);
      if (response.data.status === 'success') {
        toast.success('Template deletado com sucesso!');
        handleCloseModalDelete();
        loadTemplates();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao deletar template';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTemplate = async (template) => {
    setLoading(true);
    try {
      const formDataCopy = transformarTemplateParaFormulario(template);
      formDataCopy.nome = `${formDataCopy.nome} (Cópia)`;
      formDataCopy.status = 'ACTIVE';
      
      const data = transformarFormularioParaAPI(formDataCopy);
      
      if (user?._id || user?.id) {
        data.createdBy = user._id || user.id;
      }
      
      const response = await actionCriarTemplate(data);
      if (response.data.status === 'success') {
        toast.success('Template duplicado com sucesso!');
        loadTemplates();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao duplicar template';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Dados filtrados e ordenados
  const filteredTemplates = applySortFilter(
    templates,
    getComparator(order, orderBy),
    filterName
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - templates.length) : 0;

  return (
    <Page title="Biblioteca de Templates">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <ToastContainer />
        <HeaderBreadcrumbs
          heading="Biblioteca de Templates"
          links={[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Biblioteca de Templates' }
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Icon icon={plusFill} />}
              onClick={handleOpenModalCreate}
            >
              Novo Template
            </Button>
          }
        />

        <Card>
          <Stack spacing={2} sx={{ p: 3 }}>
            {/* Filtros */}
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}>
                <TextField
                  fullWidth
                  placeholder="Buscar templates..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20, mr: 1 }} />
                      )
                    }
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={handleFilterStatus}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Categoria"
                    onChange={handleFilterCategory}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {CATEGORIES.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Tabela */}
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <TemplatesListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : filteredTemplates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <SearchNotFound searchQuery={filterName} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {filteredTemplates
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => (
                            <TableRow hover key={row._id} tabIndex={-1}>
                              <TableCell component="th" scope="row" padding="none">
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  sx={{
                                    alignItems: "center",
                                    p: 2
                                  }}>
                                  <Typography variant="subtitle2" noWrap>
                                    {row.name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="left">
                                <Typography variant="body2" noWrap>
                                  {row.description || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">
                                {getCategoryLabel(row.category)}
                              </TableCell>
                              <TableCell align="left">
                                <Label color={getStatusColor(row.status)}>
                                  {STATUS_OPTIONS.find(s => s.value === row.status)?.label || row.status}
                                </Label>
                              </TableCell>
                              <TableCell align="left">
                                {row.createdAt
                                  ? new Date(row.createdAt).toLocaleDateString('pt-BR')
                                  : '-'}
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Visualizar">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenModalView(row._id)}
                                    >
                                      <Icon icon={eyeFill} width={20} height={20} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Editar">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenModalEdit(row)}
                                    >
                                      <Icon icon={editFill} width={20} height={20} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Duplicar">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDuplicateTemplate(row)}
                                    >
                                      <Icon icon={copyFill} width={20} height={20} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Deletar">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleOpenModalDelete(row)}
                                    >
                                      <Icon icon={trash2Fill} width={20} height={20} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={pagination.total || filteredTemplates.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </Stack>
        </Card>

        {/* Modal de Criação */}
        <Dialog open={openModalCreate} onClose={handleCloseModalCreate} maxWidth="lg" fullWidth>
          <DialogTitle>Criar Novo Template</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nome *"
                value={formData.nome}
                onChange={(e) => handleFormChange('nome', e.target.value)}
                required
                helperText="Nome do template (ex: Pesquisa de Satisfação)"
              />
              <TextField
                fullWidth
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => handleFormChange('descricao', e.target.value)}
                multiline
                rows={2}
              />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={formData.categoria}
                      label="Categoria"
                      onChange={(e) => handleFormChange('categoria', e.target.value)}
                    >
                      {CATEGORIES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => handleFormChange('status', e.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Divider />
              <VisualEditor formData={formData} onChange={handleFormChange} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModalCreate}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleCreateTemplate}
              loading={loading}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={openModalEdit} onClose={handleCloseModalEdit} maxWidth="lg" fullWidth>
          <DialogTitle>Editar Template</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nome *"
                value={formData.nome}
                onChange={(e) => handleFormChange('nome', e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => handleFormChange('descricao', e.target.value)}
                multiline
                rows={2}
              />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={formData.categoria}
                      label="Categoria"
                      onChange={(e) => handleFormChange('categoria', e.target.value)}
                    >
                      {CATEGORIES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => handleFormChange('status', e.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Divider />
              <VisualEditor formData={formData} onChange={handleFormChange} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModalEdit}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleEditTemplate}
              loading={loading}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Visualização */}
        <Dialog open={openModalView} onClose={handleCloseModalView} maxWidth="md" fullWidth>
          <DialogTitle>Detalhes do Template</DialogTitle>
          <DialogContent>
            {selectedTemplate && (() => {
              const templateForm = transformarTemplateParaFormulario(selectedTemplate);
              return (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Typography variant="subtitle2" sx={{
                        color: "text.secondary"
                      }}>
                        Nome
                      </Typography>
                      <Typography variant="body1">{selectedTemplate.name}</Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="subtitle2" sx={{
                        color: "text.secondary"
                      }}>
                        Descrição
                      </Typography>
                      <Typography variant="body1">
                        {selectedTemplate.description || '-'}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="subtitle2" sx={{
                        color: "text.secondary"
                      }}>
                        Categoria
                      </Typography>
                      <Typography variant="body1">
                        {getCategoryLabel(selectedTemplate.category)}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="subtitle2" sx={{
                        color: "text.secondary"
                      }}>
                        Status
                      </Typography>
                      <Label color={getStatusColor(selectedTemplate.status)}>
                        {STATUS_OPTIONS.find(s => s.value === selectedTemplate.status)?.label}
                      </Label>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="subtitle2" sx={{
                        color: "text.secondary"
                      }}>
                        Idioma
                      </Typography>
                      <Typography variant="body1">{selectedTemplate.language}</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="subtitle2" sx={{
                        color: "text.secondary"
                      }}>
                        Criado em
                      </Typography>
                      <Typography variant="body1">
                        {selectedTemplate.createdAt
                          ? new Date(selectedTemplate.createdAt).toLocaleString('pt-BR')
                          : '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider />
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Preview do Template
                    </Typography>
                    <TemplatePreview template={templateForm} />
                  </Box>
                </Stack>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModalView}>Fechar</Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={openModalDelete} onClose={handleCloseModalDelete}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja deletar o template{' '}
              <strong>{selectedTemplate?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModalDelete}>Cancelar</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteTemplate}
              loading={loading}
            >
              Deletar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}

// Componente TableHead
function TemplatesListHead({ order, orderBy, headLabel, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'decrescente' : 'ascendente'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
