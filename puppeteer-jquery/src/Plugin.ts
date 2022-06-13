import { PuppeteerExtraPlugin } from 'puppeteer-extra-plugin'
import { pageExtend } from './setup';

interface PluginOptions {
}

/**
 * Modify/increase the default font size in puppeteer.
 *
 * @param {Object} opts - Options
 * @param {Number} [opts.defaultFontSize=20] - Default browser font size
 *
 * @example
 * const puppeteer = require('puppeteer-extra')
 * puppeteer.use(require('puppeteer-extra-plugin-font-size')())
 * // or
 * puppeteer.use(require('puppeteer-extra-plugin-font-size')({defaultFontSize: 18}))
 * const browser = await puppeteer.launch()
 */
class Plugin extends PuppeteerExtraPlugin {
  constructor(opts?: Partial<PluginOptions>) {
    super(opts)
  }
  // usable as 'puppeteer-extra-plugin-jquery/lib/Plugin
  get name(): 'jquery/lib/Plugin' {
    return 'jquery/lib/Plugin'
  }

  get defaults(): PluginOptions {
    return { }
  }

  // PuppeteerPage
  async onPageCreated(page: any): Promise<void> {
    pageExtend(page)
  }
}

export = (pluginConfig?: Partial<PluginOptions>) => new Plugin(pluginConfig)
