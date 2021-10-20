/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as express from 'express';
import HttpException from '../exceptions/HttpException';
import DTOGenerator from '../modules/ModelGenerator';
import { schemaIfc } from '../modules/DbModule';
import SysLog from '../modules/SysLog';
 
function validationUpdateMiddleware<T>(dto_schema: schemaIfc[]): express.RequestHandler {
  return (req, res, next) => {
    const errors = DTOGenerator.validateUpdateDTOSchema({schema: dto_schema, requestDTO: req.body});
    if (errors) {
      SysLog.error(errors);
        next(new HttpException(400, errors));
    } else {
        next();
    }
  };
}

export default validationUpdateMiddleware;