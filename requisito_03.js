/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * @author Jorge Macìas
 * @name REQUISITO_03 Processamento em massa
 */

define(["N/search", "N/runtime", "N/render", "email"], function (search, runtime, render, email) {
  function getInputData() {
    log.debug("getInputData", null)
    var vendorbillSearh = search.create({
      type: "vendorbill",
      filters: [
        ["type", "anyof", "VendBill"],
        "AND",
        //["status", "anyof", "VendBill:B"],
        //"AND",
        ["trandate", "within", "lastmonth"],
      ],
      columns: [
        "total", 
        "memo", 
        "refnumber", 
        "location",
        "entity"
      ],
    });

    return vendorbillSearh;
  }
  /**
   *
   * @param {MapSummary} scriptContext
   */
  function map(scriptContext) {
    try {
      var vendorParam = runtime.getCurrentScript().getParameter({ name: 'custscript_param_vendor' });
      var locationParam = runtime.getCurrentScript().getParameter({ name: 'custscript_param_location' });
      var searchResult = JSON.parse(scriptContext.value);
      var total = searchResult.values.total;
      var vendor = searchResult.values.entity.value;
      var location = searchResult.values.location.value;
      var totalRecord = 0;
      if(vendorParam == vendor && locationParam == location){
        totalRecord += total;
      }
      scriptContext.write(vendorParam, totalRecord);
    } catch (error) {
      log.error("Error Map...", error);
    }
  }
  /**
   *
   * @param {ReduceSummary} scriptContext
   */
  function reduce(scriptContext) {
    try {
      log.debug('reduce', scriptContext.values);
      var vendor = scriptContext.key;
      var templateId = Number(runtime.getCurrentScript().getParameter({ name: 'custscript_bill_orders_template' }));
      var renderer = render.mergeEmail({ entity: { type: 'vendor', id: Number(vendor) }, templateId: templateId });
     
      email.send({ author: 21, recipients: [vendor], subject: renderer.subject, body: renderer.body, attachments: attachments });
      } catch (error) {
          log.error("Error Reduce...", error)
      }
  }
  
  return {
    getInputData: getInputData,
    map: map,
    reduce: reduce,
  };
});
