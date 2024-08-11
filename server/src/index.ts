import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', ws => {
  const client = { id: connections, state: '', ws };
  clients.set(++connections, client);

  console.log(`on ws connection ${client.id}`);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
  ws.on('close', (code, reason) => {
    console.log(`ws connection close ${code}/${reason}`);
    clients.delete(client.id);
  });
  ws.on('error', console.error);

  ws.send('something');
});

const clients = new Map<number, Client>();

type Client = {
  id: number,
  state: string,
  ws: WebSocket
};

let connections = 0;

