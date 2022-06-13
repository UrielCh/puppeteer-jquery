// const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox']

import { PageEx } from "puppeteer-extra-plugin-jquery"
import puppeteer from "puppeteer-extra"

const plugin = require('puppeteer-extra-plugin-jquery/lib/Plugin');

!(async () => {
  puppeteer.use(plugin())
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage();
  const pageX = page as unknown as PageEx;
  await pageX.goto('https://github.com/UrielCh/puppeteer-jquery/tree/master/puppeteer-jquery', { waitUntil: 'domcontentloaded' })
  const start = await pageX.waitForjQuery('span.Counter.js-social-count');
  console.log('start elment', start.length);
  const cnt = await pageX.jQuery('span.Counter.js-social-count').text();
  console.log('start count', cnt);
  await browser.close();
})()