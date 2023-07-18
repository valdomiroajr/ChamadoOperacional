var GruposCORepository = {
    //CurrentUserEmail: _spPageContextInfo.userEmail,
    GetItens: function () {
    var listDataCollection;
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.GruposCO + "')/items?$select=Id,Title,EmailCoordenador";
        $.ajax({
            async: false, // Async by default is set to “true” load the script asynchronously
            url: callPath,
            method: "GET", //Specifies the operation to fetch the list item

            headers: {
                "accept": "application/json;odata=verbose", //It defines the Data format
                "content-type": "application/json;odata=verbose" //It defines the content type as JSON

            },
            success: function (data) {
                listDataCollection = data.d.results;
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        })
        return listDataCollection;
    },
    GetItemByID: function (id) {
        var listDataCollection;
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.GruposCO + "')/items?$select=Id,Title,EmailCoordenador&$filter=Id eq " + id;
        $.ajax({
            async: false, // Async by default is set to “true” load the script asynchronously
            url: callPath,
            method: "GET", //Specifies the operation to fetch the list item

            headers: {
                "accept": "application/json;odata=verbose", //It defines the Data format
                "content-type": "application/json;odata=verbose" //It defines the content type as JSON

            },
            success: function (data) {
                listDataCollection = data.d.results[0];
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        })
        return listDataCollection;
    },
    GetCoordinatorEmailByCOGroupName: async function (coGroupName) {
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.GruposCO + "')/items?$filter=Title eq '" + coGroupName + "'&$select=Title,Id,EmailCoordenador";
        let listDataCollection;
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
            })
        return listDataCollection;

    }
}