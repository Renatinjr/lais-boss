import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Alert,
  Typography,
} from '@mui/material';
import v2_actionImportarContatos from 'src/actions/v2/clientes/v2_importarContatos';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { surface } from 'src/theme/modeColor';

export default function ModalImportarUsuarios({
  cliente,
  onClose,
  open,
  onCallback,
}) {
  const [csvFile, setCsvFile] = useState(null);
  const [replaceContacts, setReplaceContacts] = useState(false);
  const [linkChats, setLinkChats] = useState(false);
  const [ignoreErrors, setIgnoreErrors] = useState(false);
  const [erros, setErros] = useState([]);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setCsvFile(acceptedFiles[0]);
    }
  };

  const handleImportUsers = async () => {
    if (!csvFile) {
      toast.error('Por favor, selecione um arquivo CSV.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', csvFile);

    formData.append(
      'options',
      JSON.stringify({
        replace_contacts: replaceContacts,
        link_chats: linkChats,
        ignore_errors: ignoreErrors,
      })
    );

    try {
      const response = await v2_actionImportarContatos(cliente._id, formData);

      if (response.data.error) {
        setErros(response.data.message);
        setCsvFile(null);
      } else {
        toast.success('Usuários importados com sucesso!');
        onClose();
        setCsvFile(null);
        setErros([]);
        onCallback();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Erro ao importar usuários.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
  });


  const dropzoneStyle = {
    borderWidth: '2px',
    borderColor: '#888',
    borderRadius: '10px',
    marginTop: '20px',
    padding: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    color: '#555',
  };

  const dropzoneActiveStyle = {
    borderColor: '#4CAF50',
    backgroundColor: '#e0ffe0',
    color: '#333',
  };

  const dropzoneSelectedStyle = {
    backgroundColor: '#28a745',
    borderColor: '#218838',
    color: '#ffffff',
  };

  const currentDropzoneStyle = csvFile
    ? { ...dropzoneStyle, ...dropzoneSelectedStyle }
    : isDragActive
    ? { ...dropzoneStyle, ...dropzoneActiveStyle }
    : dropzoneStyle;

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        setCsvFile(null);
        setErros([]);
      }}
    >
      <DialogTitle>Importar Usuários</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Selecione o arquivo CSV contendo os dados dos usuários que você deseja
          importar.
        </DialogContentText>
        <Typography variant="body2" sx={{ p:3 , background: surface('#f9f9f9'), borderRadius:2 }}>
          Instruções:
          <ul>
            <li>O arquivo deve estar no formato CSV.</li>
            <li>Certifique-se de que o cabeçalho contenha as colunas</li>
            <li>Evite erros nos dados antes de realizar o upload.</li>
            <li>A coluna <strong>nivelAcesso</strong> deve ser: usuario, supervisao ou admin</li>
          </ul>
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          href="https://lais-app.s3.us-east-2.amazonaws.com/static/modelos/modelo_importar_usuarios.csv"
          target="_blank"
          rel="noopener noreferrer"
        >
          Baixar Modelo da Planilha
        </Button>
        <div {...getRootProps()} style={currentDropzoneStyle}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Solte o arquivo aqui...</p>
          ) : csvFile ? (
            <p>Arquivo selecionado: {csvFile.name}</p>
          ) : (
            <p>Arraste um arquivo ou clique aqui para selecionar!</p>
          )}
        </div>
        <Stack sx={{ mt: 2 }}>
          {erros.map((erro) => (
            <Alert severity="error" key={erro}>
              {erro}
            </Alert>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
            setCsvFile(null);
            setErros([]);
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleImportUsers}
          variant="contained"
          disabled={!csvFile}
          loading={loading}
        >
          Importar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
