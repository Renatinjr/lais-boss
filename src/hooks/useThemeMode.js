import { useContext } from 'react';
import { ThemeModeContext } from '../contexts/ThemeModeContext';

// ----------------------------------------------------------------------

const useThemeMode = () => useContext(ThemeModeContext);

export default useThemeMode;
