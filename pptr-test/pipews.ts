import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

async function requestListener(port: number, req: http.IncomingMessage, res: http.ServerResponse) {
    const { headers } = req;
    const path = req.url;
    http.get({ host: '127.0.0.1', port, path, headers }, (chromeResp) => {
        console.log('GET ' + path + ' ' + chromeResp.statusCode + ' c/len:' + (chromeResp.headers['Content-Length'] || chromeResp.headers['content-length']))
        res.writeHead(chromeResp.statusCode!, chromeResp.statusMessage, chromeResp.headers);
        chromeResp.on('data', (data) => {
            console.log('GET ' + path + ' Forward:' + data.toString().length + ' bytes')
            res.write(data);
        })
        chromeResp.on('end', () => {
            res.end();
        });
        chromeResp.on('close', () => {
            res.destroy();
        });
    });
}

export async function pipeWs(source: number, dest: number): Promise<void> {
    const wss = new WebSocketServer({ noServer: true });
    const server = http.createServer((req, res) => requestListener(dest, req, res));

    wss.on('connection', function connection(ws, request: http.IncomingMessage) {
        const queue: Array<WebSocket.RawData | string> = [];
        const url = `ws://127.0.0.1:${dest}${request.url}`;
        console.log('incomming WS: ', url)
        const wsChrome = new WebSocket(url);

        ws.on('message', (msg, binary) => {
            if (!binary)
                console.log('in :', JSON.parse(msg.toString()))
            else
                console.log('in :', msg.toString('hex'))
            if (wsChrome.readyState === 1) {
                wsChrome.send(msg, { binary });
            } else {
                if (!binary)
                    queue.push(msg.toString());
                else
                    queue.push(msg);
            }
        });

        wsChrome.once('open', () => {
            console.log('Ws fowarded');
            for (const msg of queue) {
                console.log('unqueue');
                wsChrome.send(msg.toString());
            }
            wsChrome.on('message', (msg, binary) => {
                if (binary) {
                    ws.send(msg, {binary});
                    console.log('out:', msg.toString('hex'));
                } else {
                    const text = msg.toString();
                    ws.send(text, {binary});
                    console.log('out:', JSON.parse(text))
                }
            })
            ws.on('close', (code: number, reason: Buffer) => {
                console.log('close ws', code);
                wsChrome.close(code, reason);
            });
        })
    });

    server.on('upgrade', function upgrade(request, socket, head) {
        // const { pathname } = parse(request.url);
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    });

    await new Promise<void>(resolve => server.listen(source, resolve));
}
