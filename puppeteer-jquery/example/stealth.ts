import { pageExtend, PageEx } from 'puppeteer-jquery'
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

const page1 = 'https://recaptcha-demo.appspot.com/recaptcha-v3-request-scores.php';

const main = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const pageEx: PageEx = pageExtend(page);
    await page.goto(page1, { waitUntil: 'domcontentloaded' }); // 'networkidle0'

    const go = await pageEx.waitForjQuery('button.go');
    // const go = await pageEx.waitForSelector('button.go');
    if (!go.length) {
        console.error('go button not found');
        return;
    }
    await pageEx.jQuery('button.go').map((index, element) => { jQuery(element).trigger('click'); })
    await page.$eval('button.go', (el: Element) => (el as HTMLElement).click()); 
    const r1 = await pageEx.waitForjQuery('pre.response:contains("score")');
    console.log(await r1[0].boundingBox());
    await page.screenshot({ path: 'testresult.png', fullPage: true })
    const result = await pageEx.jQuery('pre.response').text();
    console.log('score is:' + JSON.parse(result).score);
    await page.waitForTimeout(500);
    await page.close();
    await browser.close();
}
main();
