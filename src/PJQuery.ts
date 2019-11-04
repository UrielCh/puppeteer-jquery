import { WrapElementHandle } from "puppeteer";

/**
 * Puppeter JQuery interface
 * TODO map and test most of https://api.jquery.com/
 */
export interface PJQuery {
    /* A */

    add(selector?: string): PJQuery;
    add(html?: string): PJQuery;
    // add( selector, context )
    // addBack(selector?: string): PJQuery;
    addClass(className: string): PJQuery;
    addClass(fnc: (index: number, currentClassName: string) => String): PJQuery;
    append(content?: string): PJQuery;
    append(content: (index: number, html: string) => string): PJQuery;
    // Traversing > Miscellaneous Traversing
    addBack(selector?: string): PJQuery;
    addClass(className: String): this;
    attr(attributeName: string): Promise<string>;
    attr(attributeName: string, value: string): this;

    /* C */

    children(selector?: string): PJQuery;
    closest(selector?: string): PJQuery;
    css(propertyName: string): Promise<string>;
    css(propertyNames: string[]): Promise<string[]>;
    css(properties: { [keys: string]: string | number }): this;
    css(propertyName: string, value: string | number): this;
    css(propertyName: string, value: (index: number, value: string) => string | number): this;


    /* F */

    find(selector?: string): PJQuery;
    first(): PJQuery;

    /* H */

    html(): Promise<string>;
    html(test: string): PJQuery;

    /* I */

    is(className: String): Promise<boolean>;

    /* L */

    last(): PJQuery;

    /* M */
    // https://api.jquery.com/map/
    map(mapping: (index: number, element:any) => any): PJQuery;

    /* N */

    next(selector?: string): PJQuery;
    nextAll(selector?: string): PJQuery;
    nextUntil(selector?: string): PJQuery;

    /* P */

    parent(selector?: string): PJQuery;
    parents(selector?: string): PJQuery;
    parentsUntil(selector?: string): PJQuery;
    prev(selector?: string): PJQuery;
    prevAll(selector?: string): PJQuery;
    prevUntil(selector?: string, filter?: string): PJQuery;
    prop(attributeName: string): Promise<string>;
    prop(attributeName: string, value: string): this;

    /* R */

    removeAttr(attributeName: string): this;
    removeProp(attributeName: string): this;
    removeClass(className: String): this;

    /* S */

    siblings(selector?: string): PJQuery;


    /* T */

    text(): Promise<string>;
    text(test: string): PJQuery;


    /* V */

    val(): Promise<string>;
    val(test: string): PJQuery;

    // no way to implement it in a Proxy class
    // (): Promise<WrapElementHandle<any>[]>;
    exec(): Promise<WrapElementHandle<any>[]>;
    // get result as Javascript Plain Object
    pojo(): Promise<any[]>;    
}
