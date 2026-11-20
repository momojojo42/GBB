// ============================================================================
// Gardens by the Bay — Cloud Run Production HTTP + Multiplayer WebSocket Server
// (server.js)
// ============================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { viteMultiplayerPlugin } from './scripts/server/viteMultiplayerPlugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');
const ASSETS_DIR = path.resolve(__dirname, 'assets');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const COMPRESSIBLE_EXTENSIONS = new Set([
  '.html',
  '.js',
  '.mjs',
  '.css',
  '.json',
  '.webmanifest',
  '.svg',
  '.gltf',
  '.txt'
]);

function resolveSafeFilePath(urlPath) {
  let cleanPath = decodeURIComponent(urlPath.split('?')[0] || '/');
  if (cleanPath === '/' || cleanPath === '') {
    cleanPath = '/index.html';
  } else if (!path.extname(cleanPath)) {
    const htmlCandidate = path.join(DIST_DIR, `${cleanPath.replace(/^\/+/, '')}.html`);
    if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
      return htmlCandidate;
    }
  }

  const relativePath = cleanPath.replace(/^\/+/, '');
  const distCandidate = path.resolve(DIST_DIR, relativePath);
  if (distCandidate.startsWith(DIST_DIR) && fs.existsSync(distCandidate) && fs.statSync(distCandidate).isFile()) {
    return distCandidate;
  }

  // Fallback to source /assets directory for unhashed lightbox/runtime asset paths
  if (relativePath.startsWith('assets/')) {
    const assetSubPath = relativePath.slice('assets/'.length);
    const assetCandidate = path.resolve(ASSETS_DIR, assetSubPath);
    if (assetCandidate.startsWith(ASSETS_DIR) && fs.existsSync(assetCandidate) && fs.statSync(assetCandidate).isFile()) {
      return assetCandidate;
    }
  }

  return null;
}

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';
  const rawUrl = req.url || '/';

  // Cloud Run health check endpoint
  if (rawUrl === '/healthz' || rawUrl === '/_ah/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok', service: 'gbb-3d-treasure-hunt', timestamp: Date.now() }));
    return;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  let filePath;
  try {
    filePath = resolveSafeFilePath(rawUrl);
  } catch (_) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  if (!filePath) {
    // SPA fallback to index.html for unknown non-asset routes
    const ext = path.extname(rawUrl.split('?')[0] || '');
    const indexFallback = path.join(DIST_DIR, 'index.html');
    if (!ext && fs.existsSync(indexFallback)) {
      filePath = indexFallback;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Long cache for hashed assets or 3D models, revalidating cache for HTML
  const isHtml = ext === '.html' || ext === '.webmanifest';
  const cacheControl = isHtml
    ? 'no-cache, must-revalidate'
    : 'public, max-age=86400';

  const headers = {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff'
  };

  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  const shouldGzip = COMPRESSIBLE_EXTENSIONS.has(ext) && acceptEncoding.includes('gzip') && stat.size > 1024;

  if (shouldGzip) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
    res.writeHead(200, headers);
    if (method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
    return;
  }

  headers['Content-Length'] = stat.size;
  res.writeHead(200, headers);
  if (method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
});

// Attach Authoritative Same-Room Multiplayer WebSocket Server (/ws-multiplayer)
const mpPlugin = viteMultiplayerPlugin();
if (mpPlugin && typeof mpPlugin.configurePreviewServer === 'function') {
  mpPlugin.configurePreviewServer({ httpServer: server });
}

server.listen(PORT, HOST, () => {
  console.log(`[GBB Cloud Run Server] Listening on http://${HOST}:${PORT} (WebSocket: /ws-multiplayer)`);
});

function shutdown(signal) {
  console.log(`[GBB Cloud Run Server] Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
