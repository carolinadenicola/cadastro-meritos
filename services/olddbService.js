const { sql } = require('../config/dbConfig');
const logger = require('../logger');


//Início funções para atualização geral (Outubro 2024)

async function geraProximoAutoIncremento() {
    try {
        const pool = await sql.connect();      
        const result = await sql.query('SELECT MAX(id) AS ultimoId FROM Funcionario_totvs');
        const ultimoId = result.recordset[0].ultimoId;
        const proximoId = ultimoId + 1;
        return proximoId;
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados ou executar a consulta:', err);
        throw err;
    } 
}


async function alteraMatriculaPorNome(dadosApi, dadosBancoOld) {
    let matriculaAtual;
    try {
        const pool = await sql.connect();
        const query = `UPDATE Funcionario_totvs SET matricula = @matricula where nome = @nome`;
        for (let dadoApi of dadosApi) {
            let nomeApi = dadoApi.nome;
            let matriculaApi = dadoApi.matricula;
            let ativoApi = dadoApi.ativo;
            matriculaAtual = matriculaApi;
            console.log("Dados: ")
            console.log("Nome Api: "+nomeApi)
            console.log("Matricula Api: "+matriculaApi)
            let funcionarioCorrespondente = dadosBancoOld.find(dadoBanco => dadoBanco.nome === nomeApi && ativoApi === 1);

            if (funcionarioCorrespondente) {
                console.log('Entrou no funcionarioCorrespondente')
                await pool.request()
                .input('matricula', sql.Int, matriculaApi)
                .input('nome', sql.VarChar, nomeApi)
                .query(query);
                
            logger.debug(`Matrícula ${matriculaApi} inserida para Usuário ${nomeApi}`);
            }
        }
    } catch (error) {
        logger.error(`Erro ao inserir o usuário ${matriculaAtual} através de integração.`, error);
        console.error('DBService - Erro ao inserir dados no banco de dados:', error);        
        throw error;
    }
}

async function atualizaFuncionarioTotvs(dados) {
    let matriculaAtual;
    try {
        const pool = await sql.connect();
        const query = `INSERT INTO Funcionario_totvs (codigo_funcionario, gestor, data_desligamento, centro_custo, nome, email, email_gestor, cargo, funcao, nome_setor, matricula) VALUES (@codigo_funcionario, @gestor, @data_desligamento, @centro_custo, @nome, @email, @email_gestor, @cargo, @funcao, @nome_setor, @matricula)`;
        
        for (const item of dados) {
            
            let { descricaoCargo, ativo, descricaoCentroCusto, matricula, codigoCentroCusto, nome, codigoCargo, email, dataDesligamento } = item;
            matriculaAtual = item.matricula;
            let matriculaVarChar = matriculaAtual.toString();
            if(item.ativo === 1){               
            
                var {gestor, email_gestor} = await determinaGestor(item.descricaoCentroCusto);
                var id = await geraProximoAutoIncremento();

                await pool.request()
                    // .input('id', sql.Int, id)
                    .input('codigo_funcionario', sql.Int, 0)
                    .input('gestor', sql.VarChar, gestor)
                    .input('data_desligamento', sql.VarChar, item.dataDesligamento)
                    .input('centro_custo', sql.VarChar, item.codigoCentroCusto)
                    .input('nome', sql.VarChar, item.nome)
                    .input('email', sql.VarChar, item.email)
                    .input('email_gestor', sql.VarChar, email_gestor)
                    .input('cargo', sql.VarChar, item.descricaoCargo)
                    .input('funcao', sql.VarChar, 'Funcionario')
                    .input('nome_setor', sql.VarChar, item.descricaoCentroCusto)
                    .input('matricula', sql.VarChar, matriculaVarChar)
                    .query(query);

                logger.debug(`Usuário ${item.matricula} inserido com sucesso através de integração.`);
            }
            else{
                logger.debug(`Usuário ${item.matricula} foi desligado em ${item.dataDesligamento}.`);    
            }
        }
    } catch (error) {
        logger.error(`Erro ao inserir o usuário ${matriculaAtual} na tabela FUNCIONARIO_TOTVS.`, error);
        console.error('DBService - Erro ao inserir dados na tabela Funcionario_totvs:', error);        
        throw error;
    }
}

