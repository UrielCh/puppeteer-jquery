import { expect } from 'chai';
import { setupJQuery, BrowserEx, PageEx } from '../src';

let browser: BrowserEx;
let page: PageEx;

before(async () => {
    browser = await setupJQuery({
        headless: false,
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
        await page.jQuery('body').append(`<h2>Heading</h2>`);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal('Heading');
    }).timeout(2000);

    it('append h2 with arrow function', async () => {
        await page.jQuery('body').append(() => `<h2>Heading</h2>`);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal('HeadingHeading');
    }).timeout(2000);

    it('append h2 with full function', async () => {
        await page.jQuery('body').append((index: number, html: string) => { return `<h2>Heading</h2>` });
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal('HeadingHeadingHeading');
    }).timeout(2000);

    it('append h2 with full function using args', async () => {
        await page.jQuery('body').append((index: number, html: string) => { return `<h2>Heading ${index}</h2>` });
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal('HeadingHeadingHeadingHeading 0');
    }).timeout(2000);
});
