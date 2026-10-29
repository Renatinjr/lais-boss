import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
import MainLayout from '../layouts/main';
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// guards
import GuestGuard from '../guards/GuestGuard';
import AuthGuard from '../guards/AuthGuard';
// import RoleBasedGuard from '../guards/RoleBasedGuard';
// components
import LoadingScreen from '../components/LoadingScreen';
import RelatoriosUsuariosAtivos from 'src/pages/dashboard/RelatoriosUsuariosAtivos';
import UsuariosAppOnline from 'src/pages/dashboard/UsuariosAppOnline';
import Chat from 'src/pages/dashboard/Chat';
import Monitor from 'src/pages/dashboard/Monitor';
import Canais from 'src/pages/dashboard/Canais';
import Extrato from 'src/pages/dashboard/Extrato';
import Organizacoes from 'src/pages/dashboard/Organizacoes';
import RelatorioConsumoTokens from 'src/pages/dashboard/RelatorioConsumoTokens';
import RelatorioCreditosIa from 'src/pages/dashboard/RelatorioCreditosIa';
import AgentsFeedback from 'src/pages/dashboard/AgentsFeedback';
import FineTuning from 'src/pages/dashboard/FineTuning';
import TemplatesLibrary from 'src/pages/dashboard/TemplatesLibrary';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();
  const isDashboard = pathname.includes('/dashboard');

  return (
    <Suspense
      fallback={
        <LoadingScreen
          sx={{
            ...(!isDashboard && {
              top: 0,
              left: 0,
              width: 1,
              zIndex: 9999,
              position: 'fixed'
            })
          }}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          )
        },
        { path: 'login-unprotected', element: <Login /> },
      ]
    },

    // Dashboard Routes
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { path: '', element: <Navigate to="clientes/clientes" replace /> },
        { path: 'app', element: <GeneralApp /> },
        {
          path: 'clientes',
          children: [
            { path: '', element: <Navigate to="clientes" replace /> },
            { path: 'list', element: <UserList /> },
            { path: 'clientes', element: <Canais /> },
            { path: 'organizacoes', element: <Organizacoes /> },
            { path: 'canais', element: <Canais /> },
            { path: 'chats', element: <Chat /> },
            { path: 'faturas', element: <Faturas /> },
            { path: 'financeiro', element: <Navigate to="financeiro/transacoes" replace /> },
            { path: 'financeiro/transacoes', element: <FinancialTransactions /> },
            { path: 'financeiro/contas', element: <FinancialAccounts /> },
            { path: 'extrato', element: <Extrato /> },
            { path: 'monitor', element: <Monitor /> },
            { path: 'flow', element: <FlowList /> },
            { path: ':name/editar', element: <ClientCreate /> },
            { path: 'cliente/conta', element: <UserAccount /> }
          ]
        },
        {
          path: 'relatorios',
          children: [
            { path: '', element: <Navigate to="usuarios-ativos" replace /> },
            { path: 'usuarios-ativos', element: <RelatoriosUsuariosAtivos /> },
            { path: 'usuarios-app-online', element: <UsuariosAppOnline /> },
            { path: 'consumo-creditos', element: <RelatorioConsumoTokens /> },
            { path: 'creditos-ia', element: <RelatorioCreditosIa /> },
            { path: 'feedbacks', element: <AgentsFeedback /> },
            { path: 'creditos-ia', element: <RelatorioCreditosIa /> },
          ]
        },
        {
          path: 'ai',
          children: [
            { path: 'fine-tuning', element: <FineTuning /> }
          ]
        },
        {
          path: 'library',
          children: [
            { path: 'templates', element: <TemplatesLibrary /> }
          ]
        },
      ]
    },

    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> }
      ]
    },
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { path: '/', element: <Navigate to="/dashboard/clientes/clientes" replace /> },
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}

// IMPORT COMPONENTS

// Authentication
const Login = Loadable(lazy(() => import('../pages/authentication/Login')));
// Dashboard
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')));
const UserList = Loadable(lazy(() => import('../pages/dashboard/UserList')));

const FlowList = Loadable(lazy(() => import('../pages/dashboard/FlowList')));
const UserAccount = Loadable(lazy(() => import('../pages/dashboard/UserAccount')));
const ClientCreate = Loadable(lazy(() => import('../pages/dashboard/ClientCreate')));

const Page500 = Loadable(lazy(() => import('../pages/Page500')));
const NotFound = Loadable(lazy(() => import('../pages/Page404')));
const Faturas = Loadable(lazy(() => import('../pages/dashboard/Faturas')));
const FinancialTransactions = Loadable(lazy(() => import('../pages/dashboard/financial/FinancialTransactions')));
const FinancialAccounts = Loadable(lazy(() => import('../pages/dashboard/financial/FinancialAccounts')));
