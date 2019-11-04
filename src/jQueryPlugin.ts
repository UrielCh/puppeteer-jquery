import fs from 'fs';
import { PJQuery } from "./PJQuery";
import { Page, WrapElementHandle } from "puppeteer";

/**
 * The new interface
 */
export interface IJQueryAble {
    jQuery(selector: string): PJQuery;
}

/**
 * the New code to inject in Page
 */
export class JQueryAble implements IJQueryAble {
    jQuery(this: Page, selector: string): PJQuery {
        return new Proxy(new PProxyApi(this, selector, ''), handlerRoot) as any as PJQuery;
    }
}

/**
 * random variable name generator
 */
export const randName = () => {
    let c1 = Math.floor((Math.random() * 25));
    return 'abcdefghijklmnopqrstuvwxyz'[c1] + '_' + Number(String(Math.random()).substr(2)).toString(36);
};


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
                    const lastExec = target.exec(false);
                    return lastExec.then(...args);
                }
            case 'exec': // start exec Promise
                return (...args: any) => {
                    return target.exec(false);
                }
        }
        return (...args: any) => {
            args = args.map((arg: any) => {
                if (isString(arg)) {
                    return JSON.stringify(arg)
                }
                if (typeof arg === 'function') {
                    return arg.toString();
                }
                // is POJO
                return JSON.stringify(arg)
            });
            let newCode = `${target.code}.${key}(${args.join(',')})`;
            if (args.length === 0) {
                switch (key) {
                    case 'text':
                    case 'html':
                    case 'val':
                    case 'css':
                        const tmp = new PProxyApi(target.page, target.selector, newCode)
                        return tmp.exec(true);
                }
            }
            let child = new PProxyApi(target.page, target.selector, newCode);
            return new Proxy(child, handlerRoot);
        }
    }
}
/**
 * choose a tmp name once per Launch
 */
const jQueryName = randName();

/**
 * jquery data storage
 */
let jQueryData: string = '';

/**
 * transparant jquery interface
 */
class PProxyApi {
    constructor(public page: Page, public selector: string, public code: string) { }
    toString(): string {
        return 'JQuery selector based on:' + this.page
    }

    async exec<R>(isPOJO: boolean): Promise<any | WrapElementHandle<R[]>> {
        let code = `${jQueryName}('${this.selector.replace(/'/g, "\\\'")}')`;
        code += this.code;
        if (!isPOJO)
            code += `.toArray()`;
        let handle;
        const { page } = this;
        // console.log(code);
        try {
            try {
                handle = await page.evaluateHandle(code);
            } catch (e) {
                if (!jQueryData) {
                    // Sync call, do not want to force nodejs 10+ nor adding js-extra, not using a call back here
                    // nor adding a new Promise statement that would take as much space as this comment...
                    const jqData = fs.readFileSync('data/jquery-3.4.1.js', { encoding: 'utf-8' });
                    jQueryData = '//# sourceURL=jquery.js\n' + jqData.replace('window.jQuery = window.$ = jQuery', `window.${jQueryName} = jQuery`);
                    // TODO add minify code.
                }
                if (~e.message.indexOf(`${jQueryName} is not defined`)) {
                    await page.evaluate(jQueryData); // define jQuery
                    handle = await page.evaluateHandle(code);
                } else {
                    throw e;
                }
            }
            if (isPOJO) {
                let value = await handle.jsonValue();
                await handle.dispose();
                return value;
            }
            else {
                const array = [];
                const properties = await handle.getProperties();
                for (const property of properties.values()) {
                    const elementHandle = property.asElement();
                    if (elementHandle)
                        array.push(elementHandle);
                }
                await handle.dispose();
                return array;
            }
        } catch (e2) {
            console.error(`Exec: ${code}`)
            if (e2.message)
                e2.message = `exec: ${code}\n failed:${e2.message}`;
            throw e2;
        }
    }
}
