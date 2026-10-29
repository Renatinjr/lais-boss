/** @type {import('next').NextConfig} */
const nextConfig = {
  // the CRA app did not run in StrictMode; keep effects (API calls) single-invoked in dev
  reactStrictMode: false,
  async redirects() {
    // index routes that were <Navigate replace /> in react-router
    return [
      { source: '/', destination: '/dashboard/clientes/clientes', permanent: false },
      { source: '/dashboard', destination: '/dashboard/clientes/clientes', permanent: false },
      { source: '/dashboard/clientes', destination: '/dashboard/clientes/clientes', permanent: false },
      { source: '/dashboard/clientes/financeiro', destination: '/dashboard/clientes/financeiro/transacoes', permanent: false },
      { source: '/dashboard/relatorios', destination: '/dashboard/relatorios/usuarios-ativos', permanent: false }
    ];
  }
};

export default nextConfig;
