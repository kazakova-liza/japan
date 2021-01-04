import cache from '../cache.js'
import groupBy from '../utils/groupBy.js'
import objects from '../objects.js'
import executeQuery from '../sql/executeQuery.js'

//create table mv.in_pallets_mar (SELECT date, sku, shipment, qty, cases, pallQty, pallType, standardCaseQty, caseType FROM mv.in_pallets where substr(date,5,2)  = '03' and qty > 0)

const splitShipments = async () => {
    if (cache.receivingTable === undefined) {               //this does nothing as the start command gets this table
        cache.receivingTable = await executeQuery('readTable', undefined, 'in_pallets_mar');
        console.log(cache.receivingTable[0]);
        console.log(`Table in_caseType has been read`);
        
    }
    let svgUpdate = [];
    cache.todayReceipts = cache.receivingTable.filter((item) => item.date === cache.thisDte.date);

    cache.containers = groupBy(cache.todayReceipts, ['shipment'], [], []);
    cache.containers.forEach(function(cont) {
        cont.whse = Math.random() < 0.4 ? 'old': 'new' 
    })
    const summ1 = groupBy(cache.containers, ['whse'], [], []);
    var summ2 = summ1.reduce((obj, item) => (obj[item.whse] = item.cnt, obj) ,{});
    const newCont = ('new' in summ2) ? summ2.new: 0
    const oldCont = ('old' in summ2) ? summ2.old: 0


     svgUpdate.push({ id: 'phase_1_total', value: cache.containers.length });
     svgUpdate.push({ id: 'phase_1_old', value: oldCont });
     svgUpdate.push({ id: 'phase_1_new', value: newCont });

     return svgUpdate;

}

export default splitShipments;