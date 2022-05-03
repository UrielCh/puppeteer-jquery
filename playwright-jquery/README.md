# Playwright-JQuery

This is a port from [puppeteer-JQuery](https://www.npmjs.com/package/puppeteer-jquery) to Playwright.

## overview

This glue code is developed in Typescript, because I like Typescript and it evolves very fast.
Typescript allows you to use JQuery into your remote browser without conflict, and uses the IDE's code completion as much as possible.

### Integration 

This puppeteer does not expose many of his classes, so to register my extension, I need an instance of `Page` to patch its prototype.
so there are two ways to setup this jquery:
* Using at least one time the `function pageExtend(page: Page): PageEx`
* Calling `function setupJQuery(): Promise<BrowserEx>` once that will create and enable jQuery in an headless browser.
The JQuery extra code won't be add to any of your page until you use it.

### Usage

Handle `Page` instance as `PageEx`, and get access to `page.jQuery(selector: string)`

```bash
npm install puppeteer
npm install puppeteer-jquery
```

```Typescript
import puppeteer from 'puppeteer';
import { pageExtend } from 'puppeteer-jquery'

(async() =>{
    let browser = await puppeteer.launch({headless: true});
    let pageOrg = await browser.newPage();
    let page = pageExtend(pageOrg);
    // append a <H1>
    await page.jQuery('body').append(`<h1>Title</h1>`);
    // get the H1 value
    let title = await page.jQuery('h1').text();
    // chain calls
    let text = await page.jQuery('body button:last')
              .closest('div')
              .find('h3')
              .css('color', 'yellow')
              .parent()
              .find(':last')
              .text();
})();
```

### Advanced common usage

```bash
npm install playwright
npm install playwright-jquery
```

```Typescript
import playwright from 'playwright';
import { pageExtend } from 'playwright-jquery'

(async() =>{
    let browser = await playwright.launch({headless: true});
    let pageOrg = await browser.newPage();
    await page.goto('http://maywebsite.abc', {
        waitUntil: 'networkidle2',
    });
    
    let page = pageExtend(pageOrg);
    
    // get all li text in the page as an array
    const data: string[] = await jqPage
        .jQuery('li')
        .map((id: number, elm: HTMLElement) => elm.textContent)
        .pojo();
})();
```
`data` contains somethink like:

```javascript
 [ "a mug", "a hat"]
```


### Still more advanced common usage [typescript]

```bash
npm install -g typescript @types/node ts-node

npm init -y
npm install playwright playwright-jquery picocolors
npm --save-dev install @types/jquery
```

Fill tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": [ "DOM", "es2017" ],
    "types": [ "node", "jquery" ],
    "module": "commonjs",
    "esModuleInterop": true,
    "strict": true,
  }
}
```

Fill your the code in index.ts
```Typescript
import { setupJQuery, BrowserEx, PageEx } from '..';
import pc from 'picocolors';

async function run() { 
    const browser: BrowserEx = await setupJQuery({
        headless: true,
        args: [],
    });
    const jqPage: PageEx = await browser.newPage();
    await jqPage.goto('https://github.com/UrielCh/puppeteer-jquery', { waitUntil: 'networkidle' });

    const stars: string = await jqPage.jQuery('#repo-stars-counter-star').text();
    console.log(`my project is only ${pc.yellow(stars)}⭐`);
    const files = await jqPage.jQuery('div[aria-labelledby="files"] > div[role="row"].Box-row')
        .map((id: number, elm: HTMLElement) => {
             const div = jQuery(elm);
             const icon = (div.find('[role="gridcell"] [aria-label]:first').attr('aria-label') || '').trim();
             const filename = (div.find('div[role="rowheader"]').text() || '').trim();
             const lastChange = (div.find('[role="gridcell"]:last').text() || '').trim();
             return {icon, filename, lastChange};
        }).pojo<{icon: string, filename: string, lastChange: string}>();
    for (const file of files) {
        console.log(`file ${pc.green(file.filename)} is ${file.icon} had been change ${file.lastChange} `);
    }
    browser.close()
}
run();
```


`ts-node index.ts`
```
my project is only 3219⭐
file .vscode is Directory had been change 13 months ago
file playwright-jquery is Directory had been change 4 months ago
file puppeteer-jquery is Directory had been change 4 months ago
file .gitignore is File had been change 3 years ago
file LICENSE is File had been change 3 years ago
file README.md is File had been change 13 months ago
```



### Still more advanced common usage [javascript]

```bash
npm init -y
npm install playwright playwright-jquery picocolors
npm --save-dev install @types/jquery
```

Fill your the code in index.js
```javascript
const { setupJQuery } = require('..');
const pc = require('picocolors');