async function getNomeUsuariosCadastrados() {
    try {
        console.log("getNome")
        const result = await sql.query('SELECT nome FROM Funcionario_totvs');
        return result.recordset;
    } catch (error) {
        logger.error("Falha na consulta ao banco de dados em getMatriculas()", error);
        console.error('Erro ao retornar matrículas do banco de dados:', error);
        throw error;
    }
}

//Fim das funções para atualização geral (Outubro 2024)


//Início funções para cadastro via integração no banco não refatorado

async function determinaGestor(centroCusto){
    
    let gestor = 'ROGERIO BAUDAULF';
    let email_gestor = 'rbaudaulf@schmersal.com';

    const ti = [
        'TECNOLOGIA DA INFORMACAO'
    ];

    const marketing = [
        'MARKETING'
    ];

    const n1 = [
        'ADMINISTRATIVO - NUCLEO 1',
        'ENGENHARIA P&D - PRODUTOS',
        'MONTAGEM - ELETRONICA',
        'ACL -  PRODUTOS',
        'ENGENHARIA DE PROCESSO - PRODUTOS',
        'GRAVAÇÃO - TAMPOGRAFIA / LASER',
        'LINHA SMT',
        'MONTAGEM PRODUTOS - NUCLEO 1'
    ];

    const n2 = [
        'ENGENHARIA P&D - SOLUCOES',
        'ACL - SOLUCOES',
        'MONTAGEM SOLUCOES - NUCLEO 2'
    ];

    const n3 = [
        'COMERCIAL ELEV - BIG3',
        'MONTAGEM BIG 3 - NUCLEO 3',
        'ACL - BIG 3',
        'ENGENHARIA DE PROCESSO - BIG 3',
        'ENGENHARIA P&D - ELEV. BIG 3',
        'MONTAGEM - CHICOTES'
    ];

    const n4 = [
        'COMERCIAL ELEV -  MIDD MKT',
        'MONTAGEM MIDD MKT - NÚCLEO 4',
        'ACL - MIDD MKT',
        'ENGENHARIA DE PROCESSO - MIDDLE MARKET',
        'ENGENHARIA P&D - ELEV. MIDD MKT'
    ];

    const n5 = [
        'ENGENHARIA P&D - MIN / EX',
        'MONTAGEM MIN / EX - NUCLEO 5',
        'VENDAS - MIN / EX',
        'ACL - MIN / EX',
        'ENGENHARIA DE PROCESSO - MIN / EX',
        'LINHA USINAGEM',
        'REBARBACAO',
        'VENDAS  CENTRO OESTE',
        'VENDAS  NORDESTE',
        'VENDAS - MIN / EX'
    ];

    const vendasRogerio = [
        'FILIAL RIO DE JANEIRO - PRODUTOS',
        'VENDAS INTERIOR  DE SP',
        'VENDAS MINAS GERAIS',
        'VENDAS SAO PAULO'
    ];

    const vendasPaulo = [
        'VENDAS PARANA',
        'VENDAS RIO GRANDE DO SUL',
        'VENDAS SANTA CATARINA'
    ];

    const diretoriaRogerio = [
        'DIRETORIA'
    ];

    const qualidade = [
        'GQA - GESTAO DA QUALIDADE E AMBIENTAL'
    ];

    const controladoria = [
        'CONTROLADORIA'
    ];

    const pec = ['PESSOAS & CULTURA', 'SEGURANCA E MEDICINA DO TRABALHO'];

    const logistica = [
        'ACL ATENDIMENTO AO CLIENTE E LOGISTICA',
        'FERRAMENTARIA',
        'MANUTENCAO GERAL',
        'ENGENHARIA DE PROCESSO',
        'INJETORAS',
        'MANUTENCAO GERAL'
    ];

    const exportacao = [
        'VENDAS EXPORTACAO'
    ];

    const afastados = [
        'PESSOAS AFASTADAS/EM LICENCA',
        'PESSOAS AFASTADAS/ EM LICENCA'
    ]

    if (ti.includes(centroCusto)) {
        gestor = 'LUCIANA TOSHIKA MONIWA';
        email_gestor = 'lmoniwa@schmersal.com';
    } 
    if (marketing.includes(centroCusto)) {
        gestor = 'BRUNA LAGRECA';
        email_gestor = 'blagreca@schmersal.com';
    } 
    
    if (qualidade.includes(centroCusto)) {
        gestor = 'FABRINI DE SOUZA CARDOSO';
        email_gestor = 'fcardoso@schmersal.com';
    }
    if (controladoria.includes(centroCusto)) {
        gestor = 'LEILA ELISA ROCHA';
        email_gestor = 'lrocha@schmersal.com';
    }
    if (pec.includes(centroCusto)) {
        gestor = 'CINTIA BALDINI GARCIA';
        email_gestor = 'cgarcia@schmersal.com';
    }
    if (logistica.includes(centroCusto)) {
        gestor = 'LEONARDO PACHECO GONCALVES';
        email_gestor = 'lgoncalves@schmersal.com';
    }
    if (exportacao.includes(centroCusto)) {
        gestor = 'PEDRO HENRIQUE LOPES SOARES';
        email_gestor = 'psoares@schmersal.com';
    }
    if (n1.includes(centroCusto)) {
        gestor = 'CHRISTIAN BORBA MULLER';
        email_gestor = 'cmuller@schmersal.com';
    }
    if (n2.includes(centroCusto)) {
        gestor = 'BRUNO RICARDO DINIZ';
        email_gestor = 'bdiniz@schmersal.com';
    }
    if (n3.includes(centroCusto)) {
        gestor = 'MARCO ANTONIO DE DATO';
        email_gestor = 'mdedato@schmersal.com';
    }
    if (n4.includes(centroCusto)) {
        gestor = 'SAMUEL GARCIA ROMA';
        email_gestor = 'sroma@schmersal.com';
    }
    if (n5.includes(centroCusto)) {
        gestor = 'SAMUEL GIATTI DA SILVA';
        email_gestor = 'sgiatti@schmersal.com';
    }
    if (vendasRogerio.includes(centroCusto)) {
        gestor = 'ROGERIO DA COSTA';
        email_gestor = 'rcosta@schmersal.com';
    }
    if (vendasPaulo.includes(centroCusto)) {
        gestor = 'PAULO CESAR DA SILVA';
        email_gestor = 'psilva@schmersal.com';
    }
    if (diretoriaRogerio.includes(centroCusto)) {
        gestor = 'ROGERIO BAUDAULF';
        email_gestor = 'rbaudaulf@schmersal.com';
    }
    if (afastados.includes(centroCusto)) {
        gestor = 'AFASTADOS';
        email_gestor = 'afastados';
    }

    return { gestor, email_gestor };

}

