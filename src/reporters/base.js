/*
 * Workaround for mocha-intellij
 * mochaIntellijUtil.js looks for this file requireMochaModule
 */
export * from 'mocha/lib/reporters/base';
export { default } from 'mocha/lib/reporters/base';
