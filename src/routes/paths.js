// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  register: path(ROOTS_AUTH, '/register'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  verify: path(ROOTS_AUTH, '/verify')
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page404: '/404',
  page500: '/500',
  components: '/components'
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    app: path(ROOTS_DASHBOARD, '/clientes/clientes'),
    ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
    banking: path(ROOTS_DASHBOARD, '/banking'),
    booking: path(ROOTS_DASHBOARD, '/booking')
  },
  mail: {
    root: path(ROOTS_DASHBOARD, '/mail'),
    all: path(ROOTS_DASHBOARD, '/mail/all')
  },
  chat: {
    root: path(ROOTS_DASHBOARD, '/chat'),
    new: path(ROOTS_DASHBOARD, '/chat/new'),
    conversation: path(ROOTS_DASHBOARD, '/chat/:conversationKey')
  },
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  plataforma: {
    root: path(ROOTS_DASHBOARD, '/clientes'),
    profile: path(ROOTS_DASHBOARD, '/clientes/profile'),
    cards: path(ROOTS_DASHBOARD, '/clientes/cards'),
    clientes: path(ROOTS_DASHBOARD, '/clientes/clientes'),
    flow: path(ROOTS_DASHBOARD, '/clientes/flow'),
    users: path(ROOTS_DASHBOARD, '/clientes/list'),
    organizacoes: path(ROOTS_DASHBOARD, '/clientes/organizacoes'),
    chats: path(ROOTS_DASHBOARD, '/clientes/chats'),
    monitor: path(ROOTS_DASHBOARD, '/clientes/monitor'),
    newUser: path(ROOTS_DASHBOARD, '/clientes/new'),
    editById: path(ROOTS_DASHBOARD, `/clientes/reece-chung/edit`),
    account: path(ROOTS_DASHBOARD, '/clientes/account')
  },
  financeiro: {
    root: path(ROOTS_DASHBOARD, '/clientes/financeiro'),
    faturas: path(ROOTS_DASHBOARD, '/clientes/faturas'),
    transacoes: path(ROOTS_DASHBOARD, '/clientes/financeiro/transacoes'),
    contas: path(ROOTS_DASHBOARD, '/clientes/financeiro/contas'),
  },
  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    shop: path(ROOTS_DASHBOARD, '/e-commerce/shop'),
    product: path(ROOTS_DASHBOARD, '/e-commerce/product/:name'),
    productById: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-air-force-1-ndestrukt'),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    newProduct: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    editById: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-blazer-low-77-vintage/edit'),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
    invoice: path(ROOTS_DASHBOARD, '/e-commerce/invoice')
  },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    post: path(ROOTS_DASHBOARD, '/blog/post/:title'),
    postById: path(ROOTS_DASHBOARD, '/blog/post/apply-these-7-secret-techniques-to-improve-event'),
    newPost: path(ROOTS_DASHBOARD, '/blog/new-post')
  },
  relatorios: {
    root: path(ROOTS_DASHBOARD, '/relatorios'),
    usuariosAtivos: path(ROOTS_DASHBOARD, '/relatorios/usuarios-ativos'),
    usuariosAppOnline: path(ROOTS_DASHBOARD, '/relatorios/usuarios-app-online'),
    consumoCreditos: path(ROOTS_DASHBOARD, '/relatorios/consumo-creditos'),
    creditosIa: path(ROOTS_DASHBOARD, '/relatorios/creditos-ia'),
    feedbacks: path(ROOTS_DASHBOARD, '/relatorios/feedbacks')
  },
  ai: {
    fineTuning: path(ROOTS_DASHBOARD, '/ai/fine-tuning')
  },
  library: {
    templates: path(ROOTS_DASHBOARD, '/library/templates')
  }
};

export const PATH_DOCS = 'https://docs-minimals.vercel.app/introduction';
