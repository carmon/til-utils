declare module 'dos-config' {
  interface Config {
    port: number;
    
    githubApp: {
      id: number;
      certBase64: string;
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