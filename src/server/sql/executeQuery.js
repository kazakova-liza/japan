import connect from './connect.js'
import _ from 'lodash'
import { get, write, truncateTable } from './queries.js'


const executeQuery = async (action, query = undefined, name = undefined, data = undefined, fields = undefined, truncate = false) => {
  const db = connect();
  let records;

  try {
    switch (action) {
      case 'runQuery':
        console.log(query);
        records = await db.query(query.replace('TABLE_NAME_PLACEHOLDER', name));
        return records;
      case 'savedQuery':
        const sql = await db.query(name);
        return sql;
      case 'readTable':
        console.log(get);
        records = await db.query(get.replace('TABLE_NAME_PLACEHOLDER', name));
        return records;
      case 'write':
        if (truncate === true) {
          console.log(truncateTable.replace('TABLE_NAME_PLACEHOLDER', name));
          await db.query(truncateTable.replace('TABLE_NAME_PLACEHOLDER', name));
          console.log(`table truncated`);
        }
        const dataChunked = _.chunk(data, 10000);
        const query1 = write.replace('TABLE_NAME_PLACEHOLDER', name)
          .replace('FIELDS_NAMES_PLACEHOLDER', fields);
        console.log(query1);

        for (const chunk of dataChunked) {
          console.log(`chunk #${dataChunked.indexOf(chunk)}`)
          await db.query(query1, [chunk]);
          console.log(`Chunk has been written`);
        }
        console.log(`All chunks had been written`);
        break;
    }
  } catch (error) {
    console.log(error);
  } finally {
    // await db.close();
  }
};


export default executeQuery;
