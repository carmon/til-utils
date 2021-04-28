import * as http from 'http';
import config from 'dos-config';
import minimatch from 'minimatch';

import createGithub from './services/github';
import createTwitter from './services/twitter';

import handlePushToEditing from './push-to-editing';
import handlePushToProduction from './push-to-production';
import { BlogConfig } from './types';

const { port } = config;
http
  .createServer((req, res) => 
    {
      // Only listen for PUSH event webhooks
      if (req.method !== 'POST' && req.headers['X-GitHub-Event'] !== 'push') {
        res.end('Only PUSH events, gracias!')
        return;
      }

      let data = '';
      req
        .on('data', chunk => { data += chunk; })
        .on('end', async () => {
          try {
            const {
              head_commit,
              installation: { id: installationId }, 
              ref, 
              repository: { default_branch, full_name } 
            } = JSON.parse(data);

            const github = await createGithub(
              config.githubApp,
              full_name,
              installationId
            );

            // Get config.json from affected repo
            const cfgBlob = await github.getBlobText(default_branch, 'config.json');
            const blogConfig = JSON.parse(cfgBlob) as BlogConfig;

            // Look for added files to target folder
            const { added } = head_commit;
            const posts = (added as string[]).filter(path => minimatch(path, blogConfig.postsFormat));
            if (posts.length) {
              if (ref === `refs/heads/${blogConfig.editing}`) 
                await handlePushToEditing(github, blogConfig, posts);

              if (ref === `refs/heads/${blogConfig.production}`) {
                const twitter = await createTwitter(config.twitter)
                await handlePushToProduction(github, twitter, ref, posts);              
              }
            } else {
              console.log(`No posts found for repo ${full_name}.`);
            }            
          } catch (e) {
            console.log(e);
            res.writeHead(400);
            res.end(`{ "message" : "${e.message}"}`);
          }  
          res.end('Gracias!')
        })
        .on('error', () => { res.end({"message" : "BAD REQUEST"}); });
    }
  )
  .listen(
    port, 
    () => { console.log(`Server listening on port ${port}`); }
  );