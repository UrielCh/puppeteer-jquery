# puppeteer-extra-plugin-jquery  [![npm](https://img.shields.io/npm/v/puppeteer-extra-plugin-jquery.svg)](https://www.npmjs.com/package/puppeteer-extra-plugin-jquery)

> A plugin for [puppeteer-extra](https://github.com/berstend/puppeteer-extra) to use jQuery selector in puppeteer

## Install

```bash
yarn add puppeteer-extra-plugin-jquery
# - or -
npm install puppeteer-extra-plugin-jquery
```

If this is your first [puppeteer-extra](https://github.com/berstend/puppeteer-extra) plugin here's everything you need:

```bash
yarn add puppeteer puppeteer-extra puppeteer-extra-plugin-jquery
# - or -
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-jquery
```

## Usage Javascript

```js
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')

// add jquery plugin
const jQueryPlugin = require('puppeteer-extra-plugin-jquery/lib/injector');
puppeteer.use(jQueryPlugin())

// puppeteer usage as normal
puppeteer.launch({ headless: true }).then(async browser => {
  console.log('Running tests..')
  const page = await browser.newPage()
  await pageX.goto('https://github.com/UrielCh/puppeteer-jquery/tree/master/puppeteer-jquery', { waitUntil: 'domcontentloaded' })
  // use waitForjQuery()
  const start = await pageX.waitForjQuery('span.Counter.js-social-count');
  console.log('selector match ', start.length, 'elements');
  // use any jQuery code.
  const cnt = await pageX.jQuery('span.Counter.js-social-count').text();
  console.log('this project have', cnt, 'start');
  await browser.close();
}

```

## Usage TypeScript

> `puppeteer-extra-plugin-jquery` is intend to be use in TS to unleash its full potential
> Typing is available for most jQuery syntax.

```ts
import puppeteer from 'puppeteer-extra'
import { Plugin, PageEx } from 'puppeteer-extra-plugin-jquery'

puppeteer
  .use(new Plugin())
  .launch({ headless: true })
  .then(async browser => {
    const pageOrg = await browser.newPage()
    // cast page as PageEx (will pe update with future puppeteer-extra version)
    const page = pageOrg as unknown as PageEx;
    await page.goto('https://github.com/UrielCh/puppeteer-jquery/tree/master/puppeteer-jquery', { waitUntil: 'domcontentloaded' })
    const start = await page.waitForjQuery('span.Counter.js-social-count');
    console.log('selector match ', start.length, 'elements');
    const cnt = await page.jQuery('span.Counter.js-social-count').text();
    console.log('this project have', cnt, 'start');
    await browser.close();
  })
```

This plugin fullname is `puppeteer-extra-plugin-jquery/lib/Plugin`


<details>
 <summary><strong>Old doc without puppeteer-extra</strong></summary><br/>

## Old doc

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

```bash
npm init -y
npm install puppeteer-extra puppeteer-extra-plugin-stealth puppeteer

```

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
    const go = await pageEx.waitForjQuery('button.go');
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

```

### Notes

You may also install `@types/jquery` dependence for more complex JQuery task, in this case always use `jQuery` method, do not use `$` sortcut, the bundeled jQuery will be renamed before being injected. the injection process rename fullname `jQuery` to the rigth value before injections.

## changelog
* V0.3.9 fix jQuery.filter() signature
* V0.3.8 update typing
* V0.3.7 add getJQueryName(), jQuery.filter(), add onTimeout options
* V0.3.6 update docs
* V0.3.5 project renamed to puppeteer-extra-plugin-jquery and can be use with [berstend/puppeteer-extra](https://github.com/berstend/puppeteer-extra)
* V0.3.3 improve typing + update all deps
* V0.3.0 Add a advance example in doc, improve map signature, add not(), offsetParent(), update is(), add scrapping test, unify code to work with playwright
* V0.2.1 Add a advance example in doc, improve map signature, add not(), offsetParent(), update is(), add scrapping test.
* V0.2.0 project backmto live, puppeter is now writen in typescript, add some jquery method (attr(string), css(string), prop(string))
* V0.1.8 change waitForjQuery return type to ElementHandle[]
* V0.1.7 add waitForjQuery
* V0.1.6 update doc

## around this project

* [melbourne2991/jquery-puppeteer](https://github.com/melbourne2991/jquery-puppeteer) Simple JQuery integration, by adding a `page.evalJquery()`.
* [playwright-jquery](https://www.npmjs.com/package/playwright-jquery) The playwright version.
