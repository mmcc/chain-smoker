var path = require('path');

function isRelative(p) {
  var normal = path.normalize(p);
  var absolute = path.resolve(p);
  return normal != absolute;
}

function loadConfig(filePath) {
  if (!filePath) return;

  if (isRelative(filePath)) {
    filePath = path.join(process.cwd(), filePath);
  }

  return require(filePath);
}

module.exports = {
  loadConfig: loadConfig
};
