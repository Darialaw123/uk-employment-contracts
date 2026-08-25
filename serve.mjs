/**
 * A static file server with no dependencies.
 *
 * The site is deliberately buildless — every file under public/ is served as
 * written, so it can also be opened straight from disk or dropped onto any
 * static host. This server exists only so that clean URLs ("/templates")
 * resolve the same way locally as they would behind a CDN.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "public");
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** Resolve a request path to a file, trying `/x`, `/x.html` and `/x/index.html`. */
async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidates =
    clean === "/" || clean === "\\"
      ? ["index.html"]
      : [clean.slice(1), `${clean.slice(1)}.html`, join(clean.slice(1), "index.html")];

  for (const candidate of candidates) {
    const full = join(ROOT, candidate);
    if (!full.startsWith(ROOT)) continue;
    try {
      const info = await stat(full);
      if (info.isFile()) return full;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? "/");
  if (!file) {
    const notFound = await readFile(join(ROOT, "404.html")).catch(() => "Not found");
    res.writeHead(404, { "content-type": TYPES[".html"] });
    res.end(notFound);
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(await readFile(file));
}).listen(PORT, () => {
  console.log(`UK site → http://localhost:${PORT}`);
});
