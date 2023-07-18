$(window).on("load", function () {
    Sucesso.CarregarHTML();
});

var Sucesso = {
    //CurrentUserEmail: _spPageContextInfo.userEmail,
    CarregarHTML: function () {
        var htmlUrl = URLScripts + '/HTML/Sucesso.html';
        PageUtils.LoadHTMLInto("#DeltaPlaceHolderMain", htmlUrl, this.PrepararControles);
        document.title = 'Relatório de Declarações de Trânsito';
    }
}

