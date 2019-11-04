import { Page, launch, Browser } from "puppeteer";
import { JQueryAble, IJQueryAble } from './jQueryPlugin';

/**
 * Helper interface to handle Page with JQuery
 */
export interface BrowserEx extends Browser {
    newPage(): Promise<PageEx>;
    pages(): Promise<PageEx[]>;
}

/**
 * Helper interface to handle Page with JQuery
 */
export interface PageEx extends Page, IJQueryAble { }

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

export const pageExtend = (page: Page): PageEx => {
    applyMixins(page, [JQueryAble]);
    return page as PageEx;
}

export async function setupJQuery(): Promise<BrowserEx> {
    let browser = await launch({ headless: true });
    let page = await browser.newPage();
    pageExtend(page);
    return browser as BrowserEx;
}