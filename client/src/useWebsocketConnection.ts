import { getEventBus } from './eventBus';

export default function useWebsocketConnection() {
    if (!_instance) {
        // singleton
        _instance = new WebsocketConnection('ws://localhost:8080');
    }
    return _instance;
}
let _instance: WebsocketConnection;

type State = 'connecting' | 'open' | 'closed';
class WebsocketConnection {
    private state: State = 'closed';
    private readonly socket: WebSocket;

    constructor(url: string) {
        this.state = 'connecting';

        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = _ => {
            console.log(`WebSocketConnection.onopen`);

            this.state = 'open';
            getEventBus().emit('websocket.open');
        };
        this.socket.onclose = event => {
            console.log(`WebSocketConnection.onclose clean:${event.wasClean}, code:${event.code}, reason:${event.reason}`);

            this.state = 'closed';
            getEventBus().emit('websocket.closed');
        }
        this.socket.onmessage = event => getEventBus().emit('worldEvent', JSON.parse(event.data))

        // don't need to do anything here - rely on onclose always being called, as per the standard:
        // https://html.spec.whatwg.org/multipage/web-sockets.html#feedback-from-the-protocol%3Aconcept-websocket-closed            
        this.socket.onerror = event => console.warn('WebSocketConnection.onerror', this.state, event);
    }
}