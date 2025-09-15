/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_AI_FEATURES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
