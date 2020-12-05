var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: '',  // minu projekt Tigu serveris
    port: 3306,
    user: '',
    password: '',
    database: '',
    multipleStatements: true
});


exports.querySql = function(query, values, onData, onError) {
    try {
        pool.query(query, values, function(error, results, fields) {
            if (error) onError(error);
            onData(results);
        });
    }
    catch (err) {
        if (onError !== undefined) onError(err);
    }
};
