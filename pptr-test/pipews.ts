import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import fs from 'fs';
import { protoRevertLink } from './protoRevertLink';

export class protoRevert {
    constructor(private srcPort: number, private dstPort: number) { }
    public sessions: protoRevertLink[] = [];
    logs = [] as Array<{requestUrl: string, response: any}>;

    private async requestListener(req: http.IncomingMessage, res: http.ServerResponse) {
        const port = this.dstPort;
        const { headers } = req;
        const path = req.url;
        http.get({ host: '127.0.0.1', port, path, headers }, (chromeResp) => {
            const clen = (chromeResp.headers['Content-Length'] || chromeResp.headers['content-length']);
            console.log(`GET ${path} ${chromeResp.statusCode} Content-Length:${clen}`);
            res.writeHead(chromeResp.statusCode!, chromeResp.statusMessage, chromeResp.headers);
            let body = Buffer.alloc(0);
            chromeResp.on('data', (data) => {
                body = Buffer.concat([body, data]);
                res.write(data);
            })
            chromeResp.on('end', () => {
                const txt = JSON.parse(body.toString());
                this.logs.push({requestUrl: path || '', response: txt});
                res.end();
            });
            chromeResp.on('close', () => {
                res.destroy();
            });
        });
    }

    public async start(): Promise<void> {
        // create http servce + ws server
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
            let code = "";
            code += 'import devtools from "@u4/chrome-remote-interface";\r\n';
            code += "\r\n";
            // const session = protoRev.sessions[protoRev.sessions.length - 1];
            code += `async function run${i+1}() {\r\n`;
            if (session.endpoint.includes('devtools/browser'))
                code += '  const cdp = await devtools.connectFirst("browser");';
            else
                code += '  const cdp = await devtools.connectFirst("page");';
            code += session.writeSession();
            code += '}\r\n';
            fs.writeFileSync(`${prefix}${i + 1}.ts`, code, { encoding: 'utf8' });
        }
    }
}
