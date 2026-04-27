export {};

declare global {
  interface Window {
    ytcfg?: Record<string, any>;
  }
}

export const credentialsRetrieverMessage = 'YT_CFG_CREDENTIALS_DATA';
export const credentialSchema = {
  eomData: '',
  clientVersion: '',
  userAgent: '',
};
export type Credentials = typeof credentialSchema;
export type Message = {
  type: string;
  credentials: Credentials;
};