async function run() { 
    const browser = await setupJQuery({
        headless: true,
        args: [],
    });
    const jqPage = await browser.newPage();
    await jqPage.goto('https://github.com/UrielCh/puppeteer-jquery', { waitUntil: 'networkidle' });
    
    const stars = await jqPage.jQuery('#repo-stars-counter-star').text();
    console.log(`my project is only ${pc.yellow(stars)}⭐`);
    const files = await jqPage.jQuery('div[aria-labelledby="files"] > div[role="row"].Box-row')
        .map((id, elm) => {
             const div = jQuery(elm);
             const icon = (div.find('[role="gridcell"] [aria-label]:first').attr('aria-label') || '').trim();
             const filename = (div.find('div[role="rowheader"]').text() || '').trim();
             const lastChange = (div.find('[role="gridcell"]:last').text() || '').trim();
             return {icon, filename, lastChange};
        }).pojo();
    for (const file of files) {
        console.log(`file ${pc.green(file.filename)} is ${file.icon} had been change ${file.lastChange} `);
    }
    browser.close()
}
run();```


`node index.js`
my project is only 3220⭐
file .vscode is Directory had been change 13 months ago
file playwright-jquery is Directory had been change 4 months ago
file puppeteer-jquery is Directory had been change 4 months ago
file .gitignore is File had been change 3 years ago
file LICENSE is File had been change 3 years ago
file README.md is File had been change 13 months ago
```

### Usage Mixed with playwright-extra

```Typescript
import { pageExtend, PageEx } from 'playwright-jquery'
import playwright from 'playwright-extra';
import StealthPlugin from 'playwright-extra-plugin-stealth'
playwright.use(StealthPlugin())

const page1 = 'https://recaptcha-demo.appspot.com/recaptcha-v3-request-scores.php';

const main = async () => {
    const browser = await playwright.launch({ headless: false });
    const page = await browser.newPage();
    const pageEx: PageEx = pageExtend(page);
    await page.goto(page1, { waitUntil: 'domcontentloaded' }); // 'networkidle0'
    const r1 = await pageEx.waitForjQuery('pre.response:contains("score")');
    console.log(await r1[0].boundingBox());
    await page.screenshot({ path: 'testresult.png', fullPage: true })
    const result = await pageEx.jQuery('pre.response').text();
    console.log('score is:' + JSON.parse(result).score);
    await page.waitFor(500);
    await page.close();
    await browser.close();
}
main();
```

### Notes

You may also install `@types/jquery` dependence for more complex JQuery task, in this case always use `jQuery` method, do not use `$` sortcut, the bundeled jQuery will be renamed before being injected. the injection process rename fullname `jQuery` to the rigth value before injections.


## changelog

* V3.0 first verion ported from puppeteer-jquery 0.3.0
* V2.0 project backmto live, puppeter is now writen in typescript, add some jquery method (attr(string), css(string), prop(string))
* V1.8 change waitForjQuery return type to ElementHandle[]
* V1.7 add waitForjQuery
* V1.6 update doc

## around this project

* [berstend/puppeteer-extra](https://github.com/berstend/puppeteer-extra) A plugin proposal standard for puppeteer/playwright (not used by the way).
* [puppeteer-jquery](https://www.npmjs.com/package/puppeteer-jquery) The puppeter version.