async function getMatriculasFuncionarioTotvs() {
    try {
        const result = await sql.query('SELECT matricula FROM Funcionario_totvs');
        return result.recordset;
    } catch (error) {
        logger.error("Falha na consulta ao banco de dados em getMatriculas()", error);
        console.error('Erro ao retornar matrículas do banco de dados:', error);
        throw error;
    }
}

async function atualizaFuncionario(nome, transacao) {
    try {
        console.log("NOME: "+nome)
        // const query = `INSERT INTO funcionario (id_funcionario, nome) OUTPUT INSERTED.id_funcionario values (@id_funcionario, @nome)`;
        const query = `INSERT INTO funcionario (nome) OUTPUT INSERTED.id_funcionario values (@nome)`;
        const request = new sql.Request(transacao);
        if (nome) {
                console.log("");
                const result = await request
                    // .input('id_funcionario', sql.Int, 5005)
                    .input('nome', sql.VarChar, nome)
                    .query(query);
                
                const idFuncionario = result.recordset[0].id_funcionario;
                console.log(`Funcionário inserido com ID: ${idFuncionario}`);
                return idFuncionario;
            }
    } catch (error) {
        if (transacao) {
            await transacao.rollback();
                console.error('Erro encontrado no cadastro de funcionario, transação revertida:', error);
                logger.error("Falha ao cadastrar novo funcionario", error);
        }
        logger.error(`Erro ao inserir o usuário através de integração na tabela FUNCIONARIO.`, error);
        console.error('DBService - Erro ao inserir dados na tabela Funcionario:', error);        
        throw error;
    }
}


