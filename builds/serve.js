// Static server for local WebGL build testing.
// Usage: node builds/serve.js dist 8092 --mock   (Nazaria: Phaser/Vite build, root is dist/)
// Defaults preserve legacy behaviour: root=builds/webgl-local, port=8090
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.resolve(process.argv[2] || path.join(__dirname, "webgl-local"));
const port = parseInt(process.argv[3] || "8090", 10);
const mock = process.argv.includes("--mock");
const MOCK_TAG = '<script src="/__mock-sdk.js"></script>';
const mime = {
  ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm",
  ".data": "application/octet-stream", ".unityweb": "application/octet-stream",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".br": "application/octet-stream",
  ".ttf": "font/ttf", ".m4a": "audio/mp4", ".atlas": "text/plain", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};
http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (mock && urlPath === "/__mock-sdk.js") {
    fs.readFile(path.join(__dirname, "mock-sdk.js"), (e, d) => {
      if (e) { res.writeHead(404); res.end("404"); return; }
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(d);
    });
    return;
  }
  let p = path.join(root, urlPath);
  if (!p.startsWith(root)) { res.writeHead(403); res.end("403"); return; }
  if (p.endsWith("\\") || p.endsWith("/")) p += "index.html";
  fs.stat(p, (se, st) => {
    if (se) { res.writeHead(404); res.end("404"); return; }
    if (st.isDirectory()) p = path.join(p, "index.html");
    fs.readFile(p, (e, d) => {
      if (e) { res.writeHead(404); res.end("404"); return; }
      const type = mime[path.extname(p)] || "application/octet-stream";
      if (mock && p.endsWith("index.html")) {
        // why: no shopsyBridge.browser.js here, the bridge is bundled. Inject before the Vite module
        // script so AndroidBridge exists when Preload calls initShopsyBridge().
        d = Buffer.from(d.toString("utf8").replace(
          /(<script type="module")/,
          `${MOCK_TAG}
  $1`
        ));
      }
      res.writeHead(200, { "Content-Type": type });
      res.end(d);
    });
  });
}).listen(port, () => console.log(`serving ${root} on :${port}${mock ? " [MOCK SDK]" : ""}`));
