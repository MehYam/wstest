import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', ws => {
    const newPeer = { id: ++connections, state: '', ws };
    console.log(`on ws connection ${newPeer.id}`);

    // broadcast the addition of this new client
    const peerJoin = JSON.stringify({ type: 'peerJoin', peerId: newPeer.id });
    for (const peer of world.values()) {
        peer.ws.send(peerJoin);
    }

    // send the new client the state of the world
    // TODO: might be a race condition between the last send and this one?
    const peers = Array
        .from(world.values())
        .map(({ ws, ...rest }) => (rest));

    ws.send(JSON.stringify({ type: 'welcome', peers }));

    // officially add the client
    world.set(connections, newPeer);

    ws.on('message', data => {
        // update world
        const state = data.toString();
        world.get(newPeer.id)!.state = state;

        // broadcast change
        const peerChange = JSON.stringify({ type: 'peerChange', peerId: newPeer.id, state });
        for (const peer of world.values()) {
            peer.ws.send(peerChange);
        }
    });
    ws.on('close', (code, reason) => {
        console.log(`ws connection close ${code}/${reason}`);

        // update world
        world.delete(newPeer.id);

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
    ws: WebSocket
};
const world = new Map<number, Peer>();
let connections = 0;