async function atualizaFuncao(id_departamento, id_funcionario, transacao){
    try {
        const query = `INSERT INTO funcao (desc_funcao, id_departamento, id_funcionario) values (@desc_funcao, @id_departamento, @id_funcionario)`;
        // const query = `INSERT INTO funcao (id_funcao, desc_funcao, id_departamento, id_funcionario) values (@id_funcao, @desc_funcao, @id_departamento, @id_funcionario)`;
        const request = new sql.Request(transacao);

        await request
        // .input('id_funcao', sql.Int, 601)
        .input('desc_funcao', sql.VarChar, 'Funcionario')
        .input('id_departamento', sql.Int, id_departamento)
        .input('id_funcionario', sql.Int, id_funcionario)
        .query(query);

        return true;        
        
    } catch (error) {
        if (transacao) {
            await transacao.rollback();
                console.error('Erro encontrado no cadastro de funcao, transação revertida:', error);
                logger.error("Falha ao cadastrar nova funcao", error);
        }
        logger.error(`Erro ao inserir o usuário ${matriculaAtual} através de integração na tabela FUNCAO.`, error);
        console.error('DBService - Erro ao inserir dados na tabela Funcao:', error);        
        throw error;
    }
}

async function atualizaUsuario(email, id_funcionario, transacao) {
    try {
        const query = `INSERT INTO usuario (email, senha, id_tipo_usuario, id_funcionario) values (@email, @senha, @id_tipo_usuario, @id_funcionario)`;
        // const query = `INSERT INTO usuario (id_usuario, email, senha, id_tipo_usuario, id_funcionario) values (@id_usuario, @email, @senha, @id_tipo_usuario, @id_funcionario)`;
        const request = new sql.Request(transacao);

        await request
        // .input('id_usuario', sql.Int, 5004)       
        .input('email', sql.VarChar, email)
        .input('senha', sql.VarChar, '$2a$10$GmeN3DA7Jya..M./zOoO/uIprOBOqgCJ8G6OK.VTspKAFyQbqw0Fm')
        .input('id_tipo_usuario', sql.Int, 4)
        .input('id_funcionario', sql.Int, id_funcionario)
        .query(query);
        
    } catch (error) {
        if (transacao) {
            await transacao.rollback();
                console.error('Erro encontrado no cadastro de usuário, transação revertida:', error);
                logger.error("Falha ao cadastrar novo usuário", error);
        }
        logger.error(`Erro ao inserir o usuário através de integração na tabela USUARIO.`, error);
        console.error('DBService - Erro ao inserir dados na tabela Usuario:', error);        
        throw error;
    }
}

