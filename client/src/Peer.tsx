import * as React from 'react';
import { Peer, usePeer } from "./useWorld";
import getWebsocketConnection from './websocketConnection';

type Props = { peerId: number };
export default function PeerComponent({ peerId }: Props) {
    const { peer } = usePeer(peerId);
    const body = peer ? <PeerBody peer={peer} /> : <em>no peer info</em>;
    const border = `1px dotted ${peer ? peer.color : 'black'}`;
    return <div style={{ border, borderRadius: '5px', padding: 5 }}>
        {body}
        <div>renders: {++_debug_renders}</div>
    </div>;
}

let _debug_renders = 0;

type PBProps = { peer: Peer };
function PeerBody({ peer }: PBProps) {
    const [stateFieldValue, setStateFieldValue] = React.useState(peer.state);
    const stateField = peer.self ? <input
        style={{ width: 100 }}
        value={stateFieldValue}
        onFocus={e => {
            e.preventDefault();
            e.target.select();
        }}
        onKeyDown={e => {
            if (e.code === 'Enter') {
                console.log('would apply');
                e.preventDefault();
                e.currentTarget.select();

                getWebsocketConnection().setState(e.currentTarget.value);
            }
        }}
        onChange={e => setStateFieldValue(e.currentTarget.value)}
    /> : <em>{peer.state}</em>;

    return <span>
        <div>Peer: {peer.id} {peer.self ? <strong>(SELF)</strong> : ''}</div>
        <div>State: {stateField}</div>
    </span>;
}