'use client';

import PropTypes from 'prop-types';
// hooks
import useAuth from '../hooks/useAuth';
// pages
import Login from '../views/authentication/Login';

// ----------------------------------------------------------------------

AuthGuard.propTypes = {
  children: PropTypes.node
};

// Login renders in place at the requested URL, so once authenticated the page is already where the user wanted to go.
export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}
