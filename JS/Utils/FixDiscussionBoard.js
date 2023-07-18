//Esse script tem como objetivo acertar o redirecionamento dos itens de discussion board.
//O redirecionamento nativo está quebrado no O365, jogando o usuário de outras views para uma página incorreta.


(function() {

   //Pegando a URL da Página
   var url = window.location.pathname;  
   var myPageName = url.substring(url.lastIndexOf('/') + 1);      
   
   //Checar se a página é uma das views marcadas para ajuste
   if(myPageName.toUpperCase() == "Todos_Chamados.ASPX" ||
      myPageName.toUpperCase() == "Todos.ASPX" ||
      myPageName.toUpperCase() == "MEUSCHAMADOS.ASPX" ||
      myPageName.toUpperCase() == "POR_STATUS.ASPX")
      {
     
         //Checar se a página está no modo de visualização com a Querystring
         if(window.location.search.indexOf("VisibilityContext=WSSWebPartPage") < 0){
            if(window.location.search.length > 0 && window.location.search.indexOf("List=") < 0){
                var newUrl = window.location.href.replace(myPageName, "Flat.aspx").replace("View=", "NO=");
                window.location.href = newUrl;
              }
          }
      }
   })();
   