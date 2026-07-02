import { WORKER_ROUTE_MANIFEST } from "./contracts";

export function describeRoutes() {
  return WORKER_ROUTE_MANIFEST.map((route) => `${route.method} ${route.path} - ${route.purpose}`);
}
