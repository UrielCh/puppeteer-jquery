import { PageEx } from "puppeteer-extra-plugin-jquery";
import puppeteer from "puppeteer-extra";
import { Plugin } from "puppeteer-extra-plugin-jquery";
/// import { pipePort } from "./pipePort";
import { protoRevert } from "./pipews";

!(async () => {
  puppeteer.use(new Plugin());
  // "C:\Program Files\Google\Chrome\Application\chrome.exe" --profile-directory="bot" --remote-debugging-port=9222
  //  chrome-protocol-proxy.exe
  const protoRev = new protoRevert(9555, 9222);
  await protoRev.start();
  const browser = await puppeteer.connect({
    browserURL: "http://127.0.0.1:9555",
  });
  const pageOrg = await browser.newPage();
  const page = pageOrg as unknown as PageEx;
  await page.goto(
    "https://github.com/UrielCh/puppeteer-jquery/tree/master/puppeteer-jquery",
    { waitUntil: "domcontentloaded" }
  );
  // await prompts({ type: "text", name: "continue", message: "Are you ready ?" });
  // use waitForjQuery()
  const start = await page.waitForjQuery("span.Counter.js-social-count");
  console.log("selector match ", start.length, "elements");
  // use any jQuery code.
  const cnt = await page.jQuery("span.Counter.js-social-count").text();
  console.log("this project have", cnt, "start");
  // browser.disconnect();
  // await browser.close();
  // write down session data
  protoRev.writeSessions('code');
  console.log('all done');
  process.exit(0);
})();

// Debugger.scriptParsed