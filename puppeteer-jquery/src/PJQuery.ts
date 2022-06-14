import { WrapElementHandle } from "puppeteer";

type PJQueryHybrid<TElement = HTMLElement> = PJQuery<TElement> & Promise<PJQuery<TElement>>

/**
 * Puppeter JQuery interface
 * TODO map and test most of https://api.jquery.com/
 */
export interface PJQuery<TElement = HTMLElement> {
    /* A */

    add(selector?: string): PJQueryHybrid;
    add(html?: string): PJQueryHybrid;
    // add( selector, context )
    // addBack(selector?: string): PJQuery;
    addClass(className: string): PJQueryHybrid;
    addClass(fnc: (index: number, currentClassName: string) => String): PJQueryHybrid;
    append(content?: string): PJQueryHybrid;
    append(content: (index: number, html: string) => string): PJQueryHybrid;
    // Traversing > Miscellaneous Traversing
    addBack(selector?: string): PJQuery;
    addClass(className: String): this;
    attr(attributeName: string): Promise<string>;
    attr(attributeName: string, value: string): this;

    /* C */

    children(selector?: string): PJQueryHybrid;
    closest(selector?: string): PJQueryHybrid;
    css(propertyName: string): Promise<string>;
    css(propertyNames: string[]): Promise<string[]>;
    css(properties: { [keys: string]: string | number }): this;
    css(propertyName: string, value: string | number): this;
    css(propertyName: string, value: (index: number, value: string) => string | number): this;

    /* E */

    eq(index: number): PJQueryHybrid;

    /* F */

    filter(selector_function_selection_elements: String | ((this: TElement, index: number, element: TElement) => boolean)): PJQueryHybrid;    
    find(selector?: string): PJQueryHybrid;
    first(): PJQueryHybrid;

    /* H */

    html(): Promise<string>;
    html(test: string): PJQueryHybrid;

    /* I */

    is(selector_function_selection_elements: String | ((this: TElement, index: number, element: TElement) => boolean)): Promise<boolean>;

    /* L */

    last(): PJQueryHybrid;

    /* M */
    // https://api.jquery.com/map/
    map(callback: (this: TElement, index: number, element: TElement) => any): PJQueryHybrid;

    /* N */

    next(selector?: string): PJQueryHybrid;
    nextAll(selector?: string): PJQueryHybrid;
    nextUntil(selector?: string): PJQueryHybrid;
    not(selector_function_selection: string | ((this: TElement, index: number, element: TElement) => boolean)): PJQueryHybrid;

    /* O */

    offsetParent(): PJQueryHybrid;

    /* P */

    parent(selector?: string): PJQueryHybrid;
    parents(selector?: string): PJQueryHybrid;
    parentsUntil(selector?: string): PJQueryHybrid;
    prev(selector?: string): PJQueryHybrid;
    prevAll(selector?: string): PJQueryHybrid;
    prevUntil(selector?: string, filter?: string): PJQueryHybrid;
    prop(attributeName: string): Promise<string>;
    prop(attributeName: string, value: string): this;

    /* R */

    removeAttr(attributeName: string): this;
    removeProp(attributeName: string): this;
    removeClass(className: String): this;

    /* S */

    siblings(selector?: string): PJQueryHybrid;

    /* T */

    text(): Promise<string>;
    text(test: string): PJQueryHybrid;

    /* V */

    val(): Promise<string>;
    val(test: string): PJQueryHybrid;

    // no way to implement it in a Proxy class
    // (): Promise<WrapElementHandle<any>[]>;
    exec(): Promise<WrapElementHandle<any>[]>;
    // get result as Javascript Plain Object
    pojo<T = any>(): Promise<T[]>;
}
