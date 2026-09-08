const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  // Candidatos de resolución por orden de prioridad
  const candidates = [
    path.normalize(path.join(__dirname, 'web', reqPath)),
    path.normalize(path.join(__dirname, reqPath)),
    path.normalize(path.join(__dirname, 'data', reqPath))
  ];

  let resolvedPath = null;
  for (const candidate of candidates) {
    if (candidate.startsWith(__dirname) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      resolvedPath = candidate;
      break;
    }
  }

  if (!resolvedPath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const safePath = resolvedPath;

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(safePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Hit-Tazos Tech Server running at http://localhost:${PORT}/`);
});
