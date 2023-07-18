const PageHome = "Home.aspx";
const PageMyTickets = "MeusChamados.aspx";
const PageReportTicketsCoordinator = "RelatorioChamadosCoordenador.aspx";
const OptionsGet = {
    method: "GET",
    credentials: 'include',
    headers: new Headers({
        'Accept': 'application/json; odata=verbose',
        'Content-Type': 'application/json; odata=verbose'
    })
};

var Constants = {
    FromEmail: "CCB_LeonidasMoreira_ChamadosOperacional@Congregacao.org.br",
    URLSite: 'https://congregacao.sharepoint.com/sites/adm.sp.setorleonidasmoreira/Chamados_Operacional',
    EmailsGestao: {
        Rodrigo: "rodrigo.francisco@congregacao.org.br", 
        Eneas: "eneas.firmino@congregacao.org.br",
        CaixaJuridica: "setor8-gestao@outlook.com"
    },
    EmailCompras: "adm.sp.leonidasmoreira.compras@congregacao.org.br",
    EmailInformatica: {
        Junior: "valdomiro.dealmeida@congregacao.org.br",
        Miguel: "miguel.nunes@congregacao.org.br",
        Jonathan: "jonathan.santos@congregacao.org.br",
        Cido: "jose.aparecido@congregacao.org.br",
        Fabricio: "fabricio.centro@yahoo.com.br"
    },
    //EmailInformatica: "adm.sp.leonidasmoreira.informatica@congregacao.org.br",
    Status: {
        AguardandoAnaliseCoordenador: "Aguardando Análise Coordenador",
        AprovadoParaExecucaoCO: "Aprovado para Execução - Casa de Oração",
        EncaminhadoParaGestao: "Encaminhado para Gestão",
        EncaminhadoParaSeguranca: "Encaminhado para Segurança",
        EncaminhadoParaCivil: "Encaminhado para Civil",
        EncaminhadoParaMecanica: "Encaminhado para Mecânica",
        EncaminhadoParaEletrica: "Encaminhado para Elétrica",
        Reprovado: "Reprovado",
        Concluido: "Chamado Concluído",
        AguardandoValidacaoCoordenador: "Aguardando Validação Coordenador",
        InviavelTecnicamente: "Inviável Tecnicamente",
        EncaminhadoParaCoordenador: "Encaminhado para Coordenador",
        EncaminhadoParaEngenhariaEmergencia: "Encaminhado para Elétrica - Alarme/Luz/Som",
        EncaminhadoParaCompras: "Encaminhado para Compras",
        EncaminhadoParaInformatica: "Encaminhado para Informática",
        AguardandoAnaliseInformatica: "Aguardando Análise Informática",
        EncaminhadoPorInformaticaValidacaoCasaOracao: "Em validação - Casa de Oração"
    },
    Responsibles: {
        CasaOracao: "Casa de Oração",
        GestoresChamados: "Gestores Chamados",
        Eletrica: "Elétrica",
        Civil: "Civil",
        Seguranca: "Segurança",
        CoordenadorCO: "Coordenador",
        EletricaEmergencia: "Elétrica - Alarme/Luz/Som Emergência",
        Compras: "Compras",
        Informatica: "Informática",
        Mecanica: "Mecânica"
    },
    GetOptionsPost: function (data) {
        const OptionsPost = {
            method: "POST",
            headers: new Headers({
                'Content-Type': 'application/json;odata=verbose',
                'Accept': 'application/json;odata=verbose',
                'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value
            }),
            data: JSON.stringify(data)
        }
        return OptionsPost;
    },
    Lists: {

        Chamados: "Chamados",
        URLChamados: '/Lists/Chamados',
        CasasOracao: "Casas de Oração",
        URLCasasOracao: "/Lists/Casas%20de%20Orao",
        GruposCO: "GruposCO",
        URLGruposCO: "/Lists/Grupos",
        Categoria: "Categoria",
        URLCategoria: "/Lists/Categoria"


    },
    Groups: {
        Administrators: "Gestores de Chamados - Operacional",
        CoordenadoresCO: "Coordenadores de Casas de Oração",
        Civil: "Grupo - Categoria - Civil",
        Eletrica: "Grupo - Categoria - Elétrica",
        Seguranca: "Grupo - Categoria - Segurança",
        Compras: "Grupo - Categoria - Compras_",
        Informatica: "Grupo - Categoria - TI"
    },
    PageMapJS: {
        "FLAT.ASPX": URLScripts + '/JS/PageScripts/Flat.js',
        "SUCESSO.ASPX": URLScripts + '/JS/PageScripts/Sucesso.js',
        "RELATORIOCHAMADOSCOORDENADORES.ASPX": URLScripts + '/JS/PageScripts/RelatorioChamadosCoordenadores.js',
        "HOME.ASPX": URLScripts + '/JS/PageScripts/Home.js',
        "MEUSCHAMADOS.ASPX": URLScripts + '/JS/PageScripts/MeusChamados.js',
        "NOVOCHAMADO.ASPX": URLScripts + '/JS/PageScripts/NovoChamado.js',
        "RELATORIOCHAMADOS.ASPX": URLScripts + '/JS/PageScripts/RelatorioChamados.js',
    },
    Pages: {
        URLHome: _spPageContextInfo.webAbsoluteUrl + "/SitePages/" + PageHome,
        URLMyTickets: _spPageContextInfo.webAbsoluteUrl + "/SitePages/" + PageMyTickets,
    }

}