import mysql from 'mysql';
import util from 'util';


const connect = () => {
    const config = {
        host: "192.168.1.211",
        user: "root",
        password: "MYmkonji13@",
        database: "mv"
    };

    // const config = {
    //     host: 'localhost',
    //     user: 'root',
    //     password: 'password',
    //     database: 'mv'
    // };
    const connection = mysql.createConnection(config);
    connection.connect();
    return {
        query(sql, args) {
            return util.promisify(connection.query).call(connection, sql, args);
        },
        close() {
            return util.promisify(connection.end).call(connection);
        },
    };
}


export default connect;