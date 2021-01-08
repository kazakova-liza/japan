import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';
import executeQuery from '../sql/executeQuery.js'
import objects from '../objects.js'

const process = async () => {
    const query = `SELECT receivedDate, sum(pallets) as pallets FROM sasn GROUP BY 1 ORDER BY 2 DESC LIMIT 1;`
    const data = await executeQuery('runQuery', query);
    console.log(data[0]);

    const pallets = data[0].pallets * objects.growth;

    const flowChart = objects.flowChart.replace('{PALLETS_PLACEHOLDER}', pallets.toString());
    let flowChartUpdate = [];
    flowChartUpdate.push({
        value: flowChart
    })

    return flowChartUpdate;

};


export default process;