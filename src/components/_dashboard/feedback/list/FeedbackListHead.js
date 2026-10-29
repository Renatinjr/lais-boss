import { Icon } from '@iconify/react';
import { visuallyHidden } from '@mui/utils';
import PropTypes from 'prop-types';
// material
import { TableSortLabel, TableRow, TableCell, TableHead, Box, Checkbox } from '@mui/material';

// ----------------------------------------------------------------------

const visuallyHiddenHidden = (hidden) => (hidden ? visuallyHidden : {});

FeedbackListHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number
};

export default function FeedbackListHead({
  order,
  orderBy,
  headLabel,
  onRequestSort,
  onSelectAllClick,
  rowCount,
  numSelected
}) {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onRequestSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHiddenHidden() }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
