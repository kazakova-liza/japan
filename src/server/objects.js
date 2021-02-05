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
    casesPerPalletInboundMixed : 28,
    casesPerPalletOutbound : 18,
    pcentFullCaseFromActive : 0.2,
    vasStationsBase : 40,  //current divided by 2 shifts
    curInv : 1000000,
    invFullPalletPcent : 0.78,
    invPairsPercase : 6.5,
    invFullPallUtil : 0.7,
    CurPandHoldPallets : 950,
    periods: [1, 2, 3, 4, 5, 6, 7],
    flowChart: `flowchart LR
    title1{{"3 X Growth -- Hourly (20 hours)"}}
    subgraph Dock
    Unload("Unload {D1} <BR>{containersUnload} containers")
    Mixed_SKU_Pallet[max {maxCasesUnloadMixed} cases<BR>avg {avgCasesUnloadMixed} cases<BR>on to mixed SKU pallets]
    Single_SKU_Pallet[max {maxCasesUnloadSingle} cases <BR>avg {avgCasesUnloadSingle} cases<BR> on to single SKU Pallet]
    Unload-->Single_SKU_Pallet
    Unload-->Mixed_SKU_Pallet
    end
    subgraph PalletRackMiddle
    MidRack-->|moves from middle included in moves from top|a
    end
    subgraph PalletRackTop
    TopRack["All Pallet Racking<BR><BR>All pallets<BR>including middle<BR>{invFullPalls}"]
    Retrieve
    Putaway
    end
    subgraph Active
    Shelving["Shelving  {D5}<BR>Store {invCartons} cartons"]
    PickStation
    FullCasePick
    Robots
    Replenish["Replenish<BR>{[fcaTxt0] D6 + D5}<BR>max {maxCaseReplenActive} cases<BR>avg {avgCaseReplenActive} cases"]
    end
    subgraph Finish["Finish     Non Active {D6}"]
    KEY["KEY {D7}<BR> max {maxKeyCartons} cartons {maxKeyUnits} units<BR> max {avgKeyCartons} cartons {avgKeyUnits} units"]
    VAS["VAS <BR>{vasStations} Workstations"]
    end
    subgraph Loading
    Hold["Hold<BR>{PandHoldPallets} pallets"]--->Load
    end

    Retrieve-->|Non peak|MidRack
    Single_SKU_Pallet-->|" {D2}<BR>max {maxPalletsUnloadSingle} pallets<BR>avg {avgPalletsUnloadSingle} pallets"|Putaway

    Retrieve-->|"{[fcaTxt1] D6 + D5 - D3}<BR>max {maxPalletsReplenActive} pallets<BR>avg {avgPalletsReplenActive} pallets"|Replenish

    Mixed_SKU_Pallet-->|"{D3}<BR>max {maxPalletsUnloadMixed} pallets<BR>avg {avgPalletsUnloadMixed} pallets"|Replenish

    Retrieve-->|"{[fcaTxtNot] {D6}<BR>max {maxFCCasePalletToFinish} cartons {maxFCPalletPalletToFinish} pallets<BR>avg {avgFCCasePalletToFinish} cartons {avgFCPalletPalletToFinish} pallets"|Finish
    
    FullCasePick-->|"{[fcaTxt2] {D6}<BR>max {maxFCCaseActiveToFinish} cartons<BR>avg {avgFCCaseActiveToFinish} cartons"|Finish
    PickStation-->|"{D5}<BR>max {maxCartonsPicked} cartons<BR>avg {avgCartonsPicked} cartons"|Finish
    Finish-->|"{D8}<BR>max {maxShipCartons} cartons<BR>max {maxShipPallets} pallets<BR>avg {avgShipCartons} cartons<BR>avg {avgShipPallets} pallets"|Hold`
}

export default objects;