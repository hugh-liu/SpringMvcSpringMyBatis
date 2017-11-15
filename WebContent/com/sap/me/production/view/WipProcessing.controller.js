jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("util.Navigation");
jQuery.sap.require("util.Common");

sap.ui.controller("com.sap.me.production.view.WipProcessing", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("WIPProcessing.onBeforeShow: view for controller not defined");
            return;
        }

        if (evt.data && evt.data.context) {
            oView.setBindingContext(evt.data.context);
        }

        if (evt.fromId === "Home") {
            if (evt.data && !util.StringUtil.isBlank(evt.data.appName)) {
                oView.page.setTitle(evt.data.appName);
            }
        }

        if (evt.data && evt.data.activities && evt.data.activities.length > 0) {
            for (var i=0; i<evt.data.activities.length; i++) {
                var activity = evt.data.activities[i];
                // jQuery.sap.log.debug("WipProcessing.onBeforeShow: activity(" + i + ").activityId = " + activity.activityId);
            }
        }

        if (evt.data && evt.data.options && evt.data.options.length > 0) {

            util.Model.removeData("TEMP_START_NEXT_ACTIVITY");
            util.Model.removeData("TEMP_SIGNOFF_NEXT_ACTIVITY");
            util.Model.removeData("TEMP_COMPLETE_NEXT_ACTIVITY");

            var bShowButton = true;

            for (var i=0; i<evt.data.options.length; i++) {
                var option = evt.data.options[i];
                //  jQuery.sap.log.debug("WipProcessing.onBeforeShow: option(" + i + ").activityRef = " + option.activityRef + ", " + option.key + " = " + option.value);

                if (option.key === "SHOW_START") {
                    bShowButton = true;
                    if (option.value && (option.value === "NO" || option.value === "FALSE") ) {
                        bShowButton = false;
                    }
                    var oButtonControl = oView.byId("startButton");
                    if (oButtonControl) {
                        oButtonControl.setVisible(bShowButton);
                    }
                } else if (option.key === "SHOW_SIGNOFF") {
                    bShowButton = true;
                    if (option.value && (option.value === "NO" || option.value === "FALSE") ) {
                        bShowButton = false;
                    }
                    var oButtonControl = oView.byId("signoffButton");
                    if (oButtonControl) {
                        oButtonControl.setVisible(bShowButton);
                    }

                } else if (option.key === "SHOW_COMPLETE") {
                    bShowButton = true;
                    if (option.value && (option.value === "NO" || option.value === "FALSE") ) {
                        bShowButton = false;
                    }
                    var oButtonControl = oView.byId("completeButton");
                    if (oButtonControl) {
                        oButtonControl.setVisible(bShowButton);
                    }
                } else if (option.key === "START_NEXT_ACTION") {
                    if (!util.StringUtil.isBlank(option.value)) {
                        util.Model.setData("TEMP_START_NEXT_ACTIVITY", option.value);
                    }
                } else if (option.key === "SIGNOFF_NEXT_ACTION") {
                    if (!util.StringUtil.isBlank(option.value)) {
                        util.Model.setData("TEMP_SIGNOFF_NEXT_ACTIVITY", option.value);
                    }
                } else if (option.key === "COMPLETE_NEXT_ACTION") {
                    if (!util.StringUtil.isBlank(option.value)) {
                        util.Model.setData("TEMP_COMPLETE_NEXT_ACTIVITY", option.value);
                    }
                }
            }
        }

        this.setViewFields(evt);
    },

    /*
    * Set the field focus
    */
    setFieldFocus: function (focusField) {
        jQuery.sap.delayedCall(800, this, util.StringUtil.setFocus, [this.getView(), focusField]);
    },



    onAfterShow : function(evt) {
        this.setViewFields(evt);
        var oView = this.getView();

        // Apply Common Settings
        util.Common.applyCommonSettings(oView.byId("wipProcessType"), oView.byId("shopEntityInput"), oView.byId("operationInput"), oView.byId("resourceInput"));

        this.setFieldFocus("shopEntityInput");
    },

    setViewFields : function(evt) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("WIPProcessing.setViewFields: view for controller not defined");
            return;
        }

        var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
        var selectedResource = util.Model.getData(util.ModelKey.SelectedResource);
        var oShopEntityControl = oView.byId("shopEntityInput");
        var selectedShopEntity = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        if ( ! selectedShopEntity ) {
            oShopEntityControl.setValue("");
        } else {
            oShopEntityControl.setValue(selectedShopEntity);
        }
        var selectedshopEntityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        if (evt.firstTime) {
            if (!selectedshopEntityType || selectedshopEntityType == "") {
                selectedshopEntityType = "SFC";
                util.Model.setData(util.ModelKey.SelectedCollectionType + "_DEFAULT", "SFC");
                util.Model.setData(util.ModelKey.SelectedCollectionType , "SFC");
            }
        }
        var oWipProcessTypeControl = oView.byId("wipProcessType");
        var items = oWipProcessTypeControl.getItems();
        for (var i = 0; i < items.length; i++) {
            var val = items[i].getKey();
            if ( val === selectedshopEntityType) {
                 oWipProcessTypeControl.setSelectedItem(items[i]);
                 break;
            }
        }

        var oInputControl = oView.byId("shopEntityInput");
        if (oInputControl) {
            var oTypeControl = oView.byId("wipProcessType");
            oInputControl.setPlaceholder(oTypeControl.getSelectedItem().getText());
            if ( oInputControl._$input ) {
                oInputControl._$input.attr("placeholder", oTypeControl.getSelectedItem().getText());
            }
        }


        if (evt.firstTime || evt.fromId == "OperationBrowse") {

            if (selectedOperation && selectedOperation != "") {
                var oInputControl = oView.byId("operationInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedOperation.toUpperCase());
                }
            }
        }

        if (evt.firstTime || evt.fromId == "ResourceBrowse") {
            if (selectedResource && selectedResource != "") {
                var oInputControl = oView.byId("resourceInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedResource.toUpperCase());
                }
            }
        }
        if (evt.firstTime) {
            if (selectedShopEntity && selectedShopEntity != "") {
                var oInputControl = oView.byId("shopEntityInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedShopEntity.toUpperCase());
                }
            }
        }

        // only first time
        if (evt.firstTime) {
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
        }

    },


    processTypeChange: function(oControlEvent) {
     var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("WipProcessing.processTypeChange: view not found");
            return;
        }
        var oSelectControl = oView.byId("wipProcessType");
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
                        var oInputControl = oView.byId("shopEntityInput");
                        if (oInputControl) {
                            oInputControl.setValue("");
                            util.Model.removeData(util.ModelKey.SelectedCollectionTypeValue);
                            var oTypeControl = oView.byId("wipProcessType");
                            oInputControl.setPlaceholder(oTypeControl.getSelectedItem().getText());
                            if ( oInputControl._$input) {
                                oInputControl._$input.attr("placeholder", oTypeControl.getSelectedItem().getText());
                                this.setFieldFocus("shopEntityInput");
                            }
                        }
                    }
                }
            }
        }
   },

    browseOperationTap : function(evt) {

        util.Model.removeData("TEMP_OperationFilterValue");

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("WIPProcessing.browseOperationTap: view for controller not defined");
            return;
        }

        var oInputControl = oView.byId("operationInput");
        if (oInputControl) {
            util.Model.setData("TEMP_OperationFilterValue", oInputControl.getValue().toUpperCase());
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "OperationBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "WipProcessing",
                fromNamespace : "com.sap.me.production.view"
            }
        });
        this.setFieldFocus("shopEntityInput");
    },

    browseResourceTap : function(evt) {

        util.Model.removeData("TEMP_ResourceFilterValue");

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("WIPProcessing.browseResourceTap: view for controller not defined");
            return;
        }

        var oInputControl = oView.byId("resourceInput");
        if (oInputControl) {
            util.Model.setData("TEMP_ResourceFilterValue", oInputControl.getValue().toUpperCase());
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "ResourceBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "WipProcessing",
                fromNamespace : "com.sap.me.production.view"
            }
        });
        this.setFieldFocus("shopEntityInput");
    },

    buildParameters : function(requestData, entityType) {
        var parameters = undefined;
        var selectedshopEntityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        if ( entityType === "SFC") {
            parameters="?Sfc='" + requestData.sfc + "'&Operation='" + requestData.operation + "'&Resource='" + requestData.resource + "'";
        } else if (entityType === "SHOP_ORDER"  ) {
            parameters="?ShopOrder='" + requestData.sfc + "'&Operation='" + requestData.operation + "'&Resource='" + requestData.resource + "'";
        } else if (entityType === "PROCESS_LOT"  ) {
            parameters="?ProcessLot='" + requestData.sfc + "'&Operation='" + requestData.operation + "'&Resource='" + requestData.resource + "'";
        }
        return parameters;
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
        var oInputControl = oView.byId("shopEntityInput");
        if (oInputControl) {
            oInputControl.setValue("");
        }
    },

    startSfcTap : function(evt) {

        var requestData = this.getRequestData();
        if (!requestData) {
            return;
        }
        var selectedshopEntityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var parameters = this.buildParameters(requestData, selectedshopEntityType);
        var url = "/manufacturing-odata/Production.svc/";
        if ( selectedshopEntityType === "SFC") {
            url = url + "StartSfc";
        } else if (selectedshopEntityType === "SHOP_ORDER"  ) {
            url = url + "StartShopOrder";
        } else if (selectedshopEntityType === "PROCESS_LOT"  ) {
            url = url + "StartProcessLot";
        }
        util.IOUtil.remoteRequest(url + parameters, "POST", null, this.startSuccessCallback, this.errorCallback, this);
    },

    signoffTap : function(evt) {

        var requestData = this.getRequestData();
        if (!requestData) {
            return;
        }
        var selectedshopEntityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var parameters = this.buildParameters(requestData, selectedshopEntityType);
        var url = "/manufacturing-odata/Production.svc/";
        if ( selectedshopEntityType === "SFC") {
            url = url + "SignoffSfc";
        } else if (selectedshopEntityType === "SHOP_ORDER"  ) {
            url = url + "SignoffShopOrder";
        } else if (selectedshopEntityType === "PROCESS_LOT"  ) {
            url = url + "SignoffProcessLot";
        }
        util.IOUtil.remoteRequest(url + parameters, "POST", null, this.signoffSuccessCallback, this.errorCallback, this);
    },

    completeSfcTap : function(evt) {

        var requestData = this.getRequestData();
        if (!requestData) {
            return;
        }

        var selectedshopEntityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var parameters = this.buildParameters(requestData, selectedshopEntityType);
        var url = "/manufacturing-odata/Production.svc/";
        if ( selectedshopEntityType === "SFC") {
            url = url + "CompleteSfc";
        } else if (selectedshopEntityType === "SHOP_ORDER"  ) {
            url = url + "CompleteShopOrder";
        } else if (selectedshopEntityType === "PROCESS_LOT"  ) {
            url = url + "CompleteProcessLot";
        }
        util.IOUtil.remoteRequest(url + parameters, "POST", null, this.completeSuccessCallback, this.errorCallback, this);
    },

    getRequestData : function() {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("WIPProcessing.getRequestData: view for controller not defined");
            return;
        }

        var operation = oView.byId("operationInput").getValue();
        if (!operation) {
            var message = util.I18NUtility.getErrorText("12903.simple");
            sap.m.MessageBox.alert(message);
            return undefined;
        }
        var resource = oView.byId("resourceInput").getValue();
        if (!resource) {
            var message = util.I18NUtility.getErrorText("12904.simple");
            sap.m.MessageBox.alert(message);
            return undefined;
        }
        var sfc = oView.byId("shopEntityInput").getValue();
        if (!sfc) {
            var message = util.I18NUtility.getErrorText("12906.simple");
            var entityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
            if (entityType === "SHOP_ORDER"  ) {
                 message = util.I18NUtility.getErrorText("12907.simple");
            } else if (entityType === "PROCESS_LOT"  ) {
                 message = util.I18NUtility.getErrorText("12914.simple");
            }
            sap.m.MessageBox.alert(message);
            return undefined;
        }

        var requestData = {
            operation : operation.toUpperCase(),
            resource : resource.toUpperCase(),
            sfc : sfc.toUpperCase()
        };

        return requestData;
    },

    startSuccessCallback : function(oData) {
        sap.m.MessageToast.show(util.I18NUtility.getLocaleSpecificText("ME_MOBILE.sfc_started.TEXT"), {
            duration: 3000,
            animationDuration: 500
        });

        var sNextActivity = util.Model.getData("TEMP_START_NEXT_ACTIVITY");
        if (!util.StringUtil.isBlank(sNextActivity)) {
            jQuery.sap.delayedCall(2000, this, this.gotoNextActivity, [sNextActivity]);
        }
    },

    signoffSuccessCallback : function(oData) {
        sap.m.MessageToast.show(util.I18NUtility.getLocaleSpecificText("ME_MOBILE.sfc_signoff.TEXT"), {
            duration: 3000,
            animationDuration: 500
        });

        var sNextActivity = util.Model.getData("TEMP_SIGNOFF_NEXT_ACTIVITY");
        if (!util.StringUtil.isBlank(sNextActivity)) {
            jQuery.sap.delayedCall(2000, this, this.gotoNextActivity, [sNextActivity]);
        }
    },

    completeSuccessCallback : function(oData) {
        sap.m.MessageToast.show(util.I18NUtility.getLocaleSpecificText("ME_MOBILE.sfc_completed.TEXT"), {
            duration: 3000,
            animationDuration: 500
        });

        var sNextActivity = util.Model.getData("TEMP_COMPLETE_NEXT_ACTIVITY");
        if (!util.StringUtil.isBlank(sNextActivity)) {
            jQuery.sap.delayedCall(2000, this, this.gotoNextActivity, [sNextActivity]);
        }
    },

    errorCallback : function(errorCode, errorMessage) {
         if (errorMessage) {
             jQuery.sap.log.debug("WipProcessing Error: " + errorMessage);
             sap.m.MessageBox.alert(errorMessage);
         }
    },

    gotoNextActivity : function(sNextActivity) {

        this.saveModel();

        try {
            util.Navigation.gotoActivity(sNextActivity, "WipProcessing", "com.sap.me.production.view");
        } catch (err) {
             sap.m.MessageBox.alert(err.message);
        }

    },

    saveModel : function(evt) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("WIPProcessing.saveModel: view for controller not defined");
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

        //oInputControl = oView.byId("wipProcessType");
        //if (oInputControl) {
        //    var oItem = oInputControl.getSelectedItem();
        //    if (oItem) {
        //        var sValue = oItem.getKey();
        //        if (!util.StringUtil.isBlank(sValue)) {
        //            util.Model.setData(util.ModelKey.SelectedCollectionType, sValue.toUpperCase());
        //        }
        //    }
        //}

        //oInputControl = oView.byId("shopEntityInput");
        //if (oInputControl) {
        //    var value = oInputControl.getValue();
        //    if (!util.StringUtil.isBlank(value)) {
        //        util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, value.toUpperCase());
        //    }
        //}

        // Save Common Settings
        util.Common.saveCommonSettings(oView.byId("wipProcessType"), oView.byId("shopEntityInput"), oView.byId("operationInput"), oView.byId("resourceInput"));
    },

    navButtonTap : function(evt) {
        this.saveModel();
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
              id : "Home"
        });
    }
});