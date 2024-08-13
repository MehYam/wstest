import { usePeer } from "./useWorld";

type Props = { peerId: number };
export default function Peer({ peerId }: Props) {
    const { peer } = usePeer(peerId);
    const rendered = peer ? <>
        <div>Peer: {peer.id} {peer.self ? <strong>(SELF)</strong> : ''}</div>
        <div>State: {peer.state}</div>
    </> : <em>no peer info</em>;

    return <div style={{
        border: '1px dotted green',
        borderRadius: '5px', 
        padding: 5
    }}>
        {rendered}
        <div>renders: {++_debug_renders}</div>
    </div>;
}

let _debug_renders = 0;