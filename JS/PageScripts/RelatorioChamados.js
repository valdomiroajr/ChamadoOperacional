var RelatorioChamados = {
    LoadHTML: async function () {
        document.title = 'Relatório de Chamados';
        var htmlUrl = URLScripts + '/HTML/RelatorioChamados.html';
        await Framework.LoadPage("DeltaPlaceHolderMain", htmlUrl);
        document.getElementById("userLogged").innerHTML = "Usuário: " + _spPageContextInfo.userEmail;

        //Wait until all the scripts are loaded
        const promises = await Promise.all([
            await Framework.LoadChamadosRepository(),
            await Framework.LoadCasasOracaoRepository(),
            await Framework.LoadGruposCORepository(),
            await Framework.EnsureScriptsAreLoaded(RelatorioChamados.CheckIfScriptObjectsAreLoaded)
        ]);

        RelatorioChamados.UpdateStatusChamadoInformatica();
        RelatorioChamados.SetupFilters();
        RelatorioChamados.SetupButtons();

    },
    CheckIfScriptObjectsAreLoaded: async function () {
        try {
            let scripts = [ChamadosRepository, CasasOracaoRepository];
            return true;
        } catch (error) {
            return false;
        }
    },
    SetupButtons: function () {
        document.getElementById('btnSearch').onclick = function () {
            RelatorioChamados.Search();
        };
        document.getElementById('btnExport').onclick = function () {
            RelatorioChamados.ExportToExcel();
        };

    },
    PopulateGridRows: async function (ticketItems) {

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
            '<th class="center reportTableHeader">Responsável Atual</th>' +
            '<th class="center bdtoprightradius reportTableHeader">Criado Em</th>' +
            '</tr>' +
            '</thead>';

        if (ticketItems.length == 0) {
            htmlTabela = htmlTabela +
                "<tr>" +
                "<td class='center' colspan='6'><b>Nenhum Chamado encontrado!</b></td>" +
                "</tr>";
        } else {

            for (let index = 0; index < ticketItems.length; index++) {
                const ticketItem = ticketItems[index];
                htmlTabela = htmlTabela +
                    "<tr>" +
                    "<td class='center'>" +
                    "<div class='wd100pct center'>" +
                    "<a  id='anchorVisualizarPedido' class='decorationNone' target='_blank' href='" + ticketItem.EncodedAbsUrl + "'>" +
                    "<i class=''></i>" +
                    "<span class='icon has-text-info'>" +
                    "<i class='fas fa-search is-link iconBorder'></i>" +
                    "</span>" +
                    "</span>" +
                    "</a>" +
                    "</div>" +
                    "</td>" +
                    "<td>" + ticketItem.Id + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(ticketItem.Author.Title) + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(ticketItem.CasaOracao.Title) + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(ticketItem.Title) + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(ticketItem.Status) + "</td>" +
                    "<td class='center'>" + Utils.CheckForNullUndefined(ticketItem.Respons_x00e1_vel_x0020_Atual) + "</td>" +
                    "<td class='center'>" + Utils.FormatDate(ticketItem.Created) + "</td>" +
                    "</tr>";
            }
        }


        htmlTabela = htmlTabela + "</table>";
        let divTicketReport = document.getElementById("relatorioChamados");
        divTicketReport.innerHTML = htmlTabela;
    },
    SetupFilters: async function () {
        //var COs = await CasasOracaoRepository.GetAllItems();
        console.log("Usuário Logado =>> " + _spPageContextInfo);
        var restFilterCO = '$filter=Solicitantes eq ' + _spPageContextInfo.userId;
        var COs = await CasasOracaoRepository.GetItemsBySolicitante(restFilterCO);

        if(COs.length == 0){
            document.getElementById("ddlGrupo").disabled = true;
            document.getElementById("ddlStatus").disabled = true;
            //document.getElementById("ddlAssignedTo").disabled = true;
            document.getElementById("btnSearch").disabled = true;
            document.getElementById("btnExport").disabled = true;
        }else if(COs.length == 1){
            document.getElementById("ddlGrupo").disabled = true;
        }
        PageUtils.PopulateSelectByListItens("ddlCasaOracao", COs, "ID", "Title");

        console.log("Obtendo grupos");
        var gruposCO = await GruposCORepository.GetItens();
        PageUtils.PopulateSelectByListItens("ddlGrupo", gruposCO, "ID", "Title");

    },
    SalvoComSucesso: function () {
        alert('Solicitação criada com sucesso!');
        window.location = Constants.Paginas.URLHome;
    },
    Search: async function () {
        await Framework.Loading(true);
        
        var restFilterCO = '$filter=Solicitantes eq ' + _spPageContextInfo.userId;
        var COs = await CasasOracaoRepository.GetItemsBySolicitante(restFilterCO);
        
        this.chamadosFiltrados = new Array();
        const restFilters = await RelatorioChamados.GetRestFilters(COs, this.chamadosFiltrados);
        
        //TODO Código teste
        if(restFilters === '' && this.chamadosFiltrados.length > 0) {
            RelatorioChamados.PopulateGridRows(this.chamadosFiltrados);
            await Framework.Loading(false);
            return;
        } else {
            //TODO Código em produção
            var ticketItems = await ChamadosRepository.GetAllByFilters(restFilters);

            if (ddlStatus.value != '') {
                ticketItems = RelatorioChamados.FilterByStatus(ticketItems);
            }
            RelatorioChamados.PopulateGridRows(ticketItems);
        }
        
        await Framework.Loading(false);
    },
    GetRestFilters: async function (COs, chamadosFiltrados) {
        let ddlCasaOracao = document.getElementById("ddlCasaOracao");
        let ddlStatus = document.getElementById("ddlStatus");
        let ddlAssignedTo = document.getElementById("ddlAssignedTo");
        let ddlGrupo = document.getElementById("ddlGrupo");

        let restFilter = "";
        let verificaOutrosFiltros = true;

        if (ddlCasaOracao.value > 0) {
            restFilter += "and CasaOracaoId eq " + ddlCasaOracao.value;
            verificaOutrosFiltros = false;
        } else if (ddlGrupo.value > 0 && verificaOutrosFiltros) {
            for(let i = 0; i < COs.length; i++){
                if(COs[i].GrupoId == ddlGrupo.value) {
                    if(restFilter != "") {
                        restFilter += " or CasaOracaoId eq '" + COs[i].ID + "'"
                    } else {
                        restFilter += " and CasaOracaoId eq '" + COs[i].ID + "'"
                    }
                }
            }
        } else {
            var ticketItems = new Array();
            for(let i = 0; i < COs.length; i++){
                //TODO Código em produção
                // if(i > 0) {
                //     restFilter += "or CasaOracaoId eq '" + COs[i].ID + "'"
                // } else {
                //     restFilter += "and CasaOracaoId eq '" + COs[i].ID + "'"
                // }

                //TODO Código teste
                restFilter += "and CasaOracaoId eq '" + COs[i].ID + "'"
                var listaChamadosParcial = await ChamadosRepository.GetAllByFilters(restFilter);
                
                var indice = ticketItems.length === 0 ? ticketItems.length : ticketItems.length + 1
                for(let j = 0; j < listaChamadosParcial.length; j++){
                    ticketItems[indice] = listaChamadosParcial[j];
                    indice++;
                }
                restFilter = '';
            }

            this.chamadosFiltrados = RelatorioChamados.FilterByStatus(ticketItems)
            console.log("Filter => " + restFilter);
            console.log("Tickets " + ticketItems.length);
        }

        /*if (ddlStatus.value != '') {
            restFilter += " and Status eq '" + ddlStatus.value + "'";
        }*/

        /*
        if (ddlAssignedTo.value != '') {
            restFilter += " and Respons_x00e1_vel_x0020_Atual eq '" + ddlAssignedTo.value + "'";
        }*/

        return restFilter;
    },
    FilterByStatus: function (tickets) {
        let ddlStatus = document.getElementById("ddlStatus");
        var ticketsFiltrado = new Array();

        // for(i = 0; i < tickets.length; i++){
        //     if(tickets[i].Status === ddlStatus.value){
        //         console.log("Registro filtrado " + tickets[i]);
        //         ticketsFiltrado.push(tickets[i]);
        //     }
        // }
        var filtered = tickets.filter(function(value, index, arr){ 
            return value.Status === ddlStatus.value;
        });
        return filtered
    },
    ExportToExcel: function () {
        var htmls = document.getElementById("relatorioChamados").innerHTML;
        RelatorioChamados.GenerateExcelFile(htmls);
    },
    GenerateExcelFile: function (contentHTML) {
       
        var link = document.createElement("a");
        link.href = 'data:application/vnd.ms-excel,' + escape(contentHTML);
        link.download = "Relatório de Chamados - Leônidas Moreira.xls";
        link.click();
    },
    UpdateStatusChamadoInformatica: async function () {
        debugger;
         meusChamados = await ChamadosRepository.GetAllByCurrentUser();

            for(i = 0; i< meusChamados.length; i++){
                if(meusChamados[i].Categoria == "Informática" && meusChamados[i].Status == "Aguardando Análise Informática"){
                    await ChamadosRepository.UpdateResponsaveis(meusChamados[i].Id, Constants.Status.EncaminhadoParaInformatica, Constants.Responsibles.Informatica, "Enviado para Informática Por: CO");
                }
            }
    }
}

RelatorioChamados.LoadHTML();