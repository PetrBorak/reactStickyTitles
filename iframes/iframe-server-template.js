const express = require('express');
const app = express();
const processTemplate = require('./iframe-server-generator-tool.js').processTemplate;
const fs = require('fs');
const path = require('path');

// as will be used as template, following hack is needed
/*eslint-disable*/
const templateVars = require("__configPath");
const urlPort = "__urlPort" || 'localhost:8877';
const template = "__template";
/*eslint-enable*/

const [url, port] = urlPort.split(':');

function getTemplate(key) {
  return processTemplate(
    fs.readFileSync(path.resolve(__dirname, `iframe-${key}-template.html`), { encoding: 'utf-8' }),
    templateVars[key].htmlTemplate
  );
}

app.get('*', (req, res) => {
  setTimeout(() => {
    res.send(getTemplate(template));
  }, 3000);
});

app.listen(port, url, () => {
  // eslint-disable-next-line no-undef
  console.log(`App for ${template} is listening on ${url}:${port}`);
});
