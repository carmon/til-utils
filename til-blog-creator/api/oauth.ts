import { VercelRequest, VercelResponse } from '@vercel/node';

import resolveOauth from '../src/routes/oauth-form';

export default (req: VercelRequest, res: VercelResponse) => {
  if (req.url) {
    const code = req.url.split('=')[1];
    return resolveOauth(code, res)
  }
  res.end();
}