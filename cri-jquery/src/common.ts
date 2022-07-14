import { type Chrome } from "@u4/chrome-remote-interface";

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
 export function isString(obj: any): boolean {
    return typeof obj === 'string' || obj instanceof String;
}

/**
 * Add sources methods to dest prototype.
 * Only add method if they do not exists in the destination
 * @param dest Object with prototype to extand
 * @param sources Mixin classes, to merge to the dest prototype
 */
 export function applyMixins(dest: any, sources: any[]) {
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

export interface ChromeCtx {
    chrome: Chrome;
    sessionId?: string;
    contextId?: number;

}