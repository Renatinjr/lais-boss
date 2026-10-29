import axios from "axios";
import Config from "../../../config";

const getBaseUrl = () => `${Config.dev ? Config.api_dev : Config.api_prod}/api`;

// Upload de arquivo de treinamento
export const uploadTrainingFile = (formData) => {
  return axios({
    method: "post",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/upload-file`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Criar job de fine-tuning
export const createFineTuningJob = (data) => {
  return axios({
    method: "post",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/jobs`,
    data
  });
};

// Listar jobs de fine-tuning
export const listFineTuningJobs = (limit = 20) => {
  return axios({
    method: "get",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/jobs`,
    params: {
      limit
    }
  });
};

// Buscar job específico
export const getFineTuningJob = (jobId) => {
  return axios({
    method: "get",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/jobs/${jobId}`
  });
};

// Listar eventos de um job
export const listFineTuningEvents = (jobId) => {
  return axios({
    method: "get",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/jobs/${jobId}/events`
  });
};

// Cancelar job
export const cancelFineTuningJob = (jobId) => {
  return axios({
    method: "post",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/jobs/${jobId}/cancel`
  });
};

// Listar modelos fine-tunados
export const listFineTunedModels = () => {
  return axios({
    method: "get",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/models`
  });
};

// Deletar modelo fine-tunado
export const deleteFineTunedModel = (modelId) => {
  return axios({
    method: "delete",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/models/${modelId}`
  });
};

// Listar arquivos de treinamento
export const listTrainingFiles = () => {
  return axios({
    method: "get",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/files`
  });
};

// Buscar arquivo específico
export const getTrainingFile = (fileId) => {
  return axios({
    method: "get",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/files/${fileId}`
  });
};

// Deletar arquivo
export const deleteTrainingFile = (fileId) => {
  return axios({
    method: "delete",
    url: `${getBaseUrl()}/v2/admin/ai/fine-tuning/files/${fileId}`
  });
};
