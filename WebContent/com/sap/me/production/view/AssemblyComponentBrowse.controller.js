jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.sap.me.production.view.AssemblyHandler");

sap.ui.controller("com.sap.me.production.view.AssemblyComponentBrowse", {

    onInit : function() {
    },

    completedCallback: function (oData) {

    },

    validateInputFieldChanges: function (bFirstTime, sFromId) {
    },

    onAfterShow: function (evt) {
        this.validateInputFieldChanges(evt.firstTime, evt.fromId);
    },

    errorCallback: function (XMLHttpRequest, textStatus, errorThrown) {
        if (!XMLHttpRequest) {
            return;
        }
        if (!XMLHttpRequest.status) {
            return;
        }
        jQuery.sap.log.error("AssemblyComponentBrowse.errorCallback: The following problem occurred: " + textStatus, XMLHttpRequest.responseText + "," + XMLHttpRequest.status + "," + XMLHttpRequest.statusText);
        sap.m.MessageBox.alert("Error occured during request: " + textStatus);
    },

    onBeforeFirstShow: function (evt) {


    },

    // A Component was selected, save the values to the model.
    browseListTap: function (evt) {
        // TODO: Add to resource bundle
        var alreadyAssembled = util.I18NUtility.getLocaleSpecificText("ALREADY_ASSEMBLED.default.LABEL");   // "Invalid selection, component already assembled"

        var oSource = evt.getSource();
        if (oSource) {
            var sValue = oSource.data("alreadyAssembled");
            if (sValue === true) {
                    sap.m.MessageToast.show(alreadyAssembled, {
                    duration: 5000,
                    animationDuration: 500
                    });
                    return;
            }

            // Get the current Assembly Mode
            var currentMode = util.Model.getData("ASSEMBLY_MODE");
            // If Sequence, the findComponent is not visible.
            if (currentMode && (currentMode === "SEQUENCE" ) ) {
                // Force to the very first unassembled Component (set to index of 0)
            	util.Model.setData("SELECTED_COMPONENT_INDEX", 0);

                nextComponent = com.sap.me.production.view.AssyUtils.findNextUnassembledComponent(false, false);

                if (nextComponent && nextComponent !== undefined) {
                    util.Model.setData(util.ModelKey.SelectedComponent, nextComponent.component);
                    util.Model.setData(util.ModelKey.SelectedComponentRevision, nextComponent.componentRevision);
                    util.Model.setData(util.ModelKey.SelectedComponentDescription, nextComponent.description);
                    util.Model.setData(util.ModelKey.SelectedComponentQuantity, nextComponent.remainingQty);
                    util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, nextComponent.defaultQty);
                    util.Model.setData(util.ModelKey.SelectedAssemblyOperation, nextComponent.assemblyOperation);
                    util.Model.setData(util.ModelKey.SelectedComponentSequence, nextComponent.sequence);
                    
                    if (nextComponent.hasAssyData === true) {
                        util.Model.setData(util.ModelKey.SelectedHasAssyData, "TRUE");
                    } else {
                        util.Model.setData(util.ModelKey.SelectedHasAssyData, "FALSE");
                    }

                    util.Model.setUnsavedDataDefined(true);
                    var bus = sap.ui.getCore().getEventBus();
                    bus.publish("nav", "to", {
                        id: "AssemblyDataEntry",
                        data: {
                            namespace: "com.sap.me.production.view"
                        }
                    });
                    return;
                }
            } 


            sValue = oSource.data("component")
            jQuery.sap.log.debug("AssemblyComponentBrowse.browseListTap: Component = " + sValue);
            util.Model.setData(util.ModelKey.SelectedComponent, sValue);

            sValue = oSource.data("Version");
            if (sValue) {
                util.Model.setData(util.ModelKey.SelectedComponentRevision, sValue.toUpperCase());
            }
            sValue = oSource.data("Description");
            if (sValue)
            {
                util.Model.setData(util.ModelKey.SelectedComponentDescription, sValue);
            }

            sValue = oSource.data("Quantity");
            util.Model.setData(util.ModelKey.SelectedComponentQuantity, sValue);
            
            sValue = oSource.data("Sequence");
            util.Model.setData(util.ModelKey.SelectedComponentSequence, sValue);
            

            sValue = oSource.data("DefaultQuantity");
            util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, sValue);

            sValue = oSource.data("LotSize");
            util.Model.setData(util.ModelKey.SelectedLotSize, sValue);

            sValue = oSource.data("HasAssyData");
            if (sValue !== undefined)
            {
                if (sValue) {
                    util.Model.setData(util.ModelKey.SelectedHasAssyData, "TRUE");
                } else {
                    util.Model.setData(util.ModelKey.SelectedHasAssyData, "FALSE");
                }
            }

            sValue = oSource.data("AssemblyOperation");
            if (sValue) {
                util.Model.setData(util.ModelKey.SelectedAssemblyOperation, sValue);
            }

            // Set Selected Count if SEQUENCE Mode
            if (util.Model.getData("ASSEMBLY_MODE") !== "SEQUENCE") {
                var index =  oSource.data("Index");
                util.Model.setData("SELECTED_COMPONENT_INDEX", index);
            }
        }

        // Perform Rule Check
        var ruleOK = com.sap.me.production.view.AssyUtils.assemblyStateCheckOK();
        if (ruleOK === false) {
            return;
        }

        util.Model.setUnsavedDataDefined(true);

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id: "AssemblyDataEntry",
            data: {
                namespace: "com.sap.me.production.view"
            }
        });
    },

    onBeforeShow: function (evt) {
        jQuery.sap.log.debug("AssemblyComponentBrowse.onBeforeFirstShow: Entered method");
        com.sap.me.production.view.AssyUtils.clearSelectedFields();

        oView = this.getView();

        // Get List of Components
        var oComponentData = null;
		var component = undefined;
		if (util.Model.getData("SOURCE_PAGE") == "ASSEMBLE")
		{
			// Use the existing ComponentList
			oComponentData = util.Model.getData("COMPONENT_LIST");
			util.Model.setData("SOURCE_PAGE", undefined);
		} else {
			// Get the Component List
			component = com.sap.me.production.view.AssemblyHandler.getComponentList();
			util.Model.setData("COMPONENT_LIST", component);
		}
        
        
        // Sort the Component List
        oComponentData = com.sap.me.production.view.AssyUtils.sortComponentAssembledList();
        //  if Components are found
        if (oComponentData && oComponentData.length > 0) {
            componentCount = oComponentData.length;
            util.Model.setData("COMPONENT_LIST", oComponentData);
            util.Model.setData("COMPONENT_COUNT", componentCount);
        }

        // remove any existing model
        var oModel = sap.ui.getCore().getModel("componentsModel");
        if (oModel) {
            sap.ui.getCore().setModel(undefined, "componentsModel");
        }
        oModel = new sap.ui.model.json.JSONModel();
        
        // Create Components object and assign to the Component Data retrieved from the oData service call.
        var oComponents = {
            Components: oComponentData
        };

        // Set the data to the model
        oModel.setData(oComponents);
        // Set the model to core
        sap.ui.getCore().setModel(oModel, "componentsModel");

        // The Data is now assigned.
        var oListControl = this.getView().byId("componentBrowseList");
        if (oListControl) {
            oListControl.getBinding("items");
        }

        // Set Header Text for Label
        oControl = oView.byId("browseHeader");
        if (oControl) {
            var message = com.sap.me.production.view.AssyUtils.assemblyHeaderText();
            oControl.setText(message);
        }

        
    },

    closeTap: function () {

        // unsaved data? then prompt
        if (util.Model.isUnsavedDataDefined()) {

            var thisController = this;
            sap.m.MessageBox.show(
               util.I18NUtility.getLocaleSpecificText("ME_MOBILE.unsavedData.message.TEXT"),
               sap.m.MessageBox.Icon.QUESTION,
               util.I18NUtility.getLocaleSpecificText("ME_MOBILE.unsavedData.title.TEXT"),
               [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
               function (oAction) {
                   if (oAction) {
                       if (oAction === sap.m.MessageBox.Action.YES) {
                           com.sap.me.production.view.AssyUtils.clearAll();
                           var bus = sap.ui.getCore().getEventBus();
                           bus.publish("nav", "to", {
                               id: "Home"
                           });
                       }
                   }
               }
            );

            // no unsaved data - just return
        } else {            
            this.navButtonTap();
        }
    },

    navButtonTap: function (evt) {
        com.sap.me.production.view.AssyUtils.clearAll();
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id: "Assembly",
            data: {
                namespace: "com.sap.me.production.view"
            }
        });
    }

    });
