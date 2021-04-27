// import * as http from 'http';
// // import { App, createNodeMiddleware } from '@octokit/app';
import { GithubAppConfig } from './types';

// const decodeBase64 = (s: string) => Buffer.from(s, 'base64').toString();

// const PORT = 8000;

// this server looks into https://www.npmjs.com/package/@octokit/app 
// sucks rn, typing-wise, TODO check typings later on

export default async (_: GithubAppConfig) => {
  // const { appId, certBase64, clientId, clientSecret, installationId } = config;
  // const privateKey = decodeBase64(certBase64) || '';
  // installationId;clientId; clientSecret;
  // const app = new App({
  //   appId,
  //   privateKey,
  //   oauth: {
  //     clientId,
  //     clientSecret,
  //   },
  //   webhooks: {
  //     secret: "",
  //   },
  // });
  
  // const { data } = await app.octokit.request("/app");
  // console.log("authenticated as %s", data.name);
  
  // for await (const { octokit, repository } of app.eachRepository.iterator()) {
  //   console.log(repository);
  //   octokit;
  // }

  // // app.webhooks.on("issues.opened", async ({ octokit, payload }) => {
  // //   await octokit.request(
  // //     "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
  // //     {
  // //       owner: payload.repository.owner.login,
  // //       repo: payload.repository.name,
  // //       issue_number: payload.issue.number,
  // //       body: "Hello World!",
  // //     }
  // //   );
  // // });
  
  // app.oauth.on("token", async ({ token, octokit }) => {
  //   const { data } = await octokit.request("GET /user");
  //   console.log(`Token retrieved for ${data.login} ${token}`);
  // });

  // http.createServer(createNodeMiddleware(app)).listen(
  //   PORT, 
  //   () => {
  //     console.log(`Server listening on port ${PORT}`);
  //   });
}

