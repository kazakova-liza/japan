import executeQuery from '../sql/executeQuery.js';
import groupBy from '../utils/groupBy.js';
import cache from '../cache.js';
import invClass from './inv.js'

const init = async () => {
    cache.inv = new invClass()

    cache.receivingTable = await executeQuery('readTable', undefined, 'in_pallets_mar');
    console.log(`Table in_caseType has been read`);

    cache.ordersTable = await executeQuery('readTable', undefined, 'outbound_s_mar');
    console.log(`Table outbound_s has been read`);

    let daySkuIn = groupBy(cache.receivingTable, ['date','sku'], ['qty'], []);
    let daySkuOut = groupBy(cache.ordersTable, ['date','sku', 'standardCaseQty'], ['qty'], []);
//CALC STARTING INVENTORY
    let skuHist = {}

    daySkuOut.forEach((rc) => {
        if (!(rc.sku in skuHist)){
            let ss = {}
            ss.standardCaseQty = rc.standardCaseQty
            ss.hist = []
            skuHist[rc.sku] = ss
        }
        skuHist[rc.sku].hist.push({"date":rc.date, "direction":"out", "qty":rc.qty_sum, "cum":0})
    })
    daySkuIn.forEach((rc) => {
        if (rc.sku in skuHist){
            skuHist[rc.sku].hist.push({"date":rc.date, "direction":"in", "qty":rc.qty_sum, "cum":0})
        }
    })

    let stats = {"when":"init", "qty":0, "cases":0, "locations":0, "skus":0}
    Object.keys(skuHist).forEach((rcKey) => {
        let rcHist = skuHist[rcKey].hist
        rcHist.sort( (p, p2) => {return p.date - p2.date || p2.direction - p.direction })
        let cum = 0
        let min = 0
        for (let i = 0; i < rcHist.length; i++) {
            cum += (rcHist[i].direction == 'in') ? rcHist[i].qty : 0-rcHist[i].qty
            if (cum < min) min = cum
            rcHist[i].cum = cum
        }
        skuHist[rcKey].minusQty = min
        if (min < 0){
            if (skuHist[rcKey].standardCaseQty == 0) skuHist[rcKey].standardCaseQty = 6
            let cases = Math.ceil((0-min) / skuHist[rcKey].standardCaseQty)
            let pallets = Math.floor(cases / 32)
            let partPalCases = cases - (pallets * 32)
            for (let i = 0; i < pallets; i++) {
                cache.inv.putAway(rcKey, 32, 32 * skuHist[rcKey].standardCaseQty , 'full', 'old')
                stats.locations += 1
            }
            if(partPalCases > 0){
                cache.inv.putAway(rcKey, partPalCases, partPalCases * skuHist[rcKey].standardCaseQty , 'full', 'old')
                stats.locations += 1
            }
            stats.qty += cases * skuHist[rcKey].standardCaseQty
            stats.cases += cases
            stats.skus += 1
        }
    })

    let svgUpdate = []
    console.log(stats)
    const res = cache.inv.report(svgUpdate)
    //console.log(res)

}

export default init;