import * as express from 'express';
import cookieParser = require('cookie-parser');
import SysLog from './modules/SysLog';
import toobusy_js = require('toobusy-js');
import ServerTooBusyException from './exceptions/ServerTooBusyException';
import rateLimit = require('express-rate-limit');
import SysEnv from './modules/SysEnv';
import Controller from './interfaces/controller.interface';




class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express.default();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    // The default maxLag value is 70ms, and the default check interval is 500ms.
    // This allows an "average" server to run at 90-100% CPU and keeps request latency
    // at around 200ms. For comparison, a maxLag value of 10ms results in 60-70% CPU usage,
    // while latency for "average" requests stays at about 40ms
    toobusy_js.maxLag(SysEnv.TOOBUSY_MAX_LAG);
    toobusy_js.interval(SysEnv.TOOBUSY_CHECK_INTERVAL);
    toobusy_js.onLag(function(currentLag: number) {
      SysLog.info("Event loop lag detected! Latency: " + currentLag + "ms");
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  loggerMiddleware = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    SysLog.http('Request Header:' + JSON.stringify(request.headers));
    SysLog.http('Request Body :' + JSON.stringify(request.body));
    SysLog.http('Request Parameters :' + JSON.stringify(request.params))
    next();
  }

  limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
  });


  private initializeMiddlewares() {
    this.app.use(express.urlencoded({ limit: "5mb", extended: true }));
    this.app.use(express.json({ limit: "10mb" }));
    // this.app.use(express.multipart({ limit:"10mb" }));
    // this.app.use(express.limit("5kb")); // this will be valid for every other content type
    this.app.use(this.loggerMiddleware);
    // this.app.use(express.json());
    // this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    //  apply to all requests
    this.app.use(this.limiter);

    this.app.use(function(req, res, next) {
      if (toobusy_js()) {
        next(new ServerTooBusyException());
      } else {
        next();
      }
    })
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller: { router: import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>; }) => {
      this.app.use('/api', controller.router);
    });
  }


  public listen():void {
    this.app.listen(this.port, () => {
      SysLog.info(`App listening on the port ${this.port}`);
    });
  }
}

export default App;