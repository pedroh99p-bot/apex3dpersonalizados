// Servidor estático de desenvolvimento. Não é backend de pedidos.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
const built = process.env.APEX_TEST_BUILD === '1';
const root = fileURLToPath(new URL(built ? '../dist/' : '../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const csp = `default-src 'none'; script-src 'self'; connect-src 'none'; style-src 'self'; img-src 'self' blob:; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
http.createServer(async (req, res) => {
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  try {
    const path = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
    if (path === '/index.html') { res.writeHead(302, { Location: '/' }); return res.end(); }
    const publicPath = path === '/' ? (built ? '/index.html' : '/dev.html') : path;
    if (!/^\/((?:dev|index)\.html|(?:js|css|config|assets)\/[\w./-]+)$/.test(publicPath)) { res.writeHead(404); return res.end(); }
    const file = resolve(root, `.${publicPath}`);
    if (!file.startsWith(resolve(root) + sep)) { res.writeHead(403); return res.end(); }
    const data = await readFile(file);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
    res.setHeader('Content-Type', `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8`);
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end(); }
}).listen(port, '127.0.0.1', () => console.log(`Prévia local: http://127.0.0.1:${port}`));
