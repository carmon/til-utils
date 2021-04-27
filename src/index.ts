import config from 'dos-config';

import runServer from './server';
import createGithub from './services/github';
import createTwitter from './services/twitter';

// Init services
Promise.all([
  createGithub(config.github),
  createTwitter(config.twitter)
]).then(
  async ([github, twitter]) => {
    runServer(github, twitter);
  }
);

