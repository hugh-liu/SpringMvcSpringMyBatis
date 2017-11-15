jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("util.Common");

sap.ui.controller("com.sap.me.nonconformance.view.LogNC", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

        var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("onBeforeShow: view not found");
            return;
        }
        if (evt.fromId === "Home" && !util.StringUtil.isBlank(evt.data.appName)) {
            oView.page.setTitle(evt.data.appName);
        }

        if (!evt.data) {
            return;
        }
        if (evt.data.context) {
            oView.setBindingContext(evt.data.context);
        }

        // returning from NC Data Entry screen.  reset controls
        if (evt.fromId === "NCDataEntry") {
            util.Model.removeData(util.ModelKey.SelectedNCGroup);
            oInputControl = oView.byId("ncGroupInput");
            if (oInputControl) {
                oInputControl.setValue("");
            }

            util.Model.removeData(util.ModelKey.SelectedNCCode);
            oInputControl = oView.byId("ncCodeInput");
            if (oInputControl) {
                oInputControl.setValue("");
            }

        } else {
             var ncCode = util.Model.getData(util.ModelKey.SelectedNCCode);
             oInputControl = oView.byId("ncCodeInput");
             if (oInputControl && oInputControl.getVisible() && ncCode) {
                 oInputControl.setValue(ncCode);
             }
             var ncGroup = util.Model.getData(util.ModelKey.SelectedNCGroup);
             oInputControl = oView.byId("ncGroupInput");
             if (oInputControl && oInputControl.getVisible() && ncGroup) {
                 oInputControl.setValue(ncGroup);
             }
        }



        // no unsaved data set, initialize default values
        if (!util.Model.isUnsavedDataDefined()) {
            var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
            if (selectedOperation) {
                util.Model.setData(util.ModelKey.SelectedOperation + "_DEFAULT", selectedOperation);
            }
            var selectedResource = util.Model.getData(util.ModelKey.SelectedResource);
            if (selectedResource) {
                util.Model.setData(util.ModelKey.SelectedResource + "_DEFAULT", selectedResource);
            }
            var selectedShopEntityValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
            if (selectedShopEntityValue) {
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue + "_DEFAULT", selectedShopEntityValue);
            }
        }

        

        this.processBypassNcGroup();
    },

    /*
    * Set the field focus
    */
    setFieldFocus: function (focusField) {
        jQuery.sap.delayedCall(800, this, util.StringUtil.setFocus, [this.getView(), focusField]);
    },


    onAfterShow: function (evt) {
        var oView = this.getView();
        // Apply Common Settings
        util.Common.applyCommonSettings(oView.byId("logNcProcessType"), oView.byId("shopEntity"), oView.byId("operationInput"), oView.byId("resourceInput"));

        this.validateInputFieldChanges(evt.firstTime, evt.fromId);

        this.setFieldFocus("shopEntity");
    },

    operationChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "OperationChange");
    },

    resourceChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ResourceChange");
    },

    shopEntityChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ShopEntityChange");        
    },

    ncGroupChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "NCGroupChange");
    },


    ncCodeChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "NCCodeChange");
    },


    clearOperationTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "OperationChange");
    },

    clearResourceTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ResourceChange");
    },

    clearShopEntityTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ShopEntityChange");
    },

    clearNCGroupTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "NCGroupChange");
    },


    clearNCCodeTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "NCCodeChange");
    },

    validateInputFieldChanges : function(bFirstTime, sFromId) {

        // jQuery.sap.log.debug("LogNC.validateInputFieldChanges: bFirstTime = " + bFirstTime + ", sFromId = " + sFromId);

        var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("LogNC.validateInputFieldChanges: view not found");
            return;
        }

        var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
        var selectedResource = util.Model.getData(util.ModelKey.SelectedResource);
        var selectedshopEntityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var selectedShopEntityValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var selectedNCGroup = util.Model.getData(util.ModelKey.SelectedNCGroup);
        var selectedNCCode = util.Model.getData(util.ModelKey.SelectedNCCode);

        // first time in page - set initial values
        if (bFirstTime) {

            if (!util.StringUtil.isBlank(selectedOperation)) {
                var oInputControl = oView.byId("operationInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedOperation.toUpperCase());
                }
            }

            if (!util.StringUtil.isBlank(selectedResource)) {
                var oInputControl = oView.byId("resourceInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedResource.toUpperCase());
                }
            }

            if (util.StringUtil.isBlank(selectedshopEntityType)) {
                selectedShopEntityValue = "";
                selectedshopEntityType = "SFC";
                util.Model.setData(util.ModelKey.SelectedCollectionType + "_DEFAULT", "SFC");
                util.Model.setData(util.ModelKey.SelectedCollectionType , "SFC");
                var oTypeControl = oView.byId("logNcProcessType");
                var items = oTypeControl.getItems();
                for (var i = 0; i < items.length; i++) {
                    var val = items[i].getKey();
                    if ( val === selectedshopEntityType) {
                         oTypeControl.setSelectedItem(items[i]);
                         break;
                    }
                }
                this.setFieldFocus("shopEntity");
            }


            var oInputControl = oView.byId("shopEntity");
            if (oInputControl) {
                if (util.StringUtil.isBlank(selectedShopEntityValue)) {
                    util.Model.removeData(util.ModelKey.SelectedCollectionTypeValue);
                    var oTypeControl = oView.byId("logNcProcessType");
                    if (oTypeControl) {
                        oInputControl.setPlaceholder(oTypeControl.getSelectedItem().getText());
                        if (oInputControl._$input) {
                            oInputControl._$input.attr("placeholder", oTypeControl.getSelectedItem().getText());
                        }
                    }
                } else {
                    oInputControl.setValue(selectedShopEntityValue.toUpperCase());
                }
                this.setFieldFocus("shopEntity");
            }
            

            if (!util.StringUtil.isBlank(selectedNCGroup)) {
                var oInputControl = oView.byId("ncGroupInput");
                if (oInputControl && oInputControl.getVisible() ) {
                    oInputControl.setValue(selectedNCGroup.toUpperCase());
                }
            }


            if (!util.StringUtil.isBlank(selectedNCCode)) {
                var oInputControl = oView.byId("ncCodeInput");
                if (oInputControl && oInputControl.getVisible() ) {
                    oInputControl.setValue(selectedNCCode.toUpperCase());
                }
            }


            var wsconfig = util.Model.getData(util.ModelKey.WorkstationConfiguration);
            if (wsconfig) {
                if (!wsconfig.operationCanBeChanged) {
                    var oInputControl = oView.byId("operationInput");
                    if (oInputControl) {
                        oInputControl.setEditable(false);
                    }
                }
                if (!wsconfig.resourceCanBeChanged) {
                    var oInputControl = oView.byId("resourceInput");
                    if (oInputControl) {
                        oInputControl.setEditable(false);
                    }
                }
            }

        // else a change has occured
        } else {

            if (sFromId == "OperationBrowse") {
                if (!util.StringUtil.isBlank(selectedOperation)) {
                    var oInputControl = oView.byId("operationInput");
                    if (oInputControl) {
                        oInputControl.setValue(selectedOperation.toUpperCase());
                    }
                }
            } else if (sFromId == "OperationChange") {
                var oInputControl = oView.byId("operationInput");
                if (oInputControl) {
                    var sValue = oInputControl.getValue();
                    if (sValue) {
                        selectedOperation = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedOperation, selectedOperation);
                    }
                }
            }

            if (sFromId == "ResourceBrowse") {
                if (!util.StringUtil.isBlank(selectedResource)) {
                    var oInputControl = oView.byId("resourceInput");
                    if (oInputControl) {
                        oInputControl.setValue(selectedResource.toUpperCase());
                    }
                }
            } else if (sFromId == "ResourceChange") {
                var oInputControl = oView.byId("resourceInput");
                if (oInputControl) {
                    var sValue = oInputControl.getValue();
                    if (sValue) {
                        selectedResource = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedResource, selectedResource);
                    }
                }
            }

            if (sFromId == "ShopEntityChange") {
                var oInputControl = oView.byId("shopEntity");
                if (oInputControl) {
                    var sValue = oInputControl.getValue();
                    if (sValue) {
                        selectedShopEntityValue = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, selectedShopEntityValue);
                    }
                }
                var oInputControl = oView.byId("ncCodeInput");
                if (oInputControl && oInputControl.getVisible()) {
                   oInputControl.setValue("");
                   util.Model.removeData(util.ModelKey.SelectedNCCode, selectedNCCode);
                }
                var oInputControl = oView.byId("ncGroupInput");
                if (oInputControl && oInputControl.getVisible()) {
                   oInputControl.setValue("");
                   util.Model.removeData(util.ModelKey.SelectedNCGroup, selectedNCGroup);
                }
                
            }

            if (sFromId == "NCGroupChange") {
                var oInputControl = oView.byId("ncGroupInput");
                if (oInputControl && oInputControl.getVisible()) {
                    var sValue = oInputControl.getValue();
                    if (sValue == "" || sValue) {
                        selectedNCGroup = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedNCGroup, selectedNCGroup);
                    }
                }
            }

            if (sFromId == "NCCodeChange") {
                var oInputControl = oView.byId("ncCodeInput");
                if (oInputControl && oInputControl.getVisible() ) {
                    var sValue = oInputControl.getValue();
                    if (sValue == "" || sValue) {
                        selectedNCCode = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedNCCode, selectedNCCode);
                    }
                }
            }

        }

        // set state of collect button
        this.setNCGroupState(oView);

        // set unsaved data flag
        this.checkUnsavedData();
    },

    setNCGroupState : function(oView) {

        var bEnabled = true;

        var oInputControl = oView.byId("operationInput");
        if (oInputControl) {
            var sValue = oInputControl.getValue();
            if (util.StringUtil.isBlank(sValue)) {
                bEnabled = false;
            }
        }
        if (bEnabled) {
            oInputControl = oView.byId("resourceInput");
            if (oInputControl) {
                var sValue = oInputControl.getValue();
                if (util.StringUtil.isBlank(sValue)) {
                    bEnabled = false;
                }
            }
        }
        if (bEnabled) {
            oInputControl = oView.byId("shopEntity");
            if (oInputControl) {
                var sValue = oInputControl.getValue();
                if (util.StringUtil.isBlank(sValue)) {
                    bEnabled = false;
                }
            }
        }

        var oInputControl = oView.byId("ncGroupInput");
        if (oInputControl) {
            oInputControl.setEnabled(bEnabled);
        }

        oInputControl = oView.byId("ncCodeInput");
        if (oInputControl) {
            oInputControl.setEnabled(bEnabled);
        }

    },

    checkUnsavedData : function() {

        // if already set just return
        if (util.Model.isUnsavedDataDefined()) {
            return;
        }

        var newValue = util.Model.getData(util.ModelKey.SelectedOperation);
        var defaultValue = util.Model.getData(util.ModelKey.SelectedOperation + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData(util.ModelKey.SelectedResource);
        defaultValue = util.Model.getData(util.ModelKey.SelectedResource + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        defaultValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

    },

    processTypeChange: function(oControlEvent) {
         var oView = this.getView();
           if (oView === undefined || oView === null) {
               jQuery.sap.log.debug("LogNcController.processTypeChange: view not found");
               return;
           }
           var oSelectControl = oView.byId("logNcProcessType");
           if (oSelectControl) {
               var oItem = oSelectControl.getSelectedItem();
               if (oItem) {
                   var sValue = oItem.getKey();
                   if (sValue && sValue.length > 0) {
                     var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
                       var newSelectedType = sValue.toUpperCase();
                       // type is changing, clear value field
                       if ( ! selectedType || selectedType == null) {
                        selectedType= util.Model.getData(util.ModelKey.SelectedCollectionType + "_DEFAULT");
                       }
                       if (selectedType && selectedType != newSelectedType) {
                         util.Model.setData(util.ModelKey.SelectedCollectionType, newSelectedType);
                           var oInputControl = oView.byId("shopEntity");
                           if (oInputControl) {
                               oInputControl.setValue("");
                               var oNcControl = oView.byId("ncGroupInput");
                               if (oNcControl && oNcControl.getVisible() ) {
                            	   oNcControl.setEnabled(false);
                               }
                               oNcControl = oView.byId("ncCodeInput");
                               if (oNcControl && oNcControl.getVisible()) {
                            	   oNcControl.setEnabled(false);
                               }
                               util.Model.removeData(util.ModelKey.SelectedCollectionTypeValue);
                               var oTypeControl = oView.byId("logNcProcessType");
                               oInputControl.setPlaceholder(oTypeControl.getSelectedItem().getText());
                               if ( oInputControl._$input ) {
                                    oInputControl._$input.attr("placeholder", oTypeControl.getSelectedItem().getText());
                               }
                       
                           }
                       }
                   }
                   this.setFieldFocus("shopEntity");
               }
           }
      },

    browseOperationTap : function(evt) {

        util.Model.removeData("TEMP_OperationFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("operationInput");
                if (oInputControl) {
                    util.Model.setData("TEMP_OperationFilterValue", oInputControl.getValue().toUpperCase());
                }
        }
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "OperationBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "LogNC",
                fromNamespace : "com.sap.me.production.view"
            }
        });
        this.setFieldFocus("shopEntity");
    },

    browseResourceTap : function(evt) {

        util.Model.removeData("TEMP_ResourceFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("resourceInput");
                if (oInputControl) {
                    util.Model.setData("TEMP_ResourceFilterValue", oInputControl.getValue().toUpperCase());
                }
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "ResourceBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "LogNC",
                fromNamespace : "com.sap.me.production.view"
            }
        });
        this.setFieldFocus("shopEntity");
    },

    browseNCGroupTap : function(evt) {
        util.Model.removeData("TEMP_NCGroupFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("ncGroupInput");
                if (oInputControl) {
                    util.Model.setData("TEMP_NCGroupFilterValue", oInputControl.getValue().toUpperCase());
                }
        }
        this.validateShopEntity();
    },


    browseNCCodeTap : function(evt) {
        util.Model.removeData("TEMP_NCCodeFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("ncCodeInput");
                if (oInputControl) {
                    util.Model.setData("TEMP_NCCodeFilterValue", oInputControl.getValue().toUpperCase());
                }
        }
        this.validateShopEntity();
    },

    clearButtonTap : function() {

        var oView = this.getView();
        if (!oView) {
            return;
        }

        var wsconfig = util.Model.getData(util.ModelKey.WorkstationConfiguration);
        if (wsconfig) {
            if (wsconfig.operationCanBeChanged) {
                var oInputControl = oView.byId("operationInput");
                if (oInputControl) {
                    oInputControl.setValue("");
                }
            }
            if (wsconfig.resourceCanBeChanged) {
                var oInputControl = oView.byId("resourceInput");
                if (oInputControl) {
                    oInputControl.setValue("");
                }
            }
        }

        var oInputControl = oView.byId("shopEntity");
        if (oInputControl) {
            oInputControl.setValue("");
        }

        var oInputControl = oView.byId("ncGroupInput");
        if (oInputControl) {
            oInputControl.setValue("");
        }

        var oInputControl = oView.byId("ncCodeInput");
        if (oInputControl) {
            oInputControl.setValue("");
        }
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
                          thisController.navButtonTap();
                      }
                  }
               }
            );

        // no unsaved data - just return
        } else {
            this.navButtonTap();
        }
    },

    navButtonTap : function(evt) {
        this.saveModel();
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
              id : "Home"
        });
    },

    saveModel : function() {

        var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("saveModel: view not found");
            return;
        }

        util.Model.removeData(util.ModelKey.SelectedOperation);
        util.Model.removeData(util.ModelKey.SelectedResource);
        util.Model.removeData(util.ModelKey.SelectedCollectionType);
        util.Model.removeData(util.ModelKey.SelectedCollectionTypeValue);

        //var oInputControl = oView.byId("operationInput");
        //if (oInputControl) {
        //    var value = oInputControl.getValue();
        //    if (!util.StringUtil.isBlank(value)) {
        //        util.Model.setData(util.ModelKey.SelectedOperation, value.toUpperCase());
        //    }
        //}

        //oInputControl = oView.byId("resourceInput");
        //if (oInputControl) {
        //    var value = oInputControl.getValue();
        //    if (!util.StringUtil.isBlank(value)) {
        //        util.Model.setData(util.ModelKey.SelectedResource, value.toUpperCase());
        //    }
        //}

        //oInputControl = oView.byId("logNcProcessType");
        //if (oInputControl) {
        //	var oItem = oInputControl.getSelectedItem();
        //	if (oItem) {
        //		var sValue = oItem.getKey();
        //		if (!util.StringUtil.isBlank(sValue)) {
        //			util.Model
        //			.setData(
        //					util.ModelKey.SelectedCollectionType,
        //					sValue.toUpperCase());
        //		}
        //	}
        //}


        //oInputControl = oView.byId("shopEntity");
        //if (oInputControl) {
        //    var value = oInputControl.getValue();
        //    if (!util.StringUtil.isBlank(value)) {
        //        util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, value.toUpperCase());
        //    }
        //}

        // Save Common Settings
        util.Common.saveCommonSettings(oView.byId("logNcProcessType"), oView.byId("shopEntity"), oView.byId("operationInput"), oView.byId("resourceInput"));

        util.Model.removeData(util.ModelKey.SelectedNCGroup);
        util.Model.removeData(util.ModelKey.SelectedNCCode);
    },

    validateShopEntity: function() {
        var entityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var entityVal = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        var operRev = util.Model.getData(util.ModelKey.SelectedOperationRevision);
        if (util.StringUtil.isBlank(operRev) || operRev == "#") {
            operRev = "%23";
        }
        var parameters="&Oper='" + operation + "'&OperRev='" + operRev + "'";

        if ( entityType && entityType == 'PROCESS_LOT' ) {
            parameters="ProcessLot='" + entityVal + "'" + parameters;
            util.IOUtil.remoteRequest("/manufacturing-odata/LogNc.svc/ValidateProcessLotForNcCreate", "GET", parameters, this.shopEntityValidateSuccess, this.shopEntityValidateFailure, this);
        } else if  (entityType && entityType == 'SHOP_ORDER')  {
            parameters="ShopOrder='" + entityVal + "'" + parameters;
            util.IOUtil.remoteRequest("/manufacturing-odata/LogNc.svc/ValidateShopOrderForNcCreate", "GET", parameters, this.shopEntityValidateSuccess, this.shopEntityValidateFailure, this);
        } else if ( entityType && entityType == 'SFC') {
            parameters="Sfc='" + entityVal + "'" + parameters;
            util.IOUtil.remoteRequest("/manufacturing-odata/LogNc.svc/ValidateSfcForNcCreate", "GET", parameters, this.shopEntityValidateSuccess, this.shopEntityValidateFailure, this);
        }
    },

    shopEntityValidateSuccess : function(OData) {
        var flag = "false";
        if (OData.d.ValidateSfcForNcCreate ) {
            flag = OData.d.ValidateSfcForNcCreate.value;
        } else if ( OData.d.ValidateShopOrderForNcCreate) {
            flag = OData.d.ValidateShopOrderForNcCreate.value;
        } else if ( OData.d.ValidateProcessLotForNcCreate) {
            flag = OData.d.ValidateProcessLotForNcCreate.value;
        }
        if (flag == "true" ) {
            var bypass = util.Model.getData(util.ModelKey.BypassNcGroup);
            if (bypass) {
                var bus = sap.ui.getCore().getEventBus();
                bus.publish("nav", "to", {
                    id : "NCCodeBrowse",
                    data : {
                        namespace : "com.sap.me.nonconformance.view"
                    }
                });

            } else {
                var bus = sap.ui.getCore().getEventBus();
                bus.publish("nav", "to", {
                    id : "NCGroupBrowse",
                    data : {
                        namespace : "com.sap.me.nonconformance.view"
                    }
                });
            }
            return;
        }
        var entityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var entityVal = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        var oProperties = jQuery.sap.properties();
        var message = undefined;
        oProperties.setProperty("%OPERATION%", operation);
        if ( entityType && entityType == 'PROCESS_LOT' ) {
            oProperties.setProperty("%PROCESS_LOT%", entityVal);
            message = util.I18NUtility.getErrorText("13260.simple", oProperties);
        } else if  (entityType && entityType == 'SHOP_ORDER')  {
            oProperties.setProperty("%SHOP_ORDER%", entityVal);
            message = util.I18NUtility.getErrorText("13261.simple", oProperties);
        } else if ( entityType && entityType == 'SFC') {
            oProperties.setProperty("%SFC_BO.(2)%", entityVal);
            oProperties.setProperty("%OPERATION_BO.(2)%", operation);
            message = util.I18NUtility.getErrorText("13142.simple", oProperties);
        }
        sap.m.MessageToast.show(message, {
            duration: 3000,
            animationDuration: 800
        });

    },

    shopEntityValidateFailure : function(errorCode, errorMessage) {
        if (errorMessage) {
            jQuery.sap.log.debug("LogNc Error: " + errorMessage);
            sap.m.MessageBox.alert(errorMessage);
        }
    },

    processBypassNcGroup : function() {
        var parameters="Names='" + "USE_NC_GROUP" +"'";
        util.IOUtil.remoteRequest("/manufacturing-odata/AppConfig.svc/GetSystemRules", "GET", parameters, this.processBypassNcGroupSuccess, this.shopEntityValidateFailure, this);
    },

    processBypassNcGroupSuccess : function(OData) {
        var oView = this.getView();
        oView.byId("ncGroupInput").setVisible(true);
        oView.byId("ncCodeInput").setVisible(false);
        if ( OData) {
            if ( OData.d.results[0].value == "true") {
                util.Model.setData(util.ModelKey.BypassNcGroup, false);
                oView.byId("ncGroupInput").setVisible(true);
                oView.byId("ncCodeInput").setVisible(false);
            } else {
                util.Model.setData(util.ModelKey.BypassNcGroup, true);
                oView.byId("ncGroupInput").setVisible(false);
                oView.byId("ncCodeInput").setVisible(true);
            }
        }

    }


});