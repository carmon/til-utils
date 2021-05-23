import { VercelResponse } from "@vercel/node";

import createOAuthApp from '../github/create-oauth';

import createdView from '../views/created';
import failedView from '../views/failed';

export default async (
  oauthId: string, 
  oauthSecret: string, 
  code: string, 
  repoName: string, 
  res: VercelResponse) => {

  const github = await createOAuthApp(
    oauthId,
    oauthSecret,
    code, 
  );
  const created = await github.generateBlogRepo(repoName);
  const owner = await github.getOwner();              
  res.writeHead(200);

  res.end(created ? createdView(owner, repoName) : failedView(repoName));
}