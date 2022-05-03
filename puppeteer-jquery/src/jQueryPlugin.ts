import fs from 'fs';
import path from 'path';
import { PJQuery } from "./PJQuery";
import { Page, WrapElementHandle, ElementHandle } from "puppeteer";
import { PageEx } from './setup';
import { randName } from './common';

/**
 * choose a tmp name once per Launch
 */
const jQueryName = randName();

/**
 * Error message that can be throw if jQuery is not loaded
 */
 const nonRefErrors = [`ReferenceError: Can't find variable: ${jQueryName}`, `${jQueryName} is not defined`];

/**
 * jquery data storage
 */
let jQueryData: string = '';

/**
 * The new interface
 */
export interface IJQueryAble {
    jQuery(selector: string): PJQuery;
    waitForjQuery(selector: string, options?: { timeout?: number, polling?: 'mutation' | 'raf' | number }): Promise<ElementHandle[]>;
}

/**
 * the New code to inject in Page
 */
export class JQueryAble implements IJQueryAble {
    jQuery(this: PageEx, selector: string): PJQuery {
        return new Proxy(new PProxyApi(this, selector, ''), handlerRoot) as any as PJQuery;
    }

    async waitForjQuery(this: PageEx, selector: string, options?: { timeout?: number, polling?: 'mutation' | 'raf' | number }): Promise<ElementHandle[]> {
        const first = await this.jQuery(selector).exec();
        if (first.length)
            return first;
        await this.waitForFunction(`${jQueryName}('${selector.replace(/'/g, "\\\'")}').toArray().length > 0`, options, selector);
        return this.jQuery(selector).exec();
    }
}

/**
 * internal used isString funtion
 */
function isString(obj: any): boolean {
    return typeof obj === 'string' || obj instanceof String;
}

const handlerRoot = <ProxyHandler<PProxyApi>>{
    get(target: PProxyApi, p: PropertyKey, receiver: any) {
        // console.log(`get(${p.toString()})`, receiver);
        if (typeof p == 'symbol')
            return (<any>target)[p];
        let key = p.toString();
        switch (key) {
            // passthru
            case 'toString':
            case 'valueOf':
                return (<any>target)[p];
            case 'code':
            case 'selector':
            case 'page':
                return (<any>target)[p];
            /**
             * if exec() is forgoten, act as a promise.
             */
            case 'then': // start exec Promise
                return (...args: any) => {
                    const lastExec = target.exec(true, false);
                    return lastExec.then(...args);
                }
            case 'exec': // start exec Promise
                return (...args: any) => {
                    return target.exec(true, false);
                }
            case 'pojo': // start exec Promise
                return (...args: any) => {
                    // console.log('csll exec ', args);
                    return target.exec(true, true);
                }
        }
        return (...args: any) => {
            args = args.map((arg: any) => {
                if (isString(arg)) {
                    return JSON.stringify(arg)
                }
                if (typeof arg === 'function') {
                    return arg.toString().replace(/jQuery\(/g, `${jQueryName}(`);
                }
                // is POJO
                return JSON.stringify(arg)
            });
            let newCode = `${target.code}.${key}(${args.join(',')})`;
            // zero arg funtion that return serialisable value
            if (args.length === 0) {
                switch (key) {
                    case 'text':
                    case 'html':
                    case 'val':
                    case 'css':
                        const tmp = new PProxyApi(target.page, target.selector, newCode)
                        return tmp.exec(false, true);
                }
            }
            // one arg funtion that return serialisable value
            if (args.length === 1) {
                switch (key) {
                    case 'attr':
                    case 'css':
                    case 'prop':
                        const tmp = new PProxyApi(target.page, target.selector, newCode)
                        return tmp.exec(false, true);
                }
            }
            let child = new PProxyApi(target.page, target.selector, newCode);
            return new Proxy(child, handlerRoot);
        }
    }
}

/**
 * transparant jquery interface
 */
class PProxyApi {
    constructor(public page: Page, public selector: string, public code: string) { }
    toString(): string {
        return 'JQuery selector based on:' + this.page
    }
    /**
     * @param toArray must be set to true is the object is a jQuery
     * @param isPOJO must be set to true if waiting for plain data, fals is waiting for HTMLElements
     */
    async exec<R>(toArray: boolean, isPOJO: boolean): Promise<any | WrapElementHandle<R[]>> {
        let code = `${jQueryName}('${this.selector.replace(/'/g, "\\\'")}')`;
        code += this.code;
        if (toArray)
            code += `.toArray()`;
        let handle;
        const { page } = this;
        // console.log(code, "POJO is", isPOJO);
        try {
            try {
                handle = await page.evaluateHandle(code);
            } catch (e) {
                if (!jQueryData) {
                    // Sync call, do not want to force nodejs 10+ nor adding js-extra, not using a call back here
                    // nor adding a new Promise statement that would take as much space as this comment...
                    const jqData = fs.readFileSync(path.join(__dirname, '..', 'data', 'jquery-3.4.1.js'), { encoding: 'utf-8' });
                    jQueryData = '//# sourceURL=jquery.js\n' + jqData.replace('window.jQuery = window.$ = jQuery', `window.${jQueryName} = jQuery`);
                    // TODO add minify code.
                }
                if (e instanceof Error) {
                    const { message } = e;
                    if (~message.indexOf(nonRefErrors[0]) || ~message.indexOf(nonRefErrors[1])) {
                        await page.evaluate(jQueryData); // define jQuery
                        handle = await page.evaluateHandle(code); // and retry
                    } else {
                        throw e;
                    }
                } else {
                    throw e;
                }
            }
            if (isPOJO) {
                let value = await handle.jsonValue();
                await handle.dispose();
                return value;
            }
            const array = [];
            const properties = await handle.getProperties();
            for (const property of properties.values()) {
                const elementHandle = property.asElement();
                if (elementHandle)
                    array.push(elementHandle);
            }
            await handle.dispose();
            return array;
        } catch (e2: unknown) {
            if (e2 instanceof Error) {
                e2.message = `exec: ${code}\n failed:${e2.message}`;
            }
            throw e2;
        }
    }
}
