require('dotenv').config();
const sql = require('mssql');

const sqlConfig = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    server: process.env.SQL_SERVER,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function connect() {
    try {
        await sql.connect(sqlConfig);
        console.log('Conectado ao SQL Server');
    } catch (error) {
        console.error('Erro ao conectar ao SQL Server:', error);
    }
}

module.exports = {
    sql,
    connect
};