import PropTypes from "prop-types";
import { TableHead, TableRow, TableCell, TableSortLabel } from "@mui/material";

export default function BorrowalListHead({
  order = "asc",
  orderBy = "",
  headLabel = [],
  onRequestSort = () => {}
}) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((head) => (
          <TableCell key={head.id}>
            <TableSortLabel
              active={orderBy === head.id}
              direction={orderBy === head.id ? order : "asc"}
              onClick={(e) => onRequestSort(e, head.id)}
            >
              {head.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

BorrowalListHead.propTypes = {
  order: PropTypes.string,
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  onRequestSort: PropTypes.func
};
