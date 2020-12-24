import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';
import executeQuery from '../sql/executeQuery.js'

// create table mv.outbound_s_jan(SELECT replace(date, '/', '') as date, sku, qty, salesChannel, pickTicket FROM mv.outbound_s where date < '2018/01/30')

const splitOrders = async () => {
    if (cache.ordersTable === undefined) {
        const query = `SELECT *
                        FROM outbound_s_jan`
        cache.ordersTable = await executeQuery('runQuery', query);
        console.log(cache.ordersTable[0]);
        console.log(`Table outbound_s has been read`);
    }
    let svgUpdate = [];
    const todaysOrders = cache.ordersTable.filter((item) => item.date === cache.thisDte.date);
    const length = todaysOrders.length;

    svgUpdate.push({ id: 'phase_3_ecomm', value: length });
    return svgUpdate;
};

export default splitOrders;