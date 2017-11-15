jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("util.SystemRules");
jQuery.sap.require("com.sap.me.control.Input");
jQuery.sap.require("com.sap.me.production.view.AssyUtils");
jQuery.sap.require("util.Common");

sap.ui.controller("com.sap.me.production.view.Assembly", {

    onInit: function () {
    },

    onBeforeShow : function(evt) {
        var oView = this.getView();
       

        // returning from DC Entry screen.  reset selections
        if (evt.fromId === "AssyDataEntry") {
            util.Model.removeData(util.ModelKey.SelectedDCGroupList);
        }

        if (!evt.data) {
            return;
        }
        
        // Set Defaults only on the first call
        if (evt.data.options !== undefined) {
            // Set the Default Rules for this Activity
            com.sap.me.production.view.AssyUtils.setDefaultRules();
        }

        // Get the Activity Rules and apply to the Model (Overrides the Default, if they exist).
        if (evt.data && evt.data.options && evt.data.options.length > 0) {
            for (var i = 0; i < evt.data.options.length; i++) {
                var option = evt.data.options[i];
                var bValue = false;
                if (option.value && (option.value === "YES" || option.value === "TRUE")) {
                    util.Model.setData(option.key, true);
                } else if (option.value && (option.value === "NO" || option.value === "FALSE")) {
                    util.Model.setData(option.key, false);
                } else if (option.value) {
                    util.Model.setData(option.key, option.value);
                }

                jQuery.sap.log.debug("Assembly.onBeforeShow: option(" + i + ").activityRef = " + option.activityRef + ", " + option.key + " = " + option.value);
            }
        }
        
        this.fromViewId = evt.fromId;
        this.pendingMessage = evt.data.pendingMessage;

        if (this.fromViewId === "Home") {
            if (!util.StringUtil.isBlank(evt.data.appName)) {                
                if (oView) {
                    oView.page.setTitle(evt.data.appName);
                }
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
            var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
            if (selectedType) {
                util.Model.setData(util.ModelKey.SelectedCollectionType + "_DEFAULT", selectedType);
            }
            var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
            if (selectedTypeValue) {
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue + "_DEFAULT", selectedTypeValue);
            }
        } 

        var oInputControl = oView.byId("collectionTypeInput");
        if (oInputControl) {
            if (util.Model.getData(util.ModelKey.SelectedCollectionTypeValue) === undefined || util.Model.getData(util.ModelKey.SelectedCollectionTypeValue) === null) {
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, "");                
            }
            //oInputControl.setValue(util.Model.getData(util.ModelKey.SelectedCollectionTypeValue));
            util.Model.setData("RESET_SFCALL", true);
        }        
      
    },

    /**
    * Set the Assembly Button State Correctly (Enabled or Disabled)
    **/
    setAssemblyButonState: function()
    {
        var oView = this.getView();
        var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
        var selectedResource = util.Model.getData(util.ModelKey.SelectedResource);

        var oInputControl = oView.byId("collectionTypeInput");
        if (oInputControl) {
            var oButtonControl = oView.byId("assemblyButton");
            if (oButtonControl) {
                if ( (selectedOperation && selectedOperation.length>0) && (selectedResource && selectedResource.length>0) )
                {
                    var sValue = oInputControl.getValue();
                    if (sValue && sValue.length>0)
                    {
                        oButtonControl.setEnabled(true);
                    } else {
                        oButtonControl.setEnabled(false);
                    }
                }
            }
        }
    },

    clearButtonTap: function () {

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

    /*
    * Set the field focus
    */
    setFieldFocus: function (focusField) {
        jQuery.sap.delayedCall(800, this, util.StringUtil.setFocus, [this.getView(), focusField]);
    },

    onAfterShow : function(evt) {
        var oView = this.getView();
        

        // returning from DC Entry screen - check for messages
        if (this.fromViewId === "AssyDataEntry") {
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
                            duration: 6000,
                            animationDuration: 500
                        });
                    }
                }
                this.pendingMessage = undefined;
            }
        }


        this.validateInputFieldChanges(evt.firstTime, this.fromViewId);        
        

        // Apply Common Settings
        util.Common.applyCommonSettings(oView.byId("collectionType"), oView.byId("collectionTypeInput"), oView.byId("operationInput"), oView.byId("resourceInput"));
        this.setAssemblyButonState();

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

    validateInputFieldChanges : function(bFirstTime, sFromId) {

        var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("assembly.validateInputFieldChanges: view not found");
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

            if (selectedTypeValue && selectedTypeValue != "") {
                var oInputControl = oView.byId("collectionTypeInput");
                if (oInputControl) {
                    oInputControl.setValue("");
                }
            }

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
                                }
                            }
                        }
                    }
                    this.setFieldFocus("collectionTypeInput");
                }
            }
            
            

            if (sFromId == "CollectionValueChange") {
                var oInputControl = oView.byId("collectionTypeInput");
                if (oInputControl) {
                    var sValue = oInputControl.getValue();
                    if (sValue) {
                        selectedTypeValue = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, selectedTypeValue);
                    }
                }
            }
        }

        var oInputControl = oView.byId("collectionTypeInput");
        if (oInputControl) {
            var oButtonControl = oView.byId("assemblyButton");
            if (oButtonControl) {
                var sValue = oInputControl.getValue();
                oButtonControl.setEnabled(true);
                if ( (!selectedOperation || selectedOperation == "") || (!sValue || sValue == "") ) {
                    oButtonControl.setEnabled(false);
                }
            }
        }

        if (bFirstTime) {
            var wsconfig = util.Model.getData(util.ModelKey.WorkstationConfiguration);
            if (wsconfig) {
                if (!wsconfig.operationCanBeChanged) {
                    var oInputControl = oView.byId("operationInput");
                    var oButtonControl = oView.byId("operationBrowseBtn");
                    if (oInputControl) {
                        oInputControl.setEditable(false);
                        oButtonControl.setVisible(false);
                    }
                }
                if (!wsconfig.resourceCanBeChanged) {
                    var oInputControl = oView.byId("resourceInput");
                    var oButtonControl = oView.byId("resourceBrowseBtn");
                    if (oInputControl) {
                        oInputControl.setEditable(false);
                        oButtonControl.setVisible(false);
                    }
                }
            }
        }

        // set unsaved data flag
        this.checkUnsavedData();
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
                fromId : "Assembly",
                fromNamespace : "com.sap.me.production.view"
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
                fromId : "Assembly",
                fromNamespace : "com.sap.me.production.view"
            }
        });
        this.setFieldFocus("collectionTypeInput");
    },

    /**
    * All Components Assembled Message
    **/
    allComponentsAssembledMessage: function() {
        var oProperties = jQuery.sap.properties();
        oProperties.setProperty("%OPERATION_BO.(2)%", util.Model.getData(util.ModelKey.SelectedOperation));
        var sMessage = util.I18NUtility.getErrorText("13096.simple", oProperties);
        sap.m.MessageToast.show(sMessage, {
            duration: 6000,
            animationDuration: 500
        });
    },

    assemblyButtonTap: function (evt) {
        // TODO: Use resource bunde for messages
        util.Model.setData("TEMP_ErrorPosted", false);
        com.sap.me.production.view.AssyUtils.clearSelectedFields();

        // Save the current model
        this.saveModel();

        util.Model.setData("RESET_SFCALL", true);

        // Verify Operation, Resource and Collection value is valid
        var valid = com.sap.me.production.view.AssyUtils.verifyValidValues();
        if (valid === false) {
            return;     // Don't proceed (invalid message will be displayed by method call)
        }

        // If the Activity rule is set to check the SFC Status (set as Active), then perform the check before proceeding.
        var sfcStatus = com.sap.me.production.view.AssyUtils.assemblyStatusCheckOK();
        if (sfcStatus === false) {
            return;     // Don't proceed (invalid message will be displayed by method call)
        }

        var currentMode = util.Model.getData("ASSEMBLY_MODE");
        if (currentMode && currentMode === "SEQUENCE") {

            // Find next Unassembled Component
            var component = com.sap.me.production.view.AssyUtils.findNextUnassembledComponent(true, false);

            // Check if all components have already been assembled            
            if (component === undefined) {
                if (util.Model.getData("TEMP_ErrorPosted") === false) {
                    //sap.m.MessageBox.alert(msgAllComponentsAssembled);
                    this.allComponentsAssembledMessage();
                }
                return;
            }

            // When in SEQUENCE mode, go direct to Assemble screen and show the findComponent list.
            // Load AssemblyComponent (allows component scan/selection)
            var bus = sap.ui.getCore().getEventBus();
            bus.publish("nav", "to", {
                id: "AssemblyDataEntry",
                data: {
                    namespace: "com.sap.me.production.view"
                }
            });
        } else {
            // Get the Component List
            var component = com.sap.me.production.view.AssemblyHandler.getComponentList();

            if (component === false) {
                return;
            }

            util.Model.setData("COMPONENT_LIST", component);
			util.Model.setData("SOURCE_PAGE", "ASSEMBLE");

            // Check if all components have already been assembled
            if (com.sap.me.production.view.AssyUtils.allComponentsAssembled() === true) {
                //sap.m.MessageBox.alert(msgAllComponentsAssembled);
                this.allComponentsAssembledMessage();
                return;
            }

            // Load AssemblyComponent (allows component scan/selection)
            var bus = sap.ui.getCore().getEventBus();
            bus.publish("nav", "to", {
                id: "AssemblyComponentBrowse",
                data: {
                    namespace: "com.sap.me.production.view"
                }
            });
        }

    	return;
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

    saveModel: function () {

        var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("saveModel: view not found");
            return;
        }

        util.Model.removeData(util.ModelKey.SelectedOperation);
        util.Model.removeData(util.ModelKey.SelectedResource);
        util.Model.removeData(util.ModelKey.SelectedCollectionType);
        util.Model.removeData(util.ModelKey.SelectedCollectionTypeValue);
        
        // Save Common Settings
        util.Common.saveCommonSettings(oView.byId("collectionType"), oView.byId("collectionTypeInput"), oView.byId("operationInput"), oView.byId("resourceInput"));

    },

    exitProcessing: function() {
        util.Model.setUnsavedDataDefined(false);
    }

});
