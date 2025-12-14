// @mui
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function shadows(mode = 'light') {
  const baseColor =
    mode === 'light'
      ? '#919EAB' // grey[500]
      : '#000000'; // dark shadow

  const transparent1 = alpha(baseColor, 0.2);
  const transparent2 = alpha(baseColor, 0.14);
  const transparent3 = alpha(baseColor, 0.12);

  return [
    'none',
    `0px 2px 1px -1px ${transparent1},0px 1px 1px 0px ${transparent2},0px 1px 3px 0px ${transparent3}`,
    `0px 3px 1px -2px ${transparent1},0px 2px 2px 0px ${transparent2},0px 1px 5px 0px ${transparent3}`,
    `0px 3px 3px -2px ${transparent1},0px 3px 4px 0px ${transparent2},0px 1px 8px 0px ${transparent3}`,
    `0px 2px 4px -1px ${transparent1},0px 4px 5px 0px ${transparent2},0px 1px 10px 0px ${transparent3}`,
    `0px 3px 5px -1px ${transparent1},0px 5px 8px 0px ${transparent2},0px 1px 14px 0px ${transparent3}`,
    ...Array(19).fill(
      `0px 6px 10px ${transparent1}`
    ),
  ];
}
