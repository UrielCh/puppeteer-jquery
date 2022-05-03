import 'mocha';
import { expect } from 'chai';
import { setupJQuery, BrowserEx, PageEx } from '../src';
import fs from 'fs';
import path from 'path';
import jq from 'jquery'
var jQuery: typeof jq;
// var jQuery: JQueryStatic;

let browser: BrowserEx;// <PageEx>;
let page: PageEx;//<IJQueryAble>;

before(async () => {
    browser = await setupJQuery({
        headless: true,
        args: [],
    });
    page = await browser.newPage();
    const html = await fs.promises.readFile(path.join(__dirname, 'test.html'), { encoding: 'utf8' });
    await page.setContent(html);
});

after(async () => {
    await page.close();
    await browser.close();
});

describe('Data scraping', () => {
    it('Get all title texts', async function () {
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        let expectedTitles = ['a mug', 'a hat'];
        const data = await page
            .jQuery('.title')
            .map((id: number, elm: HTMLElement) => elm.textContent)
            .pojo<string>();
        expect(data).deep.equal(expectedTitles, 'Get all title texts');

    }).timeout(2000);

    it('Scrape complex datas', async function () {
        let expectedData = [
            {
                "title": "a mug",
                "price": 15,
                "style": "data promo-red"
            },
            {
                "title": "a hat",
                "price": 36,
                "style": "data"
            },
        ];
        const data = await page.jQuery('div.card')
            .map((id: number, elm: HTMLElement) => {
                const title = jQuery(elm).find('.title').text();
                const price = Number(jQuery(elm).find('.price').text());
                const style = jQuery(elm).find('.data').attr('class');
                return { title, price, style };
            }).pojo<string>();
        expect(data).deep.equal(expectedData, 'Get datas');

    }).timeout(2000);
});
