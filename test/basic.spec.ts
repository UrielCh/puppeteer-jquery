import { expect } from 'chai';
import { setupJQuery, BrowserEx, PageEx } from '../src';

let browser: BrowserEx;
let page: PageEx;
var jQuery: JQueryStatic;

before(async () => {
    browser = await setupJQuery({
        headless: true,
        args: [],
    });
    page = await browser.newPage();
});

after(async () => {
    await page.close();
    await browser.close();
});

describe('Basic Dom', () => {
    it('Selector + TEXT', async function () {
        await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
        let expectedTitle = 'Hello, world!';
        await page.jQuery('body').append(`<h1>${expectedTitle}</h1>`);
    }).timeout(2000);;

    // await page.goto('https://getbootstrap.com/docs/4.3/examples/jumbotron/', { waitUntil: 'domcontentloaded' });
    it('Get h1 text()', async () => {
        let expectedTitle = 'Hello, world!';
        let title = await page.jQuery('h1').text();
        expect(title).equal(expectedTitle);
    }).timeout(2000);

    it('update h1 text', async () => {
        let expectedTitle = 'Hello New';
        //.text("tmo") 
        await page.jQuery('h1').text(expectedTitle).exec();
        let title = await page.jQuery('h1').text();
        expect(title).equal(expectedTitle);
    }).timeout(2000);

    it('append h2', async () => {
        await page.jQuery('body').append(`<h2>Head 1</h2>`);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal('Head 1');
    }).timeout(2000);

    it('append h2 with arrow function', async () => {
        await page.jQuery('body').append(() => `<h2>Head 2</h2>`);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal('Head 1Head 2');
    }).timeout(2000);

    it('append h2 with full function', async () => {
        await page.jQuery('body').append((index: number, html: string) => { return `<h2>Head 3</h2>` });
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal('Head 1Head 2Head 3');
    }).timeout(2000);

    it('append h2 with full function using args', async () => {
        await page.jQuery('body').append((index: number, html: string) => { return `<h2>index ${index}</h2>` });
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal('Head 1Head 2Head 3index 0');
    }).timeout(2000);

    it('map fnc to POJO Basic', async () => {
        const ids = await page.jQuery('h2').map((id, elm)=>id).pojo();
        const expected = [0,1,2,3];
        expect(ids).eql(expected);
    }).timeout(2000);
    
    it('map fnc to POJO Advanced', async () => {
        const ids = await page.jQuery('h2').map((id, elm) => jQuery(elm).text()).pojo();
        const expected = ['Head 1', 'Head 2', 'Head 3', 'index 0'];
        expect(ids).eql(expected);
    }).timeout(2000);
});
