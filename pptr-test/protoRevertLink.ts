import http from 'http';
import WebSocket from 'ws';
import pc from 'picocolors';

const SHOW_EVENT = false;
const SHOW_MESSAGES = false;

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

interface RespSource {
    requestId: number;
    logId: number;
    method: string; // can be resove using messages Map
    field: string;
}

export interface ProtoEvent {
    method: string;
    sessionId?: string;
    params: any;
    used?: boolean;
    name: string;
}

export class protoRevertLink {
    endpoint: string;
    /**
     * request logs indexed by requestID
     */
    requests = new Map<number, { req: ProtoRequest, resp?: ProtoResponse, name: string, used?: boolean }>();
    /**
     * chrome emited values index
     */
    recevedValue = new Map<string | number, RespSource>();
    methodCounter = new Map<string, number>();
    logs = [] as Array<ProtoRequest | ProtoEvent>;


    incUsage(method: string): number {
        let cnt = (this.methodCounter.get(method) || 0) + 1;
        this.methodCounter.set(method, cnt);
        return cnt;
    }

    nameMessage(name: string, cnt: number) {
        name = name.replace(/\./g, '');
        name = name.substring(0,1).toLocaleLowerCase() + name.substring(1);
        if (cnt === 1)
            return name;
        return name + cnt;
    }

