const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadAskUserConfig, bellEnabled, configPath } = require('./config.ts');

function withConfig(content, run) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-ext-config-'));
  try {
    if (content !== undefined) { fs.mkdirSync(path.join(home, 'pi-extensions')); fs.writeFileSync(path.join(home, 'pi-extensions', 'config.json'), content); }
    const warnings = [];
    run(loadAskUserConfig({ XDG_CONFIG_HOME: home }, w => warnings.push(w)), warnings, home);
  } finally { fs.rmSync(home, { recursive: true, force: true }); }
}

test('askUser.bell false in the config file disables the bell', () => withConfig('{"askUser":{"bell":false}}', (config, warnings) => {
  assert.equal(config.bell, false); assert.deepEqual(warnings, []);
  assert.equal(bellEnabled(config, {}), false);
}));

test('no config file keeps the bell on, silently', () => withConfig(undefined, (config, warnings) => {
  assert.equal(config.bell, true); assert.deepEqual(warnings, []);
  assert.equal(bellEnabled(config, {}), true);
  assert.equal(bellEnabled(config, { PI_ASK_USER_BELL: '0' }), false, 'env var still silences');
}));

test('malformed JSON falls back to defaults with a warning and never throws', () => withConfig('{not json', (config, warnings) => {
  assert.equal(config.bell, true); assert.equal(warnings.length, 1); assert.match(warnings[0], /config\.json/);
}));

test('a value of the wrong type falls back to the default', () => withConfig('{"askUser":{"bell":"no"}}', config => {
  assert.equal(config.bell, true);
}));

test('the file lives under XDG_CONFIG_HOME, else ~/.config', () => {
  assert.equal(configPath({ XDG_CONFIG_HOME: '/x' }), path.join('/x', 'pi-extensions', 'config.json'));
  assert.equal(configPath({}), path.join(os.homedir(), '.config', 'pi-extensions', 'config.json'));
});
