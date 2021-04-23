import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { GithubAppConfig } from '../types';

const decodeBase64 = (s: string) => Buffer.from(s, 'base64').toString();

export default async (config: GithubAppConfig) => {
  const { appId, clientId, clientSecret, certBase64 } = config;
  const privateKey = decodeBase64(certBase64) || '';

  const auth = createAppAuth({
      appId,
      privateKey,
      clientId,
      clientSecret,
  });
  await auth({ type: 'app' });

  const octokit = new Octokit();

  return {
    getPost: async (repo: string, branch: string, path: string) => {
      const { owner } = config;
      const { data } = await octokit.repos.getContent({
          owner,
          path,
          ref: branch,
          repo,
      });
      // this is gross but I'm tired of discussing it with TypeScript
      if ("content" in data) {
        console.log(data.content);
        return decodeBase64(data.content);
      }
      
      return 'Error: no content found in file.';
    },
  };
}