import 'mocha';
import { expect } from 'chai';
import { setupJQuery, BrowserEx, PageEx } from '../src';
import jq from 'jquery'
var jQuery: typeof jq;
// var jQuery: JQueryStatic;

let browser: BrowserEx;// <PageEx>;
let page: PageEx;

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
    const testclass = 'clsh1';
    it('Selector + TEXT', async function () {
        await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
        let expectedTitle = 'Hello, world!';
        await page.jQuery('body').append(`<h1 class="${testclass}">${expectedTitle}</h1>`).exec();
        expect(true);
    }).timeout(10000);

    it('Get h1.attr()', async () => {
        let value = await page.jQuery('h1').attr('class');
        expect(value).equal(testclass);
    }).timeout(2000);

    // await page.goto('https://getbootstrap.com/docs/4.3/examples/jumbotron/', { waitUntil: 'domcontentloaded' });
    it('Get h1 text()', async () => {
        let expectedTitle = 'Hello, world!';
        let title = await page.jQuery('h1').text();
        expect(title).equal(expectedTitle);
    }).timeout(2000);

    it('Update h1 text with .exec()', async () => {
        let expectedTitle = 'Hello New';
        //.text("tmo") 
        await page.jQuery('h1').text(expectedTitle).exec();
        let title = await page.jQuery('h1').text();
        expect(title).equal(expectedTitle);
    }).timeout(2000);

    it('Update h1 text without .exec()', async () => {
        let expectedTitle = 'Hello New2';
        //.text("tmo") 
        await page.jQuery('h1').text(expectedTitle);
        let title = await page.jQuery('h1').text();
        expect(title).equal(expectedTitle);
    }).timeout(2000);

    let currentText: string[] = []
    it('Append h2 with .exec()', async () => {
        const newText = 'Head 1';
        await page.jQuery('body').append(`<h2>${newText}</h2>`).exec();
        currentText.push(newText);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal(currentText.join(''));
    }).timeout(2000);

    it('Append h2 without .exec()', async () => {
        const newText = 'Head 1X';
        await page.jQuery('body').append(`<h2>${newText}</h2>`);
        currentText.push(newText);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal(currentText.join(''));
    }).timeout(2000);

    it('Append h2 with arrow function with .exec()', async () => {
        const newText = 'Head 2';
        await page.jQuery('body').append(() => `<h2>Head 2</h2>`).exec();
        currentText.push(newText);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal(currentText.join(''));
    }).timeout(2000);

    it('Append h2 with arrow function without .exec()', async () => {
        const newText = 'Head 2';
        await page.jQuery('body').append(() => `<h2>Head 2</h2>`);
        currentText.push(newText);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal(currentText.join(''));
    }).timeout(2000);

    it('Append h2 with full function with .exec()', async () => {
        const newText = 'Head 5';
        await page.jQuery('body').append((index: number, html: string) => { return `<h2>Head 5</h2>` }).exec();
        currentText.push(newText);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal(currentText.join(''));
    }).timeout(2000);

    it('Append h2 with full function using args with .exec()', async () => {
        const newText = 'index 0';
        await page.jQuery('body').append((index: number, html: string) => { return `<h2>index ${index}</h2>` }).exec();
        currentText.push(newText);
        let h2Texts = await page.jQuery('h2').text();
        expect(h2Texts).equal(currentText.join(''));
    }).timeout(2000);

    it('Map fnc to POJO Basic', async () => {
        const ids = await page.jQuery('h2').map((id, elm) => id).pojo();
        const expected = currentText.map((v, n) => n);
        expect(ids).eql(expected);
    }).timeout(2000);

    it('Map fnc to POJO Advanced', async () => {
        const ids = await page.jQuery('h2').map((id, elm) => jQuery(elm).text()).pojo();
        expect(ids).eql(currentText);
    }).timeout(2000);
});
