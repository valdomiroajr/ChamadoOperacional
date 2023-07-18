//Arquivo JS necessário para Inicializar o Framework Bernal
//Deve-se adicionar a referencia a esse JS na MasterPage
//Não é necessário adicionar a referencia aos outros JS's do Framework


//git push Remote --force


let URLScripts = "";
var Framework = {
    LoadPage: async function (controlID, pageURL, callback) {
        const contentDiv = document.getElementById(controlID);
        contentDiv.innerHTML = await this.fetchHtmlAsText(pageURL);
        if (callback) {
            callback();
        }
    },
    AppendPageIntoClassNameControl: async function (controlClassName, pageURL) {
        const outerDiv = document.getElementsByClassName(controlClassName)[0];
        let customHTML = await this.fetchHtmlAsText(pageURL);


        var containerDiv = document.createElement("div");
        containerDiv.innerHTML = customHTML;

        outerDiv.insertBefore(containerDiv, outerDiv.firstChild);
        return true;
    },
    fetchHtmlAsText: async function (url) {
        return await (await fetch(url)).text();
    },
    CarregarScriptsEssenciais: function () {

        //Dynamic Load JS
        //Framework.CarregarFontawesome();
        Framework.LoadFixDiscussionBoard();
        Framework.LoadDetalhesChamado();
        Framework.LoadUtils();
        Framework.LoadPageUtils();
        Framework.FazerImportsPorPagina();


    },
    FazerImportsPorPagina: function () {
        var paginaAtualSemQS = location.pathname.substring(location.pathname.lastIndexOf("/") + 1).toUpperCase();
        Framework.LoadJS(Constants.PageMapJS[paginaAtualSemQS], true);
    },
    LoadCSS: function (cssURL) {
        let myScript = document.createElement("link");
        myScript.setAttribute("href", cssURL);
        myScript.setAttribute("type", "text/css");
        myScript.setAttribute("rel", "stylesheet");
        document.body.appendChild(myScript)
    },
    LoadJS: function (scriptURL, sync) {
        let myScript = document.createElement("script");
        myScript.setAttribute("src", scriptURL);

        if (sync) {
            myScript.setAttribute("async", "false");
        } else {
            myScript.setAttribute("async", "true");
        }

        document.body.appendChild(myScript)

    },
    LoadFixDiscussionBoard: function () {
        Framework.LoadJS(URLScripts + '/JS/Utils/FixDiscussionBoard.js');
    },
    LoadDetalhesChamado: function () {
        Framework.LoadJS(URLScripts + '/JS/Utils/DetalhesChamado.js');
    },
    LoadChamadosRepository: async function (callback) {
        Framework.LoadJS(URLScripts + '/JS/Repository/ChamadosRepository.js');
        console.log('Chamados Repo Loaded');
        if (callback)
            callback();
    },
    LoadCasasOracaoRepository: function () {
        Framework.LoadJS(URLScripts + '/JS/Repository/CasasOracaoRepository.js');
    },
    LoadGruposCORepository: function () {
        Framework.LoadJS(URLScripts + '/JS/Repository/GruposCORepository.js');
    },
    LoadCategoriaRepository: function () {
        Framework.LoadJS(URLScripts + '/JS/Repository/CategoriaRepository.js');
    },
    LoadFlat: function () {
        Framework.LoadJS(URLScripts + '/JS/Utils/Flat.js');
    },
    LoadPermissions: function () {
        Framework.LoadJS(URLScripts + '/JS/Utils/Permissions.js');
    },
    LoadConstants: function () {
        Framework.LoadJS(_spPageContextInfo.webAbsoluteUrl + '/Estilos/JS/Utils/Constants.js', true);
    },
    LoadUtils: function () {
        Framework.LoadJS(_spPageContextInfo.webAbsoluteUrl + '/Estilos/JS/Utils/Utils.js');
    },
    LoadPageUtils: function () {
        Framework.LoadJS(_spPageContextInfo.webAbsoluteUrl + '/Estilos/JS/Utils/PageUtils.js');
    },
    LoadGroupAndUserUtils: function () {
        Framework.LoadJS(_spPageContextInfo.webAbsoluteUrl + '/Estilos/JS/Utils/GroupAndUserUtils.js');
    },
    LoadEmailUtils: function () {
        Framework.LoadJS(_spPageContextInfo.webAbsoluteUrl + '/Estilos/JS/Utils/EmailUtils.js');
    },
    SetPageTitle: function (title) {
        document.getElementsByTagName('title')[0].innerHTML = title;
    },
    LoadFontawesome: function () {
        Framework.LoadJS("https://kit.fontawesome.com/dcdb5a59c9.js");
    },
    Loading: async function (visible) {
        let loadingDiv = document.getElementById("loading");
        if (visible) {
            loadingDiv.classList.remove("hidden");
        } else {
            loadingDiv.classList.add("hidden");
        }
    },
    Sleep: async function (msec) {
        return new Promise(resolve => setTimeout(resolve, msec));
    },
    EnsureScriptsAreLoaded: async function (checkIfScriptObjectsAreLoaded) {
        let fullyLoaded = false;
        while (!fullyLoaded) {
            if (await checkIfScriptObjectsAreLoaded())
                fullyLoaded = true;
            else
                await Framework.Sleep(50);
        }
        return fullyLoaded;
    }
}


document.addEventListener("DOMContentLoaded", function () {
    var loadConstants = async function (callback) {

        const scriptURL = 'https://congregacao.sharepoint.com/sites/adm.sp.setorleonidasmoreira/Chamados_Operacional/Estilos/JS/Utils/Constants.js';
        let myScript = document.createElement("script");
        myScript.setAttribute("src", scriptURL);
        myScript.setAttribute("async", "false");
        document.body.appendChild(myScript)

        setTimeout(() => {
            callback();
        }, 1000);

    }

    URLScripts = _spPageContextInfo.webAbsoluteUrl + "/Estilos";
    loadConstants(Framework.CarregarScriptsEssenciais);

});