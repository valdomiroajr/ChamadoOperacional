// JS com recursos para manipulação de Strings, Dates etc 
var Utils = {
    CheckForNullUndefined: function (text) {
        if (text == null || text == undefined) {
            return "";
        } else {
            return text;
        }
    },
    FormatDate: function (date) {
        if (date == null || date == undefined)
            return "";

        var datetime = new Date(date);
        return datetime.format("dd/MM/yyyy HH:mm");

    }
}