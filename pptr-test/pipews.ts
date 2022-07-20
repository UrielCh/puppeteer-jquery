import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import fs from 'fs';
import { ProtoRevertLink } from './protoRevertLink';

export class protoRevert {
    constructor(private srcPort: number, private dstPort: number) { }
    public sessions: ProtoRevertLink[] = [];
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
            this.sessions.push(new ProtoRevertLink(ws, request, this.dstPort));
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
            const session: ProtoRevertLink = this.sessions[i];
            let code = "";
            code += 'import Devtools from "@u4/chrome-remote-interface";\r\n';
            if (session.rawData.length)
            code += 'import fs from "fs";\r\n';

            code += "\r\n";

            if (session.rawData.length) {
                code += 'function getContent(id: number): string {\r\n';
                code += '  return fs.readFileSync("raw" + id + ".js", {encoding: "utf-8"});\r\n';
                code += '}\r\n';                  
            }

            for (let id = 0; id < session.rawData.length; id++) {
                fs.writeFileSync("raw" + (id+1) + ".js", session.rawData[id], {encoding: 'utf8'});
            }

            // const session = protoRev.sessions[protoRev.sessions.length - 1];
            code += `async function run${i+1}(devtools: Devtools) {\r\n`;
            if (session.endpoint.includes('devtools/browser'))
                code += '  const cdp = await devtools.connectFirst("browser");';
            else
                code += '  const cdp = await devtools.connectFirst("page");';
            code += '\r\n';
            code += session.writeSession();
            code += '}\r\n';
            code += '\r\n';
            code += `run${i+1}(new Devtools());\r\n`;
            
            fs.writeFileSync(`${prefix}${i + 1}.ts`, code, { encoding: 'utf8' });
        }
    }
}
