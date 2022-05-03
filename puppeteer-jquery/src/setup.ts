import puppeteer, { Page, Browser } from "puppeteer";
import { JQueryAble, IJQueryAble } from './jQueryPlugin';
import { applyMixins } from "./common";

/**
 * Helper interface to handle Page with JQuery
 */
export interface BrowserEx<T extends Page = PageEx> extends Browser {
    newPage(): Promise<T>;
    pages(): Promise<T[]>;
}

/**
 * Helper interface to handle Page with JQuery
 */
export type PageEx<T = IJQueryAble> = Page & T;

/**
 * add JQueryAble Mixin to a Page
 * @param page 
 * @returns 
 */
 export function pageExtend<T extends Page = Page>(page: T): T & JQueryAble {
    applyMixins(page, [ JQueryAble ]);
    return page as T & JQueryAble;
}

/**
 * launch a puppeter with preloaded jQuery
 * @param options LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions
 * @returns 
 */
export async function setupJQuery(options?: Parameters<typeof puppeteer.launch>[0]): Promise<BrowserEx<PageEx>> {
    if (!options)
        options = { headless: true };
    let browser: Browser = await puppeteer.launch(options);
    let page: Page = await browser.newPage();
    pageExtend(page);
    return browser as BrowserEx<PageEx>;
}
