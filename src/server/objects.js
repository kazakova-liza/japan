import splitShipments from './phases/splitShipments.js'
import unloadShipments from './phases/unloadShipments.js'
import splitOrders from './phases/splitOrders.js'
import processWaves from './phases/processWaves.js'
import groupBy from './utils/groupBy.js'
import cache from './cache.js'

const objects = {
    "inputs": [
        // {
        //     "name": "input-table",
        //     "type": "text"
        // },
    ],
    // periods: groupBy(cache.ords, ['dte'], [], []),
    phases: [
        //add reading table as phase 1 (copy from japan)
        {
            number: 1,
            name: 'splitShipments',
            function: splitShipments,
            textOnProcessing: "splitting shipments",
            textOnCompletion: "split shipments",
            async: true,
            svgTransitionElementId: undefined,

        },
        {
            number: 2,
            name: 'unloadShipments',
            function: unloadShipments,
            textOnProcessing: "unloading shipments",
            textOnCompletion: "unloaded shipments",
            svgTransitionElementId: 'arrow_1_2',
        },
        {
            number: 3,
            name: 'splitOrders',
            function: splitOrders,
            textOnProcessing: "splitting orders",
            textOnCompletion: "split orders",
            svgTransitionElementId: 'arrow_4_5',
        },
        {
            number: 4,
            name: 'processWaves',
            function: processWaves,
            textOnProcessing: "processing waves",
            textOnCompletion: "processed waves",
            svgTransitionElementId: 'arrow_5_6',
        },
    ]
}

export default objects;