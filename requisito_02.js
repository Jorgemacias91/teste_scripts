/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Jorge Macìas
 * @name REQUISITO_02 Criação de Tela (formulário) com lógica ao Submeter
 */

define(["N/search", "N/ui/serverWidget"], function (search, serverWidget) {
  /**
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request
   * @param {ServerRequest} scriptContext.response
   */
  function onRequest(scriptContext) {
    var cont = null;
    switch (scriptContext.request.method) {
      case "GET":
        var values = searchRecord();
        cont = formGet(values);
        break;
      case "POST":
        var values = getSublist(scriptContext.request);
        cont = formPost(values);
        break;
    }
    scriptContext.response.writePage(cont);
  }

  function searchRecord() {
    var approvalSearch = search.create({
      type: "customrecord_tst_aprovacao",
      filters: ["custrecord_apr_status", "anyof", "1"],
      columns: [
        "custrecord_apr_status",
        "custrecord_apr_desc",
        "custrecord_id_interno",
      ],
    });
    var status;
    var description;
    var idRecord;
    var results = [];
    var approvalPagedData = approvalSearch.runPaged({ pageSize: 100 });
    approvalPagedData.pageRanges.forEach((pageRange) => {
      var currentPage = approvalPagedData.fetch({ index: pageRange.index });
      currentPage.data.forEach((result) => {
        idRecord = result.getValue("custrecord_id_interno");
        status = result.getText("custrecord_apr_status");
        description = result.getValue("custrecord_apr_desc");
        results.push({
          idRecord,
          status,
          description,
        });
      });
    });
    log.debug("results array", results);
    return results;
  }

  function forms() {
    var form = serverWidget.createForm({
      title: "Approval of Records",
      hideNavBar: false,
    });

    var sublist = form.addSublist({
      id: "custpage_list",
      type: serverWidget.SublistType.LIST,
      label: "Records",
    });
    sublist.addMarkAllButtons();

    sublist.addField({
      id: "custpage_col_internalid",
      label: "ID Record",
      type: serverWidget.FieldType.TEXT,
    });

    sublist.addField({
      id: "custpage_col_status",
      label: "Status",
      type: serverWidget.FieldType.TEXT,
    });

    sublist.addField({
      id: "custpage_col_description",
      label: "Description",
      type: serverWidget.FieldType.TEXT,
    });

    sublist.addField({
      id: "custpage_col_process",
      label: "Process",
      type: serverWidget.FieldType.CHECKBOX,
    });
    return {
        form,
        sublist
    };
  }

  function formGet(value) {
    var formObj = forms();
    var form = formObj.form;
    var sublist = formObj.sublist;
    for (var i = 0; i < value.length; i++) {
      log.debug("id", value[i].idRecord);
      sublist.setSublistValue({
        id: "custpage_col_internalid",
        line: i,
        value: value[i].idRecord,
      });
      sublist.setSublistValue({
        id: "custpage_col_status",
        line: i,
        value: value[i].status,
      });
      sublist.setSublistValue({
        id: "custpage_col_description",
        line: i,
        value: value[i].description,
      });
    }

    form.addSubmitButton({ label: "Approval" });
    return form;
  }

  function getSublist(request) {
    var lineCount = request.getLineCount({ group: "custpage_list" });

    var arrayList = [];
    var list;

    for (var i = 0; i < lineCount; i++) {
      var internalID = request.getSublistValue({
        group: "custpage_list",
        name: "custpage_col_internalid",
        line: i,
      });

      var status = request.getSublistValue({
        group: "custpage_list",
        name: "custpage_col_status",
        line: i,
      });

      var description = request.getSublistValue({
        group: "custpage_list",
        name: "custpage_col_description",
        line: i,
      });

      var process = request.getSublistValue({
        group: "custpage_list",
        name: "custpage_col_process",
        line: i,
      });

      list = new Object();
      (list.internalID = internalID),
        (list.status = status),
        (list.description = description),
        (list.process = process);
      arrayList.push(list);

      log.debug({
        title: "arrayList",
        details: arrayList,
      });
    }

    return arrayList;
  }

  function formPost(value) {
    var formObj = forms();
    var form = formObj.form;
    var sublist = formObj.sublist;
    for (var i = 0; i < value.length; i++) {
      log.debug("id", value[i].internalID);
      sublist.setSublistValue({
        id: "custpage_col_internalid",
        line: i,
        value: value[i].internalID,
      });
      if(value[i].process == "T"){
        sublist.setSublistValue({
            id: "custpage_col_status",
            line: i,
            value: "Aprobado",
          });
      }else{
        sublist.setSublistValue({
            id: "custpage_col_status",
            line: i,
            value: "Rejeitado",
          });
      };
      sublist.setSublistValue({
        id: "custpage_col_description",
        line: i,
        value: value[i].description,
      });
    }

    form.addSubmitButton({ label: "Approval" });
    return form;
  }

  return {
    onRequest: onRequest,
  };
});
