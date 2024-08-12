import Peer from './Peer';
import './World.css';
import { useWorld } from './useWorld';

export default function World() {
    const { world } = useWorld();
    const peers = Array
        .from(world.values())
        .map(peer => <Peer peerId={peer.id} key={peer.id} />);

    return <>
        World
        <div>renders: {++_debug_renders}</div>
        {peers}
    </>;
}

let _debug_renders = 0;
