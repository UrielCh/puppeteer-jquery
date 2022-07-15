import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import fs from 'fs';
import { ProtoEvent, protoRevertLink } from './protoRevertLink';

export class protoRevert {
    constructor(private srcPort: number, private dstPort: number) { }
    public sessions: protoRevertLink[] = [];

    private async requestListener(req: http.IncomingMessage, res: http.ServerResponse) {
        const port = this.dstPort;
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

    public async start(): Promise<void> {
        // create shttpsservce + ws server
        const wss = new WebSocketServer({ noServer: true });
        const server = http.createServer((req, res) => this.requestListener(req, res));

        wss.on('connection', (ws: WebSocket.WebSocket, request: http.IncomingMessage) => {
            this.sessions.push(new protoRevertLink(ws, request, this.dstPort));
        });

        server.on('upgrade', function upgrade(request, socket, head) {
            // const { pathname } = parse(request.url);
            wss.handleUpgrade(request, socket, head, function done(ws) {
                wss.emit('connection', ws, request);
            });
        });

        await new Promise<void>(resolve => server.listen(this.srcPort, resolve));
    }

    /**
     * gen corresponding code
     */
    public writeSessions(prefix: string) {
        for (let i = 0; i < this.sessions.length; i++) {
            const session = this.sessions[i];
            // const session = protoRev.sessions[protoRev.sessions.length - 1];
            let code = `async function run${i+1}(cdp: any) {\r\n`;
            code += session.writeSession();
            code += '}\r\n';
            fs.writeFileSync(`${prefix}${i + 1}.ts`, code, { encoding: 'utf8' });
        }
    }
}
