// Tiny static server for local testing: serves app/ at http://localhost:8080.
// Node 22, standard library only. Not part of the graded entry's first load.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const port = Number(portArg ? portArg.slice('--port='.length) : (process.env.PORT ?? 8080));
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = createServer(async (req, res) => {
  let urlPath = '/';
  try {
    const raw = (req.url ?? '/').replace(/^\/{2,}/, '/');
    urlPath = decodeURIComponent(new URL(raw, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  if (urlPath === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  const filePath = join(appDir, urlPath === '/' ? 'index.html' : urlPath);
  if (!filePath.startsWith(appDir)) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(port, () => console.log('Leonida Legend at http://localhost:' + port));
