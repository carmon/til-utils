import { githubAppJwt } from "universal-github-app-jwt";
import { request } from "@octokit/request";
import { GithubAppConfig, GithubOAuthService, GithubService } from '../types';

const atob = (s: string) => Buffer.from(s, 'base64').toString();
const btoa = (s: string) => Buffer.from(s).toString('base64');

const getBotToken = async (repo: string, installation_id: number, token: string) => {
  const { data: { token: userToken } } = await request(
    `POST /app/installations/${installation_id}/access_tokens`, 
    {
      headers: { authorization: `bearer ${token}` }, 
      data: { repositories: [repo] }
    }) as any;
  return userToken;
};

const getUserToken = async (client_id: string, client_secret: string, code: string) => {
  const res = await request(
    `POST https://github.com/login/oauth/access_token`, 
    { 
      data: { 
        client_id,
        client_secret,
        code
      }
    }) as any;
  return res.data.access_token;
};

export const createOAuthApp = async (
  clientId: string,
  clientSecret: string,
  code: string
): Promise<GithubOAuthService> => {
  const userToken = await getUserToken(clientId, clientSecret, code);
  
  

  return {
    generateBlogRepo: async (name: string) => {
      try {
        const { data, status } = await request(
          `POST /repos/carmon/til-template/generate`,
          {
            headers: {
              Accept: 'application/vnd.github.baptiste-preview+json', // needed while endpoint is still in preview
              authorization: `bearer ${userToken}`
            }, 
            data: { 
              name,
              description: 'A static blog created with til-utils.'
            }
          }
        );
        console.log(data);
        return status === 201;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
    getOwner: async () => {
      const { data: { login: owner } } = await request(
        `GET https://api.github.com/user`,
        {
          headers: {
            authorization: `bearer ${userToken}`
          }
        }
      )
      return owner;
    }
  };
};

export default async (
    config: GithubAppConfig,
    fullRepoName: string,
    installationId: number,
): Promise<GithubService> => {
  const { certBase64, id } = config;
  const privateKey = atob(certBase64) || '';
  const { token } = await githubAppJwt({
    id,
    privateKey,
    // this bug is allegedly resolved in @octokit/app (see ghServer.ts),
    // is not solved in @octokit/auth-app (watching both)
    now: Math.floor(Date.now() / 1000) - 60, 
  });
  const [owner,repo] = fullRepoName.split('/');
  const botToken = await getBotToken(repo, installationId, token);

  return {
    createBlob: async (content: string) => {
      const { data: { sha } } = await request(
        `POST /repos/${fullRepoName}/git/blobs`,
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          data: { content }
        }
      )
      return sha;
    },
    createCommit: async (message: string, tree: string, parent?: string) => {
      const { data: { sha } } = await request(
        `POST /repos/${fullRepoName}/git/commits`,
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          data: { 
            message,
            parents: parent ? [parent] : [],
            tree
          }
        }
      )
      return sha;
    },
    createFile: async (path: string, content: string, message: string) => {
      const res = await request(
        `PUT /repos/${fullRepoName}/contents/${path}`,
        {
          headers: {
            authorization: `bearer ${botToken}`
          }, 
          data: { 
            content: btoa(content),
            message
          }
        }
      )
      console.log(res);
      return "";
    },
    createPR: async (head: string, base: string) => {
      const { data: { head: { sha }, number } } = await request(
        `POST /repos/${fullRepoName}/pulls`, 
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
    createRef: async (branch: string, commitSha: string) => {
      const { data: { object: { sha }} } = await request(
        `POST /repos/${fullRepoName}/git/refs`, 
        {
          headers: {
            authorization: `bearer ${botToken}`
          },
          ref: `refs/heads/${branch}`,
          sha: commitSha
      }) as any;
      return sha;
    },
    createTree: async (path: string, blobSha: string, baseSha?: string) => {
      const { data: { sha } } = await request(
        `POST /repos/${fullRepoName}/git/trees`,
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
    generateBlogRepo: async (owner: string, name: string) => {
      const res = await request(
        `POST /repos/carmon/til-template/generate`,
        {
          headers: {
            Accept: 'application/vnd.github.baptiste-preview+json', // needed while endpoint is still in preview
            authorization: `bearer ${botToken}`
          }, 
          data: {
            owner,
            name
          }
        }
      )
      console.log(res);
    },
    getBlobText: async (branch: string, path: string) => {
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
    getBranches: async () => {
      const res = await request(
        `GET /repos/${fullRepoName}/branches`,
        {
          headers: {
            authorization: `bearer ${botToken}`
          }
        }
      );
      console.log(res);
    },
    getFileDate: async (branch: string, path: string) => {
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
    getPR: async (head: string, base: string) => {
      const { data } = await request(
        `GET /repos/${fullRepoName}/pulls`, 
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
    getRef: async (branch: string) => {
      const { data: { object: { sha }} } = await request(
        `GET /repos/${fullRepoName}/git/ref/heads/${branch}`, 
        {
          headers: {
            authorization: `bearer ${botToken}`
          }
        }
      ) as any;
      return sha;
    },
    // getTree: async (branch: string) => {
    //   const { data } = await request(
    //     `GET /repos/${fullRepoName}/git/trees`, 
    //     {
    //       headers: {
    //         authorization: `bearer ${botToken}`
    //       }
    //     }
    //     ) as any;

    //   console.log(data);
    // },
    updateRef: async (branch: string, sha: string) => {
      const { data } = await request(
        `PATCH /repos/${fullRepoName}/git/refs/heads/${branch}`, 
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