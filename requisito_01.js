/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Jorge Macìas
 * @name REQUISITO_01 Customização para preenchimento de campos
 */

define(['N/record', 'N/search', 'N/ui/message'], function (record, search, message) {
  /**
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord
   * @param {Record} scriptContext.oldRecord
   * @param {string} scriptContext.type
   */

  function afterSubmit(scriptContext) {
    try {
      var newRecord = scriptContext.newRecord;
      var lookupSubsidiary = search.lookupFields({
        type: "subsidiary",
        id: newRecord.getValue("subsidiary"),
        columns: ["custbody_tst_sem_codigo"],
      });
      var semCodigo = lookupSubsidiary.custbody_tst_sem_codigo;

      if(semCodigo){
          var lookupCustomer = search.lookupFields({
            type: "customer",
            id: newRecord.getValue('entity'),
            columns: ['custentity_tst_banco', 'custentity_tst_codigo']
          });
          var bank = lookupCustomer.custentity_tst_banco ? lookupCustomer.custentity_tst_banco[0].value : "";
          var code = lookupCustomer.custentity_tst_codigo
          if(bank && code){
            var bankRecord = record.load({
                type: 'customrecord_tst_banco'
            });
            var codPromo = bankRecord.getValue('custrecord_banco_codpromo');
            if(codPromo && code){
                message.create({
                    title: 'Atenção',
                    message: 'Esta transação possui código promocional',
                    type: message.Type.WARNING
                })
            }
          }else{
              alert('Falta dos parâmetros: Banco e Código');
              retun;
          }
      }
    } catch (error) {
      log.error("Error afterSubmit...", error);
    }
  }

  return {
    afterSubmit: afterSubmit,
  };
});
