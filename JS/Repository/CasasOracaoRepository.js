var CasasOracaoRepository = {
    //CurrentUserEmail: _spPageContextInfo.userEmail,
    GetItemByID: async function (id) {
        var listDataCollection;
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.CasasOracao + "')/items?$select=Id,Title,Grupo/Title,Grupo/Id&$expand=Grupo&$filter=Id eq " + id;
        let response = await fetch(callPath, OptionsGet)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            }).then(function (data) {
                if (data.d.results.length > 0)
                    listDataCollection = data.d.results[0];
            }).catch(function (err) {
                console.warn('Error on CasasOracao.GetById', err);
            });
        return listDataCollection;
    },
    GetAllItems: async function (callback) {
        var listDataCollection;
        
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.CasasOracao + "')/items?&$select=Title,Id&$orderby=Title asc";

console.log(callPath);
        let response = await fetch(callPath, OptionsGet)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            }).then(function (data) {
                listDataCollection = data.d.results;
                if (callback) {
                    callback(listDataCollection);
                }
            }).catch(function (err) {
                console.warn('Error on CasasOracao.GetALlItems', err);
            });

        return listDataCollection;
    },
    GetItemsBySolicitante: async function (restFilters) {
        const callPath =_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.CasasOracao + "')/items?" + restFilters;

        console.log(callPath);
        let response = await fetch(callPath, OptionsGet)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            }).then(function (data) {
                listDataCollection = data.d.results;
                if (callback) {
                    callback(listDataCollection);
                }
            }).catch(function (err) {
                console.warn('Error on CasasOracao.GetALlItems', err);
            });

        return listDataCollection;

    }
}