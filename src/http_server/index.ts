import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';


export const httpServer = http.createServer(async (req, res) => {
  const __dirname = path.resolve(path.dirname(''));
  const filePath = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);

  await fs.readFile(filePath).then((data) => {
    res.writeHead(200);
    res.end(data);
  }).catch((error) => {
    res.writeHead(404);
    res.end(JSON.stringify(error));
  });
});


