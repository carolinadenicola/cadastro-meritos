require('dotenv').config();
const logger = require('../logger');
const axios = require('axios');

const username = process.env.TOTVS_USER;
const password = process.env.TOTVS_PASSWORD;
const url = 'https://aceschmersal158220.datasul.cloudtotvs.com.br/api/esp/v1/meritos/funcionario';

async function getDadosTotvs() {
    try {
        const response = await axios.get(url, {
            auth: {
                username: username,
                password: password
            }
        });

        let dados = response.data.matricula;

        if (Array.isArray(dados)) {
            return dados;
        } else {
            console.error('Dados da API TOTVS não estão em formato de array:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        throw error;
    }
}

module.exports = {
    getDadosTotvs
};


