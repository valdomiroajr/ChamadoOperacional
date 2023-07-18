Framework.LoadPage("DeltaPlaceHolderMain", URLScripts + '/HTML/Home.html');
Framework.LoadPermissions();


var Home = {
    SetupControls: function () {
        document.title = 'Home - Chamados Operacional - Leônidas Moreira';
        setTimeout(() => {
            document.getElementById("anchorNovoChamado").setAttribute("href", _spPageContextInfo.webAbsoluteUrl + "/SitePages/NovoChamado.aspx");
            document.getElementById("anchorMeusChamados").setAttribute("href", Constants.Pages.URLMyTickets);

            // document.getElementById("anchorRelatorioChamadosCoordenadores").setAttribute("href", _spPageContextInfo.webAbsoluteUrl + "/SitePages/RelatorioChamadosCoordenadores.aspx");
            document.getElementById("anchorRelatorioChamados").setAttribute("href", _spPageContextInfo.webAbsoluteUrl + "/SitePages/RelatorioChamados.aspx");

            document.getElementById("anchorGruposPermissoes").setAttribute("href", _spPageContextInfo.webAbsoluteUrl + "/_layouts/15/user.aspx");
            document.getElementById("anchorCasasOracao").setAttribute("href", _spPageContextInfo.webAbsoluteUrl + "/Lists/Casas de Orao");
            document.getElementById("anchorGruposCO").setAttribute("href", _spPageContextInfo.webAbsoluteUrl + "/Lists/GruposCO");
            Home.ExibirOcultarControlesAdministrativos();
            Home.UserLogged();
        }, 1000);

    },
     ExibirOcultarControlesAdministrativos: function () {
        var usuarioEhAdmin = Permissions.CheckIfUserIsAdmin().then(response => {
            console.log(response); // Logs the response
                if (response) {
                    console.log("Usuário ADM: " + usuarioEhAdmin)
                    columnAdministracao.show();
                } else {
                    columnAdministracao.hide();
                }
            }
        );;

        const us = async () =>{
            return Permissions.CheckIfUserIsAdmin();
        }
        var columnAdministracao = $("#columnAdministracao");

        // if (usuarioEhAdmin) {
        //     console.log("Usuário ADM: " + usuarioEhAdmin)
        //     columnAdministracao.show();
        // } else {
        //     columnAdministracao.hide();
        // }
    },
    UserLogged: function() {
        document.getElementById("userLogged").innerHTML = "Usuário: " + _spPageContextInfo.userEmail;
    }
}

Home.SetupControls();