import { VercelRequest, VercelResponse } from '@vercel/node';
import config from 'dos-config';

import resolveAuth from '../src/routes/auth';

export default (_: VercelRequest, res: VercelResponse) => 
  resolveAuth(config.oauthId, res)