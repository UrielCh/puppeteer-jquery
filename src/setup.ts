import { Page, launch, Browser } from "puppeteer";
import { JQueryAble, IJQueryAble } from './jQueryPlugin';

/**
 * Helper interface to handle Page with JQuery
 */
export interface BrowserEx<T extends Page> extends Browser {
    newPage(): Promise<T>;
    pages(): Promise<T[]>;
}

/**
 * Helper interface to handle Page with JQuery
 */
export type PageEx = Page & IJQueryAble;

/**
 * Add sources methods to dest prototype.
 * Only add method if they do not exists in the destination
 * @param dest Object with prototype to extand
 * @param sources Mixin classes, to merge to the dest prototype
 */
function applyMixins(dest: any, sources: any[]) {
    const destProto = dest.prototype || dest.__proto__;
    for (const baseCtor of sources) {
        const srcProto = baseCtor.prototype || baseCtor.__proto__;
        Object.getOwnPropertyNames(srcProto)
            .filter(name => !destProto[name])
            .forEach(name => {
                const propDef = Object.getOwnPropertyDescriptor(srcProto, name) as PropertyDescriptor;
                Object.defineProperty(destProto, name, propDef);
            })
    };
}

/**
 * add JQueryAble Mixin to a Page
 * @param page 
 * @returns 
 */
 export function pageExtend<T extends Page>(page: T): T & JQueryAble {
    applyMixins(page, [ JQueryAble ]);
    return page as T & JQueryAble;
}

/**
 * launch a puppeter with preloaded jQuery
 * @param options LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions
 * @returns 
 */
export async function setupJQuery(options?: Parameters<typeof launch>[0]): Promise<BrowserEx<PageEx>> {
    if (!options)
        options = { headless: true };
    let browser = await launch(options);
    let page = await browser.newPage();
    pageExtend(page);
    return browser as BrowserEx<PageEx>;
}