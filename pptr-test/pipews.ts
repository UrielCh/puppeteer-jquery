import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import pc from 'picocolors';

const SHOW_EVENT = false;

interface ProtoRequest {
    id: number;
    method: string;
    sessionId?: string;
    params: any;
}

interface ProtoResponse {
    id: number;
    sessionId?: string;
    result: any;
}

interface ProtoEvent {
    method: string;
    sessionId?: string;
    params: any;
}

interface RespSource {
    requestId: number;
    method: string; // can be resove using messages Map
    field: string;
}

export class protoRevertLink {
    
    requests = new Map<number, ProtoRequest>();
    requestsName = new Map<number, string>();
    responces = new Map<number, ProtoResponse>();

    recevedValue = new Map<string, RespSource>();
    methodCounter = new Map<string, number>();
    logs = [] as Array<ProtoRequest | ProtoEvent>;



    constructor(wsClient: WebSocket.WebSocket, request: http.IncomingMessage, dstPort: number) {
        const queue: Array<WebSocket.RawData | string> = [];
        const url = `ws://127.0.0.1:${dstPort}${request.url}`;
        const wsChrome = new WebSocket(url);
        console.log('Starting session on ' + url);

        /**
         * foward or queue messages
         */
        wsClient.on('message', (msg, binary) => {
            // process message
            if (binary) {
                console.log('in :', msg.toString('hex'))
            } else {
                const text = msg.toString();
                const message = JSON.parse(text);
                this.logRequest(message)
            }
            // foward or queue
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
            for (const msg of queue) {
                wsChrome.send(msg);
            }
            wsChrome.on('message', (msg, binary) => {
                if (binary) {
                    console.log('out:', msg.toString('hex'));
                } else {
                    const text = msg.toString();
                    const message = JSON.parse(text);
                    this.logResponse(message)
                }
                wsClient.send(msg, { binary });
            })
            wsClient.on('close', (code: number, reason: Buffer) => {
                wsChrome.close(code, reason);
            });
        })
    }

    indexResponce(requestId: number, method: string, data: {[key: string]: any}) {
        if (!data)
            return;
        for (const [field, value] of Object.entries(data)) {
            if (typeof value !== 'string') continue;
            if (value.length > 40) continue; // do not index superlong string
            if (this.recevedValue.has(value)) continue;
            this.recevedValue.set(value, {field, method, requestId});
        }
    }

    private aliasValue(value: string): string | null {
        const source = this.recevedValue.get(value);
        if (!source) return null;
        const name = this.requestsName.get(source.requestId)
        return '$' + `{${name}.${source.field}}`
    }

    injectVarRequest(req: ProtoRequest) {
        if (req.sessionId) {
            const alias = this.aliasValue(req.sessionId);
            if (alias) req.sessionId = alias;
        }
        if (!req.params)
            return;
        for (const [field, value] of Object.entries(req.params)) {
            if (typeof value !== 'string') continue;
            if (value.length > 40) continue; // do not index superlong string
            const alias = this.aliasValue(value);
            if (alias) {
                req.params[field] = alias;
            }
            // this.recevedValue.set(value, {field, method, requestId});
        }
    }

    /**
     * @param rest should never display aything
     * @param ctxt extra debug context
     */
    noRest(rest: any, ctxt: string) {
        if (Object.keys(rest).length) {
            console.log(pc.bgCyan('------------- REST -------------') + ctxt);
            console.log(rest);
        }
    }

    printNonEmpty(data: any) {
        if (data && Object.keys(data).length > 0)
            console.log(data);
    }

    logResponse(message: any) {
        if (message.id) {
            const resp = message as ProtoResponse;
            const { id, result, sessionId, ...rest } = resp;
            const req = this.requests.get(id);
            const method = req?.method || 'ERROR';

            console.log(`Response ${pc.green(id)}: ${pc.yellow(method)} ${pc.green(sessionId || '')}`);
            this.responces.set(id, resp);
            this.printNonEmpty(result);
            this.noRest(rest, 'msg to To Client');
            this.indexResponce(id, method, result);
        } else {
            if (SHOW_EVENT) {
                const event = message as ProtoEvent;
                // this.indexEvent(event);
                this.logs.push(event);
                const { method, sessionId, params, ...rest } = message;
                console.log(`bwr => cli: ${pc.bgMagenta('event')}: ${pc.yellow(method)} ${pc.green(sessionId || '')}`);
                this.printNonEmpty(params)
                this.noRest(rest, 'event to To Client');
            }
        }
    }

    logRequest(message: any) {
        if (message.id) {
            const req = message as ProtoRequest;
            this.injectVarRequest(req)
            const { id, method, sessionId, params, ...rest } = req;

            // counter use to names requests
            let cnt = this.methodCounter.get(method) || 0;           
            cnt++;
            this.methodCounter.set(method, cnt);
            let reqName = method.replace(/\./g, '');
            if (cnt > 1)
                reqName += cnt;
            this.requestsName.set(id, reqName)
            this.requests.set(id, req);

            this.logs.push(req);

            console.log(`Request  ${pc.green(id)}: ${pc.yellow(method)} ${pc.green(sessionId || '')}`);
            this.printNonEmpty(params);
            this.noRest(rest, 'msg to To Browser');
            // message
        } else {
            // Client can not send event to browser.
        }
    }
}


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
}
