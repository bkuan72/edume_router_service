import 'dotenv/config'; // loads the .env environment
import toobusy_js from 'toobusy-js';
import SysEnv from './modules/SysEnv';
/* eslint-disable @typescript-eslint/no-explicit-any */

import validateEnv from './utils/validateEnv';
import App from './app';
import { RoutesController } from './server/controllers/route.controller';

// validate that all required environment variable is present
SysEnv.init();
validateEnv();

const port = SysEnv.PORT;

const app = new App (
  [
    new RoutesController()
  ],
  port
);

app.listen();

process.on('SIGINT', function() {
  // app.close();
  // calling .shutdown allows your process to exit normally
  toobusy_js.shutdown();
  process.exit();
});

