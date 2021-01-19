import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';
import executeQuery from '../sql/executeQuery.js'
import objects from '../objects.js'

const process = async () => {
    const replacers = {}

    replacers.fcaTxt0 = (objects.pcentFullCaseFromActive * 100) + '%'
    replacers.fcaTxt1 = replacers.fcaTxt0
    replacers.fcaTxt2 = replacers.fcaTxt0
    replacers.fcaTxtNot = ((1-objects.pcentFullCaseFromActive) * 100) + '%'

    const query1 = `SELECT receivedDate, COUNT(DISTINCT sa.shipment) as containers FROM sasn sa 
    JOIN ( select shipment, SUM(cases) AS scases FROM sasn group BY 1 having scases > 10
    ) lg ON lg.shipment = sa.shipment GROUP BY 1 ORDER BY 2 DESC LIMIT 1;`
    const data1 = await executeQuery('runQuery', query1);
    replacers.containersUnload = data1[0].containers 

    const query2 = `select avg(pallets) AS avgPallets, max(pallets) AS maxPallets, avg(cases) as avgCases, max(cases) as maxCases FROM (SELECT receivedDate, sum(pallets) AS pallets, sum(cases) AS cases FROM sasn where pallets > 1 AND receivedDate < '20200401' GROUP BY 1) aa;`
    const data2 = await executeQuery('runQuery', query2);
    replacers.maxCasesUnloadSingle = data2[0].maxCases 
    replacers.avgCasesUnloadSingle = data2[0].avgCases 
    replacers.maxPalletsUnloadSingle = data2[0].maxPallets 
    replacers.avgPalletsUnloadSingle = data2[0].avgPallets 

    const query3 = `select max(cases) AS maxCases, AVG(cases) AS avgCases FROM (SELECT receivedDate, sum(cases) as cases FROM sasn where pallets <= 1 AND receivedDate < '20200401' GROUP BY 1) aa;`
    const data3 = await executeQuery('runQuery', query3);
    replacers.maxCasesUnloadMixed = data3[0].maxCases 
    replacers.avgCasesUnloadMixed = data3[0].avgCases 
    replacers.maxPalletsUnloadMixed = Math.ceil(data3[0].maxCases / objects.casesPerPalletInboundMixed)
    replacers.avgPalletsUnloadMixed = Math.ceil(data3[0].avgCases / objects.casesPerPalletInboundMixed)

    const query5 = `select avg(cartons) as avgCartons, max(cartons) as maxCartons, AVG(caseEquiv) as avgCaseEquiv, MAX(caseEquiv) as maxCaseEquiv FROM 
    (SELECT LEFT(wave, 8), COUNT(*) as cartons, SUM(units/6) as caseEquiv FROM cartons WHERE cartonType = 'Active'  and wave < '20200401' GROUP BY 1)aa;`
    const data5 = await executeQuery('runQuery', query5);
    replacers.maxCartonsPicked = data5[0].maxCartons 
    replacers.avgCartonsPicked = data5[0].avgCartons 

//moves from pallet store are caseEquiv from carton less cases from mixed pallet receipts
    const avgPalStoreMoves = (data5[0].avgCaseEquiv - data3[0].avgCases) / objects.casesPerPalletInboundMixed
    const maxPalStoreMoves = (data5[0].maxCaseEquiv - data3[0].maxCases) / objects.casesPerPalletInboundMixed
    replacers.avgPalletsReplenActive = Math.ceil(avgPalStoreMoves) 
    replacers.maxPalletsReplenActive = Math.ceil(maxPalStoreMoves) 

    const query6 = `select avg(cartons) as avgCartons, max(cartons) as maxCartons FROM 
        (SELECT LEFT(wave, 8), COUNT(*) as cartons FROM cartons WHERE cartonType != 'Active'  and wave < '20200401' GROUP BY 1)aa;`
    const data6 = await executeQuery('runQuery', query6);
    replacers.maxFCCasePalletToFinish = Math.ceil(data6[0].maxCartons * (1 - objects.pcentFullCaseFromActive))
    replacers.avgFCCasePalletToFinish = Math.ceil(data6[0].avgCartons * (1 - objects.pcentFullCaseFromActive))
    replacers.maxFCCaseActiveToFinish = Math.ceil(data6[0].maxCartons * objects.pcentFullCaseFromActive)
    replacers.avgFCCaseActiveToFinish = Math.ceil(data6[0].avgCartons * objects.pcentFullCaseFromActive)

    replacers.maxCaseReplenActive = data5[0].maxCaseEquiv + replacers.maxFCCaseActiveToFinish
    replacers.avgCaseReplenActive = data5[0].avgCaseEquiv + replacers.avgFCCaseActiveToFinish
    
    const query7 = `select avg(cartons) as avgCartons, max(cartons) as maxCartons, AVG(units) as avgUnits, max(units) as maxUnits, AVG(lnes) as avgLines, max(lnes) as maxLines  FROM 
    (SELECT LEFT(wave, 8), COUNT(*) as cartons, SUM(units) as units, SUM(LINES2) AS LNES FROM cartons WHERE cartonType = 'KEY'  and wave < '20200601' GROUP BY 1)aa;`
    const data7 = await executeQuery('runQuery', query7);
    replacers.avgKeyCartons = data7[0].avgCartons
    replacers.maxKeyCartons = data7[0].maxCartons
    replacers.avgKeyUnits = data7[0].avgUnits
    replacers.maxKeyUnits = data7[0].maxUnits

    replacers.vasStations = objects.vasStationsBase

    const query8 = `select avg(cartons) as avgCartons, max(cartons) as maxCartons, AVG(units) as avgUnits, max(units) as maxUnits  FROM 
    (SELECT LEFT(wave, 8), COUNT(*) as cartons, SUM(units) as units, SUM(LINES2) AS LNES FROM cartons WHERE wave < '20200601' GROUP BY 1)aa;`
    const data8 = await executeQuery('runQuery', query8);
    replacers.avgShipCartons = data8[0].avgCartons
    replacers.maxShipCartons = data8[0].maxCartons
    replacers.avgShipPallets = data8[0].avgCartons / objects.casesPerPalletOutbound
    replacers.maxShipPallets = data8[0].maxCartons / objects.casesPerPalletOutbound

    replacers.invFullPalls = objects.curInv * objects.invFullPalletPcent / objects.casesPerPalletInboundMixed / objects.invPairsPercase / objects.invFullPallUtil
    replacers.invCartons = objects.curInv * (1 - objects.invFullPalletPcent) / objects.invPairsPercase 

    replacers.PandHoldPallets = objects.CurPandHoldPallets

    let flowChart = objects.flowChart
    Object.keys(replacers).forEach((key) => {
        flowChart = flowChart.replace('{' + key + '}', Math.ceil(replacers[key]* objects.growth).toLocaleString());
    })
    Object.keys(replacers).forEach((key) => {
        flowChart = flowChart.replace('[' + key + ']', replacers[key]);
    })

    let flowChartUpdate = [];
    flowChartUpdate.push({
        value: flowChart
    })

    return flowChartUpdate;

};


export default process;