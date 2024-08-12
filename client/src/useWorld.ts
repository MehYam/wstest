import * as React from 'react';
import { getEventBus } from './eventBus';
import useWebsocketConnection from './useWebsocketConnection';

export function useWorld() {
    useWebsocketConnection();
    const [boxedWorld, setBoxedWorld] = React.useState({ world });

    const mutationHandler = React.useCallback((e: WorldEvent) => {
        handleWorldMessage(e);
        setBoxedWorld({ world });
    }, []);

    React.useEffect(() => {
        getEventBus().addListener('worldEvent', mutationHandler);
        return () => {
            getEventBus().removeListener('worldEvent', mutationHandler);
        }
    }, [mutationHandler]);

    return boxedWorld;
}

export function usePeer(peerId: number) {
    // const events = useEventBus();
    // React.useEffect(() => {
    //     events.addListener('')
    // }, [events]);
}

type Peer = { id: number, state: string };

type WorldEventType = 'welcome' | 'peerJoin' | 'peerLeave' | 'peerChange';
type WorldEvent = { type: WorldEventType };
type WelcomeEvent = WorldEvent & { type: 'welcome', peers: Peer[] };

type PeerEvent = WorldEvent & { peerId: number };
type PeerJoinEvent = PeerEvent & { type: 'peerJoin' };
type PeerLeaveEvent = PeerEvent & { type: 'peerLeave' };
type PeerChangeEvent = PeerEvent & { type: 'peerChange', state: string };

function handleWorldMessage(e: WorldEvent) {
    switch (e.type) {
        case 'welcome': {
            const hello = e as WelcomeEvent;
            for (const peer of hello.peers) {
                world.set(peer.id, peer);
            }
            break;
        }
        case 'peerJoin': {
            const join = e as PeerJoinEvent;
            world.set(join.peerId, { id: join.peerId, state: '' });

            getEventBus().emit('worldChange');
            break;
        }
        case 'peerLeave': {
            const leave = e as PeerLeaveEvent;
            world.delete(leave.peerId);

            getEventBus().emit('worldChange');
            break;
        }
        case 'peerChange': {
            const change = e as PeerChangeEvent;
            world.get(change.peerId)!.state = change.state;

            getEventBus().emit('peerChange');
            break;
        }
    }
}

const world = new Map<number, Peer>();