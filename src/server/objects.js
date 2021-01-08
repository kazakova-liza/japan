import process from './phases/process.js'


const objects = {
    inputs: [
        // {
        //     "name": "input-table",
        //     "type": "text"
        // },
    ],
    phases: [
        {
            number: 1,
            name: 'processing',
            function: process,
            textOnProcessing: "processing",
            textOnCompletion: "processed",
            async: true,
            svgTransitionElementId: undefined,
        }
    ],
    growth: 3,
    periods: [1, 2, 3, 4, 5, 6, 7],
    flowChart: `flowchart LR
    subgraph Dock
    Unload(Unload <BR>100 containers)
    Mixed_SKU_Pallet[300 cases on to <BR>mixed SKU pallets]
    Single_SKU_Pallet[200 cases on to <BR>single SKU Pallet]
    Unload-->Single_SKU_Pallet
    Unload-->Mixed_SKU_Pallet
    end
    subgraph PalletPackTop
    Retrieve
    Putaway
    end
    subgraph PalletRackMiddle
    Rack
    end
    subgraph Active
    PickStation
    Robots
    Replenish
    end
    subgraph Finish
    KEY
    VAS
    end
    subgraph Loading
    Hold--->Load
    end
    Single_SKU_Pallet-->|{PALLETS_PLACEHOLDER} pallets|Putaway
    Retrieve-->|600 pallets|Replenish
    Mixed_SKU_Pallet-->|500 pallets|Replenish
    Retrieve-->|700 pallets|Finish
    PickStation-->Finish
    VAS-->Hold
    Rack-->Replenish
    Retrieve-->|Non peak|Rack`
}

export default objects;