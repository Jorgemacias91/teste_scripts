/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * @author Jorge Macìas
 * @name REQUISITO_03 Processamento em massa
 */

define(["N/search"], function (search) {
  function getInputData() {
    var vendorbillSearh = search.create({
      type: "vendorbill",
      filters: [
        ["type", "anyof", "VendBill"],
        "AND",
        ["status", "anyof", "VendBill:B"],
        "AND",
        ["trandate", "within", "lastmonth"],
      ],
      columns: ["total", "memo", "refnumber", "location"],
    });

    return vendorbillSearh;
  }
  /**
   *
   * @param {MapSummary} scriptContext
   */
  function map(scriptContext) {
    try {
      log.debug("map...", scriptContext.value);
      var searchResult = JSON.parse(scriptContext.value);
      var total = searchResult.values.total;
      var memo = searchResult.values.memo;
      var refNumber = searchResult.values.refNumber;
      var location = searchResult.values.location;
      log.debug("total", total);
      log.debug("location", location);
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
        log.debug("Reduce...", scriptContext.value);
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
