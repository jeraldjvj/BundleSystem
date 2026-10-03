import app from './app.js';
import config from './config/index.js';

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}${config.apiPrefix} (${config.env})`);
});
