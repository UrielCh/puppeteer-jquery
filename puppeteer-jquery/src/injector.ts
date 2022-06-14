import { Plugin, PluginOptions } from "./Plugin";
/**
 * old pptr-extra injections style
 * fullname: 'puppeteer-extra-plugin-jquery/lib/injector'
 */
export = (pluginConfig?: Partial<PluginOptions>) => new Plugin(pluginConfig)
