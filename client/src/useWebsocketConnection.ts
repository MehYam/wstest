import EventEmitter from 'eventemitter3';
import useEventBus from './useEventBus';

export default function useWebsocketConnection() {
    const events = useEventBus();
    if (!_instance) {
        // singleton
        _instance = new WebsocketConnection('ws://localhost:8080', events);
    }
    return _instance;
}
let _instance: WebsocketConnection;

type State = 'connecting' | 'open' | 'closed';
class WebsocketConnection {
    private state: State = 'closed';
    private readonly socket: WebSocket;

    constructor(url: string, events: EventEmitter) {
        this.state = 'connecting';

        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = _ => {
            console.log(`WebSocketConnection.onopen`);

            this.state = 'open';
            events.emit('websocket.open');
        };
        // we don't need to do anything here - rely on onclose always being called, as per the standard:
        // https://html.spec.whatwg.org/multipage/web-sockets.html#feedback-from-the-protocol%3Aconcept-websocket-closed            
        this.socket.onerror = event => console.warn('WebSocketConnection.onerror', this.state, event);
        this.socket.onclose = event => {
            console.log(`WebSocketConnection.onclose clean:${event.wasClean}, code:${event.code}, reason:${event.reason}`);
            this.state = 'closed';

            events.emit('websocket.closed');
        }
        this.socket.onmessage = event => events.emit('websocket.ondata', event.data);
    }
}
