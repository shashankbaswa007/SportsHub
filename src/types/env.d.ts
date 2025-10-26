declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_ADMIN_ID: string;
    NEXT_PUBLIC_DEFAULT_USER_PASSWORD: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}