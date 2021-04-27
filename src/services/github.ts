import { githubAppJwt } from "universal-github-app-jwt";
import { request } from "@octokit/request";
import { GithubAppConfig, GithubService } from '../types';

const decodeBase64 = (s: string) => Buffer.from(s, 'base64').toString();

const getBotToken = async (installation_id: number, token: string) => {
  const { data: { token: userToken } } = await request(
    `POST /app/installations/${installation_id}/access_tokens`, 
    {
      headers: {
        authorization: `bearer ${token}`
      }, 
      data: {
        installation_id,
        repositories: ['til']
      }
  }) as any;
  return userToken;
};

export default async (config: GithubAppConfig): Promise<GithubService> => {
  const { appId, certBase64, installationId, owner } = config;
  const privateKey = decodeBase64(certBase64) || '';

  const { token } = await githubAppJwt({
    id: appId,
    privateKey,
    // this bug is allegedly resolved in @octokit/app (see ghServer.ts),
    // is not solved in @octokit/auth-app (watching both)
    now: Math.floor(Date.now() / 1000) - 60, 
  });
  const botToken = await getBotToken(installationId, token);

  return {
    createCommit: async (repo: string, path: string, parent: string, tree: string) => {
      const { data: { sha } } = await request(
        `POST /repos/${owner}/${repo}/git/commits`,
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          data: { 
            message: `Publish ${path}`,
            parents: [parent],
            tree
          }
        }
      )
      return sha;
    },
    createFile: async (repo: string, content: string) => {
      const { data: { sha } } = await request(
        `POST /repos/${owner}/${repo}/git/blobs`,
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          data: { content }
        }
      )
      return sha;
    },
    createPR: async (repo: string, head: string, base: string) => {
      const { data: { head: { sha }, number } } = await request(
        `POST /repos/${owner}/${repo}/pulls`, 
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          data: {
            head,
            base,
            title: 'Publish blog post' // To do, needs filepath
          }
      }) as any;
      return { number, sha };
    },
    createRef: async (repo: string, branch: string, commitSha: string) => {
      const { data: { object: { sha }} } = await request(
        `POST /repos/${owner}/${repo}/git/refs`, 
        {
          headers: {
            authorization: `bearer ${botToken}`
          },
          ref: `refs/heads/${branch}`,
          sha: commitSha
      }) as any;
      return sha;
    },
    createTree: async (repo: string, path: string, blobSha: string, baseSha: string) => {
      const { data: { sha } } = await request(
        `POST /repos/${owner}/${repo}/git/trees`,
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          data: {
            base_tree: baseSha,
            tree: [
              {
                path,
                mode: '100644',
                sha: blobSha,
                type: 'blob',
              }
            ]
          }
        }
      )
      return sha;
    },
    getBlobText: async (repo: string, branch: string, path: string) => {
      const { data: { data: { repository: { object: { text } } } } } = await request("POST /graphql", {
        headers: {
          authorization: `token ${botToken}`,
        },
        query: `query($owner: String!, $repo: String!, $expression: String!) {
          repository(owner: $owner, name: $repo) {
            object(expression: $expression) {
              ... on Blob {
                text
              }
            }
          }
        }`,
        variables: {
          owner,
          repo,
          expression: `${branch}:${path}`
        },
      });
      return text as string;
    },
    getFileDate: async (repo: string, branch: string, path: string) => {
      const { data: { data: { repository: { object: { blame: { ranges } } } } } } = await request("POST /graphql", {
        headers: {
          authorization: `token ${botToken}`,
        },
        query: `query($owner: String!, $repo: String!, $branch: String!, $path: String!) {
          repository(owner: $owner, name: $repo) {
            object(expression: $branch) {
              ... on Commit {
                id
                blame(path: $path) {
                  ranges {
                    commit {
                      authoredDate
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: {
          owner,
          repo,
          branch,
          path
        },
      });
      return ranges.length ? ranges[0].commit.authoredDate : `No date found, does file exists in ${repo}:${branch}?` ;
    },
    getPR: async (repo: string, head: string, base: string) => {
      const { data } = await request(
        `GET /repos/${owner}/${repo}/pulls`, 
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          base,
          head,
          state: 'open'
      }) as any;

      if (data.length) {
        const { number, head: { sha }} = data[0];
        return { number, sha };
      }

      return null;
    },
    getRef: async (repo: string, branch: string) => {
      const { data: { object: { sha }} } = await request(
        `GET /repos/${owner}/${repo}/git/ref/heads/${branch}`, 
        {
          headers: {
            authorization: `bearer ${botToken}`
          }
        }
      ) as any;
      return sha;
    },
    // getTree: async (repo: string, branch: string) => {
    //   const { data } = await request(
    //     `GET /repos/${owner}/${repo}/git/trees`, 
    //     {
    //       headers: {
    //         authorization: `bearer ${botToken}`
    //       }
    //     }
    //     ) as any;

    //   console.log(data);
    // },
    updateRef: async (repo: string, branch: string, sha: string) => {
      const { data } = await request(
        `PATCH /repos/${owner}/${repo}/git/refs/heads/${branch}`, 
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          sha
      }) as any;

      console.log('updateRef');
      console.log(data);
    }
  };
}