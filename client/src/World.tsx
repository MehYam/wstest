import Peer from './Peer';
import './World.css';
import { useWorld } from './useWorld';

export default function World() {
    const { world } = useWorld();
    const peers = Array
        .from(world.values())
        .map(peer => <Peer peerId={peer.id} key={peer.id} />);

    return <div style={worldStyle}>
        <strong>World</strong>
        <div>renders: {++_debug_renders}</div>
        <div style={peerStyle}>
            {peers}
        </div>
    </div>;
}

const worldStyle = { border: '1px solid green', borderRadius: '5px', padding: 10 };
const peerStyle = { display: 'flex', gap: 10, justifyContent: 'space-between', width: '100%' };

let _debug_renders = 0;
