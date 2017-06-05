const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const template = fs.readFileSync(
  path.resolve(__dirname, 'iframe-server-template.js'),
  { encoding: 'utf-8' }
);

function processTemplate(templateInner, setup) {
  let templateToOut = templateInner;
  if (setup.serverTemplates) {
    Reflect.ownKeys(setup.serverTemplates).forEach((reg) => {
      templateToOut = templateToOut.replace(
        new RegExp(`__${reg}`, 'g'),
        setup.serverTemplates[reg]);
    });
  }
  return templateToOut;
}

function templateFunc(setup) {
  setup.serverTemplates = Object.assign(
    setup.serverTemplates,
    { configPath: path.resolve(__dirname, './config/servers-config.json').split('\\').join('/') });
  const templateInner = processTemplate(
    template,
    setup
  );
  return templateInner;
}

function startServer(setup) {
  const serverPath = path.resolve(__dirname, setup.serverName ?
    `server.${setup.serverName}` : 'serverIframe.js');
  fs.writeFileSync(`${serverPath}.js`, setup.template);
  const serverProcess = spawn('node', [serverPath]);

  serverProcess.on('error', (error) => {
    console.log('server error occured', error);
  });
  serverProcess.stdout.on('data', (data) => {
    console.log(`stdout:${data}`);
  });
  serverProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  process.on('SIGINT', () => {
    console.log('****************PROCESS EXITING***********************');
    cleanUp();
  });

  function cleanUp() {
    fs.unlink(`${serverPath}.js`);
  }
}

module.exports = {
  templateFunc,
  startServer,
  processTemplate
}
