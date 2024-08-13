import * as React from 'react';
import getWebsocketConnection from './websocketConnection';

export function useWorld() {
    const cw = getConnectedWorld();
    const [boxedWorld, setBoxedWorld] = React.useState({ world: cw.world });

    const worldChangeWatcher = React.useCallback((e: WorldEvent) => {
        if (e.type === 'welcome' || e.type === 'peerJoin' || e.type === 'peerLeave') {
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
    
    const [boxedPeer, setBoxedPeer] = React.useState<{ peer: Peer | undefined }>({ 
        peer: cw.world.get(peerId)
    });

    const peerChangeWatcher = React.useCallback((e: WorldEvent) => {
        if (e.type === 'welcome' || e.type === 'peerChange') {
            const peerChange = e as PeerChangeEvent;
            if (peerChange.id === peerId) {
                const old = cw.world.get(peerChange.id)!;
                const peer = { ...old, state: peerChange.state };

                // re-box the world to indicate that it's changed.  This assumes
                // that ConnectedWorld has already mutated the peer.
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

export type Peer = { id: number, state: string, color: string, self: boolean };

type WorldEventType = 'welcome' | 'peerJoin' | 'peerLeave' | 'peerChange';
type WorldEvent = { type: WorldEventType };
type PeerEvent = WorldEvent & { id: number };

type WelcomeEvent = PeerEvent & { type: 'welcome', peers: Peer[] };
type PeerJoinEvent = PeerEvent & { type: 'peerJoin', state: string, color: string };
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
                        this.world.set(peer.id, { ...peer, self: hello.id === peer.id});
                    }
                    break;
                }
                case 'peerJoin': {
                    const join = e as PeerJoinEvent;
                    const { id, state, color } = join;
                    this.world.set(id, { id, state, color, self: false });
                    break;
                }
                case 'peerLeave': {
                    const leave = e as PeerLeaveEvent;
                    this.world.delete(leave.id);
                    break;
                }
                case 'peerChange': {
                    const change = e as PeerChangeEvent;
                    this.world.get(change.id)!.state = change.state;
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