const DYNAMIC_REGEX = /\[.*\]/g;
const FIXED_REGEX = /[\[\]]/g;

export function matchDynamicRoute(dynamicRoutes, pathname, req) {
  for (const dynamicRoute of dynamicRoutes) {
    const dynamicPathPieces = dynamicRoute.split("/");
    const pathPieces = pathname.split("/");

    if (dynamicPathPieces.length !== pathPieces.length) continue;

    let dynamicPieceIndex;

    //for each dinamic path split it into the fixed part and the dinamic one;
    for (const dynamicPathPieceIndex in dynamicPathPieces) {
      const dynamicPathPiece = dynamicPathPieces[dynamicPathPieceIndex];
      const isDynamic = DYNAMIC_REGEX.test(dynamicPathPiece);
      if (isDynamic) {
        dynamicPieceIndex = dynamicPathPieceIndex;
        DYNAMIC_REGEX.lastIndex = 0;
        break;
      }
    }

    let matchCount = 0;

    //apply the same spliting rule the the provided path;
    for (const pathPieceIndex in pathPieces) {
      if (pathPieceIndex === dynamicPieceIndex) continue;

      const pathPiece = pathPieces[pathPieceIndex];
      const dynamicPiece = dynamicPathPieces[pathPieceIndex];
      //test if the fixed part of each path matches;
      if (pathPiece !== dynamicPiece) break;
      matchCount++;
    }

    //if a match is found, populate the req.params with the dinamic key and the provided value;
    if (matchCount === dynamicPathPieces.length - 1) {
      const key = dynamicPathPieces[dynamicPieceIndex].replace(FIXED_REGEX, "");
      const value = pathPieces[dynamicPieceIndex];

      req.params = {
        [key]: value,
      };

      return dynamicRoute;
    }
  }
  return null;
}

export async function matchRoutes(req, res, routes, pathname) {
  const routePaths = Object.keys(routes);
  const fixedRoutes = routePaths.filter(
    (routePath) => !FIXED_REGEX.test(routePath)
  );
  const dynamicRoutes = routePaths.filter((routePath) => {
    const result = DYNAMIC_REGEX.test(routePath);

    if (result) {
      DYNAMIC_REGEX.lastIndex = 0;
    }

    return result;
  });

  const matchedFixedRoute = fixedRoutes.find(
    (fixedRoute) => fixedRoute === pathname
  );

  if (matchedFixedRoute) return routes[matchedFixedRoute](req, res);

  const matchedDynamicRoute = matchDynamicRoute(dynamicRoutes, pathname, req);

  if (matchedDynamicRoute) return routes[matchedDynamicRoute](req, res);

  return routes["404"](req, res);
}
