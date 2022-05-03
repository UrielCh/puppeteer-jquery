# Puppeteer-JQuery

I have started my automation browser scripts in 2006, far before *Chrome Devtools Protocol* was available, even before Chrome.
I had maintained this private project for more than a decade, and during this period this automation plateforme evolved quickly get based on JQuery selector to identify elements.
Now I'm trying to merge my stuff with the open source automation mainstream.

## overview

This glue code is developed in Typescript, because I like Typescript and it evolves very fast.
Typescript allows you to use JQuery into your remote browser without conflict, and uses the IDE's code completion as much as possible.

### Integration 

This puppeteer does not expose many of his classes, so to register my extension, I need an instance of `Page` to patch its prototype.
so there are two ways to setup this jquery:
* Using at least one time the `function pageExtend(page: Page): PageEx`
* Calling `function setupJQuery(): Promise<BrowserEx>` once that will create and enable jQuery in an headless browser.
The JQuery extra code won't be add to any of your page until you use it.

### Usage [typescript]

Handle `Page` instance as `PageEx`, and get access to `page.jQuery(selector: string)`

```bash
npm install puppeteer
npm install puppeteer-jquery
npm install --save-dev typescript @types/node ts-node
```

```Typescript
import puppeteer from 'puppeteer';
import { pageExtend } from 'puppeteer-jquery';

(async () => {
    let browser = await puppeteer.launch({headless: true});
    let pageOrg = await browser.newPage();
    let page = pageExtend(pageOrg);
    await page.jQuery('body').append(`<h1>Title</h1> <div><h3>sub-title <i>X</i><h3> <h4>h4</h4></div>`);
    // get the H1 value
    let title = await page.jQuery('h1').text();
    // chain calls
    let text = await page.jQuery('body i:last')
        .closest('div')
        .find('h3')
        .css('color', 'yellow')
        .parent()
        .find(':last')
        .text();
    console.log('this page contains H1:', title);
    console.log('last h4 contains', text);
})();
```


### Usage [javascript]

Handle `Page` instance as `PageEx`, and get access to `page.jQuery(selector: string)`

```bash
npm install puppeteer
npm install puppeteer-jquery
```

```Typescript
const puppeteer = require ('puppeteer');
const { pageExtend } = require('puppeteer-jquery');

(async () => {
    let browser = await puppeteer.launch({headless: true});
    let pageOrg = await browser.newPage();
    let page = pageExtend(pageOrg);
    await page.jQuery('body').append(`<h1>Title</h1> <div><h3>sub-title <i>X</i><h3> <h4>h4</h4></div>`);
    // get the H1 value
    let title = await page.jQuery('h1').text();
    // chain calls
    let text = await page.jQuery('body i:last')
        .closest('div')
        .find('h3')
        .css('color', 'yellow')
        .parent()
        .find(':last')
        .text();
    console.log('this page contains H1:', title);
    console.log('last h4 contains', text);
})();
```

### Advanced common usage [typescript]

```bash
npm install puppeteer
npm install puppeteer-jquery
npm install --save-dev typescript @types/node ts-node
```

```Typescript
import puppeteer from 'puppeteer';
import { pageExtend } from 'puppeteer-jquery'

(async() =>{
    let browser = await puppeteer.launch({headless: true});
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

### Advanced common usage [javascript]

```bash
npm install -g typescript @types/node ts-node

npm init -y
npm install puppeteer puppeteer-jquery picocolors
npm --save-dev install @types/jquery
```

Fill tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": [ "DOM", "ES2017" ],
    "types": [ "node", "jquery" ],
    "module": "commonjs",
    "esModuleInterop": true,
    "strict": true,
  }
}
```

Fill your the code in index.ts
```Typescript
import puppeteer from 'puppeteer';
import { pageExtend } from 'puppeteer-jquery';
import pc from 'picocolors';
import type jq from 'jquery'
var jQuery: typeof jq;
(async() =>{
    let browser = await puppeteer.launch({headless: false});
    let pageOrg = await browser.newPage();
    await pageOrg.goto('https://github.com/UrielCh/puppeteer-jquery', { waitUntil: 'networkidle2' });
    let jqPage = pageExtend(pageOrg);
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
})();

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

### Advanced common usage [javascript]

```bash
npm init -y
npm install puppeteer puppeteer-jquery picocolors
npm --save-dev install @types/jquery
```

Fill your the code in index.js
```javascript
const puppeteer = require('puppeteer');
const { pageExtend }  = require('puppeteer-jquery');
const pc = require('picocolors');

var jQuery;
(async() =>{

    let browser = await puppeteer.launch({headless: false});
    let pageOrg = await browser.newPage();
    await pageOrg.goto('https://github.com/UrielCh/puppeteer-jquery', { waitUntil: 'networkidle2' });
    let jqPage = pageExtend(pageOrg);
    /** @type {string} */
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
})();

```
`ts-node index.ts`

output:
```
my project is only 3220⭐
file .vscode is Directory had been change 13 months ago
file playwright-jquery is Directory had been change 4 months ago
file puppeteer-jquery is Directory had been change 4 months ago
file .gitignore is File had been change 3 years ago
file LICENSE is File had been change 3 years ago
file README.md is File had been change 13 months ago
```

### Usage Mixed with puppeteer-extra

```Typescript
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

* V3.3 improve typing + update all deps
* V3.0 Add a advance example in doc, improve map signature, add not(), offsetParent(), update is(), add scrapping test, unify code to work with playwright
* V2.1 Add a advance example in doc, improve map signature, add not(), offsetParent(), update is(), add scrapping test.
* V2.0 project backmto live, puppeter is now writen in typescript, add some jquery method (attr(string), css(string), prop(string))
* V1.8 change waitForjQuery return type to ElementHandle[]
* V1.7 add waitForjQuery
* V1.6 update doc

## around this project

* [melbourne2991/jquery-puppeteer](https://github.com/melbourne2991/jquery-puppeteer) Simple JQuery integration, by adding a `page.evalJquery()`.
* [berstend/puppeteer-extra](https://github.com/berstend/puppeteer-extra) A plugin proposal standard for puppeteer (not used by the way).
* [playwright-jquery](https://www.npmjs.com/package/playwright-jquery) The playwright version.
