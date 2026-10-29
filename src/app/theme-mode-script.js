// Runs in <head> before the client-only app mounts, so dark-mode users don't see a white page while it loads.
// Mirrors ThemeModeProvider: reads the stored mode (or the legacy settings.themeMode) and resolves "system".
export const themeModeScript = `(function () {
  try {
    var mode = JSON.parse(localStorage.getItem('themeMode'));
    if (!mode) mode = (JSON.parse(localStorage.getItem('settings')) || {}).themeMode;
    if (mode === 'system') mode = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (mode !== 'dark') mode = 'light';
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  } catch (e) {}
})();`;
