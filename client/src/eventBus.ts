import EventEmitter from 'eventemitter3';

export function getEventBus() {
    resetEventBus();
    return _instance;
}

/**
 * allows GC of anything listening to events.  Useful in case you want to
 * reset the app upon reconnection of the websocket
 */
export function resetEventBus() {
    if (!_instance) {
        _instance = new EventEmitter();
    }
}
let _instance: EventEmitter;