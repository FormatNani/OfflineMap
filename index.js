const server = require("./app/server/server");
const router = require("./app/router/router");
const requests = require("./app/data/tilelites");

let handle = requests.get;

server.start(router.route, handle);