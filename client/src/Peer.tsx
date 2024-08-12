import { usePeer } from "./useWorld";

type Props = { peerId: number };
export default function Peer({ peerId }: Props) {
    const { peer } = usePeer(peerId);
    const rendered = peer && <>
        <div>Peer: {peer.id}</div>
        <div>State: {peer.state}</div>
    </>;
    return <div style={{ border: '1px dotted green'}}>
        {rendered}
        <div>renders: {++_debug_renders}</div>
    </div>;
}

let _debug_renders = 0;