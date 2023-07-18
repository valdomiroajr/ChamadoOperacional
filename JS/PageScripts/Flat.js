var Flat = {
    SetupPage: async function () {
        
        Framework.LoadChamadosRepository();
        Framework.LoadCasasOracaoRepository();
        Framework.LoadGruposCORepository();
        Framework.LoadCategoriaRepository();

        Framework.LoadPermissions();
        Framework.LoadGroupAndUserUtils();
        Framework.LoadEmailUtils();
        Framework.LoadPageUtils();    

        let scriptsAreFullyLoaded = await Framework.EnsureScriptsAreLoaded(Flat.CheckIfScriptObjectsAreLoaded);

        if (scriptsAreFullyLoaded) {
            let currentTicketItem = await Flat.GetCurrentItem();

            debugger;
            if (currentTicketItem.Status == Constants.Status.AguardandoAnaliseCoordenador && currentTicketItem.Categoria == "Informática") {
                console.log("Atualizando status quando categoria for informática");
                await Flat.UpdateStatusChamadoInformatica(currentTicketItem.Id);
            }

            await Flat.AddDetailsToPage(currentTicketItem);
            Flat.SetupForWorkflow(currentTicketItem);
            await Flat.SetupFileUpload(currentTicketItem);
            await Flat.CheckUserPermissionType(currentTicketItem);
           
            if(currentTicketItem.Status != Constants.Status.Concluido && currentTicketItem.Status != Constants.Status.InviavelTecnicamente)
            {
                PageUtils.SetVisibilityByID("divAddAttachments", true);
            }
        }


    },
    CheckIfScriptObjectsAreLoaded: async function () {
        try {
            let scripts = [EmailUtils, ChamadosRepository, PageUtils];
            return true;
        } catch (error) {
            return false;
        }
    },  
    AddDetailsToPage: async function (currentItem) {
        //Adds the detail box at the top of the page
        let htmlLoaded = await Framework.AppendPageIntoClassNameControl("ms-webpart-chrome-vertical ms-webpart-chrome-fullWidth", URLScripts + '/HTML/DetalhesChamado.html');

        debugger;

        /*if(currentItem.Categoria == "Informática" && currentItem.Status == "Aguardando Validação Coordenador"){
                    await ChamadosRepository.UpdateResponsaveis(currentItem.Id, Constants.Status.EncaminhadoParaInformatica, Constants.Responsibles.Informatica, "Enviado para Informática Por: CO");
                }*/

        let lblStatus = document.getElementById("lblStatus");
        let lblCasaOracao = document.getElementById("lblCasaOracao");
        let lblCategoria = document.getElementById("lblCategoria");
        let lblResponsavel = document.getElementById("lblResponsavel");
        let lblChamado= document.getElementById("lblChamado");
        let lblSolicitante = document.getElementById("lblSolicitante");
        
        lblStatus.innerHTML = currentItem.Status;
        lblCasaOracao.innerHTML = currentItem.CasaOracao.Title;
        lblCategoria.innerHTML = currentItem.Categoria;
        lblResponsavel.innerHTML = currentItem.Respons_x00e1_vel_x0020_Atual;
        lblSolicitante.innerHTML = currentItem.Nome;

        lblChamado.innerHTML = currentItem.Id;
        document.title = 'Detalhe do chamado - ' + currentItem.Id;

        PageUtils.SetVisibilityByClassName("ms-comm-forumCmdList", false);
        PageUtils.SetVisibilityByClassName("ms-comm-allRepliesHeader", false);
        PageUtils.SetVisibilityByID("discAttachmentLink1", false);
        PageUtils.SetVisibilityByID("ms-designer-ribbon", false);

        await Flat.AddAttachmentsToPage(currentItem.Id);
    },
    AddAttachmentsToPage: async function (ticketID) {
        console.log('Running Add Attachments to page...');
        var anexos = await ChamadosRepository.GetAttachmentsByTicketId(ticketID);
        var htmlLinhas = '';
        if (anexos == null || anexos.length == 0) {
            htmlLinhas =
                "<tr>" +
                "<td colspan='2' class='center' colspan='5'>Nenhum anexo encontrado.</td>" +
                "</tr>";
        } else {
            for (let index = 0; index < anexos.length; index++) {
                const element = anexos[index];
                htmlLinhas = htmlLinhas +
                    "<tr>" +
                    "<td class='center'>" + (index + 1) + "</td>" +
                    "<td class='center'><div class='wd100pct left'><a id='anchorVisualizarPedido' target='_blank' href='" + element.ServerRelativeUrl + "'>" + element.FileName + "</a></div></td>" +
                    "</tr>";
            }
        }

        var attachmentsTbody = document.getElementById("attachmentsTbody");
        attachmentsTbody.innerHTML = htmlLinhas;

        // var outerDiv = document.getElementById("tblAnexos");
        // outerDiv.insertBefore(attachmentsTbody, outerDiv.firstChild);
    },
    SetupFileUpload: async function (currentTicketItem) {
        let input = document.getElementById('fupAnexos');
        input.onchange = async function () {
            if (this.files.length > 0) {
                for (let index = 0; index < this.files.length; index++) {
                    await Flat.SetFileUploadText(spanSelectedFile.innerHTML + this.files[index].name + '; ');
                }
            }
        };

        document.getElementById('btnEnviarAnexo').onclick = await async function () {
            Flat.SendAttachmentsClick(currentTicketItem.Id)
        };
    },
    SendAttachmentsClick: async function (ticketID) {
        await Flat.UploadAttachments(ticketID);
        setTimeout(Flat.AddAttachmentsToPage, 1000, ticketID);
    },
    SetupForWorkflow: async function (currentTicketItem) {
        //if the user is creating a new ticket
        if (window.location.pathname.toUpperCase().includes("/CHAMADOS/NEWFORM.ASPX")) {
            Flat.HideParentTRByChildID("IsQuestion");
            let elem = document.querySelector(".ms-formtable");
            elem.innerHTML = elem.innerHTML + "<tr><td> <a href='javascript:UploadAttachment()'><i class='fas fa-upload'></i> Carregar Anexo</a></td></tr>";

        } else if (window.location.pathname.toUpperCase().includes("/CHAMADOS/FLAT.ASPX")) {

            const categoria = currentTicketItem.Categoria;
            if(currentTicketItem.Status == Constants.Status.InviavelTecnicamente){
                Flat.SetBotaoForStepEnviavelTecnicamente();
                return;
            }
            //To-Do - Check if Current user belongs to the correct permission group
            if (currentTicketItem.Status == Constants.Status.AguardandoAnaliseCoordenador) {
                Flat.SetForCategoryCoordinator(currentTicketItem);
            } else if (currentTicketItem.Status == Constants.Status.AprovadoParaExecucaoCO) {
                Flat.SetForStepExecucaoCO(currentTicketItem);
            } else if (currentTicketItem.Status == Constants.Status.Concluido) {
                Flat.SetForCO(currentTicketItem);
            } else if (currentTicketItem.Status == Constants.Status.EncaminhadoParaGestao) {
                Flat.SetForStepEncaminhadoParaGestao(currentTicketItem);
            } else if (currentTicketItem.Status == Constants.Status.EncaminhadoParaSeguranca ||
                currentTicketItem.Status == Constants.Status.EncaminhadoParaCivil ||
                currentTicketItem.Status == Constants.Status.EncaminhadoParaEletrica) {
                Flat.SetForEngenharia(currentTicketItem);
            } else if (currentTicketItem.Status == Constants.Status.AguardandoValidacaoCoordenador) {
                Flat.SetForCoordinatorValidation();
            } else if (currentTicketItem.Status == Constants.Status.EncaminhadoParaCompras) {
                Flat.SetForStepCompras(currentTicketItem);
            } else if (currentTicketItem.Status == Constants.Status.EncaminhadoParaInformatica) {
                Flat.SetForStepInformatica(currentTicketItem);
            } else if (currentTicketItem.Status == Constants.Status.EncaminhadoParaMecanica) {
                Flat.SetForStepMecanica(currentTicketItem);
            }
        }
    },
    SetForEngenharia: function (currentTicketItem) {
        console.log("SetForEngenharia");
        let userBelongsToTheRightGroup = Flat.CheckIfUserBelongsToTheRightEngineeringGroup(currentTicketItem);

        if (userBelongsToTheRightGroup) {
            PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
            PageUtils.SetVisibilityByID("tdEnviarGestao", true);
            PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            PageUtils.SetVisibilityByID("tdServicoExecutado", false);
            PageUtils.SetVisibilityByID("tdEnviarCoordenacao", true);
            PageUtils.SetVisibilityByID("enviavelTecnicamenteCO", false);
            PageUtils.SetVisibilityByID("enviavelTecnicamenteCoordenacao", true);

            if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Eletrica) {
                PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Civil) {
                PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Seguranca) {
                PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            }
        }
    },
    SetForCoordinatorValidation: function () {
        if (Permissions.CheckIfuserIsCoordinator()) {
            PageUtils.SetVisibilityByID("tdConcluirChamado", true);
            //PageUtils.SetVisibilityByID("tdEnviarCivil", true);
            //PageUtils.SetVisibilityByID("tdEnviarEletrica", true);
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", true);
        }
    },
    CheckIfUserBelongsToTheRightEngineeringGroup: async function (currentTicketItem) {
        if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Eletrica) {
            return Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Eletrica);
        } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Civil) {
            return Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Civil);
        } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Seguranca) {
            return Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Seguranca);
        }
    },
    SetForCategoryCoordinator: function () {
        if (Permissions.CheckIfuserIsCoordinator()) {
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", true);
            PageUtils.SetVisibilityByID("tdConcluirChamado", false);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", true);
            PageUtils.SetVisibilityByID("tdEnviarGestao", true);
            PageUtils.SetVisibilityByID("tdEnviarCivil", true);
            PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", true);
            PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", true);
            PageUtils.SetVisibilityByID("tdEnviarCompras", false);
            PageUtils.SetVisibilityByID("tdEnviarMecanica", true);

        }
    },
    SetForStepExecucaoCO: function (currentTicketItem) {
        if (currentTicketItem.Status == Constants.Status.InviavelTecnicamente || currentTicketItem.Status == Constants.Status.AprovadoParaExecucaoCO)           {
             PageUtils.SetVisibilityByID("tdConcluirChamado", true);
        }
    },
    SetForStepEncaminhadoParaGestao: function () {
        if (Permissions.CheckIfuserIsCoordinator()) {
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", true);
            PageUtils.SetVisibilityByID("tdConcluirChamado", true);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", true);
            PageUtils.SetVisibilityByID("tdEnviarCivil", true);
            PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", true);
            PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", true);
            PageUtils.SetVisibilityByID("tdEnviarCoordenacao", true);
            PageUtils.SetVisibilityByID("tdEnviarCompras", true);
             PageUtils.SetVisibilityByID("tdEnviarMecanica", true);
        }
    },
    SetForStepCompras: function (currentTicketItem) {
        console.log("SetForStepCompras");
        let userBelongsToTheRightGroup = Flat.CheckIfUserBelongsToTheRightEngineeringGroup(currentTicketItem);

        if (userBelongsToTheRightGroup) {
            PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
            PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            PageUtils.SetVisibilityByID("tdServicoExecutado", false);
            PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
            PageUtils.SetVisibilityByID("tdEnviarGestao", true);
            PageUtils.SetVisibilityByID("tdEnviarInformatica", false);
            PageUtils.SetVisibilityByID("tdEnviarMecanica", false);

            if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Eletrica) {
                PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Civil) {
                PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            }else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Mecanica) {
                PageUtils.SetVisibilityByID("tdEnviarMecanica", false);
            } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Seguranca) {
                PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            }
        }
    },

    SetForStepInformatica: function (currentTicketItem) {
        console.log("SetForStepInformatica");
        let userBelongsToTheRightGroup = Flat.CheckIfUserBelongsToTheRightEngineeringGroup(currentTicketItem);

        if (userBelongsToTheRightGroup) {
            PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
            PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            PageUtils.SetVisibilityByID("tdEnviarMecanica", false);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            PageUtils.SetVisibilityByID("tdServicoExecutado", false);
            PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
            PageUtils.SetVisibilityByID("tdEnviarCompras", true);
            PageUtils.SetVisibilityByID("tdEnviarGestao", false);
            PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", true);
            PageUtils.SetVisibilityByID("tdInviavelTecnicamenteCO", false);

            if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Eletrica) {
                PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Civil) {
                PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Seguranca) {
                PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            }
        }
    },

    SetForStepMecanica: function (currentTicketItem) {
        console.log("SetForEngenhariaMecanica");
        let userBelongsToTheRightGroup = Flat.CheckIfUserBelongsToTheRightEngineeringGroup(currentTicketItem);

        if (userBelongsToTheRightGroup) {
            PageUtils.SetVisibilityByID("tdInviavelTecnicamente", true);
            PageUtils.SetVisibilityByID("tdEnviarGestao", true);
            PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            PageUtils.SetVisibilityByID("tdServicoExecutado", false);
            PageUtils.SetVisibilityByID("tdEnviarCoordenacao", true);

            if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Eletrica) {
                PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Civil) {
                PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            } else if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.Seguranca) {
                PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            }
        }
    },

    HideParentTRByChildID: function (controlID) {
        var control = document.getElementById(controlID);
        var parentControl = control.parentNode;

        while (parentControl.nodeName != "TR") {
            parentControl = parentControl.parentElement;
        }
        parentControl.style.display = "none";
    },

    ApproveForExecution: async function () {
        await Framework.Loading(true);
        if (confirm("Deseja aprovação esse item para Execução da Casa de Oração?")) {
            const idItem = await Flat.GetCurrentItemID();
            
            let updatedSuccessfully = await ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.AprovadoParaExecucaoCO, Constants.Responsibles.CasaOracao, "Aprovado para execução por: " + _spPageContextInfo.userEmail);
            const chamado = await Flat.GetCurrentItem();
            EmailUtils.SendMailNotification_EnvioChamadoCO(chamado.Id)
            if (updatedSuccessfully) {
                alert("Chamado aprovado para execução da CO!");
                Flat.GoToHomePage();
            }
        }
        Framework.Loading(false);
    },
    FinishTicket: async function () {
        await Framework.Loading(true);
        if (confirm("Deseja concluir esse chamado?")) {
            const idItem = await Flat.GetCurrentItemID();
            await ChamadosRepository.UpdateStatusDetalhes(idItem, Constants.Status.Concluido, "Concluído por: " + _spPageContextInfo.userEmail);
            
            let data = Promise.all([
                await EmailUtils.SendMailNotification_Coordenador_FinishedTicket(idItem),
                await EmailUtils.SendMailNotification_CO_FinishedTicket(idItem)
            ]);
            alert("Chamado Concluído com Sucesso!");
            Flat.GoToHomePage();
        }
        Framework.Loading(false);
    },
    GoToHomePage: function () {
        window.location.href = "https://congregacao.sharepoint.com/sites/adm.sp.setorleonidasmoreira/Chamados_Operacional";
    },
    ForwardToTicketManagement: async function () {
        debugger;
        await Framework.Loading(true);
        if (confirm("Deseja encaminhar esse chamado para a Gestão?")) {
            const idItem = await Flat.GetCurrentItem();
            ChamadosRepository.UpdateResponsaveis(idItem.Id, Constants.Status.EncaminhadoParaGestao, Constants.Responsibles.GestoresChamados, "Encaminhado para Gestão Por: " + _spPageContextInfo.userEmail);

            EmailUtils.SendMailNotification_EnvioChamadoCO(idItem.Id)

            alert("Chamado encaminhado para a Gestão!");
            Flat.GoToHomePage();
        }
        await Framework.Loading(false);
    },
    ForwardToCoordenador: async function () {
        await Framework.Loading(true);
        if (confirm("Deseja encaminhar chamado para Coordenação?")) {
            const idItem = await Flat.GetCurrentItem();
            await ChamadosRepository.UpdateResponsaveis(idItem.Id, Constants.Status.AguardandoValidacaoCoordenador, Constants.Responsibles.CoordenadorCO, "Enviado para coordenação Por: " + _spPageContextInfo.userEmail);
            EmailUtils.SendMailNotification_EnvioChamadoCO(idItem.Id)
            alert("Chamado atualizado com sucesso!");
            Flat.GoToHomePage();
        }
        await Framework.Loading(false);
    },
    ForwardToCompras: async function () {
        console.log("enviando chamado para compras");
        await Framework.Loading(true);
        if (confirm("Deseja encaminhar chamado para Compras?")) {
            const idItem = await Flat.GetCurrentItemID();
            await ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.EncaminhadoParaCompras, Constants.Responsibles.Compras, "Enviado para compras Por: " + _spPageContextInfo.userEmail);
            let data = Promise.all([
                await EmailUtils.SendMailNotification_Compras(idItem),
                //await EmailUtils.SendMailNotification_Gestao(idItem)
            ]);
            alert("Chamado atualizado com sucesso!");
            Flat.GoToHomePage();
        }
        await Framework.Loading(false);
    },
    ForwardToInformatica: async function () {
        console.log("enviando chamado para informática");
        await Framework.Loading(true);
        if (confirm("Deseja encaminhar chamado para Informática?")) {
            const idItem = await Flat.GetCurrentItemID();
            await ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.EncaminhadoParaInformatica, Constants.Responsibles.Informatica, "Enviado para informática Por: " + _spPageContextInfo.userEmail);
            let data = Promise.all([
                await EmailUtils.SendMailNotification_Informatica(idItem),
            ]);
            alert("Chamado atualizado com sucesso!");
            Flat.GoToHomePage();
        }
        await Framework.Loading(false);
    },
    ForwardFromInformaticaToCo: async function () {
        console.log("enviando chamado para CO");
        await Framework.Loading(true);
        if (confirm("Deseja encaminhar chamado para Casa de Oração?")) {
            const idItem = await Flat.GetCurrentItemID();
            await ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.EncaminhadoPorInformaticaValidacaoCasaOracao, Constants.Responsibles.CasaOracao, "Enviado para casa de oração Por: " + _spPageContextInfo.userEmail);
            let data = Promise.all([
                await EmailUtils.SendMailNotification_EnvioChamadoCO(idItem),
            ]);
            alert("Chamado atualizado com sucesso!");
            Flat.GoToHomePage();
        }
        await Framework.Loading(false);
    },
    ForwardToEngenharia: async function (nameCategoria) {
        debugger;
        await Framework.Loading(true);
        if (confirm("Deseja encaminhar esse chamado para a Área de " + nameCategoria + "?")) {
            const idItem = await Flat.GetCurrentItemID();
            var currentCall = await ChamadosRepository.GetById(idItem);

            if (nameCategoria == "Segurança") {
                ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.EncaminhadoParaSeguranca, Constants.Responsibles.Seguranca, "Encaminhado para Gestão Por: " + _spPageContextInfo.userEmail);
            } else if (nameCategoria == "Civil") {
                ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.EncaminhadoParaCivil, Constants.Responsibles.Civil, "Encaminhado para Gestão Por: " + _spPageContextInfo.userEmail);
            } else if (nameCategoria == "Elétrica") {
                ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.EncaminhadoParaEletrica, Constants.Responsibles.Eletrica, "Encaminhado para Gestão Por: " + _spPageContextInfo.userEmail);
            } else if (nameCategoria == "Elétrica - Alarme/Luz/Som (Emergência)") {
                ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.EncaminhadoParaEngenhariaEmergencia, Constants.Responsibles.EletricaEmergencia, "Encaminhado para Elétrica - Alarme/Luz/Som Por: " + _spPageContextInfo.userEmail);
            }
            else if (nameCategoria == "Mecânica") {
                ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.EncaminhadoParaMecanica, Constants.Responsibles.Mecanica, "Encaminhado para Mecânica Por: " + _spPageContextInfo.userEmail);
            }

            //Mail Notification
            const idItemAtual = await Flat.GetCurrentItemID();
            var itemCategoria = await CategoriaRepository.GetItemByName(nameCategoria);
            var currentItem = await ChamadosRepository.GetById(idItemAtual);
            var lst = await CategoriaRepository.GetAllItems();
            console.log(lst);
            const groupID = itemCategoria.Grupo.Id;

            var oldResponsible = currentCall.Respons_x00e1_vel_x0020_Atual != null ? currentCall.Respons_x00e1_vel_x0020_Atual : '';

            var groupEmails = GroupAndUserUtils.GetArrayGroupUsersEmailsByGroupID(groupID);
            groupEmails.forEach(user => {
                EmailUtils.SendMailNotification(currentItem, nameCategoria, user, oldResponsible);
            });


            alert("Chamado encaminhado para - " + nameCategoria);
            Flat.GoToHomePage();
        }
    },
    //Call Example: CreateHyperLinkWithClickAction("ms-comm-postReplyContainer", "Teste Click", "AprovarParaExecucao();")
    CreateHyperLinkWithClickAction: function (className, hyperLinkText, onClickFunction) {
        var ctrl = document.createElement("input");
        ctrl.type = "button";
        ctrl.value = hyperLinkText;
        ctrl.setAttribute("onClick", "javascript: " + onClickFunction);

        var element = document.getElementsByClassName(className)[0];
        element.insertBefore(ctrl, element.firstChild);
    },
    ObterValorQueryString: function (nomeParametro, urlCompleta) {
        var urlParams = new URLSearchParams(urlCompleta);
        var myParam = urlParams.get(nomeParametro);
        return myParam;
    },
    GetCurrentItemID: async function () {
        return WPQ1ListData.FolderId;       
    },
    GetCurrentItem: async function () {
        var idItemAtual = await Flat.GetCurrentItemID();
        var currentItem = await ChamadosRepository.GetById(idItemAtual);
        return currentItem;
    },
    UploadAttachments: async function (ticketID) {
        let fupAnexos = document.getElementById("fupAnexos");
        if (fupAnexos.files.length > 0) {
            for (let index = 0; index < fupAnexos.files.length; index++) {
                const file = fupAnexos.files[index];
                let response = await ChamadosRepository.AddAttachment(ticketID, file.name, file);
            }
        }
        fupAnexos.file = null;
        Flat.SetFileUploadText("Selecione...");
    },
    SetFileUploadText: async function (text) {
        let spanSelectedFile = document.getElementById("spanSelectedFile");
        spanSelectedFile.innerHTML = text;
    },
    InviavelTecnicamente: async function (solicitante) {
        await Framework.Loading(true);
        if (confirm("Deseja confirmar o chamado como Inviável Tecnicamente?")) {
            const idItem = await Flat.GetCurrentItem();
            var responsavel = ''
            var isCoordenador = false;

            if(solicitante == 'CO'){
                responsavel = Constants.Responsibles.CasaOracao;
            } else {
                responsavel = Constants.Responsibles.CoordenadorCO;
                isCoordenador = true;
            }
            await ChamadosRepository.UpdateResponsaveis(idItem.Id, Constants.Status.InviavelTecnicamente, responsavel, "Inviabilidade Técnica apontada Por: " + _spPageContextInfo.userEmail);

            EmailUtils.SendMailNotification_InviavelTecnicamento(idItem.Id, isCoordenador);
            alert("Chamado atualizado com sucesso!");
            Flat.GoToHomePage();
        }
        await Framework.Loading(false);
    },
    InviavelTecnicamenteForwardToCasaOracao: async function () {
        await Framework.Loading(true);
        if (confirm("Deseja encaminhar chamado Inviável Tecnicamente para Casa de Oração?")) {
            const idItem = await Flat.GetCurrentItem();
            await ChamadosRepository.UpdateResponsaveis(idItem.Id, Constants.Status.InviavelTecnicamente, Constants.Responsibles.CasaOracao, "Inviabilidade Técnica apontada Por: " + _spPageContextInfo.userEmail);
            EmailUtils.SendMailNotification_EnvioChamadoCO(idItem.Id)
            alert("Chamado atualizado com sucesso!");
            Flat.GoToHomePage();
        }
        await Framework.Loading(false);
    },
    ServiceExecuted: async function () {
        await Framework.Loading(true);
        if (confirm("Deseja confirmar a execução do Serviço?")) {
            const idItem = await Flat.GetCurrentItemID();
            await ChamadosRepository.UpdateResponsaveis(idItem, Constants.Status.AguardandoValidacaoCoordenador, Constants.Responsibles.CoordenadorCO, "Serviço Concluído Por: " + _spPageContextInfo.userEmail);
            EmailUtils.SendMailNotification_ServicoExecutado_Coordenadores(idItem);
            alert("Serviço executado com sucesso!");
            Flat.GoToHomePage();
        }
        await Framework.Loading(false);
    },
    CheckIfUserBelongsToGroup: async function (groupName) {
        let currentUserGroups = await Permissions.GetAllUserGroups();
        let userBelongsToGroup = false;
        for (let i = 0; i < currentUserGroups.length; i++) {
             if (currentUserGroups[i].Title == groupName) {
                userBelongsToGroup = true;
            }
        }

        console.log("userBelongsToGroup ==> " +  userBelongsToGroup)
        return userBelongsToGroup;
    },
   CheckUserPermissionType: async function(currentTicketItem) {
       debugger;
       
        if(currentTicketItem.Status == Constants.Status.InviavelTecnicamente){
            Flat.SetBotaoForStepEnviavelTecnicamente();
            return;
        } else if (await Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Administrators)){
            Flat.SetBotaoForStepGestao(currentTicketItem);
        } else if (await Permissions.CheckIfUserBelongsToGroup(Constants.Groups.CoordenadoresCO) && currentTicketItem.Categoria != "Informática"){
            Flat.SetBotaoForStepCordenator(currentTicketItem);
        } else if (await Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Civil) && currentTicketItem.Categoria != "Informática"){
            Flat.SetBotaoForStepEnviarCivil(currentTicketItem);
        } else if (await Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Eletrica) && currentTicketItem.Categoria != "Informática"){
            Flat.SetBotaoForStepEnviarGestao();
        }else if (await Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Seguranca) && currentTicketItem.Categoria != "Informática"){
            Flat.SetBotaoForStepEnviarSeguranca();
        }else if (await Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Compras) && currentTicketItem.Categoria != "Informática"){
            Flat.SetBotaoForStepEnviarCompras();
        }else if (await Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Informatica)){
            Flat.SetBotaoForStepEnviarInformatica();
        }else if (await Permissions.CheckIfUserBelongsToGroup(Constants.Groups.Mecanica)){
            Flat.SetBotaoForStepEnviarMecanica() 
        }else {
            Flat.SetBotaoForCO(currentTicketItem);
        }
    },
    SetForCO: async function (currentTicketItem) {
        if (currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.CasaOracao) {
            PageUtils.SetVisibilityByID("tdConcluirChamado", false);
            PageUtils.SetVisibilityByID("tdEnviarCivil", false);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
            PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
            PageUtils.SetVisibilityByID("tdServicoExecutado", true);
            PageUtils.SetVisibilityByID("tdEnviarCompras", false);
            PageUtils.SetVisibilityByID("tdEnviarInformatica", false);
            PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
            PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
            PageUtils.SetVisibilityByID("tdEnviarMecanica", false);
        }
    },
    SetBotaoForStepEnviavelTecnicamente: async function(){
        PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
        PageUtils.SetVisibilityByID("enviavelTecnicamenteCO", false);
        PageUtils.SetVisibilityByID("enviavelTecnicamenteCoordenacao", false);
        PageUtils.SetVisibilityByID("tdEnviarGestao", false);
        PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", false);
        PageUtils.SetVisibilityByID("tdEnviarCivil", false);
        PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
        PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
        PageUtils.SetVisibilityByID("tdServicoExecutado", false);
        PageUtils.SetVisibilityByID("tdEnviarCompras", false);
        PageUtils.SetVisibilityByID("tdConcluirChamado", false);
        PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", false);
        PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
        PageUtils.SetVisibilityByID("tdEnviarInformatica", false);
        PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
        PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", false);
        PageUtils.SetVisibilityByID("tdEnviarMecanica", false);
        PageUtils.SetVisibilityByID("tdEnviarCO", false);
    },
    SetBotaoForStepGestao: async function(currentTicketItem){
        PageUtils.SetVisibilityByID("showBotoesLinha", false);
        PageUtils.SetVisibilityByID("showBotoesBloco1", true);
        PageUtils.SetVisibilityByID("showBotoesBloco2", true);
        PageUtils.SetVisibilityByID("showBotoesBloco3", true);
        PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", false);
        PageUtils.SetVisibilityByID("tdEnviarGestao", false)
        PageUtils.SetVisibilityByID("tdConcluirChamado", false);
        PageUtils.SetVisibilityByID("tdEnviarCivil", false);
        PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
        PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
        PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
        PageUtils.SetVisibilityByID("tdServicoExecutado", false);
        PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", false);
        PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
        PageUtils.SetVisibilityByID("tdEnviarCompras", false);
        PageUtils.SetVisibilityByID("tdEnviarInformatica", false);
        PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
        PageUtils.SetVisibilityByID("tdEnviarCO", false);
        PageUtils.SetVisibilityByID("tdEnviarMecanica", false);
        PageUtils.SetVisibilityByID("enviavelTecnicamenteCoordenacao", false);
        PageUtils.SetVisibilityByID("enviavelTecnicamenteCO", true);

        if(currentTicketItem.Categoria == "Informática"){
            PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);   
        }

        if(currentTicketItem.Status != Constants.Status.EncaminhadoParaGestao && 
            currentTicketItem.Status != Constants.Status.AguardandoValidacaoCoordenador){ 
            PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
        }else{
            PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
        }

        
        
        if(currentTicketItem.Status != Constants.Status.InviavelTecnicamente){
            PageUtils.SetVisibilityByID("tdServicoExecutado", true);
        }if(currentTicketItem.Status != Constants.Status.EncaminhadoParaGestao){
            PageUtils.SetVisibilityByID("tdEnviarGestao", false);
        }else if(currentTicketItem.Status == Constants.Status.InviavelTecnicamente){
            PageUtils.SetVisibilityByID("tdEnviarCO", true);
        }
    },
    SetBotaoForStepCordenator: async function(currentTicketItem){
        
        if(currentTicketItem.Status != Constants.Status.Concluido && 
            currentTicketItem.Status != Constants.Status.AprovadoParaExecucaoCO && 
            currentTicketItem.Status != Constants.Status.InviavelTecnicamente) 
        {
            //currentTicketItem.Status != Constants.Status.EncaminhadoParaEngenhariaEmergencia

            PageUtils.SetVisibilityByID("tdConcluirChamado", true);
            PageUtils.SetVisibilityByID("tdEnviarCO", true);
            PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", true);
            PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
            PageUtils.SetVisibilityByID("tdInviavelTecnicamenteCO", false);
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", true);
            PageUtils.SetVisibilityByID("tdEnviarGestao", true);
            PageUtils.SetVisibilityByID("tdEnviarCivil", true);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", true);
            PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
            PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", true);
            PageUtils.SetVisibilityByID("tdEnviarCompras", false);
            PageUtils.SetVisibilityByID("tdEnviarInformatica", false);
            PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
            PageUtils.SetVisibilityByID("tdEnviarMecanica", true);
            PageUtils.SetVisibilityByID("enviavelTecnicamenteCO", true);
            PageUtils.SetVisibilityByID("enviavelTecnicamenteCoordenacao", false);
            
        }
        
        if(currentTicketItem.Status == Constants.Status.InviavelTecnicamente && currentTicketItem.Respons_x00e1_vel_x0020_Atual == Constants.Responsibles.CoordenadorCO) 
        {
            PageUtils.SetVisibilityByID("tdInviavelTecnicamenteCO", true);
            PageUtils.SetVisibilityByID("tdEnviarSeguranca", true);
            PageUtils.SetVisibilityByID("tdEnviarGestao", true);
            PageUtils.SetVisibilityByID("tdEnviarCivil", true);
            PageUtils.SetVisibilityByID("tdEnviarMecanica", true);
            PageUtils.SetVisibilityByID("tdEnviarEletrica", true);
        }

        if(currentTicketItem.Status == Constants.Status.EncaminhadoParaEngenhariaEmergencia && currentTicketItem.Respons_x00e1_vel_x0020_Atual != Constants.Responsibles.EletricaEmergencia) {
            PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", true);
            PageUtils.SetVisibilityByID("tdEnviarGestao", true);
        }
    },
    SetBotaoForStepEnviarGestao: async function(){
        PageUtils.SetVisibilityByID("tdEnviarGestao", false);
    },
     SetBotaoForStepEnviarSeguranca: async function(){
        PageUtils.SetVisibilityByID("tdEnviarGestao", true);
        PageUtils.SetVisibilityByID("tdEnviarCoordenacao", true);
        PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
         PageUtils.SetVisibilityByID("enviavelTecnicamenteCO", false);
        PageUtils.SetVisibilityByID("enviavelTecnicamenteCoordenacao", true);
    },
    SetBotaoForStepEnviarCivil: async function(){
        PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
        PageUtils.SetVisibilityByID("tdEnviarGestao", true);
        PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", false);
        PageUtils.SetVisibilityByID("tdEnviarCivil", false);
        PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
        PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
        PageUtils.SetVisibilityByID("tdServicoExecutado", false);
        PageUtils.SetVisibilityByID("tdEnviarCompras", false);
        PageUtils.SetVisibilityByID("tdConcluirChamado", false);
        PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", false);
        PageUtils.SetVisibilityByID("tdEnviarCoordenacao", true);
        PageUtils.SetVisibilityByID("tdEnviarInformatica", false);
        PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
        PageUtils.SetVisibilityByID("tdEnviarMecanica", true);
        PageUtils.SetVisibilityByID("enviavelTecnicamenteCO", false);
        PageUtils.SetVisibilityByID("enviavelTecnicamenteCoordenacao", true);
    },
    SetBotaoForStepEnviarCompras: async function(){
        PageUtils.SetVisibilityByID("tdEnviarGestao", true);
        PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
        PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
        PageUtils.SetVisibilityByID("tdEnviarInformatica", true);
        PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", false);
        PageUtils.SetVisibilityByID("tdEnviarCivil", false);
        PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
        PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
        PageUtils.SetVisibilityByID("tdServicoExecutado", false);
        PageUtils.SetVisibilityByID("tdEnviarGestao", false);
        PageUtils.SetVisibilityByID("tdEnviarCompras", false);
        PageUtils.SetVisibilityByID("tdConcluirChamado", false);
        PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", false);
        PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
        PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
        PageUtils.SetVisibilityByID("tdEnviarMecanica", false);
    },
    SetBotaoForStepEnviarInformatica: async function(){
        PageUtils.SetVisibilityByID("tdEnviarGestao", false);
        PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", false);
        PageUtils.SetVisibilityByID("tdEnviarCivil", false);
        PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
        PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
        PageUtils.SetVisibilityByID("tdServicoExecutado", false);
        PageUtils.SetVisibilityByID("tdEnviarGestao", false);
        PageUtils.SetVisibilityByID("tdEnviarCompras", true);
        PageUtils.SetVisibilityByID("tdEnviarCO", true);
        PageUtils.SetVisibilityByID("tdConcluirChamado", false);
        PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", false);
        PageUtils.SetVisibilityByID("tdEnviarCoordenacao", false);
        PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", true);
        PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
        PageUtils.SetVisibilityByID("tdInviavelTecnicamenteCO", false);
        PageUtils.SetVisibilityByID("tdEnviarMecanica", false);
        
    },
    SetBotaoForStepEnviarMecanica: async function(){
        PageUtils.SetVisibilityByID("tdInviavelTecnicamente", true);
        PageUtils.SetVisibilityByID("tdInviavelTecnicamenteCO", false);
        PageUtils.SetVisibilityByID("tdEnviarGestao", true);
        PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", false);
        PageUtils.SetVisibilityByID("tdEnviarCivil", false);
        PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
        PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
        PageUtils.SetVisibilityByID("tdServicoExecutado", false);
        PageUtils.SetVisibilityByID("tdEnviarCompras", false);
        PageUtils.SetVisibilityByID("tdConcluirChamado", false);
        PageUtils.SetVisibilityByID("tdEnviarEletricaEmergencia", false);
        PageUtils.SetVisibilityByID("tdEnviarCoordenacao", true);
        PageUtils.SetVisibilityByID("tdEnviarInformatica", false);
        PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
        PageUtils.SetVisibilityByID("tdEnviarMecanica", false);
    },
    SetBotaoForCO: async function(currentTicketItem){
        PageUtils.SetVisibilityByID("tdAprovarExecucaoCO", false);
        PageUtils.SetVisibilityByID("tdEnviarCivil", false);
        PageUtils.SetVisibilityByID("tdEnviarEletrica", false);
        PageUtils.SetVisibilityByID("tdEnviarSeguranca", false);
        PageUtils.SetVisibilityByID("tdServicoExecutado", false);
        PageUtils.SetVisibilityByID("tdEnviarGestao", false);
        PageUtils.SetVisibilityByID("tdEnviarCompras", false);
        PageUtils.SetVisibilityByID("tdEnviarInformatica", false);
        PageUtils.SetVisibilityByID("tdEnviarPorInformaticaParaCO", false);
        PageUtils.SetVisibilityByID("tdInviavelTecnicamente", false);
        PageUtils.SetVisibilityByID("tdInviavelTecnicamenteCO", false);

        if (currentTicketItem.Status == Constants.Status.AprovadoParaExecucaoCO)        {
             PageUtils.SetVisibilityByID("tdConcluirChamado", true);
        }

        if (currentTicketItem.Status == Constants.Status.EncaminhadoPorInformaticaValidacaoCasaOracao)        {
             PageUtils.SetVisibilityByID("tdEnviarInformatica", true);
        }
    },
    UpdateStatusChamadoInformatica: async function(ticketId) {
        await ChamadosRepository.UpdateResponsaveis(ticketId , Constants.Status.EncaminhadoParaInformatica, Constants.Responsibles.Informatica, "Enviado para Informática Por: CO");
        
    }
}



Flat.SetupPage();