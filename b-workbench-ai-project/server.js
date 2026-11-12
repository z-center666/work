const http = require('http');
const fs = require('fs');
const path = require('path');
const base = __dirname;
const mime = {
  '.html': 'text/html;charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let p = path.join(base, decodeURIComponent(req.url === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream' });
  res.end(fs.readFileSync(p));
});

server.on('error', (err) => { console.error('ERROR:', err.message); process.exit(1); });
server.listen(8080, () => { console.log('OK on 8080'); });