export type GithubOAuthService = {
  generateBlogRepo: (name: string) => Promise<boolean>;
  getOwner: () => Promise<string>;
};