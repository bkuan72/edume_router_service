import { route_proxy_paths_schema, route_proxy_paths_schema_table } from './routeProxyPaths.schema';
import { tableIfc } from '../modules/DbModule';
import { routes_schema, routes_schema_table } from './routes.schema';

export const sysTables: tableIfc[] = [
  {
    name: routes_schema_table,
    schema: routes_schema
  },
  {
    name: route_proxy_paths_schema_table,
    schema: route_proxy_paths_schema
  }
];
