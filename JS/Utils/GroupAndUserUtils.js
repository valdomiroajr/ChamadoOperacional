var GroupAndUserUtils = {
    GetGroupUsersEmailsByGroupID: function (groupId) {
        var allEmails = "";
        var allUsers = this.GetGroupUsersById(groupId);

        allUsers.forEach(user => {
            allEmails += user.Email +"; ";
        });

        return allEmails;        
    },
    GetArrayGroupUsersEmailsByGroupID: function (groupId) {
        var allEmails = "";
        var allUsers = this.GetGroupUsersById(groupId);
        var users = [];

        allUsers.forEach(user => {
           users.push(user.Email);
        });
        console.log(users);
        return users;        
    },
    GetGroupUsersById(groupId){
        //_api/Web/SiteGroups/GetByName('SiteName Members')/users?$select=Email,Id
        var listDataCollection;
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/SiteGroups/GetById('" + groupId + "')/users?$select=Email,Id";
         $.ajax({
            async: false, // Async by default is set to "true" load the script asynchronously
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
    }
}