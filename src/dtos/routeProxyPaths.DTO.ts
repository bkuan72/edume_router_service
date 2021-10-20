/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DTOGenerator from '../modules/ModelGenerator';
import CommonFn from '../modules/CommonFnModule';
import { RouteProxyPathData, route_proxy_paths_schema } from '../schemas/routeProxyPaths.schema';


export class RouteProxyPathDTO {
  data: RouteProxyPathData;
  constructor(propertyData?: any) {
    DTOGenerator.genDTOFromSchema(this, route_proxy_paths_schema);
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
  data: RouteProxyPathData;
  constructor(propertyData?: any) {
    DTOGenerator.genUpdDTOFromSchema(this, route_proxy_paths_schema);
    if (!CommonFn.isUndefined(propertyData)) {
      for (const prop in this) {
        if (CommonFn.hasProperty(propertyData, prop)) {
          this[prop] = propertyData[prop];
        }
      }
    }
  }
}