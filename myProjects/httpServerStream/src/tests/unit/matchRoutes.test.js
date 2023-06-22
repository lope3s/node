import { matchDynamicRoute, matchRoutes } from "../../util/index.js";
import { describe, it, afterEach } from "node:test";
import assert from "node:assert";

describe("Testing matchDynamicRoutes fn", () => {
  it("Should return null if no match is found", () => {
    const dynamicRoute = ["get:/test/[id]"];
    const req = {};
    const providedPathname = "get:/test/user/1";

    const matchedRoute = matchDynamicRoute(dynamicRoute, providedPathname, req);

    assert.strictEqual(matchedRoute, null);
  });

  it("Should return the matched route and add the value to the specified key in req.params", () => {
    const dynamicRoute = ["get:/test/[id]"];
    const req = {};
    const providedPathname = "get:/test/1";
    const matchedRoute = matchDynamicRoute(dynamicRoute, providedPathname, req);
    assert.strictEqual(matchedRoute, "get:/test/[id]");
    assert.deepStrictEqual(req.params, { id: "1" });
  });

  it("Should return the matched route and add the value to the specified key in the req.params even if there are more than one dynamic route", () => {
    const dynamicRoute = ["get:/test/[id]", "delete:/test/[id]"];
    const req = {};
    const providedPathname = "delete:/test/1";
    const matchedRoute = matchDynamicRoute(dynamicRoute, providedPathname, req);
    assert.strictEqual(matchedRoute, "delete:/test/[id]");
    assert.deepStrictEqual(req.params, { id: "1" });
  });
});

describe("Testing matchRoutes fn", () => {
  const tracker = new assert.CallTracker();
  const defaultFn = (req, res) => null;
  const callsFunc = tracker.calls(defaultFn, 1);
  const routes = {
    "get:/test": undefined,
    "get:/test/[id]": undefined,
    404: undefined,
  };
  const req = {};
  const res = {};

  afterEach(() => {
    for (const key in routes) {
      routes[key] = undefined;
    }
    tracker.reset();
  });

  it("Should match fixed route properly", async () => {
    const pathname = "get:/test";
    routes[pathname] = callsFunc;
    await matchRoutes(req, res, routes, pathname);
    tracker.verify();
  });

  it("Should match dynamic routes properly", async () => {
    const pathname = "get:/test/1";
    routes["get:/test/[id]"] = callsFunc;
    await matchRoutes(req, res, routes, pathname);
    tracker.verify();
    assert.deepStrictEqual(req.params, { id: "1" });
  });

  it("Should return route 404 if no match is found", async () => {
    const pathname = "get:/test/1/users";
    routes[404] = callsFunc;
    await matchRoutes(req, res, routes, pathname);
    tracker.verify();
  });
});
