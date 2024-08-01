// @ts-check

const { resolve } = require('node:path');

const eslint = require('eslint');

/**
 * Gets a configuration object based on the given path and options.
 *
 * @typedef {object} EslintConfig
 * @property {string[]} rules
 * @property {string[]} plugins
 *
 *
 * @param {string} path - The path to the configuration file or directory.
 * @param {'flat' | 'eslintrc' | 'auto'} type - The type of configuration to retrieve. If 'flat', returns a flat object with no nested configurations. If 'eslintrc', returns an ESLint configuration object.
 * @returns {EslintConfig}
 */
function getConfig(path, type) {
  if (!path) raise('You must provide the path to the config');
  if (!type) raise('You must provide the config type.');

  const config = require(resolve(process.cwd(), path));

  /** @type {string[]} */
  let rules;

  /** @type {string[]} */
  let plugins;

  if (type === 'auto') {
    type = Array.isArray(config)
      ? 'flat'
      : 'eslintrc';
  }

  if (type === 'eslintrc') {
    rules = config.rules;
    plugins = config.plugins;

    return { rules, plugins };
  }

  if (type === 'flat') {
    const configs = config;
    rules = Object.fromEntries(configs.map(_config => Object.entries(_config.rules)).flat());
    plugins = Array.from(new Set(configs.flatMap(_config => _config.plugins)));

    return { rules, plugins };
  }

  raise('Unable to resolve ' + type + ' config at: ' + path);
}

/**
 * Returns all keys of an object.
 *
 * @param {object} obj
 *
 * @returns {string[]} Object keys
 */
function getKeys(obj) {
  return Object.keys(obj);
}

/**
  * Returns an array of all core ESLint rules.
  *
  * @returns Map of core ESLint rules
  */
function getCoreRules() {
  const linter = new eslint.Linter({ configType: 'eslintrc' });

  return linter.getRules();
}

/**
  * Returns the name of a plugin without the standaard prefix.
  *
  * @param {string} plugin Full name of an eslint plugin
  * @returns {string} Plugin name
  */
function getPluginNormalizedName(plugin) {
  return plugin.replace('eslint-plugin-', '');
}

/**
  * Returns an array of all default rules from an eslint plugin.
  *
  * @param {string} plugin Name of an eslint plugin
  * @returns Array of core ESLint rules
  */
function getPluginRules(plugin) {
  const pluginConfig = require(plugin);

  /**
   * @typedef {import('eslint').Rule.RuleModule} RuleModule
   *
   * @type Object.<string, RuleModule>
   */
  const rules = pluginConfig?.rules || {};
  const prefix = getPluginNormalizedName(plugin);

  return new Map(Object.entries(rules).map(([key, rule]) => ([`${prefix}/${key}`, rule])));
}

/**
 * Finds the difference of array a vs array b.
 *
 * @template T
 * @param {T[]} arrA
 * @param {T[]} arrB
 * @returns {T[]} Difference between a and b
 */
function difference(arrA, arrB) {
  // console.log(arrB);
  return arrA
    .filter(item => arrB.indexOf(item) === -1)
    .sort((a, b) => +(a > b));
}

/**
  * Throws a generic error.
  *
  * @param {string} msg Message to emit when error is raised.
  * @throws
  */
function raise(msg) {
  throw new Error(msg);
}

const FLAGS = Object.freeze({
  PLUGINS_ONLY: '--plugins-only',
  CORE_ONLY: '--core-only',
  FLAT: '--flat',
  LEGACY: '--legacy',
  UNUSED: '--unused',
  UNKNOWN: '--unknown',
  DEPRECATED: '--deprecated',
});

const configPath = process.argv[2] ?? raise('Path to ESLing config required.');

/**
 * @type {Record<keyof typeof FLAGS, boolean>}
 */
const flags = Object.freeze(Object.fromEntries(
  Object.entries(FLAGS)
    .map(([flag]) => ([flag, process.argv.slice(3).includes(FLAGS[flag])]))
));

if (flags.PLUGINS_ONLY && flags.CORE_ONLY) {
  raise(`${FLAGS.CORE_ONLY} and ${FLAGS.PLUGINS_ONLY} are mutally exclusive. Use one or the either but not both.`);
}

if (flags.LEGACY && flags.FLAT) {
  raise(`${FLAGS.LEGACY} and ${FLAGS.FLAT} are mutally exclusive. Use one or the either but not both.`);
}

const eslintConfigType = Object.freeze({
  [+flags.LEGACY]: 'eslintrc',
  [+flags.FLAT]: 'flat',
})[1] || 'auto';

const eslintRuleDiscoveryMode = Object.freeze({
  [+flags.DEPRECATED]: 'deprecated',
  [+flags.UNKNOWN]: 'unknown',
  [+flags.UNUSED]: 'unused'
})[1] || 'unused';

const config = getConfig(configPath, eslintConfigType);

const coreRules = getCoreRules();
const pluginRules = new Map(...config.plugins.filter(Boolean).flatMap(plugin => getPluginRules(plugin)));

/**
 * @typedef {import('eslint').Rule.RuleModule} RuleModule
 * @type {Map<string, RuleModule>}
 */
const allRules = new Map();

if (flags.CORE_ONLY) {
  coreRules.forEach((v, k) => allRules.set(k, v));
} else if (flags.PLUGINS_ONLY) {
  pluginRules.forEach((v, k) => allRules.set(k, v));
} else {
  coreRules.forEach((v, k) => allRules.set(k, v));
  pluginRules.forEach((v, k) => allRules.set(k, v));
}

const currentRules = new Map(Object.keys(config.rules).map(rule => ([rule, allRules.get(rule)])));

const unusedRules = difference(Object.keys(allRules), Object.keys(currentRules));
const unknownRules = difference(Object.keys(currentRules), Object.keys(allRules));
const deprecatedRules = {};

allRules.forEach((rule, key) => {
  if (rule.meta?.deprecated) deprecatedRules[key] = rule;
});

if (eslintRuleDiscoveryMode === 'unused') console.log(unusedRules);
if (eslintRuleDiscoveryMode === 'unknown') console.log(unknownRules);
if (eslintRuleDiscoveryMode === 'deprecated') console.log(Object.keys(deprecatedRules));
