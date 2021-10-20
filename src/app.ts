import * as express from 'express';
import dbConnection from './modules/DbModule';
import cookieParser = require('cookie-parser');
import SysLog from './modules/SysLog';
import toobusy_js = require('toobusy-js');
import ServerTooBusyException from './exceptions/ServerTooBusyException';
import rateLimit = require('express-rate-limit');
import SysEnv from './modules/SysEnv';
import { ServerDefaultProperties, ServerPropertyTypeEnum } from './config/server.default.properties';
import { PropertyModel } from './server/models/property.model';




class App {
  public app: express.Application;
  public port: number;
  public logger: any;
  private properties: PropertyModel;

  constructor(controllers: any[], port: number) {
    this.properties = new PropertyModel();
    this.app = express.default();
    this.port = port;
    this.connectToTheDatabase();
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

  loggerMiddleware = (request: express.Request, response: express.Response, next: any) => {
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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
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

  private initializeControllers(controllers: any[]) {
    controllers.forEach((controller: { router: import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>; }) => {
      this.app.use('/api', controller.router);
    });
  }

  private createDefaultProperties(index: number): Promise<void> {
    return new Promise<void>((resolve) => {
        if (index >= ServerDefaultProperties.length) {
          resolve();
        } else {
          const prop = ServerDefaultProperties[index];
          const propName = SysEnv.SITE_CODE +'.'+ prop.name
          this.properties.find({
            name: propName
          }).then((propArray) => {
            if (propArray.length === 0) {
              const newProperty = {
                name: '',
                property_type: '',
                value: '',
                numValue: 0
              };
              newProperty.name = propName;
              switch(prop.type) {
                case ServerPropertyTypeEnum.INT:
                  if (prop.numValue) {
                    newProperty.numValue = prop.numValue;
                  }
                  newProperty.property_type = 'INT';
                  break;
                case ServerPropertyTypeEnum.TEXT:
                  if (prop.value) {
                    newProperty.value = prop.value;
                  }
                  newProperty.property_type = 'TEXT';
                break;
              }
              this.properties.create(newProperty).finally(() => {
                this.createDefaultProperties(index + 1);
              })
            }
          })
          .catch((err) => {
            throw(err);
          });

        }

    });
  }

  private connectToTheDatabase() {
    dbConnection.DBM_connectDB()
    .then(async () => {

      this.createDefaultProperties(0);

    })
    .catch((err) => {
      throw(err);
    });
  }

  public listen() {
    console.log(`App listening on the port ${this.port}`);
    this.app.listen(this.port, () => {
      SysLog.info(`App listening on the port ${this.port}`);
    });
  }
}

export default App;