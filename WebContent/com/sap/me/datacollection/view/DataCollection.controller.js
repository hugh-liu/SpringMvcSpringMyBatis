jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.sap.me.datacollection.view.DataCollectionHelper");
jQuery.sap.require("util.Common");

//jQuery.sap.require("com.sap.me.datacollection.view.DCGroupLoader");
//jQuery.sap.require("com.sap.me.security.view.SecurityUtility");
//jQuery.sap.require("com.sap.me.security.view.UserAuthenticationDialog");
//jQuery.sap.require("util.SystemRules");

sap.ui.controller("com.sap.me.datacollection.view.DataCollection", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {


        // returning from DC Entry screen.  reset selections
        if (evt.fromId === "DCDataEntry") {
            util.Model.removeData(util.ModelKey.SelectedDCGroupList);
        }

        if (!evt.data) {
            return;
        }

        this.fromViewId = evt.fromId;
        this.pendingMessage = evt.data.pendingMessage;

        if (this.fromViewId === "Home") {
            if (!util.StringUtil.isBlank(evt.data.appName)) {
                var oView = this.getView();
                if (oView) {
                    oView.page.setTitle(evt.data.appName);
                }
            }

            // load DC rules into global model
            var dcActivityRules = undefined;
            if (evt.data && evt.data.options && evt.data.options.length > 0) {
                dcActivityRules = evt.data.options;
            }
            com.sap.me.datacollection.view.DataCollectionHelper.initializeDataModel(dcActivityRules);

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
            var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
            if (selectedType) {
                util.Model.setData(util.ModelKey.SelectedCollectionType + "_DEFAULT", selectedType);
            }
            var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
            if (selectedTypeValue) {
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue + "_DEFAULT", selectedTypeValue);
            }
        }


    },


    /*
    * Set the field focus
    */
    setFieldFocus: function (focusField) {
        jQuery.sap.delayedCall(800, this, util.StringUtil.setFocus, [this.getView(), focusField]);
    },

    onAfterShow : function(evt) {

        // returning from DC Entry screen - check for messages
        if (this.fromViewId === "DCDataEntry") {
            if (this.pendingMessage) {
                if (this.pendingMessage.showMessage && !util.StringUtil.isBlank(this.pendingMessage.message)) {
                    if (this.pendingMessage.messageType === "box") {
                        sap.m.MessageBox.show (
                              this.pendingMessage.message,
                              sap.m.MessageBox.Icon.INFORMATION,
                              "",
                              sap.m.MessageBox.Action.OK
                        );
                    } else {
                        sap.m.MessageToast.show(this.pendingMessage.message, {
                            duration: 3000,
                            animationDuration: 500
                        });
                    }
                }
                this.pendingMessage = undefined;
            }
        }


        this.validateInputFieldChanges(evt.firstTime, this.fromViewId);

        // Set Default Values if applicable
        //var tmpCollectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        //var tmpCollectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        //if (!util.StringUtil.isBlank(tmpCollectionType))
        //{
        //    util.Model.setData(util.ModelKey.SelectedCollectionType, tmpCollectionType + "_DEFAULT");
        //    util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, tmpCollectionValue + "_DEFAULT");
        //}

        // Apply Common Settings
        var oView = this.getView();
        util.Common.applyCommonSettings(oView.byId("collectionType"), oView.byId("collectionTypeInput"), oView.byId("operationInput"), oView.byId("resourceInput"));
        // set state of collect button
        this.setCollectButtonState(oView);

        this.setFieldFocus("collectionTypeInput");
    },

    operationChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "OperationChange");
    },

    resourceChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ResourceChange");
    },

    collectionTypeChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "CollectionTypeChange");
    },

    collectionInputChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "CollectionValueChange");
    },

    clearOperationTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "OperationChange");
    },

    clearResourceTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ResourceChange");
    },

    clearCollectionInputTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "CollectionValueChange");
    },

    validateInputFieldChanges : function(bFirstTime, sFromId) {

        // jQuery.sap.log.debug("DataCollection.validateInputFieldChanges: bFirstTime = " + bFirstTime + ", sFromId = " + sFromId);

        var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("DataCollection.validateInputFieldChanges: view not found");
            return;
        }

        var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
        var selectedResource = util.Model.getData(util.ModelKey.SelectedResource);
        var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

        // first time in page - set initial values
        if (bFirstTime) {
            if (selectedOperation && selectedOperation != "") {
                var oInputControl = oView.byId("operationInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedOperation.toUpperCase());
                }
            }
            if (selectedResource && selectedResource != "") {
                var oInputControl = oView.byId("resourceInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedResource.toUpperCase());
                }
            }

            if (selectedTypeValue && selectedTypeValue !== "") {
                var oInputControl = oView.byId("collectionTypeInput");
                if (oInputControl) {
                    oInputControl.setValue("");
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

            this.setFieldFocus("collectionTypeInput");

        // else a change has occured
        } else {

            if (sFromId == "OperationBrowse") {
                if (selectedOperation && selectedOperation != "") {
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
                if (selectedResource && selectedResource != "") {
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

            if (sFromId == "CollectionTypeChange") {
                var oSelectControl = oView.byId("collectionType");
                if (oSelectControl) {
                    var oItem = oSelectControl.getSelectedItem();
                    if (oItem) {
                        var oData = oItem.getCustomData();
                        var sValue = undefined;
                        var sItemText = undefined;
                        if (oData) {
                            sValue = util.Model.getCustomDataValue(oData, "value");
                            sItemText = util.Model.getCustomDataValue(oData, "text");
                        }
                        if (!util.StringUtil.isBlank(sValue)) {
                            var newSelectedType = sValue.toUpperCase();
                            util.Model.setData(util.ModelKey.SelectedCollectionType, newSelectedType);

                            // type is changing, clear value field
                            if (selectedType != newSelectedType) {
                                var oInputControl = oView.byId("collectionTypeInput");
                                if (oInputControl) {
                                    if (!util.StringUtil.isBlank(sItemText)) {
                                        oInputControl.setPlaceholder(sItemText);
                                        oInputControl._$input.attr("placeholder", sItemText);
                                    }
                                    oInputControl.setValue("");
                                    util.Model.removeData(util.ModelKey.SelectedCollectionTypeValue);
                                    this.setFieldFocus("collectionTypeInput");
                                }
                            }
                        }
                    }
                }
            }

            if (sFromId == "CollectionValueChange") {
                var oInputControl = oView.byId("collectionTypeInput");
                if (oInputControl) {
                    var sValue = oInputControl.getValue();
                    if (!util.StringUtil.isBlank(sValue)) {
                        selectedTypeValue = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, selectedTypeValue);
                    }
                }
            }
        }

        // set state of collect button
        this.setCollectButtonState(oView);

        // set unsaved data flag
        this.checkUnsavedData();
    },

    setCollectButtonState : function(oView) {

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
            oInputControl = oView.byId("collectionTypeInput");
            if (oInputControl) {
                var sValue = oInputControl.getValue();
                if (util.StringUtil.isBlank(sValue)) {
                    bEnabled = false;
                }
            }
        }

        var oButtonControl = oView.byId("collectButton");
        if (oButtonControl) {
            oButtonControl.setEnabled(bEnabled);
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
                fromId : "DataCollection",
                fromNamespace : "com.sap.me.datacollection.view"
            }
        });
        this.setFieldFocus("collectionTypeInput");
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
                fromId : "DataCollection",
                fromNamespace : "com.sap.me.datacollection.view"
            }
        });
        this.setFieldFocus("collectionTypeInput");
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
        var oInputControl = oView.byId("collectionTypeInput");
        if (oInputControl) {
            oInputControl.setValue("");
        }
    },

    collectButtonTap : function(evt) {

        // save current view data
        this.saveModel();

        // collect the data
        com.sap.me.datacollection.view.DataCollectionHelper.collectData();
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
        this.exitProcessing();
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

        //oInputControl = oView.byId("collectionType");
        //if (oInputControl) {
        //    var oItem = oInputControl.getSelectedItem();
        //    if (oItem) {
        //        var oData = oItem.getCustomData();
        //        var sValue = undefined;
        //        if (oData) {
        //            sValue = util.Model.getCustomDataValue(oData, "value");
        //        }
        //        if (!util.StringUtil.isBlank(sValue)) {
        //            util.Model.setData(util.ModelKey.SelectedCollectionType, sValue.toUpperCase());
        //        }
        //    }
        //}

        //oInputControl = oView.byId("collectionTypeInput");
        //if (oInputControl) {
        //    var value = oInputControl.getValue();
        //    if (!util.StringUtil.isBlank(value)) {
        //        util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, value.toUpperCase());
        //    }
        //}

        // Save Common Settings
        util.Common.saveCommonSettings(oView.byId("collectionType"), oView.byId("collectionTypeInput"), oView.byId("operationInput"), oView.byId("resourceInput"));

    },

    exitProcessing : function() {
        this.oDcGroupList = undefined;
        util.Model.setUnsavedDataDefined(false);
        util.Model.removeData("DC_PROCESS_ALL_DC_GROUPS");
        util.Model.removeData("DC_AUTO_NEXT");
        util.Model.removeData("TEMPDC_PROCESS_ALL_DC_GROUPS");
        util.Model.removeData("TEMPDC_AUTO_NEXT");
        util.Model.removeData("TEMPDC_ENFORCE_GROUP_MODE");
        util.Model.removeData("TEMPDC_SHOW_APPLY_TO_ALL");
        util.Model.removeData(util.ModelKey.SelectedDCGroupList);
        sap.ui.getCore().setModel(undefined, "dcGroupsModel");
    }

});