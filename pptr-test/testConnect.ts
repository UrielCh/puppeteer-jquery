import { PageEx } from "puppeteer-extra-plugin-jquery";
import puppeteer from "puppeteer-extra";
import { Plugin } from "puppeteer-extra-plugin-jquery";
/// import { pipePort } from "./pipePort";
import { ProtoEvent, protoRevert } from "./pipews";
import fs from "fs";

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

  // DONE
  console.log(protoRev.sessions.length);
  const [session] = protoRev.sessions;
  // const session = protoRev.sessions[protoRev.sessions.length - 1];
  let code = 'async function run(cdp: any) {\r\n';

  let waitEvents = new Set<string>;

  const ls = '  ';

  const flushWait = () => {
    if (waitEvents.size) {
      code += `${ls}await cdp.waitForAllEvents(`;
      code += [...waitEvents].map(a => `"${a}"`).join(', ');
      code += `);\r\n`;
      waitEvents.clear();
    }
  }

  for (const message of session.logs) {
    if ('id' in message) {
      flushWait();
      const { id } = message;
      const meta = session.requests.get(id);
      if (!meta)
        continue;
      code += ls;
      if (meta.used) {
        code += `const ${meta.name} = `;
      }
      code += `await cdp.${meta.req.method}(`;
      if (meta.req.params || meta.req.sessionId) {
        let params = JSON.stringify(meta.req.params || {});
        params = params.replace(/"\$\{([A-Za-z0-9_.]+)\}"/g, '$1');
        //${TargetcreateTarget.targetId}"
        code += params;
      }
      if (meta.req.sessionId) {
        code += ', '
        code += meta.req.sessionId.replace(/\$\{([A-Za-z0-9_.]+)\}/g, '$1');
      }
      code += `); // ${meta.req.id}`;
      code += '\r\n';
    } else {
      // events
      const mevent = message as ProtoEvent;
      if (mevent.name) {
        // used event;
        code += `${ls}const ${mevent.name} = `;
        code += `await cdp.${mevent.method}();`;
        code += '\r\n';
      } else {
        waitEvents.add(mevent.method);
      }
    }
  }
  code += '}\r\n';
  fs.writeFileSync('code.ts', code, {encoding: 'utf8'});
  console.log('all done');
})();

// Debugger.scriptParsed