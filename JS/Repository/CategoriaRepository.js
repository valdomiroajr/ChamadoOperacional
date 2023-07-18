var CategoriaRepository = {
    //CurrentUserEmail: _spPageContextInfo.userEmail,
    GetItemByName: async function (areaName) {
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.Categoria + "')/items?$select=Id,Title,Grupo/Title,Grupo/Id&$filter=Title eq '" + areaName + "'&$expand=Grupo";
        let response = await fetch(callPath, OptionsGet);
        let data = await response.json();
        if (data.d.results) {
            return data.d.results[0];
        } else
            return null;
    },
    GetAllItems: async function (callback) {
        var listDataCollection;
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.Categoria + "')/items?$select=Title,Id&$orderby=Title desc";
        await fetch(callPath, OptionsGet)
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
                console.warn('Something went wrong.', err);
            });
        return listDataCollection;
    },
     GetItemByID: async function (id) {
        var listDataCollection;
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.Categoria + "')/items?$select=Id,Title,Grupo/Title,Grupo/Id&$expand=Grupo&$filter=Id eq " + id;
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
                console.warn('Error on Categoria.GetById', err);
            });
        return listDataCollection;
    }
}