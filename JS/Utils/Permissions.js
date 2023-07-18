var Permissions = {
    CheckIfUserIsCurrentGroupCoordinator: async function (chamado) {
        const idCO = chamado.CasaOracao.Id;
        var currentCO = await CasasOracaoRepository.GetItemByID(idCO);
        var currentGrupoCO = await GruposCORepository.GetItemByID(currentCO.Grupo.Id);

        //Checks if the current user e-mail is the same as the CO Coordinator for that CO Group
        return _spPageContextInfo.userEmail.toUpperCase() == currentGrupoCO.EmailCoordenador.toUpperCase()
    },
    CheckIfuserIsCoordinator: async function (){
        return await this.CheckIfUserBelongsToGroup(Constants.Groups.CoordenadoresCO);
    },
    CheckIfUserBelongsToGroup: async function (groupName) {
        let currentUserGroups = await Permissions.GetAllUserGroups();
        let userBelongsToGroup = false;
        for (let i = 0; i < currentUserGroups.length; i++) {
            if (currentUserGroups[i].Title == groupName){
                userBelongsToGroup = true;
            }
        }
        return userBelongsToGroup;
    },
    CheckIfUserIsAdmin: function () {
        return Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Administrators);
    },
    GetAllUserGroups: async function () {
        var currentUserGroups;
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/currentuser/groups";

        let response = await fetch(callPath, OptionsGet)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        }).then(function (data) {
            // This is the JSON from our response
            currentUserGroups = data.d.results;
        }).catch(function (err) {
            console.warn('Error on Permissions.GetAllUserGroups', err);
        });

        return currentUserGroups;
    }
}