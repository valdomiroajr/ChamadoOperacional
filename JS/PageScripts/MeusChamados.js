var MeusChamados = {
    CarregarHTML: async function () {
        var htmlUrl = URLScripts + '/HTML/MeusChamados.html';
        Framework.LoadPage("DeltaPlaceHolderMain", htmlUrl);
        document.title = 'Novo Chamado';
        MeusChamados.SetupControls();
    },
    SetupControls: async function () {
        var meusChamados;

        //Ensure that the frameworks were loaded before the call;
        try {
            debugger;
            meusChamados = await ChamadosRepository.GetAllByCurrentUser();

            for(i = 0; i< meusChamados.length; i++){
                if(meusChamados[i].Categoria == "Informática" && meusChamados[i].Status == "Aguardando Análise Coordenador"){
                    await ChamadosRepository.UpdateResponsaveis(meusChamados[i].Id, Constants.Status.AguardandoAnaliseInformatica, Constants.Responsibles.Informatica, "Enviado para Informática Por: CO");
                }
            }

            meusChamados = await ChamadosRepository.GetAllByCurrentUser();
        } catch (error) {
            await setTimeout(() => {
                MeusChamados.SetupControls();
            }, 50);
            return;
        }


        var currentUserId = _spPageContextInfo.userId;
        var htmlLinhas = '';
        var htmlTabela =
            '<table id="tblItens" class="table is-striped is-hoverable is-fullwidth">' +
            '<thead>' +
            '<tr class="bg">' +
            '<th class="wd100 center bdtopleftradius reportTableHeader" colspan="2">Visualizar</th>' +
            '<th class="center reportTableHeader">Criado Por</th>' +
            '<th class="center reportTableHeader">Casa de Oração</th>' +
            '<th class="center reportTableHeader">Assunto</th>' +
            '<th class="center reportTableHeader">Status</th>' +
            '<th class="center bdtoprightradius reportTableHeader">Criado Em</th>' +
            '</tr>' +
            '</thead>';

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
        let divMeusChamados = document.getElementById("meusChamados");
        divMeusChamados.innerHTML = divMeusChamados.innerHTML + htmlTabela;
        document.getElementById("userLogged").innerHTML = "Usuário: " + _spPageContextInfo.userEmail;
    },
    SalvoComSucesso: function () {
        alert('Solicitação criada com sucesso!');
        window.location = Constants.Paginas.URLHome;
    },
}

Framework.LoadChamadosRepository(MeusChamados.CarregarHTML);