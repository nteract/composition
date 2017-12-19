const nextRoutes = require("next-routes");
const routes = (module.exports = nextRoutes());

routes.add("edit", "/edit/:gistid");
