import * as http from 'http';
import config from 'dos-config';
import minimatch from 'minimatch';

import { GithubService, TwitterService } from './types';

const PORT = 8000;

// const getTwitterStatus = (title: string) => `New blog post: ${title} in https://til.vercel.app/`;

// TODO: dates.json as hash map
const getFilename = (p: string): string =>
  p.substring(p.lastIndexOf('/') + 1);

export default (github: GithubService, _: TwitterService) => {
  const server = http.createServer((req, res) => {
    const { method, url } = req;
    console.log(`url is ${url}`);
  
    let bodyChunk: Uint8Array[] = [];
    req.on('error', () => {
      res.end({"message" : "BAD REQUEST"});
    }).on('data', (chunk) => {
      bodyChunk.push(chunk);
    }).on('end', async () => {
      const body = Buffer.concat(bodyChunk).toString();
      if (method === 'POST') {
        try {
          const { head_commit, repository: { name: repo }, ref } = JSON.parse(body);

          const { watch } = config;  
          if (ref === `refs/heads/${watch.branch}`) {
            const { branch, datesFile, postsFormat, prFrom } = watch;
            // Look for added files to target folder 
            const { added } = head_commit;
            const posts = (added as string[]).filter(path => minimatch(path, postsFormat));
            if (posts.length) {
              // Get source branch ref
              const sourceRefSha = await github.getRef(repo, branch);
              
              // Reduce all added posts to date strings (ISO-8601, see https://docs.github.com/en/graphql/reference/scalars#datetime)
              const dates = (await Promise.all(
                posts.map(async path => ({ [getFilename(path)]: await github.getFileDate(repo, branch, path) }))
              )).reduce((p, c) => ({ ...p, ...c }));

              // Get dates.json from branch
              const json = await github.getBlobText(repo, branch, datesFile);
              
              // Merged dates object
              const obj = { ...JSON.parse(json), ...dates };
              
              // Create blob, tree and commit
              const blobSha = await github.createFile(repo, JSON.stringify(obj));
              const treeSha = await github.createTree(repo, datesFile, blobSha, sourceRefSha);
              const commitSha = await github.createCommit(
                repo, 
                `${datesFile} after ${posts.length > 1 
                  ? posts.slice(0, posts.length - 1).join(', ') + ' and ' + posts[posts.length - 1]
                  : posts[0]
                }.`.replace('\n', ' '), 
                sourceRefSha,
                treeSha
              );
              
              // Add commit to ref and create a PR
              await github.updateRef(repo, prFrom, commitSha);
              await github.createPR(repo, prFrom, branch);
            }            
          }
        } catch (e) {
          res.writeHead(400);
          res.end("{\"message\" : \"BAD REQUEST\"}");
        }
      }
  
      res.end('Gracias!')
    });
  })
  
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}