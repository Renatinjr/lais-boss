import axios from 'axios';
import Config from '../config';

// ----------------------------------------------------------------------

// Origins of our own APIs. The logged-in user's token is only ever sent to these.
const API_ORIGINS = [Config.api_prod, Config.api_dev, Config.urlDev, Config.url]
  .filter(Boolean)
  .map((url) => new URL(url).origin);

// Actions call the global axios directly, so the token is attached per request here
// (read from localStorage each time, so login/logout apply immediately).
// An Authorization header set explicitly by the caller is left untouched.
function attachAccessToken(config) {
  if (typeof window === 'undefined') {
    return config;
  }

  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken || config.headers.has('Authorization')) {
    return config;
  }

  const { origin } = new URL(axios.getUri(config), window.location.origin);
  if (API_ORIGINS.includes(origin)) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
}

axios.interceptors.request.use(attachAccessToken);

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(attachAccessToken);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;
