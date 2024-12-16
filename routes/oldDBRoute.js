const express = require('express');
const logger = require('../logger');
const router = express.Router();
const { getDadosTotvs } = require('../services/totvsService');
const {     alteraMatriculaPorNome, getNomeUsuariosCadastrados,
            atualizaFuncionarioTotvs, getMatriculasFuncionarioTotvs,
            cadastraNovosFuncionarios, getDadosDemitidos } = require('../services/olddbService');


//Rotas para atualização geral do banco não refatorado (Outubro 2024)

router.get('/cargaMatriculas', async (req, res) => {
    try {        
        let dadosBancoOld = await getNomeUsuariosCadastrados();
        let dadosApi = await getDadosTotvs();

        if (dadosApi.length > 0) {
            await alteraMatriculaPorNome(dadosApi, dadosBancoOld);
            res.send('Matrículas adicionadas aos funcionários cadastrados com sucesso.');
        } else {
            res.send('Não existem matrículas para atualização no momento.');
        }

    } catch (error) {
        console.error('Erro capturado:', error);
        res.status(500).send('TOTVS ROUTE - Erro ao obter ou inserir dados');
    }
});

router.get('/cargaFuncionarioTotvs', async (req, res) => {
    try {        
        let dadosBancoOld = await getMatriculasFuncionarioTotvs();
        let dadosApi = await getDadosTotvs();

        let novosFuncionarios = await dadosApi.filter(dadoApi => 
            !dadosBancoOld.some(dadoBanco => dadoBanco.matricula === dadoApi.matricula)
        );

        if (novosFuncionarios.length > 0) {
            await atualizaFuncionarioTotvs(novosFuncionarios);
            res.send('Novos funcionários cadastrados com sucesso.');
        } else {
            res.send('Não existem novos funcionários para cadastro.');
        }

    } catch (error) {
        console.error('Erro capturado:', error);
        res.status(500).send('TOTVS ROUTE - Erro ao obter ou inserir dados');
    }
});

//Fim das rotas para atualização do banco não refatorado (Outubro 2024)

//Rotas de integração

router.get('/atualizaDemitidos', async (req, res) => {
    try {
        // console.log("chegou aqui");
        // let dadosBanco = await getDadosDemitidos();
        // let dadosApi = await getDadosTotvs();
        // console.log("chegou aqui");
        // let usuariosDemitidos = await dadosApi.filter(dadoApi =>
        //     dadosBanco.some(dadoBanco => dadoBanco.matricula == dadoApi.matricula && dadoBanco.data_desligamento != dadoApi.data_desligamento)
        // );
        // console.log(usuariosDemitidos);

        res.send('Conectou')

        // if(usuariosDemitidos.length > 0){
        //     await atualizaDemitidos(usuariosDemitidos);            
        //     res.send('Funcionários demitidos alterados com sucesso.');
        // } else {
        //     res.send('Não é necessário efetuar alterações.');
        // }

    } catch (error) {
        res.status(500).send('TOTVS ROUTE - Erro ao obter ou inserir dados');
    }
});


router.get('/cadastroFuncionarios', async (req, res) =>{
    try {
        console.log("chegou aqui")
        let dadosBanco = await getMatriculasFuncionarioTotvs();
        console.log("Dados banco: "+ dadosBanco.length)
        let dadosApi = await getDadosTotvs();
        console.log("Dados Totvs: "+ dadosApi.length)
        
        let ativos = dadosApi.filter(dadoApi => dadoApi.ativo === 1);
        console.log("ativos: "+ ativos.length)
        let novosFuncionarios = ativos.filter(dadoApi => 
            !dadosBanco.some(dadoBanco => dadoBanco.matricula == dadoApi.matricula)
        );
        console.log("novos: "+ novosFuncionarios.length)
        console.log(">>>>>>>>>>>"+novosFuncionarios.length);
        
        if(novosFuncionarios.length > 0){
            let resultado = await cadastraNovosFuncionarios(novosFuncionarios);
            if(resultado === true){
                res.send('Novos funcionários cadastrados com sucesso.');
            }
        } else {
            res.send('Não existem novos funcionários para cadastro')
        }
        
    } catch (error) {
        res.status(500).send('oldDBRoute - Erro ao obter ou inserir dados.')
    }
});

router.get('/cadastroTeste', async (req, res) =>{
    try {      
        let novosFuncionarios = [];

        novosFuncionarios.push({
            descricaoCargo: "Teste de Cargo",
            ativo: 1,
            descricaoCentroCusto: "TECNOLOGIA DA INFORMACAO",
            matricula: 5005,
            codigoCentroCusto: 12100,
            nome: "TESTE DE INTEGRACAO TI",
            codigoCargo: 777,
            email: "testeintegracao2@schmersal.com"
        });

        

        if(novosFuncionarios.length > 0){
            let resultado = await cadastraNovosFuncionarios(novosFuncionarios);
            if(resultado === true){
                res.send('Novos funcionários cadastrados com sucesso.');
            }
        } else {
            res.send('Não existem novos funcionários para cadastro')
        }
        
    } catch (error) {
        res.status(500).send('oldDBRoute - Erro ao obter ou inserir dados.')
    }
});


module.exports = router;