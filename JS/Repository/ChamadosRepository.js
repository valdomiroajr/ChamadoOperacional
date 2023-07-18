//AttachmentFiles,Title&$expand=AttachmentFiles
var ChamadosRepository = {
    GetById: async function (id) {
        const callPath = "https://congregacao.sharepoint.com/sites/adm.sp.setorleonidasmoreira/Chamados_Operacional/_api/web/lists/GetByTitle('Chamados')/items?$select=EncodedAbsUrl,AttachmentFiles,Respons_x00e1_vel_x0020_Atual,Title,Id,Categoria,Status,Nome,CasaOracao/Title,CasaOracao/Id,Author/Title,Author/EMail&$expand=CasaOracao,Author,AttachmentFiles&$filter=ContentType eq 'Discussão' and Id eq " + id;
        let response = await fetch(callPath, OptionsGet);
        let data = await response.json();
        if (data.d.results) {
            return data.d.results[0];
        } else
            return null;
    },
    GetAllByCurrentUser: async function () {
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.Chamados + "')/items?$filter=ContentType eq 'Discussão' and AuthorId eq " + _spPageContextInfo.userId + "&$select=Title,Id,Status,Categoria/Title,CasaOracao/Title,Created,Author/Title,EncodedAbsUrl&$expand=CasaOracao,Author&$orderby=Id desc";
        let listDataCollection;
        let response = await fetch(callPath, OptionsGet)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            }).then(function (data) {
                // This is the JSON from our response
                listDataCollection = data.d.results;
            })
        return listDataCollection;
    },
    GetAllByFilters: async function (restfilter) {
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.Chamados + "')/items?$select=Title,Id,Status,CasaOracao/Title,Created,Author/Title,EncodedAbsUrl,Respons_x00e1_vel_x0020_Atual&$expand=CasaOracao,Author&$orderby=Id desc&$filter=ContentType eq 'Discussão' " + restfilter;
        let listDataCollection;
        let response = await fetch(callPath, OptionsGet)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            }).then(function (data) {
                // This is the JSON from our response
                listDataCollection = data.d.results;
                console.log(data.d.results);
            })
        return listDataCollection;
    },
    CreateNewChamado: async function (title, nome, email, description, casaOracao, category) {
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.Chamados + "')/items";

        let metadata = {
            Title: title,
            Nome: nome,
            E_x002d_mail: email,
            Body: description,
            CasaOracaoId: casaOracao,
            Categoria: category,
            Solicitante: nome,
            __metadata: {
                type: 'SP.Data.ChamadosListItem'
            }
        }

        let postHeaders = new Headers({
            'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
            'Accept': 'application/json; odata=verbose',
            'Content-Type': 'application/json; odata=verbose'
        });

        let postOptions = {
            method: 'POST',
            headers: postHeaders,
            credentials: 'include',
            body: JSON.stringify(metadata)
        }

        let response = await fetch(callPath, postOptions);
        let data = await response.json();
        console.log(data.d);
        return data.d;
    },
    UpdateResponsaveis: async function (idChamado, status, responsavelAtual, detalhes) {
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.Chamados + "')/items/GetById(" + idChamado + ")";
        let metadata = {
            Status: status,
            Respons_x00e1_vel_x0020_Atual: responsavelAtual,
            Detalhes: detalhes,
            __metadata: {
                type: 'SP.Data.ChamadosListItem'
            }
        }

        let postHeaders = new Headers({
            'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
            'Accept': 'application/json; odata=verbose',
            'Content-Type': 'application/json; odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'

        });

        // POST request options
        let postOptions = {
            method: 'POST',
            headers: postHeaders,
            credentials: 'include',
            body: JSON.stringify(metadata)
        }

        let response = await fetch(callPath, postOptions)
            .catch(function (err) {
                console.warn('Error on ChamadosRepository.UpdateResponsaveis', err);
            });
        if (response.ok) {
            return true;
        } else {
            alert('Erro ao atualizar responsável.');
            return false;
        }
    },
    UpdateStatusDetalhes: async function (idChamado, status, detalhes) {
        const callPath = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Constants.Lists.Chamados + "')/items/GetById(" + idChamado + ")";
        let metadata = {
            Status: status,
            Detalhes: detalhes,
            __metadata: {
                type: 'SP.Data.ChamadosListItem'
            }
        }

        let postHeaders = new Headers({
            'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
            'Accept': 'application/json; odata=verbose',
            'Content-Type': 'application/json; odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'

        });

        // POST request options
        let postOptions = {
            method: 'POST',
            headers: postHeaders,
            credentials: 'include',
            body: JSON.stringify(metadata)
        }

        let response = await fetch(callPath, postOptions)
            .catch(function (err) {
                console.warn('Error on ChamadosRepository.UpdateResponsaveis', err);
            });
        if (response.ok) {
            return true;
        } else {
            alert('Erro ao atualizar responsável.');
            return false;
        }
    },
    GetAttachmentsByTicketId: async function (id) {
        let callPath = Constants.URLSite + "/_api/lists/GetByTitle('" + Constants.Lists.Chamados + "')/items(" + id + ")?$select=AttachmentFiles,Title&$expand=AttachmentFiles"
        let attachments;
        let response = await fetch(callPath, OptionsGet)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            }).then(function (data) {
                attachments = data.d.AttachmentFiles.results;

            }).catch(function (err) {
                console.warn('Error on ChamadosRepository.GetAttachmentsById', err);
            });

        return attachments;
    },
    AddAttachment: async function (itemID, fileName, file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            ChamadosRepository.UploadDocument(e.target.result, fileName, itemID);
        }
        reader.onerror = function (e) {
            alert(e.target.error);
        }
        reader.readAsArrayBuffer(file);

    },
    UploadDocument: async function (buffer, fileName, itemID) {
        const callPath = Constants.URLSite + "/_api/web/lists/GetByTitle('" + Constants.Lists.Chamados + "')/items(" + itemID + ")/AttachmentFiles/add(FileName='" + fileName + "')";

        let postHeaders = new Headers({
            'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
            'Accept': 'application/json; odata=verbose',
            'Content-Type': 'application/json; odata=verbose',
            'Content-Length': buffer.byteLength
        });

        // POST request options
        let postOptions = {
            method: 'POST',
            headers: postHeaders,
            body: buffer,
            processData: false,
            credentials: 'include'
        }

        let response = await fetch(callPath, postOptions);
        return response.json();
    }
}