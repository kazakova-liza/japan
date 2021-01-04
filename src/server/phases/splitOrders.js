import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';
import executeQuery from '../sql/executeQuery.js'
import xl from 'excel4node'
import addWS from '../utils/addWS.js'
import createColumnsArray from '../utils/createColumnsArray.js'

//create table mv.outbound_s_mar(SELECT replace(date, '/', '') as date, sku, qty, salesChannel, pickTicket, standardCaseQty FROM mv.outbound_s where substr(date,6,2)  = '03' AND qty > 0)

//UPDATE outbound_s_mar SET salesChannel = 'Ded' WHERE isnull(salesChannel)

const splitOrders = async () => {
    if (cache.ordersTable === undefined) {
        const query = `SELECT *
                        FROM outbound_s_mar`
        cache.ordersTable = await executeQuery('runQuery', query);
        console.log(cache.ordersTable[0]);
        console.log(`Table outbound_s has been read`);
    }
    let svgUpdate = [];
    cache.todaysOrders = cache.ordersTable.filter((item) => item.date === cache.thisDte.date);
    const length = cache.todaysOrders.length;
    cache.pickTickets = groupBy(cache.todaysOrders, ['pickTicket','salesChannel'], ['qty'], []);
    if (length > 0) {
        var rCnt = 0
        var rWave = 0
        var eCnt = 0
        var eWave = 0
        const rMax = 20000
        const eMax = 5000
        cache.pickTickets.forEach(function(ln) {
            switch(ln.salesChannel){
                case 'Retail':
                    ln.wave = 'R' + rWave
                    rCnt += ln.qty_sum
                    if (rCnt > rMax) {
                        rCnt = 0
                        rWave++
                    }
                break
                case 'E-Com':
                    ln.wave = 'E' + eWave
                    eCnt += ln.qty_sum
                    if (eCnt > eMax) {
                        eCnt = 0
                        eWave++
                    }
                break
                case 'WholeSale':
                    ln.wave = 'W0'
                break
                case 'Ded':
                    ln.wave = 'D0'
                break
            } 
        })
       
     
        var pTicks = cache.pickTickets.reduce((obj, item) => (obj[item.pickTicket] = item.wave, obj) ,{});
        cache.todaysOrders.forEach(function(ln) {
            ln.wave = pTicks[ln.pickTicket]
        })

        // const ordSumm2 = groupBy(cache.todaysOrders, ['wave'], ['qty'], ['pickTicket', 'sku']);
        // const wb1 = new xl.Workbook();
        // const ordSumm2columns = createColumnsArray(ordSumm2[0]);
        // const ws = wb1.addWorksheet(cache.thisDte.date);
        // addWS(ws, ordSumm2columns, ordSumm2);
        // wb1.write(`test1a1a.xlsx`);

     
    }

    svgUpdate.push({ id: 'phase_3_ecomm', value: length });
    return svgUpdate;
};

export default splitOrders;