import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
// material
import {
  Box,
  OutlinedInput,
  InputAdornment,
  Toolbar,
  Typography
} from '@mui/material';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'user_id', label: 'Usuário', alignRight: false },
  { id: 'agent_id', label: 'Agente', alignRight: false },
  { id: 'feedback_type', label: 'Tipo', alignRight: false },
  { id: 'priority', label: 'Prioridade', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'date', label: 'Data', alignRight: false },
  { id: '' }
];

FeedbackListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func
};

export default function FeedbackListToolbar({ numSelected, filterName, onFilterName }) {
  return (
    <Toolbar
      sx={{
        p: 0,
        pl: 1,
        pr: 1,
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter'
        })
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selecionado(s)
        </Typography>
      ) : (
        <Box sx={{ flexGrow: 1 }} />
      )}

      <OutlinedInput
        value={filterName}
        onChange={onFilterName}
        placeholder="Buscar feedbacks..."
        startAdornment={
          <InputAdornment position="start">
            <Icon icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
          </InputAdornment>
        }
        sx={{ width: { xs: 1, sm: 240 } }}
      />
    </Toolbar>
  );
}
