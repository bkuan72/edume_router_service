import { RouteProxyPathModel } from './routeProxyPath.model';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { routes_schema, routes_schema_table } from '../../schemas/routes.schema';
import { RouteDTO } from '../../dtos/routes.DTO';
import { EntityModel } from './entity.model';

export class RouteModel extends EntityModel {
  routeProxyPath: RouteProxyPathModel;
  constructor (altTable?: string) {
    super();

    if (altTable) {
      super(altTable);
    } else  {
      this.tableName = routes_schema_table;
    }
    this.requestDTO = RouteDTO;
    this.responseDTO = RouteDTO;
    this.schema = routes_schema;
    this.routeProxyPath = new RouteProxyPathModel();
  }

  public getAllRoutes() {
    return new Promise<any[]>((resolve) => {
      const getProxyPaths = (routes: any[], idx: number) => {
        return new Promise<void>((res) => {
          this.routeProxyPath.find({route_id: routes[idx].id}).then((proxyPaths) => {
            if (idx >= routes.length) {
              // TODO
              res();
            } else {
              getProxyPaths(routes, idx++);
            }
          })
          .catch(() => {
            res();
          })
        });
      }
      const i = 0;
      this.getAll().then((routes: any[]) => {
        getProxyPaths(routes, i).finally(() => {
          resolve(routes);
        });
      })
      .catch(() => {
        resolve([]);
      })
    });
  }

}