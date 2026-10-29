import { isActivePath } from 'src/routes/utils';

// ----------------------------------------------------------------------

export { default as NavSectionVertical } from './vertical';
export { default as NavSectionHorizontal } from './horizontal';

export function isExternalLink(path) {
  return path.includes('http');
}

export function getActive(path, pathname) {
  return path ? isActivePath(path, pathname) : false;
}