async function atualizaFuncionarioTotvsCadastro(descricaoCargo, ativo, descricaoCentroCusto, matricula, codigoCentroCusto, nome, email, dataDesligamento, idFuncionario, transacao) {
    let matriculaAtual;
    try {
        const query = `INSERT INTO Funcionario_totvs (codigo_funcionario, gestor, data_desligamento, centro_custo, nome, email, email_gestor, cargo, funcao, nome_setor, matricula) VALUES (@codigo_funcionario, @gestor, @data_desligamento, @centro_custo, @nome, @email, @email_gestor, @cargo, @funcao, @nome_setor, @matricula)`;
        // const query = `INSERT INTO Funcionario_totvs (id, codigo_funcionario, gestor, data_desligamento, centro_custo, nome, email, email_gestor, cargo, funcao, nome_setor, matricula) VALUES (@id, @codigo_funcionario, @gestor, @data_desligamento, @centro_custo, @nome, @email, @email_gestor, @cargo, @funcao, @nome_setor, @matricula)`;
        const request = new sql.Request(transacao);
        const funcionarioInserido = [];
        if(ativo === 1){                       
            var {gestor, email_gestor} = await determinaGestor(descricaoCentroCusto);

            await request
                // .input('id', sql.Int, 40004)
                .input('codigo_funcionario', sql.Int, idFuncionario)
                .input('gestor', sql.VarChar, gestor)
                .input('data_desligamento', sql.VarChar, dataDesligamento)
                .input('centro_custo', sql.Int, codigoCentroCusto)
                .input('nome', sql.VarChar, nome)
                .input('email', sql.VarChar, email)
                .input('email_gestor', sql.VarChar, email_gestor)
                .input('cargo', sql.VarChar, descricaoCargo)
                .input('funcao', sql.VarChar, 'Funcionario')
                .input('nome_setor', sql.VarChar, descricaoCentroCusto)
                .input('matricula', sql.Int, matricula)
                .query(query);

                funcionarioInserido.push({
                    // id: 40004,
                    codigo_funcionario: idFuncionario,
                    gestor: gestor,
                    data_desligamento: dataDesligamento,
                    centro_custo: codigoCentroCusto,
                    nome: nome, 
                    email: email,
                    email_gestor: email_gestor,
                    cargo: descricaoCargo,
                    funcao: 'Funcionario',
                    nome_setor: descricaoCentroCusto,
                    matricula: matricula
                });


            logger.debug(`Usuário ${matricula} inserido com sucesso através de integração.`);

            return funcionarioInserido;
        }
        else{
            logger.debug(`Usuário ${matricula} foi desligado em ${dataDesligamento}.`);    
        }
    
    } catch (error) {
        if (transacao) {
            await transacao.rollback();
                console.error('Erro encontrado no cadastro da tabela Funcionario_totvs, transação revertida:', error);
                logger.error("Falha ao cadastrar novo Funcionario_totvs", error);
        }
        logger.error(`Erro ao inserir o usuário ${matriculaAtual} na tabela FUNCIONARIO_TOTVS.`, error);
        console.error('DBService - Erro ao inserir dados na tabela Funcionario_totvs:', error);        
        throw error;
    }
}

async function atualizaDepartamento(descDepto, transacao){
    try {
        const query = `INSERT INTO departamento (desc_departamento) OUTPUT INSERTED.id_departamento values (@desc_departamento)`;
        // const query = `INSERT INTO departamento (id_departamento, desc_departamento) OUTPUT INSERTED.id_departamento values (@id_departamento, @desc_departamento)`;
        const request = new sql.Request(transacao);
        if (nome) {
                const result = await request
                    // .input('id_departamento', sql.Int, 1000)
                    .input('desc_departamento', sql.VarChar, descDepto)
                    .query(query);
                
                const idDepartamento = result.recordset[0].id;
                logger.debug(`Departamento inserido com ID: ${idDepartamento}`);
                return idDepartamento;
            }
    } catch (error) {        
        if (transacao) {
        await transacao.rollback();
            console.error('Erro encontrado no cadastro de departamento, transação revertida:', error);
            logger.error("Falha ao cadastrar novo departamento", error);
        }
        logger.error(`Erro ao inserir registro através de integração na tabela DEPARTAMENTO.`, error);
        console.error('DBService - Erro ao inserir dados na tabela Departamento:', error);        
        throw error;
    }
}

async function getDepartamentoUsuario(departamento) {
    try {        
        const pool = await sql.connect();
        console.log("Departamento: "+departamento)
        const query = `SELECT id_departamento FROM departamento where desc_departamento = @desc_departamento`;
            const result = await pool.request()
            .input('desc_departamento', sql.VarChar, departamento)
            .query(query);
        
            console.log("ID_DEPARTAMENTO: "+result.recordset[0].id_departamento);

        return result.recordset[0].id_departamento;
    } catch (error) {
        logger.error("Falha na consulta ao banco de dados em getDepartamentoUsuario()", error);
        console.error('Erro ao retornar departamentos do banco de dados:', error);
        throw error;
    }
    
}

