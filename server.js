const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const apiKey = 'ptla_oqoJQWaEMChKJEkwRJa5uWLL6HzwxmWooC67UWSN6y7';
const panelUrl = 'https://net.forgenetwork.my.id';

const server = http.createServer(async (req, res) => {
    let filePath = '.' + req.url;
    if (filePath == './') {
        filePath = './index.html'; // Ganti dengan nama file HTML Anda
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    }[extname] || 'application/octet-stream';

    if (req.url === '/') {
        try {
            const response = await axios.get(`${panelUrl}/api/application/nodes`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json'
                }
            });

            if (!response.status === 200) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const data = response.data;
            const nodeStatus = data.data.map(node => ({
                name: node.attributes.name,
                id: node.attributes.id,
                status: node.attributes.maintenance_mode ? 'Maintenance' : 'Online'
            }));

            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Status Node Pterodactyl</title>
                <!-- Memasukkan stylesheet Bootstrap -->
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container">
                    <h1 class="mt-5">Status Node Pterodactyl</h1>
                    <ul class="list-group mt-3">
                        ${nodeStatus.map(node => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Node ${node.name} (ID: ${node.id})
                                <span class="badge ${node.status === 'Maintenance' ? 'badge-danger' : 'badge-success'}">${node.status}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
            </body>
            </html>
        `;
        

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            res.writeHead(500);
            res.end('Failed to fetch node status');
        }
    } else {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code == 'ENOENT') {
                    fs.readFile('./404.html', (err, content) => { // Jika file tidak ditemukan
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    });
                } else {
                    res.writeHead(500);
                    res.end('Server Error: ' + err.code);
                    res.end();
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}/`);
});
