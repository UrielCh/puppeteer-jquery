// const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox']

import { PageEx } from "puppeteer-extra-plugin-jquery"
import puppeteer from "puppeteer-extra"

// const injector = require('puppeteer-extra-plugin-jquery/lib/injector');
// then use injector()
import { Plugin } from "puppeteer-extra-plugin-jquery"

!(async () => {
  puppeteer.use(new Plugin())
  const browser = await puppeteer.launch({ headless: false })
  const pageOrg = await browser.newPage();
  const page = pageOrg as unknown as PageEx;
  await page.goto('https://github.com/UrielCh/puppeteer-jquery/tree/master/puppeteer-jquery', { waitUntil: 'domcontentloaded' })
  // use waitForjQuery()
  const start = await page.waitForjQuery('span.Counter.js-social-count');
  console.log('selector match ', start.length, 'elements');
  // use any jQuery code.
  const cnt = await page.jQuery('span.Counter.js-social-count').text();
  console.log('this project have', cnt, 'start');
  await browser.close();
})()