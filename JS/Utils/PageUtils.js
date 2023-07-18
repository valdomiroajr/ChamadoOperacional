// JS com recursos para manipulação de páginas e montagem de formulários 
var PageUtils = {
    SetVisibilityByClassName: function (className, visible) {
        var elements = document.getElementsByClassName(className);
        for (var i = 0; i < elements.length; i++) {
            if (visible) {
                elements[i].classList.remove('hidden');
            } else {
                elements[i].classList.add('hidden');
            }
        }
    },
    SetVisibilityByID: function (id, visible) {
        var element = document.getElementById(id);
        if (element) {
            if (visible) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    },
    PopulateSelectByListItens: function (selectID, items, valueFieldName, textFieldName) {
        var targetSelect = document.getElementById(selectID);

        if (!targetSelect) {
            console.log('Erro ao montar select ' + selectID + ": Objeto não encontrado.");
            return;
        }
        items.forEach(itm => {
            var option = document.createElement("option");
            option.value = itm[valueFieldName];
            option.text = itm[textFieldName];
            targetSelect.appendChild(option);
        });
    }

}