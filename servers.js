var iframeServersConfig = require("./iframes/config/servers-config.json");
var iframeServerGeneartor = require("./iframes/iframe-server-generator-tool");
var spawn  = require("child_process").spawn;

var args = process.argv;

function startServers(){
  console.log('start servers');
  var frontServer = spawn("node", ["server.js"]);
  frontServer.stdout.on("data", ((data) => {
    console.log(`front app: ${data}`);
  })
  );
  Reflect.ownKeys(iframeServersConfig).forEach((item) => {
    if(process.argv.indexOf(item) != -1){
      iframeServerGeneartor.startServer(Object.assign(iframeServersConfig[item].serverTemplates, {template: iframeServerGeneartor.templateFunc(iframeServersConfig[item])}));
    }
  });
}

startServers();