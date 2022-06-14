import { PuppeteerExtraPlugin } from 'puppeteer-extra-plugin'
import { jQueryName } from './jQueryPlugin';
import { pageExtend } from './setup';

export interface PluginOptions {
}

/**
 */
export class Plugin extends PuppeteerExtraPlugin {
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

  /**
   * @returns get current Jquery internal name
   */
  public getJQueryName(): string {
    return jQueryName;
  }
}

export default (pluginConfig?: Partial<PluginOptions>) => new Plugin(pluginConfig)
