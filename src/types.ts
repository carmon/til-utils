export type GithubAppConfig = {
  appId: number;
  clientId: string;
  clientSecret: string;
  certBase64: string;
  installationId: number;
  owner: string;
}

export type GithubService = {
  createCommit: (repo: string, path: string, parent: string, tree: string) => Promise<string>;
  createFile: (repo: string, content: string) => Promise<string>;
  createPR: (repo: string, head: string, base: string) => Promise<GithubPR>;
  createRef: (repo: string, branch: string, sha: string) => Promise<string>;
  createTree: (repo: string, path: string, blobSha: string, baseSha: string) => Promise<string>;
  getBlobText: (repo: string, branch: string, path: string) => Promise<string>;
  getFileDate: (repo: string, branch: string, path: string) => Promise<string>;
  getPR: (repo: string, head: string, base: string) => Promise<GithubPR | null>;
  getRef: (repo: string, branch: string) => Promise<string>;
  updateRef: (repo: string, branch: string, sha: string) => Promise<void>;
};

export type GithubPR = {
  number: number;
  sha: string;
};

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

export type TwitterService = {
  tweet: (status: string) => Promise<any>; // TODO: type this properly
}