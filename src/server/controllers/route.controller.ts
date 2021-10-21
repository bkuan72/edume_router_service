import { RouteDTO, UpdRouteDTO } from './../../dtos/routes.DTO';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {RouteModel} from "../models/route.model";
import * as express from 'express';
import Controller from "../../interfaces/controller.interface";
import DataNotFoundException from "../../exceptions/DataNotFoundException";
import NoDataException from "../../exceptions/NoDataExceptions";
import { routes_schema } from "../../schemas/routes.schema";
import validationUpdateMiddleware from "../../middleware/validate.update.dto.middleware";
import validationMiddleware from "../../middleware/validation.middleware";

import PostDataFailedException from "../../exceptions/PostDataFailedException";
import SysEnv from "../../modules/SysEnv";
import PutDataFailedException from '../../exceptions/PutDataFailedException';



export class RoutesController implements Controller{
  public path='/routes';
  public router= express.Router();
  private routes = new RouteModel();
  siteCode = SysEnv.SITE_CODE;


  constructor() {
      this.siteCode = SysEnv.SITE_CODE;
      this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(this.path,
                    validationMiddleware(routes_schema),
                    this.newRoute);
    this.router.put(this.path+'/putRoute',
                      validationMiddleware(routes_schema),
                      this.putRoute);
    this.router.get(this.path,  this.getAll);
    this.router.get(this.path+'/byId/:id', this.findById);
    this.router.patch(this.path+'/:id', validationUpdateMiddleware(routes_schema), this.update);
    this.router.get(this.path+'/DTO', this.apiDTO);
    this.router.get(this.path+'/updDTO', this.apiUpdDTO);
    this.router.get(this.path+'/schema', this.apiSchema);
    return;
  }

  apiDTO  = (request: express.Request, response: express.Response) => {
    const dto = new RouteDTO();
    response.send(dto);
  }
  apiUpdDTO  = (request: express.Request, response: express.Response) => {
    const dto = new UpdRouteDTO();
    response.send(dto);
  }
  apiSchema  = (request: express.Request, response: express.Response) => {
    response.send(routes_schema);
  }

  newRoute  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
      this.routes.create(request.body).then((respRouteDTO) => {        console.log(request.body)
        if (respRouteDTO) {
            response.send(respRouteDTO);
          } else {
            next(new PostDataFailedException())
          }
      })
  };

  putRoute  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    console.log(request.body)
    this.routes.find( { url_path : request.body.url_path }).then((respRouteDTO) => {
      console.log("Got responseDTO")
      console.log(respRouteDTO)
      if (respRouteDTO[0]) {
        console.log(request.body)
        this.routes.updateById(respRouteDTO[0].id, request.body).then((respRouteDTO) => {
          console.log("Update responseDTO")
          console.log(respRouteDTO)
          if (respRouteDTO) {
            response.send(respRouteDTO);
          } else {
            next(new DataNotFoundException(request.params.id))
          }
        })
      } else {
        console.log ('POST')
        console.log(respRouteDTO)
        this.routes.create(request.body).then((respRouteDTO) => {
          console.log ('POST Success')
          console.log(respRouteDTO)
          if (respRouteDTO) {
              response.send(respRouteDTO);
            } else {
              next(new PutDataFailedException())
            }
        })
      }
    })

  };


  findById  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.routes.findById(request.params.id).then((respRouteDTO) => {
      if (respRouteDTO) {
        response.send(respRouteDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }

  getAll  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.routes.getAll().then((respRouteDTOArray) => {
      if (respRouteDTOArray) {
        response.send(respRouteDTOArray);
      } else {
        next(new NoDataException())
      }
    })
  }

  update  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.routes.updateById(request.params.id, request.body).then((respRouteDTO) => {
      if (respRouteDTO) {
        response.send(respRouteDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }
}