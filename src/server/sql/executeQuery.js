import connectToDatabase from './workWithSQL.js'
import _ from 'lodash'
import cache from '../cache.js'
import { get, truncate, write } from './queries.js'


const executeQuery = async (action, tableName) => {
  const db = connectToDatabase();

  try {
    switch (action) {
      case 'getData':
        console.log(get);
        const records = await db.query(get.replace('TABLE_NAME_PLACEHOLDER', tableName));
        return records;
      case 'write':
        let data;
        console.log(truncate.replace('TABLE_NAME_PLACEHOLDER', tableName));
        await db.query(truncate.replace('TABLE_NAME_PLACEHOLDER', tableName));
        console.log(`table truncated`);
        console.log(write.replace('TABLE_NAME_PLACEHOLDER', tableName));
        if (tableName.trim() === 'activelines') {
          data = cache.dataForActiveLines;
        }
        else if (tableName.trim() === 'keyorderlines') {
          data = cache.dataForKeyOrderLines;
        }
        else {
          data = cache.dataForMySql; //rename this to something more sensible
        }
        console.log(data);
        const dataChunked = _.chunk(data, 10);
        for (const chunk of dataChunked) {
          let items;
          if (tableName.trim() === 'keyorderlines' || tableName.trim() === 'activelines') {
            items = chunk;
            // items = chunk.map(item => [
            //   item.dte,
            //   item.carton,
            //   item.sku,
            //   item.qty
            // ]);
          }
          else {
            items = chunk.map(item => [
              item.dte,
              item.sku,
              item.qty,
              item.rackNum,
              item.carton,
              item.grp
            ]);
          }
          console.log(`Writing chunk of length ${items.length}:`);
          // console.log(JSON.stringify(items))
          await db.query(write.replace('TABLE_NAME_PLACEHOLDER', tableName), [items]);
          console.log(`Chunk has been written`);
        }
        break;
    }
  } catch (error) {
    console.log(error);
  } finally {
    // await db.close();
  }
};

export default executeQuery;
