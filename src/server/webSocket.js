import runHttpServer from './http.js'
import websocket from 'websocket'

const runWebSocketServer = () => {
    const server = runHttpServer();
    const wsServer = new websocket.server({
        httpServer: server,
    });
    return wsServer;
};

export default runWebSocketServer;