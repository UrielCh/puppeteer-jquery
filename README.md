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

### Usage

Handle `Page` instance as `PageEx`, and get access to `page.jQuery(selector: string)`

```Typescript
let browser = await launch({headless: true});
let pageOrg = await browser.newPage();
let page = pageExtand(pageOrg);
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
```

## around this project

* [melbourne2991/jquery-puppeteer](https://github.com/melbourne2991/jquery-puppeteer) Simple JQuery integration, by adding a `page.evalJquery()`.
* [berstend/puppeteer-extra](https://github.com/berstend/puppeteer-extra) A plugin proposal standard for puppeteer (not used by the way).
