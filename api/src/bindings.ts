export interface Bindings {
  DB: D1Database;
  CACHE: KVNamespace;
  ENVIRONMENT: string;
  TURNSTILE_SECRET?: string;
  TURNSTILE_SITEKEY?: string;
  ADMIN_TOKEN?: string;
}

export interface Variables {
  ipHash: string;
  installId: string | null;
}
