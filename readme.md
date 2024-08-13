## React Websocket Tester

This repo represents a minimal implementation of a React/Node client and server websocket.  It demonstrates one possible approach to implementing hooks around a mutating world state, and aims to minimally re-render components as that world state changes.  I put this together in response to the Reddit thread here: https://www.reddit.com/r/reactjs/comments/1enzy0i/comment/lhbjk9v/?context=3

Typescript is used on client and server.  Very few dependencies have been added beyond the basic scaffolding necessary to create a Node app with a Vite+React frontend.

The code is rough and may contain bugs.  I make no claims as to the level of code quality, but any feedback or criticism is welcome and encouraged.

### Running the example

Clone the repo, and run the following commands:

    # running server from the wstest root directory:

    cd server
    npm install
    npm run dev

    # running client from wstest root directory (use a separate terminal):

    cd client
    npm install
    npm run dev

In the browser, you'll see a representation of global ("World") state, which contains one or more peers.  Duplicate the browser tab to add another peer.

Each browser tab should show the same world state, except that each will identify it's own peer in the peer list.  A peer can mutate its own state (type into the edit field and press Enter).  Note that the render count will only increment for the peer being edited, and will only increment for the World when a peer has joined or left.

### Implementation Notes

The websocket and world state are kept as singletons, in the websocketConnection.ts and useWorld.ts files, respectively.  In order to make components re-render in response to mutation changes, the useWorld and usePeer hooks use a "boxing" trick with React.useState() to spoof new world/client states being set.  This is a bit of a hack, and arguably a non-mutatable data is a more solid approach here.