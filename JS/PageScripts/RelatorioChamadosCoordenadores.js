var RelatorioChamadosCoordenadores = {
    CarregarHTML: async function () {
        document.title = 'Relatório de Chamados - Coordenadores de Grupos';
        var htmlUrl = URLScripts + '/HTML/RelatorioChamadosCoordenadores.html';
        await Framework.LoadPage("DeltaPlaceHolderMain", htmlUrl);


        await Framework.LoadChamadosRepository();
        await Framework.EnsureScriptsAreLoaded(RelatorioChamadosCoordenadores.CheckIfScriptObjectsAreLoaded);

        RelatorioChamadosCoordenadores.PopularGridMeusChamados();
 
    },
    CheckIfScriptObjectsAreLoaded: async function () {
        try {
            let scripts = [EmailUtils, ChamadosRepository, PageUtils];
            return true;
        } catch (error) {
            return false;
        }
    },
    PopularGridMeusChamados: function () {
        var urlVisualizarChamado = RelatorioChamadosCoordenadores.GetURLVisualizarChamado();
        var currentUserId = _spPageContextInfo.userId;
        var meusChamados = ChamadosRepository.GetAllByCurrentUser();
        var htmlLinhas = '';

        var htmlTabela =
            '<table id="tblItens" class="tableStyle">' +
            '<tr>' +
            '<th class="wd100 center">Visualizar</th>' +
            '<th class="center">Criado Por</th>' +
            '<th class="center">Casa de Oração</th>' +
            '<th class="center">Assunto</th>' +
            '<th class="center">Status</th>' +
            '<th class="center">Criado Em</th>' +
            '</tr>';

        if (meusChamados.length == 0) {
            htmlTabela = htmlTabela +
                "<tr>" +
                "<td class='center' colspan='6'><b>Nenhum Chamado encontrado!</b></td>" +
                "</tr>";
        } else {
           
            for (let index = 0; index < meusChamados.length; index++) {
                const chamado = meusChamados[index];
                htmlTabela = htmlTabela +
                    "<tr>" +
                    "<td class='center'>" +
                    "<div class='wd100pct center'>" +
                    "<a  id='anchorVisualizarPedido' class='decorationNone' target='_blank' href='" + chamado.EncodedAbsUrl + "'>" +
                    "<i class=''></i>" +
                    "<span class='icon has-text-info'>" +
                    "<i class='fas fa-search is-link iconBorder'></i>" +
                    "</span>" +
                    "</span>" +
                    "</a>" +
                    "</div>" +
                    "</td>" +
                    "<td>" + chamado.Id + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(chamado.Author.Title) + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(chamado.CasaOracao.Title) + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(chamado.Title) + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(chamado.Status) + "</td>" +
                    "<td class='center'>" + Utils.FormatDate(chamado.Created) + "</td>" +
                    "</tr>";
            }
        }
        

        htmlTabela = htmlTabela + "</table>";
        let divMeusChamados = document.getElementById("relatorioChamados");
        divMeusChamados.innerHTML = divMeusChamados.innerHTML + htmlTabela;

    },
    SalvoComSucesso: function () {
        alert('Solicitação criada com sucesso!');
        window.location = Constants.Paginas.URLHome;
    },
    GetURLVisualizarChamado: function () {

    }
}

RelatorioChamadosCoordenadores.CarregarHTML();
