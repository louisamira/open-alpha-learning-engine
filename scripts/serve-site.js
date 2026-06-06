import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT ?? 4173);
const root = process.cwd();

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"]
]);

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const filePath = resolvePublicPath(url.pathname);
    const data = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(data);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Open Alpha Learning Engine UI: http://127.0.0.1:${port}/`);
});

function resolvePublicPath(pathname) {
  if (pathname === "/") {
    return path.join(root, "site", "index.html");
  }

  const normalized = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const requestPath = normalized.startsWith(path.sep) ? normalized.slice(1) : normalized;

  if (requestPath === "styles.css") {
    return path.join(root, "site", "styles.css");
  }

  if (requestPath.startsWith("dist/") || requestPath.startsWith("curriculum/")) {
    return path.join(root, requestPath);
  }

  return path.join(root, "site", requestPath);
}
