// Shopsy Mock SDK Harness - browser-side stand-in for the RN SDK native bridge.
// Loaded by serve.js in --mock mode (injected before the Vite module script).
// Answers the bridge contract so release builds pass the profile gate and the
// full round loop can be exercised in a plain browser:
//   requestProfile   -> updateProfile   (source: "server" => trusted)
//   requestGameConfig-> updateGameConfig
//   roundStarted     -> gameStartedAck
//   gameCompleted    -> gameCompletedAck (coinsEarnedForGame - SDK-authoritative)
// Everything is logged with [MockSDK] so the console is the validation record.
(function () {
  "use strict";

  var LATENCY_MS = 250; // simulate native/network async
  var GAME_ID = "city-builder";
  var seq = 0;

  function log() {
    var args = ["%c[MockSDK]", "color:#7c3aed;font-weight:bold"].concat([].slice.call(arguments));
    console.log.apply(console, args);
  }

  function deliver(msg) {
    // why: Nazaria's bridge is not on window; it listens for window "message" events (object or JSON).
    setTimeout(function () { window.postMessage(msg, "*"); log("-> game", msg.action, msg); }, LATENCY_MS);
  }

  function envelope(type, action, data) {
    return { type: type, action: action, data: data };
  }

  var profile = {
    source: "server",
    timestamp: Date.now(),
    gameId: GAME_ID,
    profile: {
      basic: { userName: "MockTester", userId: "mock-user-001" },
      avatarId: 2,
      coinBalance: 1250,
      claimableRewards: { perGameRewardCoinsForToday: 15 },
      perGameRewardCoinsForToday: 15
    }
  };

  var gameConfig = {
    gameId: GAME_ID,
    source: "server",
    config: {
      turnDurationSeconds: 15,
      maxGamesPerDay: 10,
      rewardsEnabled: true
    }
  };

  function handleGameMessage(raw) {
    var msg;
    try { msg = JSON.parse(raw); } catch (e) { log("unparseable from game:", raw); return; }
    var action = msg.action || msg.type;
    log("- game", action, msg);

    switch (action) {
      case "requestProfile":
        deliver(envelope("stateSync", "updateProfile", profile));
        break;
      case "requestGameConfig":
        deliver(envelope("stateSync", "updateGameConfig", gameConfig));
        break;
      case "roundStarted":
        seq++;
        deliver(envelope("gameplay", "gameStartedAck", {
          gameId: GAME_ID, roundId: "mock-round-" + seq, accepted: true
        }));
        break;
      case "gameCompleted":
        deliver(envelope("gameplay", "gameCompletedAck", {
          gameId: GAME_ID,
          roundId: "mock-round-" + seq,
          coinsEarnedForGame: 15,
          totalCoinBalance: 1250 + seq * 15
        }));
        break;
      case "analyticsEvent":
        // Case-sensitive per contract - record verbatim for eyeballing.
        log("ANALYTICS", (msg.data && (msg.data.eventName || msg.data.name)) || "(unnamed)", msg.data);
        break;
      default:
        log("(no auto-reply for", action + ")");
    }
  }

  // Impersonate the Android WebView native interface (game -> SDK path).
  window.AndroidBridge = {
    postMessage: function (raw) { handleGameMessage(raw); }
  };

  log("armed - AndroidBridge mocked, latency", LATENCY_MS + "ms, gameId", GAME_ID);
})();
