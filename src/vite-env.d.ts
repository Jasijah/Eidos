/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EIDOS_CONTEXT_MODEL_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
