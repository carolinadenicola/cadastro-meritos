const express = require('express');
const logger = require('./logger');
const cors = require('cors');
const app = express();
const port = 3005;
const { connect } = require('./config/dbConfig');
const oldDBRoute = require('./routes/oldDBRoute');

app.use(cors());

connect();

app.get("/", (req, res) => {

    res.send("Página inicial");

});

// app.use('/api', totvsRoute);
app.use('/api', oldDBRoute);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});