// $(window).on("load", function() {
//     BuscarDetalhesChamado();
//     //InserirLinkWorkflows();
//     SobrescreverRenderPost();
// });


// function SobrescreverRenderPost() {
//     SP.UI.Discussions.ForumRenderer.prototype.renderForumPost = function(a) {
    
         
//            ULS06I: ;var b = new SP.HtmlBuilder
//           , c = a.forumViewState
//           , d = c.createPostBehavior(a, a.CurrentItem);
//         c.addNewPost(d);
//         var e = SP.UI.Discussions.PostBehavior.RenderOptions.get_$2J();
//         this.setRenderOptions(e);
//         d.render(b, e);
//          BuscarDetalhesChamado();
//         //InserirLinkWorkflows();
//         return b.toString()

//     }
    
    
    
// }


// var siteUrl = "/sites/adm.sp.setorleonidasmoreira/Chamados_Operacional";

// function ObterIDItemAtual() {
// 	console.log(ObterValorQueryString("ID", $("[id*='edit-Link']")[0].href));
//     return ObterValorQueryString("ID", $("[id*='edit-Link']")[0].href)
    

// }

// var listName = "Chamados";
// function BuscarDetalhesChamado() {

//     var idItemAtual = ObterIDItemAtual();
//     var clientContext = new SP.ClientContext(siteUrl);
//     var clientContext = new SP.ClientContext();
//     var targetList = clientContext.get_web().get_lists().getByTitle(listName);
//     targetListItem = targetList.getItemById(idItemAtual);
//     clientContext.load(targetListItem);
//     clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));

    
    
    
//   /*  var oList = clientContext.get_web().get_lists().getByTitle('Central de Chamados');

//     var camlQuery = new SP.CamlQuery();
//     camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' +
//         '<Value Type=\'Number\'>' + idItemAtual + '</Value></Eq></Where></Query><RowLimit>10</RowLimit></View>');

//     this.collListItem = oList.getItems(camlQuery);
//     clientContext.load(collListItem);
//     clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
// */
// }




// function ObterValorQueryString(nomeParametro, urlCompleta) {
//     var urlParams = new URLSearchParams(urlCompleta);
//     var myParam = urlParams.get(nomeParametro);
//     return myParam;
// }

// function onQuerySucceeded(sender, args) {
//     //var listItemEnumerator = collListItem.getEnumerator();
//     var htmlDetalhesHeader = "<table class=\"tableDetalhes\"><tr><td colspan=\"2\" class=\"detalhesHeader\">Detalhes do Chamado</td></tr>";
//     var htmlDetalhesMiddle = "";
//     var htmlDetalhesFooter = "</table>";

  
//         var oListItem = targetListItem;
//         htmlDetalhesMiddle += "<tr><td class=\"detalhesFieldLabel\">Status Atual:</td><td>" + oListItem.get_item('Status') + "</td>";
//         htmlDetalhesMiddle += "<tr><td class=\"detalhesFieldLabel\">Casa de Oração:</td><td>" + oListItem.get_item('Casa_x0020_de_x0020_Ora_x00e7__x').$7Q_1 + "</td>";

//       //  if (oListItem.get_item('AreaResponsavel') != null) {
//       //      htmlDetalhesMiddle += "<tr><td class=\"detalhesFieldLabel\">Especialidade:</td><td>" + oListItem.get_item('AreaResponsavel').$5u_1 + "</td>";
//       //  } else {
//        //     htmlDetalhesMiddle += "<tr><td class=\"detalhesFieldLabel\">Especialidade:</td><td><a href='" + $("[id*='edit-Link']")[0].href + "'> Clique aqui para atribuir um especialista </a> </td>";
//       //  }
   

//     var htmlFinal = htmlDetalhesHeader + htmlDetalhesMiddle + htmlDetalhesFooter;
//     var htmlOriginalPost = $(".ms-comm-postRootContainer")[0].innerHTML;
    
//     //Só adicionar a string caso não tenha renderizado atabela de detalhes
//     if(htmlOriginalPost.indexOf("Detalhes do Chamado") == -1){
//     	$(".ms-comm-postRootContainer")[0].innerHTML = htmlFinal + htmlOriginalPost;
//     }
// }

// function InserirLinkWorkflows() {
// 	$(document).ready(function() {
// 	    var idItemAtual = ObterIDItemAtual();
// 	    var sourceUrl = window.location.href;
// 	    var linkIniciarWorkflow = "https://congregacao.sharepoint.com/sites/adm.sp.setorleonidasmoreira/Chamados_Operacional/_layouts/15/Workflow.aspx?ID=" + idItemAtual + "&List={D3B5035C-0E1D-49E5-8521-3CF02311A9E6}&Source=" + sourceUrl;
	
// 	    var htmlLinkWorkflow = '<a href="' + linkIniciarWorkflow + '" title="Visualizar Workflows"><img border="0" width="20" height="15" alt="Workflows" src="/_layouts/15/images/availableworkflow.gif?rev=46"></a>';
	
	
// 	    var htmlOriginal = $("[id*='commandBar']")[0].innerHTML;
	    
// 	    //Só adicionar a string caso não tenha renderizado o link dos workflows
// 	    if(htmlOriginal.indexOf("Visualizar Workflows") == -1){
// 		   	$("[id*='commandBar']")[0].innerHTML = htmlOriginal + htmlLinkWorkflow;
// 	 	}   
	    
// 	});

// }

// //https://congregacao.sharepoint.com/sites/setorlapa/SuporteOperacional/_layouts/15/Workflow.aspx?ID=37&List={CCD3D1CD-149F-40DC-8880-97138EADE183}&Source=https%3A%2F%2Fcongregacao%2Esharepoint%2Ecom%2Fsites%2Fsetorlapa%2FPatrimonio%2FLists%2FCentralChamados%2FTodos%2Easpx
// //commandBar0