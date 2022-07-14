async function run(cdp: any) {
  await cdp.Target.getBrowserContexts(); // 1
  await cdp.Target.setDiscoverTargets({ "discover": true }); // 2
  await cdp.waitForAllEvents("Target.targetCreated");
  await cdp.Target.createTarget({ "url": "about:blank" }); // 3
  const TargettargetCreated17 = await cdp.Target.targetCreated();
  await cdp.Target.attachToTarget({ "targetId": TargettargetCreated17.targetInfo.targetId, "flatten": true }); // 4
  const TargetattachedToTarget21 = await cdp.Target.attachedToTarget();
  await cdp.waitForAllEvents("Target.targetInfoChanged");
  await cdp.Page.enable({}, TargetattachedToTarget21.sessionId); // 5
  await cdp.Page.getFrameTree({}, TargetattachedToTarget21.sessionId); // 6
  await cdp.Target.setAutoAttach({ "autoAttach": true, "waitForDebuggerOnStart": false, "flatten": true }, TargetattachedToTarget21.sessionId); // 7
  await cdp.Performance.enable({}, TargetattachedToTarget21.sessionId); // 8
  await cdp.Log.enable({}, TargetattachedToTarget21.sessionId); // 9
  await cdp.Page.setLifecycleEventsEnabled({ "enabled": true }, TargetattachedToTarget21.sessionId); // 10
  await cdp.Runtime.enable({}, TargetattachedToTarget21.sessionId); // 11
  await cdp.Network.enable({}, TargetattachedToTarget21.sessionId); // 12
  const RuntimeexecutionContextCreated35 = await cdp.Runtime.executionContextCreated();
  await cdp.waitForAllEvents("Page.lifecycleEvent");
  await cdp.Page.addScriptToEvaluateOnNewDocument({ "source": "//# sourceURL=pptr://__puppeteer_evaluation_script__", "worldName": "__puppeteer_utility_world__" }, TargetattachedToTarget21.sessionId); // 13
  await cdp.Page.createIsolatedWorld({ "frameId": TargettargetCreated17.targetInfo.targetId, "worldName": "__puppeteer_utility_world__", "grantUniveralAccess": true }, TargetattachedToTarget21.sessionId); // 14
  await cdp.waitForAllEvents("Runtime.executionContextCreated");

  await cdp.Emulation.setDeviceMetricsOverride({ "mobile": false, "width": 800, "height": 600, "deviceScaleFactor": RuntimeexecutionContextCreated35.context.id, "screenOrientation": { "angle": 0, "type": "portraitPrimary" } }, TargetattachedToTarget21.sessionId); // 15
  await cdp.Emulation.setTouchEmulationEnabled({ "enabled": false }, TargetattachedToTarget21.sessionId); // 16
  await cdp.waitForAllEvents("Page.frameResized");

  await cdp.Page.navigate({ "url": TargettargetCreated17.targetInfo.url, "frameId": TargettargetCreated17.targetInfo.targetId }, TargetattachedToTarget21.sessionId); // 17
  await cdp.waitForAllEvents("Page.frameStartedLoading", "Page.lifecycleEvent", "Target.targetInfoChanged", "Runtime.executionContextsCleared", "Page.frameNavigated", "Runtime.executionContextCreated", "Page.loadEventFired");

  await cdp.Page.navigate({ "url": "https://github.com/UrielCh/puppeteer-jquery/tree/master/puppeteer-jquery", "frameId": TargettargetCreated17.targetInfo.targetId }, TargetattachedToTarget21.sessionId); // 18
  const RuntimeexecutionContextCreated70 = await cdp.Runtime.executionContextCreated();
  await cdp.waitForAllEvents("Page.frameStoppedLoading", "Page.domContentEventFired", "Page.lifecycleEvent", "Network.requestWillBeSent", "Network.requestWillBeSentExtraInfo", "Network.responseReceivedExtraInfo", "Network.responseReceived", "Page.frameStartedLoading", "Runtime.executionContextsCleared", "Log.entryAdded", "Target.targetInfoChanged", "Page.frameNavigated", "Network.dataReceived", "Runtime.executionContextCreated", "Network.loadingFinished", "Network.resourceChangedPriority");

  // first page.waitForjQuery("span.Counter.js-social-count");
  await cdp.Runtime.evaluate({
    expression: "y_q28cvu8slu('span.Counter.js-social-count').toArray()\n//# sourceURL=pptr://__puppeteer_evaluation_script__",
    contextId: RuntimeexecutionContextCreated70.context.id,
    returnByValue: false,
    awaitPromise: true,
    userGesture: true,
  }, TargetattachedToTarget21.sessionId); // 19
  // await cdp.waitForAllEvents("Network.requestWillBeSent", "Network.responseReceived", "Network.dataReceived", "Network.requestWillBeSentExtraInfo", "Network.loadingFinished", "Target.targetInfoChanged", "Page.navigatedWithinDocument", "Network.responseReceivedExtraInfo");
  await cdp.Runtime.evaluate({
    expression: "//# sourceURL=jquery.js\n/*!\r\n * jQuery JavaScript Library v3.4.1\r\n * https://jquery.com/\r\n *\r\n * Includes Sizzle.js\r\n * https://...)\r\n// and CommonJS for browser emulators (#13566)\r\nif ( !noGlobal ) {\r\n\twindow.y_q28cvu8slu = jQuery;\r\n}\r\n\r\nreturn jQuery;\r\n} );",
    contextId: RuntimeexecutionContextCreated70.context.id,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  }, TargetattachedToTarget21.sessionId); // 20
  // await cdp.waitForAllEvents("Network.responseReceived", "Network.dataReceived", "Network.loadingFinished", "Network.requestWillBeSentExtraInfo");

  // first retry page.waitForjQuery("span.Counter.js-social-count");
  const Runtimeevaluate3 = await cdp.Runtime.evaluate({
    expression: "y_q28cvu8slu('span.Counter.js-social-count').toArray()\n//# sourceURL=pptr://__puppeteer_evaluation_script__",
    contextId: RuntimeexecutionContextCreated70.context.id,
    returnByValue: false,
    awaitPromise: true,
    userGesture: true,
  }, TargetattachedToTarget21.sessionId); // 21
  await cdp.Runtime.getProperties({
    objectId: Runtimeevaluate3.objectId,
    ownProperties: true,
  }, TargetattachedToTarget21.sessionId); // 22
  await cdp.Runtime.releaseObject({
    objectId: Runtimeevaluate3.objectId
  }, TargetattachedToTarget21.sessionId); // 23
  // const cnt = await page.jQuery("span.Counter.js-social-count").text();
  await cdp.Runtime.evaluate({
    expression: "y_q28cvu8slu('span.Counter.js-social-count').text()\n//# sourceURL=pptr://__puppeteer_evaluation_script__",
    contextId: RuntimeexecutionContextCreated70.context.id,
    returnByValue: false,
    awaitPromise: true,
    userGesture: true,
  }, TargetattachedToTarget21.sessionId); // 24
}
