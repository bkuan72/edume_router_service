/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { route_proxy_paths_schema, route_proxy_paths_schema_table } from '../../schemas/routeProxyPaths.schema';
import { RouteProxyPathDTO } from '../../dtos/routeProxyPaths.DTO';
import { EntityModel } from './entity.model';

export class RouteProxyPathModel extends EntityModel {
  constructor (altTable?: string) {
    super();

    if (altTable) {
      super(altTable);
    } else  {
      this.tableName = route_proxy_paths_schema_table;
    }
    this.requestDTO = RouteProxyPathDTO;
    this.responseDTO = RouteProxyPathDTO;
    this.schema = route_proxy_paths_schema;
  }

}