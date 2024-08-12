import * as React from 'react';
import getWebsocketConnection from './websocketConnection';

export function useWorld() {
    const cw = getConnectedWorld();
    const [boxedWorld, setBoxedWorld] = React.useState({ world: cw.world });

    const worldChangeWatcher = React.useCallback((e: WorldEvent) => {
        if (e.type === 'welcome' || 'peerJoin' || e.type === 'peerLeave') {
            console.log('re-box world');

            // re-box the world to indicate that it's changed.  This assumes
            // that ConnectedWorld has already mutated the world.
            setBoxedWorld({ world: cw.world });
        }
    }, [cw]);

    React.useEffect(() => {
        cw.websocketEvents.addListener('worldEvent', worldChangeWatcher);
        return () => {
            cw.websocketEvents.removeListener('worldEvent', worldChangeWatcher);
        }
    }, [cw, worldChangeWatcher]);

    return boxedWorld;
}

export function usePeer(peerId: number) {
    const cw = getConnectedWorld();
    
    const [boxedPeer, setBoxedPeer] = React.useState<{ peer: Peer | undefined }>({ peer: undefined });
    const peerChangeWatcher = React.useCallback((e: WorldEvent) => {
        if (e.type === 'peerChange') {
            console.log('re-box peer');

            const peerChange = e as PeerChangeEvent;
            if (peerChange.peerId === peerId) {
                // re-box the world to indicate that it's changed.  This assumes
                // that ConnectedWorld has already mutated the peer.
                const peer = cw.world.get(peerChange.peerId)!;
                setBoxedPeer({ peer });
            }
        }
    }, [peerId, cw]);

    React.useEffect(() => {
        cw.websocketEvents.addListener('worldEvent', peerChangeWatcher);
        return () => {
            cw.websocketEvents.removeListener('worldEvent', peerChangeWatcher);
        }
    }, [cw]);

    return boxedPeer;
}

type Peer = { id: number, state: string };

type WorldEventType = 'welcome' | 'peerJoin' | 'peerLeave' | 'peerChange';
type WorldEvent = { type: WorldEventType };
type WelcomeEvent = WorldEvent & { type: 'welcome', peers: Peer[] };

type PeerEvent = WorldEvent & { peerId: number };
type PeerJoinEvent = PeerEvent & { type: 'peerJoin' };
type PeerLeaveEvent = PeerEvent & { type: 'peerLeave' };
type PeerChangeEvent = PeerEvent & { type: 'peerChange', state: string };

class ConnectedWorld {
    readonly websocketEvents;
    readonly world = new Map<number, Peer>();
    constructor() {
        const wc = getWebsocketConnection();
        this.websocketEvents = wc.events;
        this.websocketEvents.addListener('worldEvent', (e: WorldEvent) => {
            console.log(`worldEvent ${JSON.stringify(e)}`);
            switch (e.type) {
                case 'welcome': {
                    const hello = e as WelcomeEvent;
                    for (const peer of hello.peers) {
                        this.world.set(peer.id, peer);
                    }
                    break;
                }
                case 'peerJoin': {
                    const join = e as PeerJoinEvent;
                    this.world.set(join.peerId, { id: join.peerId, state: '' });
                    break;
                }
                case 'peerLeave': {
                    const leave = e as PeerLeaveEvent;
                    this.world.delete(leave.peerId);
                    break;
                }
                case 'peerChange': {
                    const change = e as PeerChangeEvent;
                    this.world.get(change.peerId)!.state = change.state;
                    break;
                }
            }
        });
    }
}

function getConnectedWorld() {
    if (!_instance) {
        _instance = new ConnectedWorld();
    }
    return _instance;
}
let _instance: ConnectedWorld;