const nameID = "txtName";
const emailID = "txtEmail";
const casaOracaoID = "ddlCasaOracao";
const categoryID = "ddlCategory";
const subjectID = "txtAssunto";
const descriptionID = "txtDescription";
const fupAnexosID = "fupAnexos";

var NovoChamado = {
    CarregarHTML: async function () {
        document.title = 'Novo Chamado';
        const promises = await Promise.all([
            await Framework.LoadPage("DeltaPlaceHolderMain", URLScripts + '/HTML/NovoChamado.html'),
            await Framework.LoadChamadosRepository(),
            await Framework.LoadCasasOracaoRepository(),
            await Framework.LoadCategoriaRepository(),
            await Framework.LoadGruposCORepository(),
            await Framework.LoadPageUtils(),
            await Framework.LoadEmailUtils(),
            await Framework.EnsureScriptsAreLoaded(NovoChamado.CheckIfScriptObjectsAreLoaded)
        ]);

        NovoChamado.SetupControls();
    },
    CheckIfScriptObjectsAreLoaded: async function () {
        try {
            let scripts = [ChamadosRepository, CasasOracaoRepository, CategoriaRepository, PageUtils, EmailUtils, GruposCORepository];
            return true;
        } catch (error) {
            return false;
        }
    },
    SetupControls: async function () {
        //var COs = await CasasOracaoRepository.GetAllItems();
        var categories = await CategoriaRepository.GetAllItems();

        //Implementado filtro para retornanr apenas as COs pelo solicitante
        var restFilterCO = '$filter=Solicitantes eq ' + _spPageContextInfo.userId;
        var COs = await CasasOracaoRepository.GetItemsBySolicitante(restFilterCO);
      
        NovoChamado.PopulateDropdownCO(COs);
        NovoChamado.PopulateDropdownCategoria(categories);
        NovoChamado.SetupButtons();
        NovoChamado.SetupFileUpload();
        NovoChamado.UserLogged();
    },
    SetupButtons: function () {
        document.getElementById('btnSave').onclick = function () {
            NovoChamado.btnSave();
        };

        document.getElementById('btnCancel').onclick = function () {
            NovoChamado.btnSave();
        };
    },
    SetupFileUpload: function () {
        var input = document.getElementById('fupAnexos');
        input.onchange = function () {
            let spanSelectedFile = document.getElementById("spanSelectedFile");
            if (this.files.length > 0) {
                for (let index = 0; index < this.files.length; index++) {
                    spanSelectedFile.innerHTML += this.files[index].name + '; ';
                }
            }

        };
    },
    PopulateDropdownCO: function (items) {
        PageUtils.PopulateSelectByListItens(casaOracaoID, items, "ID", "Title");
    },
    PopulateDropdownCategoria: function (items) {
        PageUtils.PopulateSelectByListItens(categoryID, items, "ID", "Title");
    },
    btnSave: async function () {
        await Framework.Loading(true);
        await NovoChamado.Save();

    },
    Save: async function () {
        await Framework.Loading(true);
        if (this.ValidateMandatoryFields() && confirm("Confirmar criação de um novo chamado?")) {
            debugger;
            let newItem = await NovoChamado.CreateNewChamado();

            let response = await this.UploadAttachments(newItem.ID);
            
            let idCategoria = document.getElementById(categoryID).value;
            

            //Quando chamado direcionado para Informática
            if (idCategoria == 10){
                debugger;

                await ChamadosRepository.UpdateResponsaveis(newItem.Id, Constants.Status.EncaminhadoParaInformatica,      Constants.Responsibles.Informatica, "Enviado para Informática Por: CO");
                

                let data = Promise.all([
                    await EmailUtils.SendMailNotification_NovoChamadoSolicitante(newItem.ID),
                    await EmailUtils.SendMailNotification_Informatica(newItem.ID)
                ]);
            }else{
                let data = Promise.all([
                    await EmailUtils.SendMailNotification_NovoChamadoSolicitante(newItem.ID),
                    await EmailUtils.SendMailNotification_Coordenador(newItem.ID)
                ]);
            }
            alert('Chamado criado com sucesso!');
            window.location = Constants.URLSite;
        }
        Framework.Loading(false);
    },
    ValidateMandatoryFields: function () {
        let valid = true;
        var mandatoryFields = [
            [nameID, "Nome"],
            [casaOracaoID, "Casa de Oração"],
            [categoryID, "Categoria"],
            [subjectID, "Assunto"],
            [emailID, "E-mail"],
            [descriptionID, "Descrição"]
        ];

        mandatoryFields.forEach(mandatoryField => {
            if (!this.ValidateMandatoryField(mandatoryField[0], mandatoryField[1])) {
                valid = false;
            }
        });

        if (!valid) {
            alert('Atenção: Os Campos sinalizados em vermelho são de preenchimento obrigatório!');
        }

        return valid;
    },
    ValidateMandatoryField: function (fieldID, fieldAlias) {
        let valid = false;
        if (!document.getElementById(fieldID).value) {
            this.SetDangerMandatoryField(fieldID);
        } else {
            valid = true;
            this.RemoveDangerMandatoryField(fieldID);
        }
        return valid;
    },
    btnCancel: function () {
        if (confirm("Deseja cancelar a sua solicitação?")) {
            window.location = Constants.URLSite;
        }
    },
    SetDangerMandatoryField: function (fieldID) {
        let ctrl = document.getElementById(fieldID);
        if (ctrl.type == 'select-one')
            ctrl.parentElement.classList.add("is-danger");
        else
            ctrl.classList.add("is-danger");
    },
    RemoveDangerMandatoryField: function (fieldID) {
        let ctrl = document.getElementById(fieldID);
        if (ctrl.type == 'select-one')
            ctrl.parentElement.classList.remove("is-danger");
        else
            ctrl.classList.remove("is-danger");
    },
    CreateNewChamado: async function () {
        debugger;
        console.log("Nome do responsável " + document.getElementById(nameID).value)
        const name = document.getElementById(nameID).value;
        const email = document.getElementById(emailID).value;
        const description = document.getElementById(descriptionID).value;
        const casaOracao = document.getElementById(casaOracaoID).value;
        const categoryId = document.getElementById(categoryID).value;
        const subject = document.getElementById(subjectID).value;

        const category = await CategoriaRepository.GetItemByID(categoryId);
    
        return await ChamadosRepository.CreateNewChamado(subject, name, email, description, casaOracao, category.Title);
    },
    UploadAttachments: async function (newItemID) {
        let fupAnexos = document.getElementById(fupAnexosID);
        if (fupAnexos.files.length > 0) {
            for (let index = 0; index < fupAnexos.files.length; index++) {
                const file = fupAnexos.files[index];

                let response = await ChamadosRepository.AddAttachment(newItemID, file.name, file);
            }

        }
    },
    UserLogged: function() {
        document.getElementById("userLogged").innerHTML = "Usuário: " + _spPageContextInfo.userEmail;
    }
}



NovoChamado.CarregarHTML();