async function cadastraNovosFuncionarios(dados) {
    let transacao
    try {
        const pool = await sql.connect();
        transacao = new sql.Transaction(pool);
        await transacao.begin();

        for(const item of dados){
            let { descricaoCargo, ativo, descricaoCentroCusto, matricula, codigoCentroCusto, nome, codigoCargo, email, dataDesligamento } = item;
            let id_funcionario = await atualizaFuncionario(nome, transacao);
            if(id_funcionario) {
                console.log("Cadastrou funcionario");
                let funcionario_totvs = await atualizaFuncionarioTotvsCadastro(descricaoCargo, ativo, descricaoCentroCusto, matricula, codigoCentroCusto, nome, email, dataDesligamento, id_funcionario, transacao);
                if(funcionario_totvs){
                    console.log("Cadastrou funcionario totvs");
                    let funcao
                    let codigo_func = funcionario_totvs[0].codigo_funcionario;
                    let email = funcionario_totvs[0].email;
                    let nome_departamento = funcionario_totvs[0].nome_setor;
                    let departamentoUsuario = await getDepartamentoUsuario(nome_departamento, transacao);
                    console.log("departamentoUsuario: "+departamentoUsuario)
                    if(departamentoUsuario){
                        funcao = await atualizaFuncao(departamentoUsuario, codigo_func, transacao);  
                    } 
                        else {
                            let departamentoCadastrado = await atualizaDepartamento(nome_departamento, transacao);
                            if(departamentoCadastrado){
                                funcao = await atualizaFuncao(departamentoCadastrado, codigo_func, transacao);
                            }                        
                        }
                        console.log("Funcao: "+funcao)
                    if(funcao === true){                        
                        console.log("Cadastrou funcao");
                        console.log("email funcao: "+email)
                        console.log("codigo funcao: "+codigo_func)
                        await atualizaUsuario(email, codigo_func, transacao);
                        
                        console.log("Cadastrou usuario");
                    }
                }
            }
        }

        await transacao.commit();
        return true;

    } catch (error) {
        if (transacao) {
            await transacao.rollback();
            console.error('Erro encontrado, transação revertida:', error);
            logger.error("Falha ao cadastrar novo usuário", error);
        }
        return false;
    }
    finally{
        sql.close();
    }

    
}


async function getDadosDemitidos() {
    try {
        console.log("Chegou no getDadosDemitidos")
        const result = await sql.query('SELECT matricula, data_desligamento FROM Funcionario_totvs');
        return result.recordset;
    } catch (error) {
        logger.error("Falha na consulta ao banco de dados em getDadosDemitidos()", error);
        console.error('Erro ao retornar usuários demitidos do banco de dados:', error);
        throw error;
    }
}

async function atualizaDemitidos(dados) {
    let matriculaAtual;
    try {
        const pool = await sql.connect();
        transacao = new sql.Transaction(pool);
        await transacao.begin();

        const query = `UPDATE Funcionario_totvs set data_desligamento = @data_desligamento where matricula = @matricula`;
        
        for (const item of dados) {
            let { descricaoCargo, ativo, descricaoCentroCusto, matricula, codigoCentroCusto, nome, codigoCargo, email, dataDesligamento } = item;
            matriculaAtual = item.matricula;

            await pool.request()
                .input('matricula', sql.Int, item.matricula)
                .input('data_desligamento', sql.Bit, item.data_desligamento)
                .query(query);

            logger.debug(`Usuário ${item.matricula} desabilitado com sucesso através de integração.`);
        }
    await transacao.commit();
    
    } catch (error) {
        if(transacao){
            await transacao.rollback();
            console.error('Erro encontrado, transação revertida:', error);
            logger.error("Nenhum usuário foi desligado devido à falha na transação.", error);
        }
        logger.error(`Erro ao alterar status de atividade do usuário ${matriculaAtual} através de integração.`, error);
        console.error('DBService - Erro ao alterar dados no banco de dados:', error);        
        throw error;
    }
    finally{
        await sql.close();
    }
}

module.exports = {
    alteraMatriculaPorNome,
    getNomeUsuariosCadastrados,
    atualizaFuncionarioTotvs,
    getMatriculasFuncionarioTotvs,
    cadastraNovosFuncionarios,
    getDadosDemitidos
};