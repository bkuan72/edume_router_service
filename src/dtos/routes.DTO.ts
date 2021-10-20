/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DTOGenerator from '../modules/ModelGenerator';
import CommonFn from '../modules/CommonFnModule';
import { RouteData, routes_schema } from '../schemas/routes.schema';


export class RouteDTO {
  data: RouteData;
  constructor(propertyData?: any) {
    DTOGenerator.genDTOFromSchema(this, routes_schema);
    if (!CommonFn.isUndefined(propertyData)) {
      for (const prop in this) {
        if (CommonFn.hasProperty(propertyData, prop)) {
          this[prop] = propertyData[prop];
        }
      }
    }
  }
}

export class UpdRouteDTO {
  data: RouteData;
  constructor(propertyData?: any) {
    DTOGenerator.genUpdDTOFromSchema(this, routes_schema);
    if (!CommonFn.isUndefined(propertyData)) {
      for (const prop in this) {
        if (CommonFn.hasProperty(propertyData, prop)) {
          this[prop] = propertyData[prop];
        }
      }
    }
  }
}