// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Label from '../../components/Label';
import SvgIconStyle from '../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => (
  <SvgIconStyle src={`/static/icons/navbar/${name}.svg`} sx={{ width: '100%', height: '100%' }} />
);

const ICONS = {
  blog: getIcon('ic_blog'),
  cart: getIcon('ic_cart'),
  chat: getIcon('ic_chat'),
  mail: getIcon('ic_mail'),
  user: getIcon('ic_user'),
  kanban: getIcon('ic_kanban'),
  banking: getIcon('ic_banking'),
  calendar: getIcon('ic_calendar'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  booking: getIcon('ic_booking')
};

const sidebarConfig = [
  {
    subheader: 'Administrativo',
    items: [
      {
        title: 'FINANCEIRO',
        path: PATH_DASHBOARD.financeiro.root,
        icon: ICONS.banking,
        children: [
          { title: 'faturas', path: PATH_DASHBOARD.financeiro.faturas },
          { title: 'movimentações', path: PATH_DASHBOARD.financeiro.transacoes },
          { title: 'contas', path: PATH_DASHBOARD.financeiro.contas },
        ]
      },
    ]
  },
  {
    subheader: 'Gerência',
    items: [
      {
        title: 'plataforma',
        path: PATH_DASHBOARD.plataforma.root,
        icon: ICONS.user,
        children: [
          // { title: 'organizações', path: PATH_DASHBOARD.plataforma.organizacoes },
          { title: 'clientes', path: PATH_DASHBOARD.plataforma.clientes },
          { title: 'Comando', path: PATH_DASHBOARD.plataforma?.chats },
          { title: 'sentinela', path: PATH_DASHBOARD.plataforma?.monitor },
        ]
      },
      {
        title: 'relatórios',
        path: '/dashboard/relatorios',
        icon: ICONS.user,
        children: [
          { title: 'usuarios', path: '/dashboard/relatorios/usuarios-ativos' },
          { title: 'créditos IA', path: '/dashboard/relatorios/creditos-ia' },
        ]
      },
      {
        title: 'IA',
        path: PATH_DASHBOARD.ai.fineTuning,
        icon: ICONS.analytics,
        children: [
          { title: 'fine-tuning', path: PATH_DASHBOARD.ai.fineTuning },
        ]
      },
      {
        title: 'Biblioteca',
        path: PATH_DASHBOARD.library.templates,
        icon: ICONS.ecommerce,
        children: [
          { title: 'Templates', path: PATH_DASHBOARD.library.templates },
        ]
      },
      // {
      //   title: 'Aplicativo',
      //   path: '/dashboard/app/usuarios-online',
      //   icon: ICONS.user,
      //   children: [
      //     { title: 'Usuarios online', path: '/dashboard/app/usuarios-app-online' },
      //   ]
      // },
    ]
  },



];

export default sidebarConfig;
