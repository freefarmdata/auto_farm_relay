
let enabled = true;

function log() {
  if (enabled) {
    console.log(`${new Date().toISOString()} |`, ...arguments);
  }
}

function enable() {
  enabled = true;
}

function disable() {
  enabled = false;
}

module.exports = {
  log,
  enable,
  disable
}