    constructor(wsClient: WebSocket.WebSocket, request: http.IncomingMessage, dstPort: number) {
        const queue: Array<WebSocket.RawData | string> = [];
        this.endpoint = `ws://127.0.0.1:${dstPort}${request.url}`;
        const wsChrome = new WebSocket(this.endpoint);
        console.log('Starting session on ' + this.endpoint);

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

    indexResponce(requestId: number, method: string, data: { [key: string]: any }) {
        // if (requestId === 21) debugger; // should index objectId: '-1498025529418368793.5.3'
        if (!data.result)
            return;
        for (const [field, value] of Object.entries(data.result)) {
            this.tryIndexString(method, field, value, requestId, 0);
        }
    }

    tryIndexString = (method: string, field: string, value: any, requestId: number, logId: number) => {
        if (typeof value === 'string') {
            // const strValue = value as string;
            if (value.length > 40) return; // do not index superlong string
            if (this.recevedValue.has(value)) return;
            const logId = this.logs.length - 1;
            this.recevedValue.set(value, { field, method, requestId, logId });
        }
        if (typeof value === 'number') {
            if (value === 0) return; // do not index superlong string
            if (this.recevedValue.has(value)) return;
            this.recevedValue.set(value, { field, method, requestId, logId });
        }
    }

    indexEvent(event: ProtoEvent) {
        if (!event)
            return;
        // if (event.method === 'Target.targetCreated') debugger;
        if (!event.params)
            return;
        const logId = this.logs.length - 1;
        for (const [field, value] of Object.entries(event.params)) {
            if (typeof value === 'string') {
                this.tryIndexString(event.method, field, value, 0, logId);
            }
            // seatch in a second LVL not more
            if (typeof value === 'object') {
                for (const [field2, value2] of Object.entries(value as any)) {
                    this.tryIndexString(event.method, `${field}.${field2}`, value2, 0, logId);
                }
            }
        }
    }

    private aliasValue(value: string | number): string | null {
        const source = this.recevedValue.get(value);
        if (!source) return null;

        if (source.requestId) {
            const r = this.requests.get(source.requestId);
            if (!r)
                throw Error(`corruption requestId: ${source.requestId} not found`);
            const name = r.name
            r.used = true;
            return '$' + `{${name}.${source.field}}`
        }
        // source is an event
        const event = this.logs[source.logId] as ProtoEvent;
        if (!event)
            throw Error('corruption Event not found');
        event.used = true;
        const name = event.name;
        return '$' + `{${name}.${source.field}}`
    }

    injectVarRequest(req: ProtoRequest) {
        // if (req.id === 22) debugger; // should inject objectId: '-1498025529418368793.5.3'
        if (req.sessionId) {
            const alias = this.aliasValue(req.sessionId);
            if (alias) req.sessionId = alias;
        }
        if (!req.params)
            return;
        for (const [field, value] of Object.entries(req.params)) {
            if (typeof value === 'string') {
                if (value.length > 40) continue; // do not index superlong string
                const alias = this.aliasValue(value);
                if (alias) {
                    req.params[field] = alias;
                }
            }
            if (typeof value === 'number') {
                // if (value.length > 40) continue; // do not index superlong string
                const alias = this.aliasValue(value);
                if (alias) {
                    req.params[field] = alias;
                }
            }
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
            if (!req) {
                return;
            }
            const method = req?.req.method || 'ERROR';
            req.resp = resp;
            if (SHOW_MESSAGES) {
                console.log(`Response ${pc.green(id)}: ${pc.yellow(method)} ${pc.green(sessionId || '')}`);
                this.printNonEmpty(result);
            }
            this.noRest(rest, 'msg to To Client');

            this.indexResponce(id, method, result);
        } else {
            const event = message as ProtoEvent;
            const { method } = event;
            const cnt = this.incUsage(method);
            event.name = this.nameMessage(method, cnt); // gen a reference name
    
            this.logs.push(event);
            this.indexEvent(event);
            if (SHOW_EVENT) {
                const { method, sessionId, params, ...rest } = message;
                console.log(`${pc.bgMagenta('EVENT')}: ${pc.yellow(method)} ${pc.green(sessionId || '')}`);
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
            if (method === 'Runtime.evaluate') {
                const expression = params.expression as string;
                if (expression && expression.length > 512) {
                    params.expression = expression.substring(0, 128) + '...' + expression.substring(expression.length - 128);
                }
            }
            // counter use to names requests
            const cnt = this.incUsage(method);
            this.requests.set(id, { req, name: this.nameMessage(method, cnt) });
            this.logs.push(req);

            if (SHOW_MESSAGES) {
                console.log(`Request  ${pc.green(id)}: ${pc.yellow(method)} ${pc.green(sessionId || '')}`);
                this.printNonEmpty(params);
            }
            this.noRest(rest, 'msg to To Browser');
            // message
        } else {
            // Client can not send event to browser.
        }
    }

    public writeSession(): string {
        const session = this;
        let waitEvents = new Set<string>;
        const ls = '  ';
        let code = ''
        const flushWait = () => {
            if (waitEvents.size) {
                code += `${ls}await cdp.waitForAllEvents(`;
                code += [...waitEvents].map(a => `"${a}"`).join(', ');
                code += `);\r\n`;
                waitEvents.clear();
            }
        }
        code += `${ls}// connecte to ${this.endpoint}`
        for (const message of session.logs) {
            if ('id' in message) {
                flushWait();
                const { id } = message;
                const meta = session.requests.get(id);
                if (!meta)
                    continue;
                code += ls;
                if (meta.used) {
                    code += `const ${meta.name} = `;
                }
                code += `await cdp.${meta.req.method}(`;
                if (meta.req.params || meta.req.sessionId) {
                    let params = JSON.stringify(meta.req.params || {});
                    params = params.replace(/"\$\{([A-Za-z0-9_.]+)\}"/g, '$1');
                    //${TargetcreateTarget.targetId}"
                    code += params;
                }
                if (meta.req.sessionId) {
                    code += ', '
                    code += meta.req.sessionId.replace(/\$\{([A-Za-z0-9_.]+)\}/g, '$1');
                }
                code += `); // ${meta.req.id}`;
                code += '\r\n';
            } else {
                // events
                const mevent = message as ProtoEvent;
                if (mevent.used) {
                    // used event;
                    code += `${ls}const ${mevent.name} = `;
                    code += `await cdp.${mevent.method}();`;
                    code += '\r\n';
                } else {
                    waitEvents.add(mevent.method);
                }
            }
        }
        return code;
    }
}

