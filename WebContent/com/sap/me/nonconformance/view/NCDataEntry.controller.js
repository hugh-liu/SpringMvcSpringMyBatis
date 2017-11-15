jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.sap.me.nonconformance.view.ComponentConfigurator");

sap.ui.controller("com.sap.me.nonconformance.view.NCDataEntry", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

       util.Model.removeData("TEMP_NC_ComponentList");

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("NCDataEntry.onBeforeShow: view for controller not defined");
            return;
        }

        if (evt.data && evt.data.context) {
            oView.setBindingContext(evt.data.context);
        }

        if ("to" === evt.direction && evt.data && evt.data.appName) {
            oView.page.setTitle(evt.data.appName);
        }

        var selectedNCCode = util.Model.getData(util.ModelKey.SelectedNCCode);
        if (selectedNCCode) {
            var oInputControl = oView.byId("ncCodeInput");
            if (oInputControl) {
                oInputControl.setValue(selectedNCCode.toUpperCase());
            }
        }

        // get data fields
        var requestUrl = "/manufacturing-odata/LogNc.svc/NcCodes('" + selectedNCCode + "')/dataFields";
        var oComponentList = undefined;
        try {
            oComponentList = util.IOUtil.getODataRequestResults(requestUrl, false);
        } catch (err) {
            jQuery.sap.log.error(err.message);
            return;
        }
        if (!oComponentList || oComponentList.length <= 0) {
            //  17214.simple=Data to Collect list is missing
            //var message = util.I18NUtility.getErrorText("17214.simple");
            //sap.m.MessageBox.alert(message);
            return;
        }

        for (var i = 0; i < oComponentList.length; i++) {
            if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.LIST) {
                var url = "/manufacturing-odata/LogNc.svc/GetDataFieldValidValues?NcCode='" + selectedNCCode + "'&FieldName='" + oComponentList[i].name + "'";
                // jQuery.sap.log.debug("onBeforeShow: url = " + url);
                var oValidValues = undefined;
                try {
                    oValidValues = util.IOUtil.getODataRequestResults(url, false);
                } catch(err) {
                    jQuery.sap.log.error(err.message);
                    continue;
                }
                if (oValidValues && oValidValues.length > 0) {
                    oComponentList[i].validValues = oValidValues;
                    // jQuery.sap.log.debug("onBeforeShow: oValidValues length = " + oValidValues.length);
                }
            } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT) {
                if (oComponentList[i].name === "NC_CODE") {
                    oComponentList[i].type = com.sap.me.nonconformance.view.DataType.NONE;
                    if (oComponentList[i].defaultValue) {
                        var oPageControl = oView.byId("dataEntryPage");
                        if (oPageControl) {
                            oPageControl.setTitle(oComponentList[i].defaultValue);
                        }
                    }
                }
            }
        }

        // add the data type fields
        var oDataEntryList = oView.byId("dataEntryList");
        if (oDataEntryList) {
            if (oDataEntryList.getItems() && oDataEntryList.getItems().length > 0) {
                oDataEntryList.destroyItems();
            }
            var oControlList = com.sap.me.nonconformance.view.ComponentConfigurator.getControls(oView, oComponentList);
            if (oControlList && oControlList.length > 0) {
                for (var i = 0; i < oControlList.length; i++) {
                    oDataEntryList.addItem(oControlList[i]);
                }
                util.Model.setData("TEMP_NC_ComponentList", oComponentList);
            }
        }
    },

    onAfterShow : function(evt) {

    },

    closeTap : function() {

        // unsaved data? then prompt
        if (util.Model.isUnsavedDataDefined()) {

           var thisController = this;
           sap.m.MessageBox.show (
               util.I18NUtility.getLocaleSpecificText("ME_MOBILE.unsavedData.message.TEXT"),
               sap.m.MessageBox.Icon.QUESTION,
               util.I18NUtility.getLocaleSpecificText("ME_MOBILE.unsavedData.title.TEXT"),
               [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
               function(oAction) {
                  if (oAction) {
                      if (oAction === sap.m.MessageBox.Action.YES) {
                          util.Model.removeData(util.ModelKey.SelectedNCGroup);
                          util.Model.removeData(util.ModelKey.SelectedNCCode);
                          var bus = sap.ui.getCore().getEventBus();
                          bus.publish("nav", "to", {
                                id : "Home"
                          });
                      }
                  }
               }
           );

        // no unsaved data - just return
        } else {
              util.Model.removeData(util.ModelKey.SelectedNCGroup);
              util.Model.removeData(util.ModelKey.SelectedNCCode);
              var bus = sap.ui.getCore().getEventBus();
              bus.publish("nav", "to", {
                    id : "Home"
              });
        }
    },

    clearButtonTap : function() {

        var oComponentList = util.Model.getData("TEMP_NC_ComponentList");
        if (!oComponentList) {
            return;
        }

        var oView = this.getView();
        if (!oView) {
            return;
        }

        try {
            com.sap.me.nonconformance.view.ComponentConfigurator.clearControls(oView, oComponentList);
        } catch (err) {
            jQuery.sap.log.error(err.message);
            sap.m.MessageToast.show(err.message, {
                duration: 5000,
                animationDuration: 500
            });
            return;
        }
    },

    addButtonTap : function(evt) {

        var oComponentList = util.Model.getData("TEMP_NC_ComponentList");
        var oDataValues = null;
        if (oComponentList) {
            var oView = this.getView();
            if (!oView) {
                jQuery.sap.log.error("NCDataEntry.addButtonTap: view for controller not defined");
                return;
            }
            try {
                oDataValues = com.sap.me.nonconformance.view.ComponentConfigurator.getDataValues(oView, oComponentList);
            } catch ( error) {
                sap.m.MessageToast.show(error.message, {
                                 duration: 5000,
                                 animationDuration: 500
                             });
                return;
            }
        }

        var selectedShopEntityValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var selectedNCCode = util.Model.getData(util.ModelKey.SelectedNCCode);
        var shopEntityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var selectedOper = util.Model.getData(util.ModelKey.SelectedOperation);
        var selectedOperRev = util.Model.getData(util.ModelKey.SelectedOperationRevision);
        var jsonString = undefined;
        if ( shopEntityType === "SFC") {
            var postData = {
                    "NcCode" : selectedNCCode,
                    "Sfc" : selectedShopEntityValue,
                    "Oper" : selectedOper,
                    "OperRev" : selectedOperRev,
                    "DataEntryVals" : oDataValues
            };
            jsonString = JSON.stringify(postData);
        } else if (shopEntityType === "SHOP_ORDER" ) {
            var postData = {
                    "NcCode" : selectedNCCode,
                    "ShopOrder" : selectedShopEntityValue,
                    "Oper" : selectedOper,
                    "OperRev" : selectedOperRev,
                    "DataEntryVals" : oDataValues
            };
            jsonString = JSON.stringify(postData);
        } else if (shopEntityType === "PROCESS_LOT" ) {
            var postData = {
                    "NcCode" : selectedNCCode,
                    "ProcessLot" : selectedShopEntityValue,
                    "Oper" : selectedOper,
                    "OperRev" : selectedOperRev,
                    "DataEntryVals" : oDataValues
            };
            jsonString = JSON.stringify(postData);
        }

        // jQuery.sap.log.debug("addButtonTap: post data = " + jsonString);

        util.IOUtil.remoteRequest("/manufacturing-odata/LogNc.svc/NcRecords", "POST", jsonString, this.addSuccessCallback, this.addErrorCallback, this);

    },

    addSuccessCallback : function(oData) {
         util.Model.removeData(util.ModelKey.SelectedNCGroup);
         util.Model.removeData(util.ModelKey.SelectedNCCode);
         var bus = sap.ui.getCore().getEventBus();
         bus.publish("nav", "to", {
               id : "LogNC",
               data : {
                   namespace : "com.sap.me.nonconformance.view"
               }
         });
         sap.m.MessageToast.show(util.I18NUtility.getLocaleSpecificText("ME_MOBILE.nc_logged.TEXT"), {
             duration: 3000,
             animationDuration: 500
         });
    },

    addErrorCallback : function(errorCode, errorMessage) {
         if (errorMessage) {
             jQuery.sap.log.debug("Log NC Error: " + errorMessage);
            sap.m.MessageBox.alert(errorMessage);
         }
    },

    navButtonTap : function(evt) {
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back", {
                id : "NCCodeBrowse",
                data : {
                    namespace : "com.sap.me.nonconformance.view"
                }
        });
    }

});