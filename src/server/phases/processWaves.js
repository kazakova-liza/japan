import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const processWaves = () => {
    const waveSKU =  groupBy(cache.todaysOrders, ['wave','sku', 'standardCaseQty'], ['qty'], []);
    let stats = {"when":"pick","qty":0, "waveSkus":0}
    waveSKU.forEach((get) => {
        cache.inv.retrieve(get.sku, get.qty_sum, get.standardCaseQty)
        stats.qty += get.qty_sum
        stats.WaveSkus += 1
    })
    console.log(stats)

    const res = cache.inv.report()
    let svgUpdate = res.svg
    return svgUpdate;
};


export default processWaves;