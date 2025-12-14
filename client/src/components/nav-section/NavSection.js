import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, List, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { StyledNavItem, StyledNavItemIcon } from './styles';

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item }) {
  const theme = useTheme();
  const { title, path, icon, info } = item;

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        color: theme.palette.text.secondary,

        '& .MuiListItemIcon-root': {
          color: 'inherit',
        },

        '&.active': {
          color: theme.palette.text.primary,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.action.selected
              : theme.palette.action.selected,
          fontWeight: theme.typography.fontWeightBold,

          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
          },
        },

        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />

      {info && info}
    </StyledNavItem>
  );
}
