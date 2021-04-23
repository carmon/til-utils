declare module 'dos-config' {
  interface Config {
    repo: string;
    branch: string;
    folder: string;

    github: {
      appId: number;
      clientId: string;
      clientSecret: string;
      certBase64: string;
      installationId: number;
      owner: string;
    }

    twitter: {
      consumer: {
        key: string;
        secret: string;
      },
      access_token: {
        key: string;
        secret: string;
      }
    }
  }
  const config: Config;
  export default config;
} 