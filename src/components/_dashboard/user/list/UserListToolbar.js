import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';
import trash2Fill from '@iconify/icons-eva/trash-2-fill';
import roundFilterList from '@iconify/icons-ic/round-filter-list';
// material
import { useTheme, styled } from '@mui/material/styles';
import { Box, Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  padding: theme.spacing(0, 1, 0, 3),
  gap: theme.spacing(2),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  height: 40,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  })
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  pod: PropTypes.string,
  listaServidores: PropTypes.array,
  changePod: PropTypes.func
};

export default function UserListToolbar({ numSelected, filterName, onFilterName, pod, listaServidores, changePod }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: isLight ? 'primary.main' : 'text.primary',
          bgcolor: isLight ? 'primary.lighter' : 'primary.dark'
        })
      }}
    >
      <SearchStyle
        value={filterName}
        onChange={onFilterName}
        placeholder="Pesquisar"
        startAdornment={
          <InputAdornment position="start">
            <Box component={Icon} icon={searchFill} sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        }
      />

      <FormControl sx={{ width: 300 }}>
        <InputLabel id="demo-multiple-name-label">POD</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          value={pod}
          size="small"
          onChange={changePod}
          input={<Select label="POD" />}
        //   MenuProps={MenuProps}
        >
         <MenuItem value="Todos">Todos</MenuItem>

          {listaServidores.map((name) => (
            <MenuItem
              key={name._id}
              value={name.pod}
            >
              {name.pod}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

    </RootStyle>
  );
}
