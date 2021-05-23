import { VercelRequest, VercelResponse } from '@vercel/node';
import config from 'dos-config';

import resolveCreate from '../src/routes/create';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.url?.includes('/create')) {
    const match = req.url.match(/\/create\?code=([\w.-]+)&name=([\w\@.-]+)/);
    if (match) {
      const [, code, repoName] = match;
      return await resolveCreate(
        config.oauthId,
        config.oauthSecret,
        code,
        repoName,
        res
      );
    }
  }
  res.end();
}