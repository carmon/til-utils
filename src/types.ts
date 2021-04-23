export type GithubAppConfig = {
  appId: number;
  clientId: string;
  clientSecret: string;
  certBase64: string;
  installationId: number;
  owner: string;
}

export type TwitterConfig = {
  consumer: {
    key: string;
    secret: string;
  },
  access_token: {
    key: string;
    secret: string;
  }
}