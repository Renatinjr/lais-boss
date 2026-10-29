import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
// material
import { useTheme } from '@material-ui/core/styles';
import {
  Card,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  Switch,
  FormControlLabel
} from '@material-ui/core';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Scrollbar from '../../components/Scrollbar';
// actions
import {
  uploadTrainingFile,
  createFineTuningJob,
  listFineTuningJobs,
  getFineTuningJob,
  listFineTuningEvents,
  cancelFineTuningJob,
  listFineTunedModels,
  deleteFineTunedModel,
  listTrainingFiles,
  getTrainingFile,
  deleteTrainingFile
} from '../../actions/v2/ai/v2_actionOpenAIFineTuning';

// ----------------------------------------------------------------------

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fine-tuning-tabpanel-${index}`}
      aria-labelledby={`fine-tuning-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FineTuning() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  // States
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobEvents, setJobEvents] = useState([]);
  const pollingIntervalRef = useRef(null);
  const [openCreateJobDialog, setOpenCreateJobDialog] = useState(false);
  const [selectedFileForJob, setSelectedFileForJob] = useState(null);
  const [openDirectFineTuningDialog, setOpenDirectFineTuningDialog] = useState(false);
  const [directTrainingData, setDirectTrainingData] = useState('');
  const [directValidationData, setDirectValidationData] = useState('');
  const [trainingConversations, setTrainingConversations] = useState([
    { id: 1, messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }, { role: 'assistant', content: '' }] }
  ]);
  const [validationConversations, setValidationConversations] = useState([]);
  const [useFormMode, setUseFormMode] = useState(true);
  const [formTabValue, setFormTabValue] = useState(0);
  const [useDPO, setUseDPO] = useState(false);

  // Form states
  const [createJobForm, setCreateJobForm] = useState({
    training_file: '',
    validation_file: '',
    model: 'gpt-3.5-turbo',
    hyperparameters: {
      n_epochs: 'auto',
      batch_size: 'auto',
      learning_rate_multiplier: 'auto'
    },
    suffix: ''
  });

  // Status colors
  const getStatusColor = (status) => {
    const statusMap = {
      'validating_files': 'info',
      'queued': 'default',
      'running': 'primary',
      'succeeded': 'success',
      'failed': 'error',
      'cancelled': 'warning'
    };
    return statusMap[status] || 'default';
  };

  // Load data
  const loadFiles = async () => {
    try {
      const response = await listTrainingFiles();
      if (response.data && response.data.status === 'success') {
        setFileList(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      enqueueSnackbar('Erro ao carregar arquivos', { variant: 'error' });
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await listFineTuningJobs(100);
      if (response.data && response.data.status === 'success') {
        setJobList(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar jobs:', error);
      enqueueSnackbar('Erro ao carregar jobs de fine-tuning', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const response = await listFineTunedModels();
      if (response.data && response.data.status === 'success') {
        setModelList(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      enqueueSnackbar('Erro ao carregar modelos', { variant: 'error' });
    }
  };

  useEffect(() => {
    loadFiles();
    loadJobs();
    loadModels();
  }, []);

  // Polling para jobs em execução
  useEffect(() => {
    const activeJobs = jobList.filter(job => 
      job.status === 'running' || job.status === 'queued' || job.status === 'validating_files'
    );

    if (activeJobs.length > 0 && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        loadJobs();
      }, 10000); // Atualizar a cada 10 segundos
    } else if (activeJobs.length === 0 && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobList]);

  // File upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.jsonl')) {
        setSelectedFile(file);
      } else {
        enqueueSnackbar('Por favor, selecione um arquivo .jsonl', { variant: 'warning' });
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      enqueueSnackbar('Selecione um arquivo primeiro', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('purpose', 'fine-tune');

      const response = await uploadTrainingFile(formData);
      if (response.data && response.data.status === 'success') {
        enqueueSnackbar('Arquivo enviado com sucesso!', { variant: 'success' });
        setSelectedFile(null);
        document.getElementById('file-input').value = '';
        await loadFiles();
      } else {
        enqueueSnackbar(response.data?.message || 'Erro ao enviar arquivo', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      enqueueSnackbar(error.response?.data?.message || 'Erro ao enviar arquivo', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Create job
  const handleCreateJob = async (fileId = null) => {
    const trainingFile = fileId || createJobForm.training_file;
    
    if (!trainingFile) {
      enqueueSnackbar('Selecione um arquivo de treinamento', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        training_file: trainingFile,
        model: createJobForm.model,
        suffix: createJobForm.suffix || undefined,
        hyperparameters: createJobForm.hyperparameters
      };

      if (createJobForm.validation_file) {
        payload.validation_file = createJobForm.validation_file;
      }

      const response = await createFineTuningJob(payload);
      if (response.data && response.data.status === 'success') {
        enqueueSnackbar('Job de fine-tuning criado com sucesso!', { variant: 'success' });
        setCreateJobForm({
          training_file: '',
          validation_file: '',
          model: 'gpt-3.5-turbo',
          hyperparameters: {
            n_epochs: 'auto',
            batch_size: 'auto',
            learning_rate_multiplier: 'auto'
          },
          suffix: ''
        });
        setOpenCreateJobDialog(false);
        setSelectedFileForJob(null);
        await loadJobs();
        setTabValue(1); // Mudar para aba de jobs
      } else {
        enqueueSnackbar(response.data?.message || 'Erro ao criar job', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao criar job:', error);
      enqueueSnackbar(error.response?.data?.message || 'Erro ao criar job', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle create job from file
  const handleCreateJobFromFile = (file) => {
    if (file.status !== 'processed') {
      enqueueSnackbar('O arquivo ainda não foi processado. Aguarde o processamento.', { variant: 'warning' });
      return;
    }
    setSelectedFileForJob(file.id);
    setCreateJobForm(prev => ({
      ...prev,
      training_file: file.id
    }));
    setOpenCreateJobDialog(true);
  };

  // Handle direct fine-tuning without file
  const handleDirectFineTuning = async () => {
    if (!directTrainingData.trim()) {
      enqueueSnackbar('Insira os dados de treinamento', { variant: 'warning' });
      return;
    }

    // Validate JSONL format
    const lines = directTrainingData.trim().split('\n');
    let isValid = true;
    let errorMessage = '';

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        JSON.parse(line);
      }
    } catch (error) {
      isValid = false;
      errorMessage = `Erro na linha: ${error.message}`;
    }

    if (!isValid) {
      enqueueSnackbar(`Formato JSONL inválido. ${errorMessage}`, { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      // Criar arquivo temporário a partir dos dados
      const trainingBlob = new Blob([directTrainingData], { type: 'text/plain' });
      const trainingFile = new File([trainingBlob], 'direct_training.jsonl', { type: 'text/plain' });
      
      // Upload do arquivo de treinamento
      const trainingFormData = new FormData();
      trainingFormData.append('file', trainingFile);
      trainingFormData.append('purpose', 'fine-tune');

      const trainingFileResponse = await uploadTrainingFile(trainingFormData);
      if (!trainingFileResponse.data || trainingFileResponse.data.status !== 'success') {
        enqueueSnackbar('Erro ao criar arquivo de treinamento', { variant: 'error' });
        return;
      }

      const trainingFileId = trainingFileResponse.data.data?.id;
      if (!trainingFileId) {
        enqueueSnackbar('Erro ao obter ID do arquivo de treinamento', { variant: 'error' });
        return;
      }

      let validationFileId = null;
      
      // Se houver dados de validação, criar arquivo também
      if (directValidationData.trim()) {
        const validationLines = directValidationData.trim().split('\n');
        try {
          for (let i = 0; i < validationLines.length; i++) {
            const line = validationLines[i].trim();
            if (!line) continue;
            JSON.parse(line);
          }

          const validationBlob = new Blob([directValidationData], { type: 'text/plain' });
          const validationFile = new File([validationBlob], 'direct_validation.jsonl', { type: 'text/plain' });
          
          const validationFormData = new FormData();
          validationFormData.append('file', validationFile);
          validationFormData.append('purpose', 'fine-tune');

          const validationFileResponse = await uploadTrainingFile(validationFormData);
          if (validationFileResponse.data && validationFileResponse.data.status === 'success') {
            validationFileId = validationFileResponse.data.data?.id;
          }
        } catch (error) {
          enqueueSnackbar('Erro ao criar arquivo de validação. Continuando apenas com treinamento...', { variant: 'warning' });
        }
      }

      // Aguardar processamento do arquivo (polling simples)
      let fileProcessed = false;
      let attempts = 0;
      const maxAttempts = 30; // 30 tentativas, ~30 segundos

      while (!fileProcessed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const fileResponse = await getTrainingFile(trainingFileId);
          if (fileResponse.data && fileResponse.data.data?.status === 'processed') {
            fileProcessed = true;
            break;
          }
        } catch (error) {
          console.error('Erro ao verificar status do arquivo:', error);
        }
        attempts++;
      }

      if (!fileProcessed) {
        enqueueSnackbar('Arquivo ainda está sendo processado. O job será criado automaticamente quando estiver pronto.', { variant: 'info' });
      }

      // Criar o job de fine-tuning
      const payload = {
        training_file: trainingFileId,
        model: createJobForm.model,
        suffix: createJobForm.suffix || undefined,
        hyperparameters: createJobForm.hyperparameters
      };

      if (validationFileId) {
        payload.validation_file = validationFileId;
      }

      const response = await createFineTuningJob(payload);
      if (response.data && response.data.status === 'success') {
        enqueueSnackbar('Job de fine-tuning criado com sucesso!', { variant: 'success' });
        setDirectTrainingData('');
        setDirectValidationData('');
        setTrainingConversations([
          { id: 1, messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }, { role: 'assistant', content: '' }] }
        ]);
        setValidationConversations([]);
        setUseFormMode(true);
        setFormTabValue(0);
        setUseDPO(false);
        setOpenDirectFineTuningDialog(false);
        await loadFiles();
        await loadJobs();
        setTabValue(1); // Mudar para aba de jobs
      } else {
        enqueueSnackbar(response.data?.message || 'Erro ao criar job', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao criar fine-tuning direto:', error);
      enqueueSnackbar(error.response?.data?.message || 'Erro ao criar fine-tuning', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // View job details
  const handleViewJobDetails = async (jobId) => {
    try {
      setLoading(true);
      const [jobResponse, eventsResponse] = await Promise.all([
        getFineTuningJob(jobId),
        listFineTuningEvents(jobId)
      ]);

      if (jobResponse.data && jobResponse.data.status === 'success') {
        setSelectedJob(jobResponse.data.data);
      }

      if (eventsResponse.data && eventsResponse.data.status === 'success') {
        setJobEvents(eventsResponse.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do job:', error);
      enqueueSnackbar('Erro ao carregar detalhes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Cancel job
  const handleCancelJob = async (jobId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este job?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await cancelFineTuningJob(jobId);
      if (response.data && response.data.status === 'success') {
        enqueueSnackbar('Job cancelado com sucesso', { variant: 'success' });
        await loadJobs();
      } else {
        enqueueSnackbar(response.data?.message || 'Erro ao cancelar job', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao cancelar job:', error);
      enqueueSnackbar(error.response?.data?.message || 'Erro ao cancelar job', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Tem certeza que deseja deletar este arquivo?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteTrainingFile(fileId);
      if (response.data && response.data.status === 'success') {
        enqueueSnackbar('Arquivo deletado com sucesso', { variant: 'success' });
        await loadFiles();
      } else {
        enqueueSnackbar(response.data?.message || 'Erro ao deletar arquivo', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      enqueueSnackbar(error.response?.data?.message || 'Erro ao deletar arquivo', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Delete model
  const handleDeleteModel = async (modelId) => {
    if (!window.confirm('Tem certeza que deseja deletar este modelo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteFineTunedModel(modelId);
      if (response.data && response.data.status === 'success') {
        enqueueSnackbar('Modelo deletado com sucesso', { variant: 'success' });
        await loadModels();
      } else {
        enqueueSnackbar(response.data?.message || 'Erro ao deletar modelo', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao deletar modelo:', error);
      enqueueSnackbar(error.response?.data?.message || 'Erro ao deletar modelo', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString * 1000).toLocaleString('pt-BR');
  };

  // Generate JSONL from conversations
  const generateJSONLFromConversations = (conversations) => {
    return conversations
      .map(conv => {
        if (useDPO) {
          // Formato DPO: messages, chosen, rejected
          const messages = conv.messages
            .filter(msg => msg.content.trim() !== '' && msg.role !== 'assistant')
            .map(msg => ({
              role: msg.role,
              content: msg.content
            }));
          
          const chosen = conv.chosen?.content?.trim() ? {
            role: 'assistant',
            content: conv.chosen.content
          } : null;
          
          const rejected = conv.rejected?.content?.trim() ? {
            role: 'assistant',
            content: conv.rejected.content
          } : null;
          
          if (messages.length > 0 && chosen && rejected) {
            return JSON.stringify({ messages, chosen, rejected });
          }
          return null;
        } else {
          // Formato padrão: messages
          const messages = conv.messages
            .filter(msg => msg.content.trim() !== '')
            .map(msg => ({
              role: msg.role,
              content: msg.content
            }));
          if (messages.length > 0) {
            return JSON.stringify({ messages });
          }
          return null;
        }
      })
      .filter(line => line !== null)
      .join('\n');
  };

  // Add new conversation
  const addTrainingConversation = () => {
    const newId = trainingConversations.length > 0 
      ? Math.max(...trainingConversations.map(c => c.id)) + 1 
      : 1;
    const newConv = useDPO
      ? { 
          id: newId, 
          messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }],
          chosen: { content: '' },
          rejected: { content: '' }
        }
      : { id: newId, messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }, { role: 'assistant', content: '' }] };
    setTrainingConversations([...trainingConversations, newConv]);
  };

  const addValidationConversation = () => {
    const newId = validationConversations.length > 0 
      ? Math.max(...validationConversations.map(c => c.id)) + 1 
      : 1;
    const newConv = useDPO
      ? { 
          id: newId, 
          messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }],
          chosen: { content: '' },
          rejected: { content: '' }
        }
      : { id: newId, messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }, { role: 'assistant', content: '' }] };
    setValidationConversations([...validationConversations, newConv]);
  };

  // Remove conversation
  const removeTrainingConversation = (id) => {
    setTrainingConversations(trainingConversations.filter(c => c.id !== id));
  };

  const removeValidationConversation = (id) => {
    setValidationConversations(validationConversations.filter(c => c.id !== id));
  };

  // Add message to conversation
  const addMessageToTrainingConversation = (convId) => {
    setTrainingConversations(
      trainingConversations.map(conv =>
        conv.id === convId
          ? { ...conv, messages: [...conv.messages, { role: 'user', content: '' }] }
          : conv
      )
    );
  };

  const addMessageToValidationConversation = (convId) => {
    setValidationConversations(
      validationConversations.map(conv =>
        conv.id === convId
          ? { ...conv, messages: [...conv.messages, { role: 'user', content: '' }] }
          : conv
      )
    );
  };

  // Remove message from conversation
  const removeMessageFromTrainingConversation = (convId, msgIndex) => {
    setTrainingConversations(
      trainingConversations.map(conv =>
        conv.id === convId
          ? { ...conv, messages: conv.messages.filter((_, idx) => idx !== msgIndex) }
          : conv
      )
    );
  };

  const removeMessageFromValidationConversation = (convId, msgIndex) => {
    setValidationConversations(
      validationConversations.map(conv =>
        conv.id === convId
          ? { ...conv, messages: conv.messages.filter((_, idx) => idx !== msgIndex) }
          : conv
      )
    );
  };

  // Update message in conversation
  const updateTrainingMessage = (convId, msgIndex, field, value) => {
    setTrainingConversations(
      trainingConversations.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              messages: conv.messages.map((msg, idx) =>
                idx === msgIndex ? { ...msg, [field]: value } : msg
              )
            }
          : conv
      )
    );
  };

  const updateValidationMessage = (convId, msgIndex, field, value) => {
    setValidationConversations(
      validationConversations.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              messages: conv.messages.map((msg, idx) =>
                idx === msgIndex ? { ...msg, [field]: value } : msg
              )
            }
          : conv
      )
    );
  };

  // Update DPO chosen/rejected
  const updateTrainingDPO = (convId, type, value) => {
    setTrainingConversations(
      trainingConversations.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              [type]: { content: value }
            }
          : conv
      )
    );
  };

  const updateValidationDPO = (convId, type, value) => {
    setValidationConversations(
      validationConversations.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              [type]: { content: value }
            }
          : conv
      )
    );
  };

  // Sync form data to JSON when form mode changes or conversations change
  useEffect(() => {
    if (useFormMode) {
      const trainingJSONL = generateJSONLFromConversations(trainingConversations);
      const validationJSONL = generateJSONLFromConversations(validationConversations);
      setDirectTrainingData(trainingJSONL);
      setDirectValidationData(validationJSONL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingConversations, validationConversations, useFormMode, useDPO]);

  return (
    <Page title="Fine-Tuning de Modelos OpenAI | Lais Boss">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Fine-Tuning de Modelos OpenAI"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Fine-Tuning' }
          ]}
        />

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Upload de Arquivos" />
              <Tab label="Jobs de Fine-Tuning" />
              <Tab label="Modelos Fine-Tunados" />
            </Tabs>
            <Button
              variant="contained"
              startIcon={<Icon icon="eva:flash-fill" />}
              onClick={() => setOpenDirectFineTuningDialog(true)}
              sx={{ mr: 2 }}
            >
              Fine-Tuning Direto
            </Button>
          </Box>

          {/* Tab 1: Upload de Arquivos */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Enviar Arquivo de Treinamento (JSONL)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Faça upload de um arquivo JSONL formatado para treinamento. Cada linha deve ser um objeto JSON válido.
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <input
                      accept=".jsonl"
                      style={{ display: 'none' }}
                      id="file-input"
                      type="file"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-input">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<Icon icon="eva:upload-fill" />}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        Selecionar Arquivo
                      </Button>
                    </label>
                    {selectedFile && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Arquivo selecionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </Alert>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    onClick={handleFileUpload}
                    disabled={!selectedFile || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Icon icon="eva:cloud-upload-fill" />}
                    fullWidth
                  >
                    {loading ? 'Enviando...' : 'Enviar Arquivo'}
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Formato do Arquivo JSONL
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Para modelos de chat (gpt-3.5-turbo, gpt-4):
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem'
                    }}
                  >
{`{"messages": [
  {"role": "system", "content": "Você é um assistente útil."},
  {"role": "user", "content": "Olá!"},
  {"role": "assistant", "content": "Olá! Como posso ajudar?"}
]}`}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Arquivos Enviados
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell>Tamanho</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Criado em</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fileList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Nenhum arquivo enviado
                          </TableCell>
                        </TableRow>
                      ) : (
                        fileList.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                {file.id}
                              </Typography>
                            </TableCell>
                            <TableCell>{file.filename}</TableCell>
                            <TableCell>{formatFileSize(file.bytes)}</TableCell>
                            <TableCell>
                              <Chip
                                label={file.status}
                                color={file.status === 'processed' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatDate(file.created_at)}</TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                {file.status === 'processed' && (
                                  <Tooltip title="Criar job de fine-tuning">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCreateJobFromFile(file)}
                                      color="primary"
                                    >
                                      <Icon icon="eva:play-circle-fill" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Deletar arquivo">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteFile(file.id)}
                                    color="error"
                                  >
                                    <Icon icon="eva:trash-2-fill" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 2: Jobs de Fine-Tuning */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Criar Novo Job de Fine-Tuning
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Arquivo de Treinamento</InputLabel>
                        <Select
                          value={createJobForm.training_file}
                          onChange={(e) => setCreateJobForm({ ...createJobForm, training_file: e.target.value })}
                          label="Arquivo de Treinamento"
                        >
                          {fileList
                            .filter((f) => f.status === 'processed')
                            .map((file) => (
                              <MenuItem key={file.id} value={file.id}>
                                {file.filename}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Arquivo de Validação (Opcional)</InputLabel>
                        <Select
                          value={createJobForm.validation_file}
                          onChange={(e) => setCreateJobForm({ ...createJobForm, validation_file: e.target.value })}
                          label="Arquivo de Validação (Opcional)"
                        >
                          <MenuItem value="">Nenhum</MenuItem>
                          {fileList
                            .filter((f) => f.status === 'processed')
                            .map((file) => (
                              <MenuItem key={file.id} value={file.id}>
                                {file.filename}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Modelo Base</InputLabel>
                        <Select
                          value={createJobForm.model}
                          onChange={(e) => setCreateJobForm({ ...createJobForm, model: e.target.value })}
                          label="Modelo Base"
                        >
                          <MenuItem value="gpt-4.1-2025-04-14">gpt-4.1-2025-04-14</MenuItem>
                          <MenuItem value="gpt-4.1-mini-2025-04-14">gpt-4.1-mini-2025-04-14</MenuItem>
                          <MenuItem value="gpt-4.1-nano-2025-04-14">gpt-4.1-nano-2025-04-14</MenuItem>
                          <MenuItem value="gpt-4o">gpt-4o</MenuItem>
                          <MenuItem value="gpt-4o-mini">gpt-4o-mini</MenuItem>
                          <MenuItem value="gpt-4-turbo">gpt-4-turbo</MenuItem>
                          <MenuItem value="gpt-4">gpt-4</MenuItem>
                          <MenuItem value="gpt-3.5-turbo">gpt-3.5-turbo</MenuItem>
                          <MenuItem value="gpt-3.5-turbo-1106">gpt-3.5-turbo-1106</MenuItem>
                          <MenuItem value="gpt-3.5-turbo-0125">gpt-3.5-turbo-0125</MenuItem>
                          <MenuItem value="babbage-002">babbage-002</MenuItem>
                          <MenuItem value="davinci-002">davinci-002</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Sufixo (Opcional)"
                        value={createJobForm.suffix}
                        onChange={(e) => setCreateJobForm({ ...createJobForm, suffix: e.target.value })}
                        placeholder="Ex: meu-modelo"
                        helperText="Sufixo para o nome do modelo"
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Épocas (n_epochs)"
                        value={createJobForm.hyperparameters.n_epochs}
                        onChange={(e) =>
                          setCreateJobForm({
                            ...createJobForm,
                            hyperparameters: { ...createJobForm.hyperparameters, n_epochs: e.target.value }
                          })
                        }
                        helperText="Padrão: auto"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={() => handleCreateJob()}
                        disabled={!createJobForm.training_file || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Icon icon="eva:play-fill" />}
                      >
                        {loading ? 'Criando...' : 'Criar Job de Fine-Tuning'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Jobs de Fine-Tuning
                </Typography>
                {loading && <LinearProgress sx={{ mb: 2 }} />}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Modelo Base</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Criado em</TableCell>
                        <TableCell>Modelo Fine-Tunado</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Nenhum job encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        jobList.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                {job.id}
                              </Typography>
                            </TableCell>
                            <TableCell>{job.model}</TableCell>
                            <TableCell>
                              <Chip
                                label={job.status}
                                color={getStatusColor(job.status)}
                                size="small"
                              />
                              {job.status === 'running' && (
                                <CircularProgress size={16} sx={{ ml: 1 }} />
                              )}
                            </TableCell>
                            <TableCell>{formatDate(job.created_at)}</TableCell>
                            <TableCell>
                              {job.fine_tuned_model ? (
                                <Chip
                                  label={job.fine_tuned_model}
                                  color="success"
                                  size="small"
                                  sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Tooltip title="Ver detalhes">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewJobDetails(job.id)}
                                    color="primary"
                                  >
                                    <Icon icon="eva:eye-fill" />
                                  </IconButton>
                                </Tooltip>
                                {job.status === 'running' && (
                                  <Tooltip title="Cancelar job">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCancelJob(job.id)}
                                      color="warning"
                                    >
                                      <Icon icon="eva:close-circle-fill" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 3: Modelos Fine-Tunados */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Modelos Fine-Tunados
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID do Modelo</TableCell>
                    <TableCell>Modelo Base</TableCell>
                    <TableCell>Criado em</TableCell>
                    <TableCell>Objeto</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modelList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum modelo fine-tunado encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    modelList.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {model.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{model.base_model}</TableCell>
                        <TableCell>{formatDate(model.created)}</TableCell>
                        <TableCell>{model.object}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Deletar modelo">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteModel(model.id)}
                              color="error"
                            >
                              <Icon icon="eva:trash-2-fill" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>

        {/* Dialog de Detalhes do Job */}
        <Dialog
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Detalhes do Job de Fine-Tuning
            {selectedJob && (
              <Chip
                label={selectedJob.status}
                color={getStatusColor(selectedJob.status)}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>
          <DialogContent>
            {selectedJob && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      ID do Job
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      {selectedJob.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Modelo Base
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {selectedJob.model}
                    </Typography>
                  </Grid>
                  {selectedJob.fine_tuned_model && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">
                        Modelo Fine-Tunado
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                        {selectedJob.fine_tuned_model}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Criado em
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {formatDate(selectedJob.created_at)}
                    </Typography>
                  </Grid>
                  {selectedJob.trained_tokens && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">
                        Tokens Treinados
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {selectedJob.trained_tokens.toLocaleString('pt-BR')}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Eventos do Job
                </Typography>
                <Scrollbar sx={{ maxHeight: 400 }}>
                  <Box>
                    {jobEvents.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum evento encontrado
                      </Typography>
                    ) : (
                      jobEvents.map((event, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(event.created_at)}
                          </Typography>
                          <Typography variant="body2">{event.message}</Typography>
                          {event.level && (
                            <Chip
                              label={event.level}
                              size="small"
                              color={event.level === 'error' ? 'error' : 'default'}
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      ))
                    )}
                  </Box>
                </Scrollbar>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedJob(null)}>Fechar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para Criar Job a partir de Arquivo */}
        <Dialog
          open={openCreateJobDialog}
          onClose={() => {
            setOpenCreateJobDialog(false);
            setSelectedFileForJob(null);
            setCreateJobForm(prev => ({
              ...prev,
              training_file: ''
            }));
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="eva:play-circle-fill" width={24} />
              Criar Job de Fine-Tuning
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedFileForJob && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Arquivo selecionado: {fileList.find(f => f.id === selectedFileForJob)?.filename}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Arquivo de Validação (Opcional)</InputLabel>
                  <Select
                    value={createJobForm.validation_file}
                    onChange={(e) => setCreateJobForm({ ...createJobForm, validation_file: e.target.value })}
                    label="Arquivo de Validação (Opcional)"
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {fileList
                      .filter((f) => f.status === 'processed' && f.id !== selectedFileForJob)
                      .map((file) => (
                        <MenuItem key={file.id} value={file.id}>
                          {file.filename}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Modelo Base</InputLabel>
                  <Select
                    value={createJobForm.model}
                    onChange={(e) => setCreateJobForm({ ...createJobForm, model: e.target.value })}
                    label="Modelo Base"
                  >
                    <MenuItem value="gpt-4.1-2025-04-14">gpt-4.1-2025-04-14</MenuItem>
                    <MenuItem value="gpt-4.1-mini-2025-04-14">gpt-4.1-mini-2025-04-14</MenuItem>
                    <MenuItem value="gpt-4.1-nano-2025-04-14">gpt-4.1-nano-2025-04-14</MenuItem>
                    <MenuItem value="gpt-4o">gpt-4o</MenuItem>
                    <MenuItem value="gpt-4o-mini">gpt-4o-mini</MenuItem>
                    <MenuItem value="gpt-4-turbo">gpt-4-turbo</MenuItem>
                    <MenuItem value="gpt-4">gpt-4</MenuItem>
                    <MenuItem value="gpt-3.5-turbo">gpt-3.5-turbo</MenuItem>
                    <MenuItem value="gpt-3.5-turbo-1106">gpt-3.5-turbo-1106</MenuItem>
                    <MenuItem value="gpt-3.5-turbo-0125">gpt-3.5-turbo-0125</MenuItem>
                    <MenuItem value="babbage-002">babbage-002</MenuItem>
                    <MenuItem value="davinci-002">davinci-002</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sufixo (Opcional)"
                  value={createJobForm.suffix}
                  onChange={(e) => setCreateJobForm({ ...createJobForm, suffix: e.target.value })}
                  placeholder="Ex: meu-modelo"
                  helperText="Sufixo para o nome do modelo"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Épocas (n_epochs)"
                  value={createJobForm.hyperparameters.n_epochs}
                  onChange={(e) =>
                    setCreateJobForm({
                      ...createJobForm,
                      hyperparameters: { ...createJobForm.hyperparameters, n_epochs: e.target.value }
                    })
                  }
                  helperText="Padrão: auto"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCreateJobDialog(false);
                setSelectedFileForJob(null);
                setCreateJobForm(prev => ({
                  ...prev,
                  training_file: ''
                }));
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={() => handleCreateJob(selectedFileForJob)}
              disabled={!selectedFileForJob || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Icon icon="eva:play-fill" />}
            >
              {loading ? 'Criando...' : 'Criar Job'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para Fine-Tuning Direto (sem arquivo) */}
        <Dialog
          open={openDirectFineTuningDialog}
          onClose={() => {
            setOpenDirectFineTuningDialog(false);
            setDirectTrainingData('');
            setDirectValidationData('');
            setTrainingConversations([
              { id: 1, messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }, { role: 'assistant', content: '' }] }
            ]);
            setValidationConversations([]);
            setUseFormMode(true);
            setFormTabValue(0);
            setUseDPO(false);
          }}
          fullScreen
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="eva:flash-fill" width={24} />
                Fine-Tuning Direto (Sem Arquivo)
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={useFormMode ? 'contained' : 'outlined'}
                  onClick={() => setUseFormMode(true)}
                  startIcon={<Icon icon="eva:edit-fill" />}
                >
                  Formulário
                </Button>
                <Button
                  size="small"
                  variant={!useFormMode ? 'contained' : 'outlined'}
                  onClick={() => setUseFormMode(false)}
                  startIcon={<Icon icon="eva:code-fill" />}
                >
                  JSON Direto
                </Button>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 3, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
            {useFormMode ? (
              // Modo Formulário
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Tabs value={formTabValue} onChange={(e, newValue) => setFormTabValue(newValue)}>
                      <Tab label="Formulário de Conversas" />
                      <Tab label="Pré-visualização JSON" />
                    </Tabs>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useDPO}
                          onChange={(e) => {
                            setUseDPO(e.target.checked);
                            // Resetar conversas quando mudar o modo
                            setTrainingConversations([
                              e.target.checked
                                ? { id: 1, messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }], chosen: { content: '' }, rejected: { content: '' } }
                                : { id: 1, messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }, { role: 'assistant', content: '' }] }
                            ]);
                            setValidationConversations([]);
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Icon icon="eva:star-fill" width={16} />
                          <Typography variant="caption">DPO (Direct Preference Optimization)</Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {formTabValue === 0 && (
                    // Seção 1: Formulário de Conversas
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">Treinamento *</Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Icon icon="eva:plus-fill" />}
                            onClick={addTrainingConversation}
                          >
                            + Conversa
                          </Button>
                        </Box>
                        <Scrollbar sx={{ maxHeight: 'calc(100vh - 450px)' }}>
                          {trainingConversations.map((conv, convIdx) => (
                            <Paper key={conv.id} sx={{ p: 1.5, mb: 1.5, bgcolor: 'grey.50' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>#{convIdx + 1}</Typography>
                                <Box>
                                  {!useDPO && (
                                    <IconButton
                                      size="small"
                                      onClick={() => addMessageToTrainingConversation(conv.id)}
                                      color="primary"
                                      sx={{ p: 0.5 }}
                                    >
                                      <Icon icon="eva:message-square-fill" width={16} />
                                    </IconButton>
                                  )}
                                  {trainingConversations.length > 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={() => removeTrainingConversation(conv.id)}
                                      color="error"
                                      sx={{ p: 0.5 }}
                                    >
                                      <Icon icon="eva:trash-2-fill" width={16} />
                                    </IconButton>
                                  )}
                                </Box>
                              </Box>
                              {conv.messages.map((msg, msgIdx) => (
                                <Box key={msgIdx} sx={{ mb: 1 }}>
                                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                                    <FormControl size="small" sx={{ minWidth: 90, mt: 0.5 }}>
                                      <Select
                                        value={msg.role}
                                        onChange={(e) => updateTrainingMessage(conv.id, msgIdx, 'role', e.target.value)}
                                        sx={{ height: 32 }}
                                        disabled={useDPO && msg.role === 'assistant'}
                                      >
                                        <MenuItem value="system">System</MenuItem>
                                        <MenuItem value="user">User</MenuItem>
                                        {!useDPO && <MenuItem value="assistant">Assistant</MenuItem>}
                                      </Select>
                                    </FormControl>
                                    <TextField
                                      fullWidth
                                      multiline
                                      rows={1}
                                      size="small"
                                      value={msg.content}
                                      onChange={(e) => updateTrainingMessage(conv.id, msgIdx, 'content', e.target.value)}
                                      placeholder={`${msg.role}...`}
                                      sx={{
                                        '& .MuiInputBase-root': {
                                          height: 'auto',
                                          minHeight: 32
                                        }
                                      }}
                                    />
                                    {conv.messages.length > 1 && (
                                      <IconButton
                                        size="small"
                                        onClick={() => removeMessageFromTrainingConversation(conv.id, msgIdx)}
                                        color="error"
                                        sx={{ p: 0.5, mt: 0.5 }}
                                      >
                                        <Icon icon="eva:close-fill" width={16} />
                                      </IconButton>
                                    )}
                                  </Box>
                                </Box>
                              ))}
                              {useDPO && (
                                <>
                                  <Divider sx={{ my: 1 }} />
                                  <Box sx={{ mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                      <Icon icon="eva:checkmark-circle-2-fill" width={16} color="success" />
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                                        Resposta Correta (Chosen)
                                      </Typography>
                                    </Box>
                                    <TextField
                                      fullWidth
                                      multiline
                                      rows={2}
                                      size="small"
                                      value={conv.chosen?.content || ''}
                                      onChange={(e) => updateTrainingDPO(conv.id, 'chosen', e.target.value)}
                                      placeholder="Digite a resposta correta/preferida..."
                                    />
                                  </Box>
                                  <Box sx={{ mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                      <Icon icon="eva:close-circle-fill" width={16} color="error" />
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                                        Resposta Incorreta (Rejected)
                                      </Typography>
                                    </Box>
                                    <TextField
                                      fullWidth
                                      multiline
                                      rows={2}
                                      size="small"
                                      value={conv.rejected?.content || ''}
                                      onChange={(e) => updateTrainingDPO(conv.id, 'rejected', e.target.value)}
                                      placeholder="Digite a resposta incorreta/não preferida..."
                                    />
                                  </Box>
                                </>
                              )}
                            </Paper>
                          ))}
                        </Scrollbar>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">Validação (Opcional)</Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Icon icon="eva:plus-fill" />}
                            onClick={addValidationConversation}
                          >
                            + Conversa
                          </Button>
                        </Box>
                        <Scrollbar sx={{ maxHeight: 'calc(100vh - 450px)' }}>
                          {validationConversations.length === 0 ? (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                              <Typography variant="caption" color="text.secondary">
                                Nenhuma conversa
                              </Typography>
                            </Paper>
                          ) : (
                            validationConversations.map((conv, convIdx) => (
                              <Paper key={conv.id} sx={{ p: 1.5, mb: 1.5, bgcolor: 'grey.50' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>#{convIdx + 1}</Typography>
                                  <Box>
                                    {!useDPO && (
                                      <IconButton
                                        size="small"
                                        onClick={() => addMessageToValidationConversation(conv.id)}
                                        color="primary"
                                        sx={{ p: 0.5 }}
                                      >
                                        <Icon icon="eva:message-square-fill" width={16} />
                                      </IconButton>
                                    )}
                                    <IconButton
                                      size="small"
                                      onClick={() => removeValidationConversation(conv.id)}
                                      color="error"
                                      sx={{ p: 0.5 }}
                                    >
                                      <Icon icon="eva:trash-2-fill" width={16} />
                                    </IconButton>
                                  </Box>
                                </Box>
                                {conv.messages.map((msg, msgIdx) => (
                                  <Box key={msgIdx} sx={{ mb: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                                      <FormControl size="small" sx={{ minWidth: 90, mt: 0.5 }}>
                                        <Select
                                          value={msg.role}
                                          onChange={(e) => updateValidationMessage(conv.id, msgIdx, 'role', e.target.value)}
                                          sx={{ height: 32 }}
                                          disabled={useDPO && msg.role === 'assistant'}
                                        >
                                          <MenuItem value="system">System</MenuItem>
                                          <MenuItem value="user">User</MenuItem>
                                          {!useDPO && <MenuItem value="assistant">Assistant</MenuItem>}
                                        </Select>
                                      </FormControl>
                                      <TextField
                                        fullWidth
                                        multiline
                                        rows={1}
                                        size="small"
                                        value={msg.content}
                                        onChange={(e) => updateValidationMessage(conv.id, msgIdx, 'content', e.target.value)}
                                        placeholder={`${msg.role}...`}
                                        sx={{
                                          '& .MuiInputBase-root': {
                                            height: 'auto',
                                            minHeight: 32
                                          }
                                        }}
                                      />
                                      {conv.messages.length > 1 && (
                                        <IconButton
                                          size="small"
                                          onClick={() => removeMessageFromValidationConversation(conv.id, msgIdx)}
                                          color="error"
                                          sx={{ p: 0.5, mt: 0.5 }}
                                        >
                                          <Icon icon="eva:close-fill" width={16} />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </Box>
                                ))}
                                {useDPO && (
                                  <>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ mb: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <Icon icon="eva:checkmark-circle-2-fill" width={16} color="success" />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                                          Resposta Correta (Chosen)
                                        </Typography>
                                      </Box>
                                      <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        size="small"
                                        value={conv.chosen?.content || ''}
                                        onChange={(e) => updateValidationDPO(conv.id, 'chosen', e.target.value)}
                                        placeholder="Digite a resposta correta/preferida..."
                                      />
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <Icon icon="eva:close-circle-fill" width={16} color="error" />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                                          Resposta Incorreta (Rejected)
                                        </Typography>
                                      </Box>
                                      <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        size="small"
                                        value={conv.rejected?.content || ''}
                                        onChange={(e) => updateValidationDPO(conv.id, 'rejected', e.target.value)}
                                        placeholder="Digite a resposta incorreta/não preferida..."
                                      />
                                    </Box>
                                  </>
                                )}
                              </Paper>
                            ))
                          )}
                        </Scrollbar>
                      </Grid>
                    </Grid>
                  )}

                  {formTabValue === 1 && (
                    // Seção 2: Pré-visualização JSON
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          JSON de Treinamento
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const json = generateJSONLFromConversations(trainingConversations);
                            navigator.clipboard.writeText(json);
                            enqueueSnackbar('JSON copiado!', { variant: 'success' });
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <Icon icon="eva:copy-fill" width={16} />
                        </IconButton>
                      </Box>
                      <Paper sx={{ p: 2, bgcolor: 'grey.900', mb: 2, minHeight: '300px' }}>
                        <Scrollbar>
                          <Box
                            component="pre"
                            sx={{
                              color: 'grey.100',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              m: 0,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}
                          >
                            {generateJSONLFromConversations(trainingConversations) || '(vazio)'}
                          </Box>
                        </Scrollbar>
                      </Paper>

                      {validationConversations.length > 0 && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              JSON de Validação
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const json = generateJSONLFromConversations(validationConversations);
                                navigator.clipboard.writeText(json);
                                enqueueSnackbar('JSON copiado!', { variant: 'success' });
                              }}
                              sx={{ p: 0.5 }}
                            >
                              <Icon icon="eva:copy-fill" width={16} />
                            </IconButton>
                          </Box>
                          <Paper sx={{ p: 2, bgcolor: 'grey.900', minHeight: '300px' }}>
                            <Scrollbar>
                              <Box
                                component="pre"
                                sx={{
                                  color: 'grey.100',
                                  fontSize: '0.75rem',
                                  fontFamily: 'monospace',
                                  m: 0,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {generateJSONLFromConversations(validationConversations) || '(vazio)'}
                              </Box>
                            </Scrollbar>
                          </Paper>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              // Modo JSON Direto
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Treinamento (JSONL) *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    size="small"
                    value={directTrainingData}
                    onChange={(e) => setDirectTrainingData(e.target.value)}
                    placeholder={`{"messages": [{"role": "system", "content": "Você é um assistente útil."}, {"role": "user", "content": "Olá!"}, {"role": "assistant", "content": "Olá! Como posso ajudar?"}]}\n{"messages": [{"role": "system", "content": "Você é um assistente útil."}, {"role": "user", "content": "Qual é a capital do Brasil?"}, {"role": "assistant", "content": "A capital do Brasil é Brasília."}]}`}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: '0.75rem'
                      }
                    }}
                    helperText={`${directTrainingData.split('\n').filter(l => l.trim()).length} linha(s)`}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Validação (JSONL) - Opcional
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    size="small"
                    value={directValidationData}
                    onChange={(e) => setDirectValidationData(e.target.value)}
                    placeholder="Formato igual ao de treinamento (opcional)"
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: '0.75rem'
                      }
                    }}
                    helperText={directValidationData ? `${directValidationData.split('\n').filter(l => l.trim()).length} linha(s)` : 'Opcional'}
                  />
                </Grid>
              </Grid>
            )}

            <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Configurações do Job
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Modelo Base</InputLabel>
                  <Select
                    value={createJobForm.model}
                    onChange={(e) => setCreateJobForm({ ...createJobForm, model: e.target.value })}
                    label="Modelo Base"
                  >
                    <MenuItem value="gpt-4.1-2025-04-14">gpt-4.1-2025-04-14</MenuItem>
                    <MenuItem value="gpt-4.1-mini-2025-04-14">gpt-4.1-mini-2025-04-14</MenuItem>
                    <MenuItem value="gpt-4.1-nano-2025-04-14">gpt-4.1-nano-2025-04-14</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Sufixo (Opcional)"
                  value={createJobForm.suffix}
                  onChange={(e) => setCreateJobForm({ ...createJobForm, suffix: e.target.value })}
                  placeholder="Ex: meu-modelo"
                  helperText="Sufixo para o nome do modelo"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Épocas (n_epochs)"
                  value={createJobForm.hyperparameters.n_epochs}
                  onChange={(e) =>
                    setCreateJobForm({
                      ...createJobForm,
                      hyperparameters: { ...createJobForm.hyperparameters, n_epochs: e.target.value }
                    })
                  }
                  helperText="Padrão: auto"
                />
              </Grid>

              {!useFormMode && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Exemplo de formato JSONL:</strong>
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: 'white',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        overflow: 'auto'
                      }}
                    >
{`{"messages": [
  {"role": "system", "content": "Você é um assistente útil."},
  {"role": "user", "content": "Olá!"},
  {"role": "assistant", "content": "Olá! Como posso ajudar?"}
]}`}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenDirectFineTuningDialog(false);
                setDirectTrainingData('');
                setDirectValidationData('');
                setTrainingConversations([
                  { id: 1, messages: [{ role: 'system', content: '' }, { role: 'user', content: '' }, { role: 'assistant', content: '' }] }
                ]);
                setValidationConversations([]);
                setUseFormMode(true);
                setFormTabValue(0);
                setUseDPO(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleDirectFineTuning}
              disabled={!directTrainingData.trim() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Icon icon="eva:flash-fill" />}
            >
              {loading ? 'Criando...' : 'Criar Fine-Tuning'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}

