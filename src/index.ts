import * as http from 'http';
import config from 'dos-config';
import minimatch from 'minimatch';

import createGithub/*, { createOAuthApp } */ from './services/github';
import createTwitter from './services/twitter';
// import authView from './views/authentication';
// import formView from './views/form';
// import createdView from './views/created';
// import failedView from './views/failed';

import handlePushToEditing from './push-to-editing';
import handlePushToProduction from './push-to-production';
import { BlogConfig } from './types';

const { port } = config;
http
  .createServer((req, res) => 
    {
      let data = '';
      req
        .on('data', chunk => { data += chunk; })
        .on('end', async () => {
          // if (req.url === '/auth') {
          //   res.writeHead(302);
          //   res.end(authView(config.oauthApp.clientId));
          //   return;
          // }

          // if (req.url?.includes('/oauth')) {
          //   const code = req.url.split('=')[1];
          //   res.writeHead(200);
          //   res.end(formView(code))
          //   return;
          // }

          // if(req.url?.includes('/create')) {
          //   const match = req.url.match(/\/create\?code=([\w.-]+)&name=([\w\@.-]+)/);
          //   if(match) {
          //     const [, code, name] = match;
          //     const github = await createOAuthApp(
          //       config.oauthApp.clientId,
          //       config.oauthApp.clientSecret,
          //       code, 
          //     );
          //     const created = await github.generateBlogRepo(name);
          //     const owner = await github.getOwner();              
          //     res.writeHead(200);

          //     res.end(created ? createdView(owner, name) : failedView(name));
          //     return;
          //   }

          // }


          try {
            const event = req.headers['x-github-event'];
            if (event === 'installation_repositories') {
              const { installation: { id: installationId }, repositories_added } = JSON.parse(data);
              repositories_added.map(async ({ full_name }: { [k: string]: string}) => {
                // This code is commented because current github app API does not 
                // support creating a repository from a template repository
                console.log(installationId, full_name);
                
                // const github = await createGithub(
                //   config.githubApp,
                //   full_name,
                //   installationId
                // );

                // Check if repo is empty
                // await github.getBranches();

                // const [owner, repo] = full_name.split('/');
                // await github.generateBlogRepo(owner, 'testing-repo');

                // Create blob for config.json
                // console.log('blob');
                // const blob_id = await github.createFile(fileStr);
                // console.log('tree');
                // const tree_id = await github.createTree('config.json', blob_id);
                // console.log('commit');
                // const commitSha = await github.createCommit(
                //   'Initial commit from til-utils',
                //   tree_id
                // );
                // console.log('ref');
                // await github.createRef(defaults.editing, commitSha);
                // console.log('branch created');
              });
            }

            if (event === 'push') {
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