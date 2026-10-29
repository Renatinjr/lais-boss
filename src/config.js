export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const cognitoConfig = {
  userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID,
  clientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID
};

export const auth0Config = {
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN
};

export const mapConfig = process.env.NEXT_PUBLIC_MAP_MAPBOX;

export const googleAnalyticsConfig = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const ICON = {
  NAVBAR_ITEM: 22,
  NAVBAR_ITEM_HORIZONTAL: 20,
};

export const NAVBAR = {
  BASE_WIDTH: 260,
  DASHBOARD_WIDTH: 280,
  DASHBOARD_COLLAPSE_WIDTH: 88,
  //
  DASHBOARD_ITEM_ROOT_HEIGHT: 48,
  DASHBOARD_ITEM_SUB_HEIGHT: 40,
  DASHBOARD_ITEM_HORIZONTAL_HEIGHT: 32,
};


export default {
  dev:false,
  //api_dev: 'https://lais.ngrok.app',
  api_dev:'http://localhost:2000',
  api_prod: 'https://api.lais.app',
  url: 'http://104.131.77.187:10001',
  //urlDev:'http://localhost:2000',
  urlDev:'https://api.zindi.com.br'
};


// urlDev:'http://143.244.158.76:3051'
// urlDev:'http://localhost:2000'