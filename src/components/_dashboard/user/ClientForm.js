import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useSnackbar } from 'notistack5';
import { useNavigate } from 'react-router-dom';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { LoadingButton } from '@material-ui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  FormHelperText,
  FormControlLabel,
  Container,
  FormGroup,
  FormControl,
  Divider,
  Chip,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';
// utils
import { fData } from '../../../utils/formatNumber';
import fakeRequest from '../../../utils/fakeRequest';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
//
import Label from '../../Label';
import { UploadAvatar } from '../../upload';
import countries from './countries';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import CloseIcon from '@material-ui/icons/Close';
import v2_actionEditarCliente from 'src/actions/v2/clientes/v2_actionEditarCliente';

// ACTIONS ---------------------------------------------------------------------
//import editarCliente from "../../../actions/editarCliente";

// ----------------------------------------------------------------------

ClientForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object
};

export default function ClientForm({
  isEdit,
  currentUser,
  editarMsgFinalizacao,
  propsEditarCliente,
  msgBoasVindas,
  isReadyCheckMsgSend,
  changeIsReadyCheckMsgSend,
  changeMsgBoasVindas,
  editarCheckMsg,
  isSentinela,
  changeIsMensagemFinalizacao,
  changeIsSentinela,
  isMensagemFinalizacao,
  msgFinalizacao,
  changeMsgFinalizacao,
  nomeCliente,
  numero,
  changeNumero,
  changeNomeCliente,
  submitDadosEssenciais,
  isLoading,
  submitPesquisaConfig,
  msgPesquisa,
  changeMsgPesquisa,
  statusPesquisaChat,
  changeStatusPesquisaChat,
  planoSelecionado = '',
  changePlanoSelecionado,
  addonsSelecionados = [],
  changeAddonsSelecionados,
  submitPlanosServicos,
  dadosPlanos = { data: { planos: [], adicionais: [] } },
  features = [],
  changeFeatures,
  submitFeatures,
  clienteId,
  inadimplenciaAtivo = false,
  inadimplenciaMensagem = '',
  inadimplenciaLoading = false,
  changeInadimplenciaMensagem,
  submitInadimplencia
}) {
  const [desconto, setDesconto] = useState(0);
  const [featureSelecionada, setFeatureSelecionada] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const featuresWithCategories = [
    {
      category: 'Chats',
      name: 'Carteirização',
      value: 'chats.wallet'
    },
    {
      category: 'Chats',
      name: 'Enviar arquivo documento',
      value: 'lais_chat_enviar_arquivo_documento'
    },
    {
      category: 'Chats',
      name: 'Automações',
      value: 'automacoes'
    },
    {
      category: 'Chats',
      name: 'Campanhas',
      value: 'campanhas'
    },
    {
      category: 'Chats',
      name: 'Chat Interno',
      value: 'chat_interno'
    },


    {
      category: 'IA',
      name: 'Agentes de IA',
      value: 'agentes_ia'
    },
    {
      category: 'IA',
      name: 'Automações com IA',
      value: 'ia.automacoes'
    },
    {
      category: 'Automações',
      name: 'Triggers',
      value: 'automacoes.triggers'
    },
    {
      category: 'IA',
      name: 'Feedback de IA',
      value: 'ai.feedback'
    },
    {
      category: 'IA',
      name: 'Lais go',
      value: 'laisgo'
    },
    {
      category: 'IA',
      name: 'Análise de atendimento',
      value: 'ai.analise_atendimento'
    },
    {
      category: 'IA',
      name: 'Transcrição de áudio',
      value: 'ai.transcricao_audio',
    },
    {
      category: 'IA',
      name: 'Transcrição de imagens',
      value: 'ai.transcricao_imagens',
    },

    {
      category: 'Features',
      name: 'Lais Imobiliária',
      value: 'features.lais_imobiliaria'
    },
    {
      category: 'Chats',
      name: 'backup de arquivos',
      value: 'wpp_backup_files'
    }





  ];

  // Função para buscar dados completos do serviço
  const getServicoCompleto = (itemId) => {
    return dadosPlanos?.data?.adicionais?.find(addon => addon._id === itemId);
  };

  // Calcula o total do carrinho
  const subtotalCarrinho = addonsSelecionados.reduce((total, item) => {
    const precoValido = parseFloat(item.preco) || 0;
    const quantidadeValida = parseInt(item.quantidade) || 1;
    const subtotalItem = precoValido * quantidadeValida;
    return total + subtotalItem;
  }, 0);

  // Calcula o desconto
  const valorDesconto = desconto;
  const totalComDesconto = subtotalCarrinho - valorDesconto;

  const handleDescontoChange = (event) => {
    const valor = event.target.value;
    if (valor === '' || Number(valor) >= 0) {
      setDesconto(valor);
    }
  };

  async function handleEditarCliente(scope, action) {
    try {
      const response = await v2_actionEditarCliente(clienteId, {
        scope: scope,
        action: action
      });
      return response;
    } catch (error) {
      alert('Erro ao editar cliente')
      console.log(error)
    }
  }

  const handleAdicionarAoCarrinho = (addon) => {
    const itemExistente = addonsSelecionados.find(item => item.id === addon._id);

    if (itemExistente) {
      // Se existe, aumenta a quantidade
      const novosAddons = addonsSelecionados.map(item =>
        item.id === addon._id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      );
      changeAddonsSelecionados(novosAddons);
    } else {
      // Se não existe, adiciona com quantidade 1
      const precoNumerico = parseFloat(addon.regular_price) || 0;

      changeAddonsSelecionados([...addonsSelecionados, {
        id: addon._id,
        nome: addon.name,
        preco: precoNumerico,
        quantidade: 1,
        key: addon.key
      }]);
    }
  };

  const handleRemoverDoCarrinho = (addonId) => {
    const itemExistente = addonsSelecionados.find(item => item.id === addonId);

    if (itemExistente?.quantidade > 1) {
      // Se tem mais de um, diminui a quantidade
      const novosAddons = addonsSelecionados.map(item =>
        item.id === addonId
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      );
      changeAddonsSelecionados(novosAddons);
    } else {
      // Se só tem um, remove do carrinho
      const novosAddons = addonsSelecionados.filter(item => item.id !== addonId);
      changeAddonsSelecionados(novosAddons);
    }
  };

  const handleAdicionarFeature = () => {
    if (featureSelecionada && !features.includes(featureSelecionada)) {
      changeFeatures([...features, featureSelecionada]);
      setFeatureSelecionada('');
    }
  };

  const handleRemoverFeature = (featureParaRemover) => {
    const novasFeatures = features.filter(feature => feature !== featureParaRemover);
    changeFeatures(novasFeatures);
  };

  const handleChangeFeatureSelecionada = (event) => {
    setFeatureSelecionada(event.target.value);
  };

  // Agrupa features por categoria
  const featuresPorCategoria = featuresWithCategories.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {});

  // Filtra features já selecionadas
  const featuresDisponiveis = featuresWithCategories.filter(feature =>
    !features.includes(feature.value)
  );


  return (
    <Box>
      <Card sx={{ p: 3, width: '100%' }}>
        <Typography variant="h5" paragraph>
          Dados Essenciais
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure as informações básicas e controles do cliente
        </Typography>

        <Stack spacing={4}>
          {/* Informações Editáveis */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Informações Editáveis
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }}>
                <TextField
                  fullWidth
                  label="Nome do Cliente"
                  placeholder="Digite o nome do cliente"
                  value={nomeCliente}
                  onChange={event => changeNomeCliente(event)}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Número WhatsApp"
                  placeholder="Digite o número do WhatsApp"
                  value={numero}
                  onChange={event => changeNumero(event)}
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Canais */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Canais
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }}>
              <TextField
                fullWidth
                disabled
                value={currentUser?.channels?.use || 0}
                variant="outlined"
                helperText="Em uso"
              />
              <TextField
                fullWidth
                disabled
                value={currentUser?.channels?.free || 0}
                variant="outlined"
                helperText="Grátis"
              />
              <TextField
                fullWidth
                disabled
                value={currentUser?.channels?.paid || 0}
                variant="outlined"
                helperText="Pagos"
              />
              <TextField
                fullWidth
                disabled
                value={currentUser?.channels?.limit || 0}
                variant="outlined"
                helperText="Limite"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Créditos de IA */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Créditos de IA
            </Typography>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Uso por categoria
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }}>
                <TextField
                  fullWidth
                  disabled
                  value={currentUser?.credits?.uso?.automations || 0}
                  variant="outlined"
                  helperText="Automações"
                />
                <TextField
                  fullWidth
                  disabled
                  value={currentUser?.credits?.uso?.agents || 0}
                  variant="outlined"
                  helperText="Agentes"
                />
                <TextField
                  fullWidth
                  disabled
                  value={currentUser?.credits?.uso?.copilot || 0}
                  variant="outlined"
                  helperText="Copilot"
                />
                <TextField
                  fullWidth
                  disabled
                  value={currentUser?.credits?.uso?.voice || 0}
                  variant="outlined"
                  helperText="Voz"
                />
                <TextField
                  fullWidth
                  disabled
                  value={currentUser?.credits?.uso?.chats || 0}
                  variant="outlined"
                  helperText="Chats"
                />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Totais
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }}>
                <TextField
                  fullWidth
                  disabled
                  value={currentUser?.credits?.total?.use || 0}
                  variant="outlined"
                  helperText="Total utilizado"
                />
                <TextField
                  fullWidth
                  disabled
                  value={currentUser?.credits?.total?.limit || 0}
                  variant="outlined"
                  helperText="Limite de créditos"
                />
                <TextField
                  fullWidth
                  disabled
                  value={currentUser?.credits?.total?.credits_add || 0}
                  variant="outlined"
                  helperText="Créditos adicionais"
                />
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Usuários */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Usuários
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }}>
              <TextField
                fullWidth
                disabled
                value={currentUser?.users?.use || 0}
                variant="outlined"
                helperText="Em uso"
              />
              <TextField
                fullWidth
                disabled
                value={currentUser?.users?.free || 0}
                variant="outlined"
                helperText="Grátis"
              />
              <TextField
                fullWidth
                disabled
                value={currentUser?.users?.limit || 0}
                variant="outlined"
                helperText="Limite"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Controles */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Controles do Sistema
            </Typography>
            <Box sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'grey.50'
            }}>
              <FormControlLabel
                value="start"
                label="Sentinela"
                labelPlacement="start"
                control={
                  <Switch
                    onChange={event => changeIsSentinela(event)}
                    checked={isSentinela}
                    color="primary"
                  />
                }
                sx={{
                  justifyContent: 'space-between',
                  width: '100%',
                  m: 0
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Ativa o sistema de monitoramento automático do WhatsApp
              </Typography>
            </Box>

            <Box sx={{
              mt: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'grey.50'
            }}>
              <FormControlLabel
                value="start"
                label="Cliente inadimplente"
                labelPlacement="start"
                control={
                  <Switch
                    onChange={(event) => {
                      const checked = event.target.checked;
                      if (submitInadimplencia) submitInadimplencia(checked, inadimplenciaMensagem);
                    }}
                    checked={!!inadimplenciaAtivo}
                    color="secondary"
                  />
                }
                sx={{
                  justifyContent: 'space-between',
                  width: '100%',
                  m: 0
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Quando ativo, exibe banner de aviso no topo do sistema para todos os usuários deste cliente
              </Typography>
              {inadimplenciaAtivo && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <TextField
                    label="Mensagem exibida (opcional)"
                    multiline
                    rows={2}
                    value={inadimplenciaMensagem || ''}
                    onChange={(e) => changeInadimplenciaMensagem && changeInadimplenciaMensagem(e.target.value)}
                    placeholder="Ex.: Fatura em aberto. Entre em contato com o suporte para regularizar."
                    fullWidth
                  />
                  <LoadingButton
                    type="button"
                    onClick={() => submitInadimplencia && submitInadimplencia(true, inadimplenciaMensagem)}
                    loading={inadimplenciaLoading}
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Salvar mensagem
                  </LoadingButton>
                </Stack>
              )}
            </Box>
          </Box>

          {/* Botão de Salvar */}
          <Box sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Clique em "Salvar" para aplicar as alterações nos dados essenciais
              </Typography>
            </Box>
            <LoadingButton
              onClick={submitDadosEssenciais}
              type="submit"
              loading={isLoading}
              variant="contained"
              sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'green.dark' } }}
            >
              Salvar Dados Essenciais
            </LoadingButton>
          </Box>
        </Stack>
      </Card>

      <Card sx={{ p: 3, width: '100%', mt: 2 }}>
        <Typography variant="h5" paragraph>
          Features
        </Typography>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Gerencie as funcionalidades disponíveis para este cliente. Selecione uma feature da lista abaixo para adicioná-la.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Selecione uma feature</InputLabel>
              <Select
                value={featureSelecionada}
                onChange={handleChangeFeatureSelecionada}
                label="Selecione uma feature"
              >
                {Object.keys(featuresPorCategoria).map((categoria) => {
                  const featuresDaCategoria = featuresPorCategoria[categoria].filter(feature =>
                    !features.includes(feature.value)
                  );

                  if (featuresDaCategoria.length === 0) return null;

                  return [
                    <MenuItem key={`header-${categoria}`} disabled>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {categoria}
                      </Typography>
                    </MenuItem>,
                    ...featuresDaCategoria.map((feature) => (
                      <MenuItem key={feature.value} value={feature.value} sx={{ pl: 3 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {feature.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {feature.value}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ];
                }).flat()}
              </Select>
            </FormControl>
            <LoadingButton
              variant="contained"
              onClick={handleAdicionarFeature}
              disabled={!featureSelecionada}
              startIcon={<AddIcon />}
            >
              Adicionar
            </LoadingButton>
          </Stack>

          {features.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                Features Ativas ({features.length})
              </Typography>

              {/* Agrupa features por categoria */}
              {Object.keys(featuresPorCategoria).map((categoria) => {
                const featuresAtivasDaCategoria = features.filter(featureValue =>
                  featuresPorCategoria[categoria].some(f => f.value === featureValue)
                );

                if (featuresAtivasDaCategoria.length === 0) return null;

                return (
                  <Box key={categoria} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                      {categoria}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {featuresAtivasDaCategoria.map((featureValue, index) => {
                        const featureInfo = featuresWithCategories.find(f => f.value === featureValue);
                        return (
                          <Chip
                            key={index}
                            label={featureInfo ? featureInfo.name : featureValue}
                            onDelete={() => handleRemoverFeature(featureValue)}
                            deleteIcon={<CloseIcon />}
                            color="primary"
                            variant="filled"
                            sx={{ mb: 1 }}
                            title={`${featureInfo?.name || featureValue} - ${featureValue}`}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          )}

          {features.length === 0 && (
            <Box sx={{
              p: 3,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'grey.50'
            }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                📋 Nenhuma feature adicionada
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecione uma feature da lista acima para começar
              </Typography>
            </Box>
          )}

          {featuresDisponiveis.length === 0 && features.length > 0 && (
            <Box sx={{
              p: 3,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'success.main',
              borderRadius: 2,
              bgcolor: 'success.lighter'
            }}>
              <Typography variant="body1" color="success.main" sx={{ mb: 1 }}>
                ✅ Todas as features disponíveis foram adicionadas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este cliente tem acesso a todas as funcionalidades disponíveis
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              onClick={async () => {
                try {
                  await handleEditarCliente({ features: features }, 'editar_features');
                  enqueueSnackbar('Features salvas com sucesso!', { variant: 'success' });
                } catch (error) {
                  enqueueSnackbar('Erro ao salvar features', { variant: 'error' });
                }
              }}
              sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'green.dark' } }}
              variant="contained"
              disabled={features.length === 0}
            >
              Salvar Features
            </LoadingButton>
          </Box>
        </Stack>
      </Card>

      <Card sx={{ p: 2, width: '100%', mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Serviços
        </Typography>

        <Grid container spacing={2}>
          {/* <Grid item xs={12}>
            <TextField
              select
              label="Plano"
              fullWidth
              size="small"
              value={planoSelecionado}
              onChange={(e) => changePlanoSelecionado(e.target.value)}
              SelectProps={{
                native: true
              }}
            >
              <option value="">Selecione um plano</option>
              {dadosPlanos?.data?.planos
                ?.filter(plano => plano.type === 'plan')
                .map((plano) => (
                  <option key={plano._id} value={plano._id}>
                    {plano.name} - R$ {plano.regular_price}/mês
                    {plano.params?.numberUsers && ` (${plano.params.numberUsers} usuários)`}
                    {plano.params?.numberChannelsWhatsapp && ` (${plano.params.numberChannelsWhatsapp} canais)`}
                  </option>
                ))}
            </TextField>
          </Grid> */}

          <Grid item xs={8}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Serviços Disponíveis
            </Typography>

            <Stack spacing={1}>
              {dadosPlanos?.data?.adicionais
                ?.filter(addon => addon.type === 'addon')
                .map((addon) => (
                  <Box
                    key={addon._id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {addon.name}
                      </Typography>

                    </Box>
                    <LoadingButton
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdicionarAoCarrinho(addon)}
                      startIcon={<AddIcon />}
                    >
                      Adicionar
                    </LoadingButton>
                  </Box>
                ))}
            </Stack>
          </Grid>

          <Grid item xs={4}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Carrinho
            </Typography>

            <Stack spacing={3}>
              {addonsSelecionados.map((item) => {
                const servicoCompleto = getServicoCompleto(item.id);
                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                          {servicoCompleto?.name || item.nome}
                        </Typography>
                        {servicoCompleto?.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                            {servicoCompleto.description}
                          </Typography>
                        )}
                      </Box>

                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        onClick={() => handleRemoverDoCarrinho(item.id)}
                        sx={{ minWidth: 24, height: 24 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </LoadingButton>

                      <Typography variant="caption" sx={{ px: 1, fontWeight: 'medium' }}>
                        {item.quantidade}
                      </Typography>

                      <LoadingButton
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          if (servicoCompleto) {
                            handleAdicionarAoCarrinho(servicoCompleto);
                          }
                        }}
                        sx={{ minWidth: 24, height: 24 }}
                      >
                        <AddIcon fontSize="small" />
                      </LoadingButton>
                    </Box>
                  </Box>
                );
              })}

              {addonsSelecionados.length > 0 && (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    label="Desconto (R$)"
                    type="number"
                    value={desconto}
                    onChange={handleDescontoChange}
                    inputProps={{
                      min: 0,
                      step: 0.01
                    }}
                  />

                  <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal:</span>
                        <span>R$ {(subtotalCarrinho || 0).toFixed(2)}/mês</span>
                      </Typography>

                      {desconto > 0 && (
                        <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                          <span>Desconto ({desconto}%):</span>
                          <span>- R$ {(valorDesconto || 0).toFixed(2)}/mês</span>
                        </Typography>
                      )}

                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5, borderTop: '1px dashed', borderColor: 'divider', fontWeight: 'medium' }}>
                        <span>Total:</span>
                        <span>R$ {(totalComDesconto || 0).toFixed(2)}/mês</span>
                      </Typography>
                    </Stack>
                  </Box>
                </>
              )}

              {addonsSelecionados.length === 0 && (
                <Box sx={{ p: 1.5, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="caption">
                    Nenhum serviço adicionado
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <LoadingButton onClick={() => {
                const ids = addonsSelecionados.map(item => item.id);
                console.log(ids);
                handleEditarCliente({ "billing.services": ids }, 'editar_addons');
                console.log(addonsSelecionados);
              }} type="submit" variant="contained" size="small">
                Salvar Configurações
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </Card>


    </Box>
  );
}
