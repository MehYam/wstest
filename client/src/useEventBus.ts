import EventEmitter from 'eventemitter3';

export default function useEventBus() {
    if (_instance) {
        _instance = new EventEmitter();
    }
    return _instance;
}

let _instance: EventEmitter;