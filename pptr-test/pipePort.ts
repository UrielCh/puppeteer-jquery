import net from 'net';
import pc from 'picocolors';

// see https://datatracker.ietf.org/doc/html/rfc6455#section-5.2

interface HttpOver { mtd: string, url: string, http: string, body: Buffer, headers: { [key: string]: string } };

function minisplitHttp(data: Buffer): HttpOver {
  const p = data.indexOf(Buffer.from('\r\n\r\n'));
  const req = data.toString('utf8', 0, p);
  const body = data.subarray(p + 4);
  const lines = req.split('\r\n');
  const [mtd, url, http] = lines.shift()!.split(' ');
  const headers = Object.fromEntries(lines.map(l => {
    const s = l.indexOf(':');
    if (!s)
      return [s, ''];
    return [l.substring(0, s), l.substring(s + 1).trimStart()]
  }))
  return { mtd, url, http, body, headers }
}

function getWebSockedMassages(data: Buffer): { text?: string; bin?: Buffer }[] {
  const messages: { text?: string; bin?: Buffer }[] = [];
  let itertator = data;
  while (itertator.length) {
    let payloadStart = 2;
    let payload: Buffer;
    const part1 = itertator.readUint8(0);
    const part2 = itertator.readUint8(1);
    const fin = part1 & 0x10;
    const opcode = part1 & 0x0f;
    const mask = part2 & 0x80;
    let len = part2 & 0x7f;

    if (mask) {
      payloadStart += 4;
      // todo read Masking-key
    }

    if (len < 126) {
      payload = itertator.subarray(payloadStart, payloadStart + len);
    } else if (len == 126) {
      payloadStart += 2;
      len = itertator.readUint16BE(2);
      payload = itertator.subarray(payloadStart, payloadStart + len);
    } else if (len == 127) {
      payloadStart += 8;
      len = Number(itertator.readBigUint64BE(2));
      payload = itertator.subarray(payloadStart, payloadStart + len);
    } else {
      throw Error('Houston we have a problem')
    }
    if (opcode === 0) { // continuation
      console.log(pc.red('continuation'));
    } else if (opcode === 1) { // test
      messages.push({ text: payload.toString() })
    } else if (opcode === 2) {// test
      messages.push({ bin: payload })
    }
    itertator = itertator.subarray(payloadStart + len);
  }
  return messages;
}

async function pipePort2(source: net.Socket, dest: number) {
  const destSocket = net.createConnection({ port: dest, host: '127.0.0.1' }, () => {
    console.log('');
    console.log('');
    console.log('connected');
    let cntIn = 0;
    let SecWebSocketAccept: undefined | string = '';
    // from pptr
    source.on('data', (data) => {
      if (cntIn++ === 0) {
        const http = minisplitHttp(data);
        console.log(pc.green(http.mtd + ' ' + http.url));
        console.log(http.headers);
      } else {
        console.log(pc.green(data.toString("hex")).substring(0, 64));
      }
      destSocket.write(data);
    })

    source.on('close', (data) => {
      destSocket.destroy();
    })
    let cntOut = 0;
    // from browser
    destSocket.on('data', (data) => {
      if (cntOut++ === 0) {
        const http = minisplitHttp(data);
        console.log(pc.red(http.mtd + ' ' + http.url));
        console.log(http.headers); // Connection, Sec-WebSocket-Accept, Upgrade
        SecWebSocketAccept = http.headers['Sec-WebSocket-Accept'];
        if (http.body.length) {
          const ct = http.headers['Content-Type'] || '';
          if (ct === 'application/json; charset=UTF-8') {
            console.log(pc.red('from Browser'));
            console.log(JSON.parse(http.body.toString()));
          }
          else
            console.log(http.body.toString('base64'));
        }
      } else {
        if (SecWebSocketAccept) {
          const messages = getWebSockedMassages(data);
          for (const message of messages) {
            if (message.text) {
              // console.log(pc.red('from Browser'));
              // console.log(JSON.parse(message.text));
            } else if (message.bin) {
              console.log('bin:', pc.red(message.bin.toString('hex')));

            }
          }
        } else {
          console.log(pc.red(data.toString()));
        }
      }
      source.write(data);
    })
  });
}

export async function pipePort(source: number, dest: number): Promise<void> {
  const server = net.createServer(function (socket) {
    pipePort2(socket, dest);
  });
  await new Promise<void>(resolve => server.listen(source, resolve));
}
