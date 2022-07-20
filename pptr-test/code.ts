import Devtools from "@u4/chrome-remote-interface";
import fs from "fs";

function getContent(id: number): string {
  return fs.readFileSync("_raw" + id + ".js", { encoding: "utf-8" });
}
async function run1(devtools: Devtools) {
  const cdp = await devtools.connectFirst("browser");
  // connecte to ws://127.0.0.1:9222/devtools/browser/56d0e7cc-4a3b-46e5-9b71-fdd53d11bdd1
  await cdp.Target.getBrowserContexts(); // 1
  const wait1 = cdp.waitForAllEvents("Target.targetCreated");
  const targettargetCreated3P = cdp.Target.targetCreated();
  await cdp.Target.setDiscoverTargets({ "discover": true }); // 2
  const targettargetCreated3 = await targettargetCreated3P;
  await wait1;
  const targettargetCreated16P = cdp.Target.targetCreated();
  await cdp.Target.createTarget({ "url": targettargetCreated3.targetInfo.title }); // 3
  const targettargetCreated16 = await targettargetCreated16P;
  const targetattachedToTargetP = cdp.Target.attachedToTarget();
  const wait2 = cdp.waitForAllEvents("Target.targetInfoChanged");
  await cdp.Target.attachToTarget({ "targetId": targettargetCreated16.targetInfo.targetId, "flatten": true }); // 4
  const targetattachedToTarget = await targetattachedToTargetP;
  await wait2;
  await cdp.Page.enable({}, targetattachedToTarget.sessionId); // 5
  await cdp.Page.getFrameTree({}, targetattachedToTarget.sessionId); // 6
  await cdp.Target.setAutoAttach({ "autoAttach": true, "waitForDebuggerOnStart": false, "flatten": true }, targetattachedToTarget.sessionId); // 7
  await cdp.Performance.enable({}, targetattachedToTarget.sessionId); // 8
  await cdp.Log.enable({}, targetattachedToTarget.sessionId); // 9
  const wait3 = cdp.waitForAllEvents("Page.lifecycleEvent");
  await cdp.Page.setLifecycleEventsEnabled({ "enabled": true }, targetattachedToTarget.sessionId); // 10

  const runtimeexecutionContextCreatedP = cdp.Runtime.executionContextCreated();

  await cdp.Runtime.enable({}, targetattachedToTarget.sessionId); // 11
  await cdp.Network.enable({}, targetattachedToTarget.sessionId); // 12
  const runtimeexecutionContextCreated = await runtimeexecutionContextCreatedP;
  await wait3;
  await cdp.Page.addScriptToEvaluateOnNewDocument({ "source": "//# sourceURL=pptr://__puppeteer_evaluation_script__", "worldName": "__puppeteer_utility_world__" }, targetattachedToTarget.sessionId); // 13
  const wait4 = cdp.waitForAllEvents("Runtime.executionContextCreated");
  await cdp.Page.createIsolatedWorld({ "frameId": targettargetCreated16.targetInfo.targetId, "worldName": "__puppeteer_utility_world__", "grantUniveralAccess": true }, targetattachedToTarget.sessionId); // 14
  await wait4;
  const wait5 = cdp.waitForAllEvents("Page.frameResized");
  await cdp.Emulation.setDeviceMetricsOverride({ "mobile": false, "width": 800, "height": 600, "deviceScaleFactor": runtimeexecutionContextCreated.context.id, "screenOrientation": { "angle": 0, "type": "portraitPrimary" } }, targetattachedToTarget.sessionId); // 15
  await cdp.Emulation.setTouchEmulationEnabled({ "enabled": false }, targetattachedToTarget.sessionId); // 16
  await wait5;
  const wait6 = cdp.waitForAllEvents("Page.frameStartedLoading", "Page.lifecycleEvent", "Target.targetInfoChanged", "Runtime.executionContextsCleared", "Page.frameNavigated", "Runtime.executionContextCreated", "Page.loadEventFired");

  await cdp.Page.navigate({
    url: "https://github.com/UrielCh/puppeteer-jquery/tree/master/puppeteer-jquery",
    frameId: targettargetCreated16.targetInfo.targetId },
  targetattachedToTarget.sessionId); // 17

  await wait6;
  const runtimeexecutionContextCreated5P = cdp.Runtime.executionContextCreated();
  const wait7 = cdp.waitForAllEvents("Page.frameStoppedLoading", "Page.domContentEventFired", "Page.lifecycleEvent", "Network.requestWillBeSent", "Network.requestWillBeSentExtraInfo", "Network.responseReceivedExtraInfo", "Network.responseReceived", "Page.frameStartedLoading", "Runtime.executionContextsCleared", "Log.entryAdded", "Target.targetInfoChanged", "Page.frameNavigated", "Network.dataReceived", "Runtime.executionContextCreated", "Network.loadingFinished", "Page.navigatedWithinDocument");
  await cdp.Page.navigate({
    url: "https://github.com/UrielCh/puppeteer-jquery/tree/master/puppeteer-jquery",
    frameId: targettargetCreated16.targetInfo.targetId
  }, targetattachedToTarget.sessionId); // 18

  const runtimeexecutionContextCreated5 = await runtimeexecutionContextCreated5P;
  await wait7;
  const wait8 = cdp.waitForAllEvents("Network.requestWillBeSentExtraInfo", "Network.responseReceivedExtraInfo", "Network.requestWillBeSent", "Page.lifecycleEvent");
  const wait9 = cdp.waitForAllEvents("Network.loadingFinished", "Page.navigatedWithinDocument");  
  await cdp.Runtime.evaluate({
    expression: "d_197ksy6sjm3('span.Counter.js-social-count').toArray()\n//# sourceURL=pptr://__puppeteer_evaluation_script__",
    contextId: runtimeexecutionContextCreated5.context.id,
    returnByValue: false,
    awaitPromise: true,
    userGesture: true
  }, targetattachedToTarget.sessionId); // 19
  await wait8;

  await cdp.Runtime.evaluate({ "expression": getContent(1), "contextId": runtimeexecutionContextCreated5.context.id, "returnByValue": true, "awaitPromise": true, "userGesture": true }, targetattachedToTarget.sessionId); // 20
  await wait9;

  //const wait10 = cdp.waitForAllEvents("Network.requestWillBeSentExtraInfo", "Network.responseReceivedExtraInfo");
  const runtimeevaluate3 = await cdp.Runtime.evaluate({ "expression": "d_197ksy6sjm3('span.Counter.js-social-count').toArray()\n//# sourceURL=pptr://__puppeteer_evaluation_script__", "contextId": runtimeexecutionContextCreated5.context.id, "returnByValue": false, "awaitPromise": true, "userGesture": true }, targetattachedToTarget.sessionId); // 21
  // await wait10;
  const props1 = await cdp.Runtime.getProperties({ "objectId": runtimeevaluate3.result.objectId!, "ownProperties": true }, targetattachedToTarget.sessionId); // 22
  await cdp.Runtime.releaseObject({ "objectId": runtimeevaluate3.result.objectId! }, targetattachedToTarget.sessionId); // 23
  const { result  } = await cdp.Runtime.evaluate({ "expression": "d_197ksy6sjm3('span.Counter.js-social-count').text()\n//# sourceURL=pptr://__puppeteer_evaluation_script__", "contextId": runtimeexecutionContextCreated5.context.id, "returnByValue": false, "awaitPromise": true, "userGesture": true }, targetattachedToTarget.sessionId); // 24
  console.log(props1);
  console.log({result});
  console.log("====");
}

run1(new Devtools()).catch(console.error);
