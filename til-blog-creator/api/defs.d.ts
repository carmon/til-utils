declare module 'dos-config' {
    interface Config {
        oauthId: string;
        oauthSecret: string;
    }
    const config: Config;
    export default config;
} 