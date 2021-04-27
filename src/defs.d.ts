declare module 'dos-config' {
  interface Config {
    watch: {
      branch: string;
      postsFormat: string;
      prFrom: string;
      datesFile: string;
    }

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