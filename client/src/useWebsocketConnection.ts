let _instance: WebsocketConnection;
export default function useWebsocketConnection() {
    if (!_instance) {
        // singleton
        _instance = new WebsocketConnection('ws://localhost:8080');
    }
    return _instance;
}

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
            //getEventBus().emit('websocket.open');
        };
        // we don't need to do anything here - rely on onclose always being called, as per the standard:
        // https://html.spec.whatwg.org/multipage/web-sockets.html#feedback-from-the-protocol%3Aconcept-websocket-closed            
        this.socket.onerror = event => console.warn('WebSocketConnection.onerror', this.state, event);
        this.socket.onclose = event => {
            console.log(`WebSocketConnection.onclose clean:${event.wasClean}, code:${event.code}, reason:${event.reason}`);
            this.state = 'closed';

            //let normalizedCode = event.code;
            //getEventBus().emit('websocket.closed');
        }
        //this.socket.onmessage = event => getEventBus().emit('websocket.ondata', event.data);
    }
}
