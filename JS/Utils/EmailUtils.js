var EmailUtils = {
    SendMailNotification: async function (chamado, areaName, to, oldResponsible) {
        const mailBody = 'Caro usuário, <br/>' +
            'Um novo chamado de Suporte Operacional foi encaminhado para a área de ' + areaName +
            '<br/> <br/>' +
            '<b>ID:</b> ' + chamado.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + chamado.CasaOracao.Title + '<br/>' +
            '<b>Criado Por:</b> ' + chamado.Author.EMail + '<br/>' +
            '<b>Enviado Por:</b> ' + oldResponsible + '<br/>' +
            '<b>Assunto:</b> ' + chamado.Title + '<br/><br/>' +
            '<a href="' + chamado.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';


        //const subject = 'CCB - Leônidas Moreira - Chamado Operacional - ' + areaName + ' - ' + chamado.Id;
        const subject = 'Chamado: ' + chamado.Id + ' - Área Técnica Responsável: ' + areaName; + ' - Casa de Oração: ' + chamado.CasaOracao.Title
        EmailUtils.SendEmail(to, mailBody, subject);
    },
    SendMailNotification_NovoChamadoSolicitante: async function (idChamado) {
        debugger;
        let chamado = await ChamadosRepository.GetById(idChamado);
        const authorEmail = _spPageContextInfo.userEmail;
        const mailBody = 'Caro usuário, <br/>' +
            'O seu chamado foi criado com sucesso!' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + chamado.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + (chamado.CasaOracao != undefined ? chamado.CasaOracao.Title : '') + '<br/>' +
            '<b>Criado Por:</b> ' + authorEmail + '<br/>' +
            '<b>Assunto:</b> ' + chamado.Title + '<br/><br/>' +
            '<a href="' + chamado.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';

        //const subject = 'CCB - Leônidas Moreira - Chamado Operacional - ' + chamado.Id;
        const subject = 'Chamado: ' + chamado.Id;
        EmailUtils.SendEmail(authorEmail, mailBody, subject);
    },
    SendMailNotification_EnvioChamadoCO: async function (ticketID) {
        debugger
        let ticketItem = await ChamadosRepository.GetById(ticketID)
        let ticketCO = await CasasOracaoRepository.GetItemByID(ticketItem.CasaOracao.Id);
        let groupCO = await GruposCORepository.GetCoordinatorEmailByCOGroupName(ticketCO.Grupo.Title);
        if (groupCO) {
            const mailBody = EmailUtils.GetEmailBodyForCO(ticketItem, ticketCO);
            const subject = 'Chamado: ' + ticketItem.Id;
            EmailUtils.SendEmail(ticketItem.Author.Title, mailBody, subject);
        }
    },
    SendMailNotification_Coordenador: async function (ticketID) {
        let ticketItem = await ChamadosRepository.GetById(ticketID)
        let ticketCO = await CasasOracaoRepository.GetItemByID(ticketItem.CasaOracao.Id);
        let groupCO = await GruposCORepository.GetCoordinatorEmailByCOGroupName(ticketCO.Grupo.Title);
        if (groupCO) {
            const mailBody = EmailUtils.GetEmailBodyForCoordinator(ticketItem, ticketCO);
            const subject = EmailUtils.CriaTituloGenericoEmail(ticketItem);
            EmailUtils.SendEmail(groupCO.EmailCoordenador, mailBody, subject);
        }
    },
    SendMailNotification_Informatica: async function (ticketID) {
        console.log("Enviando email para informática");
       let ticketItem = await ChamadosRepository.GetById(ticketID)
        let ticketCO = await CasasOracaoRepository.GetItemByID(ticketItem.CasaOracao.Id);
        let groupCO = await GruposCORepository.GetCoordinatorEmailByCOGroupName(ticketCO.Grupo.Title);
        if (groupCO) {
            const mailBody = EmailUtils.GetEmailBodyForInformatica(ticketItem, ticketCO);
            const subject = EmailUtils.CriaTituloGenericoEmail(ticketItem);
            debugger;
            EmailUtils.SendEmailTI(mailBody, subject);
        }
    },
    SendMailNotification_Coordenador_FinishedTicket: async function (ticketID) {
        let ticketItem = await ChamadosRepository.GetById(ticketID)
        let ticketCO = await CasasOracaoRepository.GetItemByID(ticketItem.CasaOracao.Id);
        let groupCO = await GruposCORepository.GetCoordinatorEmailByCOGroupName(ticketCO.Grupo.Title);
        if (groupCO) {
            const mailBody = EmailUtils.GetEmailBodyFinihedTicket(ticketItem, ticketCO);
            const subject = EmailUtils.CriaTituloGenericoEmail(ticketItem);
            EmailUtils.SendEmail(groupCO.EmailCoordenador, mailBody, subject);
        }
    },
    SendMailNotification_CO_FinishedTicket: async function (ticketID) {
        let ticketItem = await ChamadosRepository.GetById(ticketID)
        let ticketCO = await CasasOracaoRepository.GetItemByID(ticketItem.CasaOracao.Id);
        const mailBody = EmailUtils.GetEmailBodyFinihedTicket(ticketItem, ticketCO);
        const subject = 'Chamado: ' + ticketItem.Id;
        EmailUtils.SendEmail(ticketItem.Author.Title, mailBody, subject);
    },
    SendMailNotification_InviavelTecnicamento: async function (ticketID, isCoordenador) {
        let ticketItem = await ChamadosRepository.GetById(ticketID);

        const subject = EmailUtils.CriaTituloGenericoEmail(ticketItem);
        
        let ticketCO = await CasasOracaoRepository.GetItemByID(ticketItem.CasaOracao.Id);
        const mailBody = EmailUtils.GetEmailBodyInviavelTecnicamento(ticketItem, ticketCO);
        
        if (isCoordenador) {
            let groupCO = await GruposCORepository.GetCoordinatorEmailByCOGroupName(ticketCO.Grupo.Title);
            if (groupCO) {
                EmailUtils.SendEmail(groupCO.EmailCoordenador, mailBody, subject);
            }
        } else {
            EmailUtils.SendEmail(ticketItem.Author.Title, mailBody, subject);
        }
    },
    SendMailNotification_ServicoExecutado_Coordenadores: async function (ticketID) {
        let ticket = await ChamadosRepository.GetById(ticketID);
        const authorEmail = _spPageContextInfo.userEmail;
        const mailBody = 'Caros Coordenadores, <br/>' +
            'O chamado abaixo foi atualizado para "Serviço Executado".' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + ticket.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + (ticket.CasaOracao != undefined ? ticket.CasaOracao.Title : '') + '<br/>' +
            '<b>Criado Por:</b> ' + authorEmail + '<br/>' +
            '<b>Assunto:</b> ' + ticket.Title + '<br/><br/>' +
            '<a href="' + ticket.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';

        const subject = EmailUtils.CriaTituloGenericoEmail(ticket);
        EmailUtils.SendEmail(authorEmail, mailBody, subject);
    },
    SendMailNotification_Compras: async function (ticketID) {
        let ticketItem = await ChamadosRepository.GetById(ticketID)
        let ticketCO = await CasasOracaoRepository.GetItemByID(ticketItem.CasaOracao.Id);
        let groupCO = await GruposCORepository.GetCoordinatorEmailByCOGroupName(ticketCO.Grupo.Title);
        if (groupCO) {
            const mailBody = EmailUtils.GetEmailBodyForCompras(ticketItem, ticketCO);
            const subject = EmailUtils.CriaTituloGenericoEmail(ticketItem);
            EmailUtils.SendEmail(Constants.EmailCompras, mailBody, subject);
        }
    },
    SendMailNotification_Gestao: async function (ticketID) {
        let ticketItem = await ChamadosRepository.GetById(ticketID)
        let ticketCO = await CasasOracaoRepository.GetItemByID(ticketItem.CasaOracao.Id);
        const mailBody = EmailUtils.GetEmailBodyForGestao(ticketItem, ticketCO);
        const subject = EmailUtils.CriaTituloGenericoEmail(ticketItem);
        EmailUtils.SendEmail(Constants.Rodrigo, mailBody, subject);
        
    },
    GetEmailBodyForCoordinator: function (ticket, ticketCO) {
        return 'Caro usuário, <br/>' +
            'O seu chamado foi criado com sucesso!' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + ticket.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + ticketCO.Title + '<br/>' +
            '<b>Grupo:</b> ' + ticketCO.Grupo.Title + '<br/>' +
            '<b>Criado Por:</b> ' + ticket.Author.EMail + '<br/>' +
            '<b>Assunto:</b> ' + ticket.Title + '<br/><br/>' +
            '<a href="' + ticket.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';
    },
    GetEmailBodyForGestao: function (ticket, ticketCO) {
        return 'Caro gestor, <br/>' +
            'Chamado em andamento".' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + ticket.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + ticketCO.Title + '<br/>' +
            '<b>Grupo:</b> ' + ticketCO.Grupo.Title + '<br/>' +
            '<b>Criado Por:</b> ' + ticket.Author.EMail + '<br/>' +
            '<b>Assunto:</b> ' + ticket.Title + '<br/><br/>' +
            '<a href="' + ticket.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';
    },
    GetEmailBodyForCompras: function (ticket, ticketCO) {
        return 'Caro usuário, <br/>' +
            'O chamado abaixo foi encaminhado para orçamento de material".' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + ticket.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + ticketCO.Title + '<br/>' +
            '<b>Grupo:</b> ' + ticketCO.Grupo.Title + '<br/>' +
            '<b>Criado Por:</b> ' + ticket.Author.EMail + '<br/>' +
            '<b>Assunto:</b> ' + ticket.Title + '<br/><br/>' +
            '<a href="' + ticket.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';
    },
    GetEmailBodyForInformatica: function (ticket, ticketCO) {
        debugger;
        return 'Caro usuário, <br/>' +
            'O chamado abaixo foi encaminhado para análise da T.I".' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + ticket.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + ticketCO.Title + '<br/>' +
            '<b>Grupo:</b> ' + ticketCO.Grupo.Title + '<br/>' +
            '<b>Criado Por:</b> ' + ticket.Author.EMail + '<br/>' +
            '<b>Assunto:</b> ' + ticket.Title + '<br/><br/>' +
            '<a href="' + ticket.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';
    },
    GetEmailBodyFinihedTicket: function (ticket, ticketCO) {
        return 'Caro usuário, <br/>' +
            'O chamado foi finalizado pela CO com sucesso!' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + ticket.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + ticketCO.Title + '<br/>' +
            '<b>Grupo:</b> ' + ticketCO.Grupo.Title + '<br/>' +
            '<b>Criado Por:</b> ' + ticket.Author.EMail + '<br/>' +
            '<b>Assunto:</b> ' + ticket.Title + '<br/><br/>' +
            '<a href="' + ticket.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';
    },
    GetEmailBodyForCO: function (ticket, ticketCO) {
        return 'Caro usuário, <br/>' +
            'O seu chamado foi respondido' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + ticket.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + ticketCO.Title + '<br/>' +
            '<b>Grupo:</b> ' + ticketCO.Grupo.Title + '<br/>' +
            '<b>Criado Por:</b> ' + ticket.Author.EMail + '<br/>' +
            '<b>Assunto:</b> ' + ticket.Title + '<br/><br/>' +
            '<a href="' + ticket.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';
    },
     GetEmailBodyInviavelTecnicamento: function (ticket, ticketCO) {
        return 'Caro usuário, <br/>' +
            'O chamado foi respondido' +
            '<br/> <br/>' +
            '<b>ID:</b> ' + ticket.Id + '<br/>' +
            '<b>Casa de Oração:</b> ' + ticketCO.Title + '<br/>' +
            '<b>Grupo:</b> ' + ticketCO.Grupo.Title + '<br/>' +
            '<b>Criado Por:</b> ' + ticket.Author.EMail + '<br/>' +
            '<b>Assunto:</b> ' + ticket.Title + '<br/><br/>' +
            '<a href="' + ticket.EncodedAbsUrl + '">Clique aqui para visualizar o Chamado</a>';
    },
    SendEmail: function (to, body, subject) {
        debugger;
        console.log("Enviando email para: " + to);
        var callPath = _spPageContextInfo.webServerRelativeUrl + "/_api/SP.Utilities.Utility.SendEmail";
        $.ajax({
            contentType: 'application/json',
            url: callPath,
            type: "POST",
            data: JSON.stringify({
                'properties': {
                    '__metadata': {
                        'type': 'SP.Utilities.EmailProperties'
                    },
                    'From': Constants.FromEmail,
                    'To': {
                        'results': [to, Constants.EmailsGestao.Rodrigo, Constants.EmailsGestao.Eneas]
                    },
                    'Body': body,
                    'Subject': subject
                }
            }),
            headers: {
                "Accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                console.log('Email Sent Successfully');
            },
            error: function (err) {
                console.log('Error in sending Email: ' + JSON.stringify(err));
            }
        });
    },
    SendEmailTI: function (body, subject) {
        debugger;
        console.log("Enviando email para TI: ");
        var callPath = _spPageContextInfo.webServerRelativeUrl + "/_api/SP.Utilities.Utility.SendEmail";
        $.ajax({
            contentType: 'application/json',
            url: callPath,
            type: "POST",
            data: JSON.stringify({
                'properties': {
                    '__metadata': {
                        'type': 'SP.Utilities.EmailProperties'
                    },
                    'From': Constants.FromEmail,
                    'To': {
                        'results': [Constants.EmailInformatica.Junior, Constants.EmailInformatica.Cido, Constants.EmailInformatica.Miguel, Constants.EmailInformatica.Jonathan, Constants.EmailInformatica.Fabricio]
                    },
                    'Body': body,
                    'Subject': subject
                }
            }),
            headers: {
                "Accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                console.log('Email Sent Successfully');
            },
            error: function (err) {
                console.log('Error in sending Email: ' + JSON.stringify(err));
            }
        });
    },
    CriaTituloGenericoEmail: function (ticketItem) {
        return 'Chamado: ' + ticketItem.Id + ' - Casa de Oração: ' + ticketItem.CasaOracao.Title
    }
}
