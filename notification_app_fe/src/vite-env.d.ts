/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVALUATION_ACCESS_TOKEN: string;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
