export type GithubAppConfig = {
  id: number;
  certBase64: string;
}

export type GithubService = {
  createCommit: (path: string, parent: string, tree: string) => Promise<string>;
  createFile: (content: string) => Promise<string>;
  createPR: (head: string, base: string) => Promise<GithubPR>;
  createRef: (branch: string, sha: string) => Promise<string>;
  createTree: (path: string, blobSha: string, baseSha: string) => Promise<string>;
  getBlobText: (branch: string, path: string) => Promise<string>;
  getFileDate: (branch: string, path: string) => Promise<string>;
  getPR: (head: string, base: string) => Promise<GithubPR | null>;
  getRef: (branch: string) => Promise<string>;
  updateRef: (branch: string, sha: string) => Promise<void>;
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

export type BlogConfig = {
  datesFile: string;
  editing: string;
  postsFormat: string;
  production: string;
}