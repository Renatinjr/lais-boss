// Replacement for react-router's matchPath({ path, end: false }, pathname)
export function isActivePath(path, pathname) {
  if (!path || !pathname) return false;
  const base = path.replace(/\/+$/, '');
  return pathname === base || pathname.startsWith(`${base}/`);
}
