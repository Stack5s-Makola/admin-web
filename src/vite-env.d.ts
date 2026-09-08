/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEV_FAKE_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
