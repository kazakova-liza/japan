import runWebSocketServer from './webSocket.js'
import objects from './objects.js';
import executeQuery from './sql/executeQuery.js';
import execute from './execute.js';
import cache from './cache.js';



const main = async () => {
    const wsServer = runWebSocketServer();

    wsServer.on('request', async (request) => {
        cache.connection = request.accept(null, request.origin);

        cache.connection.on('message', async (message) => {
            console.log('Received Message:', message.utf8Data);

            let command;
            let numberOfPeriodsToExecute;
            let phases = [];

            for (const phase of objects.phases) {
                phases.push(phase.number);
            }

            const maxPhase = Math.max(...phases);

            try {
                command = JSON.parse(message.utf8Data);
            } catch (err) {
                console.log(command);
                console.log('Command is not a JSON, skipping');
                return;
            }
            // if (command.topic === 'stop') { }
            if (command.topic === 'inputs') {
                cache.connection.sendUTF(JSON.stringify({
                    topic: 'inputs',
                    payload: objects.inputs
                }));
            }
            if (command.topic === 'jump') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                if (cache.currentPhase < maxPhase) {
                    numberOfPeriodsToExecute = 1;
                    await execute(numberOfPeriodsToExecute, 'all');
                }
                cache.currentPeriod++;
                numberOfPeriodsToExecute = command.payload;
                await execute(numberOfPeriodsToExecute, 'all');
                cache.currentPeriod = cache.currentPeriod + numberOfPeriodsToExecute - 1;
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'start') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                numberOfPeriodsToExecute = 1;
                cache.currentPhase = 1;
                cache.currentPeriod = 0;
                cache.receivingTable = await executeQuery('readTable', undefined, 'in_pallets_mar');
                const phase1 = objects.phases.find((phase) => phase.number === 1);
                const svgUpdate = [{ id: 'phase', value: phase1.textOnProcessing }];

                await init()

                cache.connection.sendUTF(JSON.stringify({
                    topic: 'htmlUpdate',
                    payload: svgUpdate
                }));
                await execute(numberOfPeriodsToExecute);
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'phase++') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                numberOfPeriodsToExecute = 1;
                cache.currentPhase++;
                await execute(numberOfPeriodsToExecute);
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'period++') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                numberOfPeriodsToExecute = 1;
                await execute(numberOfPeriodsToExecute, 'all');
                cache.currentPhase = 1;
                cache.currentPeriod++;
                cache.connection.sendUTF(JSON.stringify({ topic: 'setToNought' }));
                await execute(numberOfPeriodsToExecute);
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'execute period') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                numberOfPeriodsToExecute = 1;
                await execute(numberOfPeriodsToExecute, 'all');
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'dump') {
                await executeQuery('write', null, command.payload, cache.needInv.map(Object.values), 'sku,qty,standardCaseQty');
            }
        });

        cache.connection.on('close', (reasonCode, description) => {
            console.log('Client has disconnected, stopping the experiment');
            // experimentExecutor.stop();
        });
    });
};

main();
