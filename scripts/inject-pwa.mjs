// Post-build PWA injector for Quartz.
// Runs after `quartz build`. Copies PWA assets into public/, builds a precache
// manifest from the emitted files, stamps a cache version, and injects the
// manifest <link> + service-worker registration into every .html page.
import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const PUBLIC = path.join(repo, "public");
const ASSETS = path.join(repo, "pwa-assets");

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

async function main() {
  try {
    await fs.access(PUBLIC);
  } catch {
    console.error("[pwa] public/ not found — run `quartz build` first.");
    process.exit(1);
  }

  // 1) Copy static PWA assets into public/
  const copy = [
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
    "icon-maskable-512.png",
    "apple-touch-icon.png",
    "favicon-32.png",
  ];
  for (const f of copy) {
    await fs.copyFile(path.join(ASSETS, f), path.join(PUBLIC, f)).catch((e) => {
      console.warn("[pwa] skip", f, e.message);
    });
  }

  // 2) Build precache list from everything emitted (skip huge/binary-noise).
  const files = await walk(PUBLIC);
  const urls = new Set(["/"]);
  const SKIP = new Set([".map"]);
  for (const abs of files) {
    const rel = "/" + path.relative(PUBLIC, abs).split(path.sep).join("/");
    if (rel.endsWith("/sw.js")) continue;
    if (SKIP.has(path.extname(rel))) continue;
    urls.add(rel);
  }
  const precache = [...urls].sort();

  // 3) Cache version = hash of the precache list (changes when content changes).
  const version = createHash("sha1").update(precache.join("\n")).digest("hex").slice(0, 12);

  // 4) Render service worker from template.
  let sw = await fs.readFile(path.join(ASSETS, "sw.template.js"), "utf8");
  sw = sw
    .replace("__CACHE_VERSION__", version)
    .replace("__PRECACHE_URLS__", JSON.stringify(precache));
  await fs.writeFile(path.join(PUBLIC, "sw.js"), sw, "utf8");

  // 5) Inject <link rel=manifest>, icons, theme-color, and SW registration
  //    into every HTML page's <head>.
  const headInject = `
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="theme-color" content="#284b63">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("/sw.js").catch(function () {});
        });
      }
    </script>`;

  let patched = 0;
  for (const abs of files) {
    if (path.extname(abs) !== ".html") continue;
    let html = await fs.readFile(abs, "utf8");
    if (html.includes("/manifest.webmanifest")) continue; // idempotent
    if (html.includes("</head>")) {
      html = html.replace("</head>", headInject + "\n</head>");
      await fs.writeFile(abs, html, "utf8");
      patched++;
    }
  }

  console.log(
    `[pwa] version ${version} | precached ${precache.length} urls | injected into ${patched} html pages`
  );
}

main();
