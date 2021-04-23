import * as http from 'http';
import config from 'dos-config';

import createGithub from './services/github';
import createTwitter from './services/twitter';

const PORT = 8000;

const isRepo = (name: string): boolean => 
  config.repo === name;

const isBranch = (ref: string): boolean =>
  ref === `refs/heads/${config.branch}`;

const getTwitterStatus = (title: string) => `New blog post: ${title} in https://til.vercel.app/`;

// Init services
Promise.all([
  createGithub(config.github),
  createTwitter(config.twitter)
]).then(
  ([github, twitter]) => {
    const server = http.createServer((req, res) => {
      const { method, url } = req;
      console.log(`url is ${url}`);
    
      let bodyChunk: Uint8Array[] = [];
      req.on('error', () => {
        res.end({"message" : "BAD REQUEST"});
      }).on('data', (chunk) => {
        bodyChunk.push(chunk);
      }).on('end', () => {
        const body = Buffer.concat(bodyChunk).toString();
        if (method === 'POST') {
          try {
            const { head_commit, repository: { name }, ref } = JSON.parse(body);
    
            // Check for target repo and branch
            if (isRepo(name) && isBranch(ref)) {
              // Only affect added files
              const res = head_commit.added.filter((f: string) => f.includes(`${config.folder}/`));
              Promise.all(
                res.map(async (p: string) => await github.getPost(name, ref, p))
              ).then((contents) => {
                // Get only first lines
                const titles = (<string[]>contents).map(s => s.split('\n')[0]);
                Promise.all(
                  titles.map(async t => {
                    twitter.tweet(getTwitterStatus(t));
                  })
                ).then(() => {
                  console.log('Tweets made');
                });
              })
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

  });

