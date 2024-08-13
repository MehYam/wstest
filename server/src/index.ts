import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', ws => {
    const newPeerBase = {
        id: ++connections, 
        state: '---',
        color: colors[colors.length % connections]
    };
    const newPeer = { ws, ...newPeerBase };

    // broadcast the addition of this new client
    const peerJoin = JSON.stringify({ type: 'peerJoin', ...newPeerBase });
    for (const peer of world.values()) {
        peer.ws.send(peerJoin);
    }

    // officially add the client, send it the world
    // TODO: might be a race condition between the last send and this one?
    world.set(connections, newPeer);
    console.log(`ws connection ${newPeer.id}, peers: ${world.size}`);

    const peers = Array
        .from(world.values())
        .map(({ ws, ...rest }) => (rest));

    ws.send(JSON.stringify({ type: 'welcome', peers, peerId: newPeer.id }));

    ws.on('message', data => {
        // update world
        const state = data.toString();

        console.log(`peer ${newPeer.id} setting state to ${state}`);

        world.get(newPeer.id)!.state = state;

        // broadcast change
        const peerChange = JSON.stringify({ type: 'peerChange', peerId: newPeer.id, state });
        for (const peer of world.values()) {
            peer.ws.send(peerChange);
        }
    });
    ws.on('close', (code, reason) => {
        // update world
        world.delete(newPeer.id);

        console.log(`ws connection close ${code}/${reason}, peers: ${world.size}`);

        // broadcast change
        const peerLeave = JSON.stringify({ type: 'peerLeave', peerId: newPeer.id });
        for (const peer of world.values()) {
            peer.ws.send(peerLeave);
        }
    });
    ws.on('error', console.error);
});

type Peer = {
    id: number,
    state: string,
    color: string,
    ws: WebSocket
};
const world = new Map<number, Peer>();
let connections = 0;

const colors = [
    'red',
    'green',
    'blue',
    'yellow',
    'purple',
    'grey',
    'khaki',
    'cyan',
    'magenta',
    'darkgreen',
    'darkmagenta',
    'crimson',
    'cornflowerblue'
] as const;