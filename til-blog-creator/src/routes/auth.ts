import { VercelResponse } from "@vercel/node";

import authView from '../views/authentication';

export default (oauthId: string, res: VercelResponse) => {
  res.writeHead(302);
  res.end(authView(oauthId));
}