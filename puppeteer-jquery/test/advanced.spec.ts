import 'mocha';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { setupJQuery, BrowserEx, PageEx, jQueryName } from '../src';
import jq from 'jquery'
var jQuery: typeof jq;

const html = fs.readFileSync(path.join(__dirname, './sample.html'), { encoding: 'utf8' });


let browser: BrowserEx;// <PageEx>;
let page: PageEx;

before(async () => {
    browser = await setupJQuery({
        headless: true,
        args: [],
    });
    page = await browser.newPage();
    await page.goto('data:text/html,' + html);
});

after(async () => {
    await page.close();
    await browser.close();
});


describe('complex getter', async () => {
    it('basic query', async () => {
        const zones = await page.jQuery(':contains("keyword")').exec();
        expect(zones.length).equal(14)
    })

    it('query no chidren function', async () => {
        const zones = await page.jQuery(':contains("keyword")').filter(function f() { return jQuery(this).children().length === 0 }).exec();
        expect(zones.length).equal(3)
    })

    it('query no chidren arrow', async () => {
        const zones = await page.jQuery(':contains("keyword")').filter((i, elm) => jQuery(elm).children().length === 0).exec();
        expect(zones.length).equal(3)
    })

    it('query exact arrow', async () => {
        const zones = await page.jQuery(':contains("keyword")').filter((i, elm) => jQuery(elm).text() === "keyword").exec();
        expect(zones.length).equal(2)
    })

    it('query exact no chidren', async () => {
        const zones = await page.jQuery(':contains("keyword")').filter((i, elm) => { const q = jQuery(elm); return q.text() === 'keyword' && !q.children().length }).exec();
        expect(zones.length).equal(1)
    })

    it('query exact no chidren dynamic', async () => {
        const text = 'keyword';
        const selector = `:contains("${text.replace(/"/, '\"')}")`;

        const zones = await page.jQuery(selector).filter((i, elm) => { const q = jQuery(elm); return q.text() === text && !q.children().length }).exec({ text });
        expect(zones.length).equal(1)
    })

    // it('query exact', async () => {
    //     const zones = await page.jQuery(':contains("keyword")').exec();
    //     expect(zones.length).equal(5)
    // })

})