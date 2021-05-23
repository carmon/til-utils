import { VercelResponse } from "@vercel/node";

import formView from '../views/form';

export default (code: string, res: VercelResponse) => {
  res.writeHead(200);
  res.end(formView(code));
}