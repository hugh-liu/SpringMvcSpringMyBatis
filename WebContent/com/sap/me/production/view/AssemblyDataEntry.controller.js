jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.sap.me.production.view.AssemblyComponentConfigurator");
jQuery.sap.require("com.sap.me.production.view.AssyUtils");

sap.ui.controller("com.sap.me.production.view.AssemblyDataEntry", {

    onInit: function () {
        jQuery.sap.delayedCall(500, this, this.tabFiredCheck, null);
    },

    onBeforeFirstShow: function (evt) {

    },

    /**
    *  This method runs continously in the background, every 500 ms.
    *  It was necessary to allow the AssemblyComponentConfigurator (tab on last Assy Data Field) to be able to perform
    *  an Assembly 'Add' from within this class.  
    **/
    tabFiredCheck: function () {
        // Check if Fire on Tab should be triggered
        if (util.Model.getData("FIRE_ASSY_TAB_ADD") === true)
        {
            jQuery.sap.delayedCall(500, this, this.addButtonTap, null);
            util.Model.setData("FIRE_ASSY_TAB_ADD", false);
        }

        // Fire Parsing of Barcode
        if (util.Model.getData("FIRE_BARCODE_TAB") === true) {
            var barcodeString = util.StringUtil.encodeString(util.Model.getData("BARCODE_SCAN_TEXT"));
            this.populateBarcodeScanResult(barcodeString, true);            // Parse the Barcode and populate the fields accordingly
            util.Model.setData("BARCODE_SCAN_TEXT", undefined);             // Clear Barcode text
            util.Model.setData("FIRE_BARCODE_TAB", false);
        }

        jQuery.sap.delayedCall(500, this, this.tabFiredCheck, null);
    },

    /**
    * Update the page values
    **/
    updatePageValues: function(skipPressed) {
        // TODO: Replace with Resource values
        var component = util.I18NUtility.getLocaleSpecificText("component.default.LABEL")
        //var remainingQty = "Rem Qty";
        var remainingQty = util.I18NUtility.getLocaleSpecificText("REM_QTY.default.LABEL");
        var description = util.I18NUtility.getLocaleSpecificText("description.default.LABEL");
        qtyField = util.I18NUtility.getLocaleSpecificText("qty.default.LABEL");

        var oView = this.getView();

        // Get Header Values
        var selectedComponent = util.Model.getData(util.ModelKey.SelectedComponent);
        var selectedComponentRevision = util.Model.getData(util.ModelKey.SelectedComponentRevision);
        var selectedComponentDescription = util.Model.getData(util.ModelKey.SelectedComponentDescription);
        var selectedComponentQuantity = util.Model.getData(util.ModelKey.SelectedComponentQuantity);
        var selectedDefaultComponentQuantity = util.Model.getData(util.ModelKey.SelectedDefaultComponentQuantity);

        // Display (or not) All SFCs Checkbox
        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);              

        var oControl = oView.byId("componentHeaderLine1");
        if (oControl) {
            var headerLine1 = component + ": ";
            if (selectedComponent !== null) {
                headerLine1 = component + ": " + selectedComponent + "/" + selectedComponentRevision;
            }
            oControl.setText(headerLine1);
        }

        var qtyRemControl = oView.byId("cQtyRemaining");
        if (qtyRemControl) {
            var qtyRemaining = remainingQty + ": ";
            if (selectedComponentQuantity !== null) {
                qtyRemaining = remainingQty + ": " + com.sap.me.production.view.AssyUtils.formatDecimal(selectedComponentQuantity);
            }
            qtyRemControl.setText(qtyRemaining);
        }

        oControl = oView.byId("cHeaderLine2");
        if (oControl) {
            var headerLine2 = description + ": ";
            if (selectedComponentDescription !== null) {
                headerLine2 = description + ": " + selectedComponentDescription;
            }
            oControl.setText(headerLine2);
        }

        // Set Header Text for Label
        oControl = oView.byId("dataEntryHeader");
        if (oControl) {
            var message = com.sap.me.production.view.AssyUtils.assemblyHeaderComponent();
            oControl.setText(message);
        }
        
        // Determine if SKIP button is enabled
        var allowSkip = util.Model.getData("ALLOW_SKIP");
        oControl = oView.byId("skipButton");
        if (oControl) {
            if (allowSkip ===true && ((util.Model.getData("ASSEMBLY_MODE") === "SEQUENCE") || (util.Model.getData("ASSEMBLY_MODE") === "CHOOSE_AUTO_NEXT"))) {
                oControl.setVisible(true);
            } else {
                oControl.setVisible(false);
            }
        } else {
            oControl.setVisible(false);
        }

        // Set Text for Component Quantity
        var oEnterQty = oView.byId("componentHeaderQty");
        if (oEnterQty && selectedDefaultComponentQuantity !== null) {
            oEnterQty.setValue(com.sap.me.production.view.AssyUtils.formatDecimal(selectedDefaultComponentQuantity).toString());
        } else {
            oEnterQty.setValue("");
        }

        // Set Focus to findcomponent (if visible)
        var oFindComponent = oView.byId("findComponent");
        // If Choose, the findComponent is visible.
        if (oFindComponent && oFindComponent.getVisible() === true) {
            jQuery.sap.delayedCall(500, this, com.sap.me.production.view.AssyUtils.setFocus, [oView, "findComponentHeaderText"]);
        }

        oAssyDataFields = com.sap.me.production.view.AssemblyHandler.getAssyDataFields();

        // Auto Add on Tab NOT enabled
        util.Model.setData("ASSY_TAB_FIELD", undefined);
        util.Model.setData("ASSY_TAB_ENABLED", false);

        // add the data type fields
        var oDataEntryList = oView.byId("assemblyDataEntryList");
        if (oDataEntryList) {
            if (oDataEntryList.getItems() && oDataEntryList.getItems().length > 0) {
                oDataEntryList.destroyItems();
            }
            var oControlList = com.sap.me.production.view.AssemblyComponentConfigurator.getControls(oView, com.sap.me.production.view.AssemblyComponentConfigurator.fieldMapper(oAssyDataFields));
            if (oControlList && oControlList.length > 0) {
                var foundFirst = false;
                var foundControl = undefined;
                for (var i = 0; i < oControlList.length; i++) {
                    // Set focus to data field if available type found.
                    if (foundFirst === false) {
                        if (    oAssyDataFields[i].type === "TEXT"
                            ||  oAssyDataFields[i].type === "TEXT_AREA"
                            ||  oAssyDataFields[i].type === "NUMBER"
                            ||  oAssyDataFields[i].type === "TEXT_AREA") {
                            foundControl = oAssyDataFields[i];
                            foundFirst = true;
                        }
                    }
                    oDataEntryList.addItem(oControlList[i]);
                }

                // Set Focus to first relevant field
                if (foundFirst === true && foundControl !== undefined) {
                    jQuery.sap.delayedCall(200, this, com.sap.me.production.view.AssyUtils.setFocus, [oView, foundControl.name]);
                }
                util.Model.setData("TEMP_Assy_ComponentList", oAssyDataFields);
            }


            // If AutoAdd on Tabout is enabled, get the last field which will trigger the Add            
            if (util.Model.getData("AUTO_ADD_ON_TABOUT") === true) {
                // If Assembly Data Fields Exist
                var tabDataField = undefined;
                if (oAssyDataFields && oAssyDataFields.length > 0) {
                    // Find last Data Field that is "Auto-Add" enabled
                    for (var i = oAssyDataFields.length-1; i > -1; i--) {
                        if (    oAssyDataFields[i].type === "TEXT"
                            ||  oAssyDataFields[i].type === "TEXT_AREA"
                            ||  oAssyDataFields[i].type === "NUMBER"
                            ||  oAssyDataFields[i].type === "TEXT_AREA"
                            ) {
                            util.Model.setData("ASSY_TAB_FIELD", oAssyDataFields[i]);
                            util.Model.setData("ASSY_TAB_ENABLED", true);
                            break;
                        }
                    }
                }
            }

        }

        // Show the Barcode Field
        var barcodeEnabled = util.Model.getData("DISPLAY_BARCODE");
        if (barcodeEnabled === true) {
            this.showBarcode();
        } else {
            this.hideBarcode();
        }
    },

    /**
    * Lot size Check 
    * - If lotSize = 1, disable "All SFC" checkbox.
    * - Otherwise, enable it.
    **/
    lotSizeCheck: function (ignoreSfc) {
        var oView = this.getView();

        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

        var allSfcsHBox = oView.byId("allHBox");
        if (collectionType && collectionType !== "SFC") {
            allSfcsHBox.setVisible(true);
            var selectedLotSize = util.Model.getData(util.ModelKey.SelectedLotSize);
            if (selectedLotSize === "1") {
                // Disable if Lot Size is 1
                this.disableAllSfcs(true, ignoreSfc);
            } else {
                this.enableAllSfcs();
            }
        }
    },

    /**
    * Reset "All SFCs" state to checked.
    **/
    resetAllSfcs: function () {
        var oView = this.getView();

        var allSfcsHBox = oView.byId("allHBox");
        allSfcsHBox.setVisible(false);
        util.Model.setData("ALL_SFC_INDEX", 0);
        util.Model.setData("ALL_SFC_LIST", undefined);
        util.Model.setData("ALL_SFC_ENABLED", true);
        util.Model.setData("TEMP_SelectedCollectionValue", undefined);
        util.Model.setData("TEMP_SelectedCollectionType", undefined);
    },

    disableAllSfcs: function(forceSfcUpdate, ignoreGetSfc) {
        var oView = this.getView();

        if (oView) {
            var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
            var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

            var allSfcsHBox = oView.byId("allHBox");
            if (collectionType && collectionType !== "SFC") {
                // Process Lot or Shop Order Selected
                var allSfcs = oView.byId("allCheckBox");
                if (allSfcs) {
                    // Get List of SFC's for SO/PL
                    if (forceSfcUpdate === true) {
                        util.Model.setData("TEMP_SelectedCollectionType", undefined);
                        var oSfcs = com.sap.me.production.view.AssemblyHandler.getSfcs(collectionType, collectionValue);
                        // Set Current Index for SFC in List
                        util.Model.setData("ALL_SFC_INDEX", 0);
                        util.Model.setData("ALL_SFC_LIST", oSfcs);
                    }
                    allSfcsHBox.setVisible(true);
                    allSfcs.setEnabled(false);
                    allSfcs.setSelected(false);
                    var allSfcsItem = oView.byId("allSfcItem");
                    allSfcsItem.setVisible(true);
                    util.Model.setData("TEMP_AssemblyDataEntryView", oView);
                    util.Model.setData("ALL_SFC_ENABLED", false);
                    util.Model.setData("TEMP_SelectedCollectionType", "SFC");


                    if (ignoreGetSfc === false) {                        
                        com.sap.me.production.view.AssyUtils.setText(oView, "allSfcSFC", this.getAllSfcCurrentSfc(false));
                    }
                }
            } else {
                // SFC Selected
                var allSfcsItem = oView.byId("allSfcItem");
                if (allSfcsItem) {
                    allSfcsItem.setVisible(false);
                }
                var allSfcs = oView.byId("allCheckBox");
                if (allSfcs) {
                }
                allSfcsHBox.setVisible(false);               
                util.Model.setData("ALL_SFC_INDEX", undefined);
                util.Model.setData("ALL_SFC_LIST", undefined);
                util.Model.setData("ALL_SFC_ENABLED", true);
                util.Model.setData("TEMP_SelectedCollectionValue", undefined);
                util.Model.setData("TEMP_SelectedCollectionType", undefined);
            }
        }
    },

    enableAllSfcs: function() {
        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

        var oView = this.getView();

        if (oView) {
            var allSfcsHBox = oView.byId("allHBox");
            if (collectionType && collectionType !== "SFC") {
                var allSfcs = oView.byId("allCheckBox");
                allSfcs.setEnabled(true);
                allSfcs.setSelected(true);
                allSfcsHBox.setVisible(true);
                var allSfcsItem = oView.byId("allSfcItem");
                allSfcsItem.setVisible(false);
                // Get List of SFC's for SO/PL
                util.Model.setData("TEMP_SelectedCollectionType", undefined);
                var oSfcs = com.sap.me.production.view.AssemblyHandler.getSfcs(collectionType, collectionValue);
                if (oSfcs) {
                    // Set Current Index for SFC in List
                    util.Model.setData("ALL_SFC_INDEX", 0);
                    util.Model.setData("ALL_SFC_LIST", oSfcs);
                    util.Model.setData("ALL_SFC_ENABLED", true);
                    util.Model.setData("TEMP_AssemblyDataEntryView", oView);
                }
            } else {
                allSfcsHBox.setVisible(false);
                util.Model.setData("ALL_SFC_INDEX", undefined);
                util.Model.setData("ALL_SFC_LIST", undefined);
                util.Model.setData("ALL_SFC_ENABLED", true);
                util.Model.setData("TEMP_SelectedCollectionValue", undefined);
                util.Model.setData("TEMP_SelectedCollectionType", undefined);
            }
        }
    },

    /**
    * All SFCs checkbox disabled
    * This function is invoked when the user clicks the Checkbox (De-Selects the "All SFCs")
    */
    allCheckBoxChange: function (forceChecked) {
        var oView = this.getView();
        var allSfcs = oView.byId("allCheckBox");
        var allSfcsChecked = allSfcs.getSelected();
        if (allSfcs && allSfcsChecked === false) {
            this.disableAllSfcs(true, false);
            this.updatePageValues(false);         
        } 

        // Force this Selection
        if (forceChecked === true) {
            this.enableAllSfcs();
            this.updatePageValues(false);
        }
        
    },


    /**
    * Returns the current SFC
    **/
    getAllSfcCurrentSfc: function (skipNext) {
        var bAllSfcMode = util.Model.getData("ALL_SFC_ENABLED");
        
        var oSfcs = util.Model.getData("ALL_SFC_LIST");
        var currentIndex = util.Model.getData("ALL_SFC_INDEX");
        if (oSfcs && oSfcs.length > 0) {
            if (skipNext === true) {
                currentIndex = currrentIndex + 1;
                if (currentIndex < oSfcs.length) {
                    var currentSfc = "";
                    if (util.Model.getData("ASSEMBLY_MODE") !== "CHOOSE" && util.Model.getData("ASSEMBLY_MODE") !== "CHOOSE_AUTO_NEXT") {
                        currentSfc = com.sap.me.production.view.AssyUtils.getNextSfcToAssemble(true);
                    } else {
                        currentSfc = com.sap.me.production.view.AssyUtils.getNextSfcToAssemble(false);
                    }
                    util.Model.setData("TEMP_SelectedCollectionValue", currentSfc);
                    return currentSfc;
                } else {
                    util.Model.setData("ALL_SFC_INDEX", undefined);
                    util.Model.setData("TEMP_SelectedCollectionValue", undefined);
                    return undefined;
                }
            } else {
                // Get Current SFC
                var currentSfc = "";
                if (util.Model.getData("ASSEMBLY_MODE") !== "CHOOSE" && util.Model.getData("ASSEMBLY_MODE") !== "CHOOSE_AUTO_NEXT") {
                    currentSfc = com.sap.me.production.view.AssyUtils.getNextSfcToAssemble(true);
                } else {
                    currentSfc = com.sap.me.production.view.AssyUtils.getNextSfcToAssemble(false);
                }
                util.Model.setData("TEMP_SelectedCollectionValue", currentSfc);
                return currentSfc;
            }
        } else {
            util.Model.setData("ALL_SFC_INDEX", undefined);
            util.Model.setData("TEMP_SelectedCollectionValue", undefined);
            return undefined;
        }

    },


    onBeforeShow: function (evt) {

        // TODO: Replace with Resource values
        component = util.I18NUtility.getLocaleSpecificText("component.default.LABEL");
        //remainingQty = "Rem Qty";
        remainingQty = util.I18NUtility.getLocaleSpecificText("QTY_REMAINING.default.LABEL");
        description = util.I18NUtility.getLocaleSpecificText("description.default.LABEL");;
        qtyField = util.I18NUtility.getLocaleSpecificText("qty.default.LABEL");

        // TODO: Replace these with Resource values
        msgComponentRequired = util.I18NUtility.getErrorText("12911.simple"); // "Component required";
        msgRevisionRequired = util.I18NUtility.getErrorText("12912.simple"); // "Revision required"
        msgQuantityRequired = util.I18NUtility.getErrorText("12908.simple");// "Quantity required";
        msgComponentAdded = util.I18NUtility.getLocaleSpecificText("assembled.richAssyPt.MESSAGE"); //"Component assembled";
        msgMultipleAdded = util.I18NUtility.getLocaleSpecificText("assemblyComplete.assyPt.MESSAGE"); // "All components assembled";
        msgComponentAssembled = util.I18NUtility.getLocaleSpecificText("COMPONENT_ASSEMBLED_SFCS.default.LABEL"); // "Component assembled on %SFCS% SFC(s)";
        msgComponentNotFound = util.I18NUtility.getLocaleSpecificText("COMPONENT_NOT_FOUND.default.TEXT"); //"Component or revision not found";
        msgComponentsAlreadyAssembled = util.I18NUtility.getLocaleSpecificText("COMPONENT_ALREADY_ASSEMBLED.default.TEXT");     //"Components previously assembled, nothing done";
        
        // Reset the SFC All checkbox
        if (util.Model.getData("RESET_SFCALL") === true) {
            this.resetAllSfcs();
            var oView = this.getView();
            allSfcs = oView.byId("allSfcItem");
            allSfcs.setVisible(false);
            util.Model.setData("RESET_SFCALL", false);  // Reset to False
        }

        buttonNext = "Next";       

        this.fromViewId = evt.fromId;
        util.Model.removeData("TEMP_Assy_ComponentList");

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("AssemblyDataEntry.onBeforeShow: view for controller not defined");
            return;
        }

        if (evt.data && evt.data.context) {
            oView.setBindingContext(evt.data.context);
        }

        if ("to" === evt.direction && evt.data && evt.data.appName) {
            oView.page.setTitle(evt.data.appName);
        }

        // Get the current Assembly Mode
        var currentMode = util.Model.getData("ASSEMBLY_MODE");
        var oFindComponent = oView.byId("findComponent");
        // findComponent is not visible until after Assembly.
        if (oFindComponent) {
            oFindComponent.setVisible(false);
        }
        this.lotSizeCheck(false);
        this.updatePageValues(false);

    },

    fieldChange: function(oControlEvent) {
        var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("AssemblyDataEntry.fieldChange: view not found");
            return;
        }
    },

    /**
    *  This will clear the header information.  Intended for "CHOOSE" mode.
    */
    clearHeaderValues: function () {
        // Clear Fields
        com.sap.me.production.view.AssyUtils.setValue(this.getView(), "componentHeaderQty", "");
        com.sap.me.production.view.AssyUtils.setText(this.getView(), "cQtyRemaining", remainingQty + ":");
        com.sap.me.production.view.AssyUtils.setText(this.getView(), "componentHeaderLine1", component + ":");
        com.sap.me.production.view.AssyUtils.setText(this.getView(), "cHeaderLine2", description + ":");

        this.clearAssemblyDataEntryList();
    },

    clearAssemblyDataEntryList: function() {
        // Clear the data type fields
        var oView = this.getView();
        var oDataEntryList = oView.byId("assemblyDataEntryList");
        if (oDataEntryList) {
            if (oDataEntryList.getItems() && oDataEntryList.getItems().length > 0) {
                oDataEntryList.destroyItems();
            }
        }
    },

    /**
    Event invoked on a Barcode Scan (with Enter)
    **/
    barcodeKeyEvent: function (oControlEvent) {
        var barcodeString = oControlEvent.mParameters.newValue;
        this.populateBarcodeScanResult(util.StringUtil.encodeString(barcodeString), false);       
    },

    /**
    * Tab on Barcode pressed
    **/
    barcodeTabPressed: function (evt)
    {
        // Resulting Field Value is similar to:
        var barcodeString = evt.srcElement.value;

        if (barcodeString && barcodeString.length > 0) {
            util.Model.setData("BARCODE_SCAN_TEXT", barcodeString);
            util.Model.setData("FIRE_BARCODE_TAB", true);
        }
    },

    getControlIndex: function(oAssyDataFields, searchControl)
    {
        var returnIndex = -1;

        for (var i = 0; i < oAssyDataFields.length; i++) {
            if (oAssyDataFields[i].name === searchControl) {
                return i;
            }

        }

        return returnIndex;

    },

    /**
    * Parse the Barcode scan results and populate the associated fields (if they exist).
    **/
    populateBarcodeScanResult: function(barcodeString, forced)
    {
        var oView = this.getView();

        // A barcode was found
        if (barcodeString && !util.StringUtil.isBlank(barcodeString)) {
            var enterPressed = barcodeString.indexOf("\n");
            var encodedEnterPressed = barcodeString.indexOf("%0a");

            if (enterPressed > -1 || encodedEnterPressed > -1 || forced === true) {

                // Strip off the Enter Key press
                if (encodedEnterPressed > -1)
                {
                    barcodeString = barcodeString.replace("%0a", "");
                }
                // Parse the Barcode String
                var oBarcodeDataFields = com.sap.me.production.view.AssemblyHandler.parseBarcode(barcodeString);

                // No parsing took place, just exit.
                if (oBarcodeDataFields === false) {
                    return;
                }

                // Populate Fields
                var oAssyDataFields = com.sap.me.production.view.AssemblyHandler.getAssyDataFields();
                if (oBarcodeDataFields && oBarcodeDataFields.length > 0) {
                    for (i = 0; i < oBarcodeDataFields.length; i++) {
                        var oInputControl = oView.byId(oBarcodeDataFields[i].dataField);
                        if (oInputControl) {

                            // If a Checkbox
                            if (oAssyDataFields[this.getControlIndex(oAssyDataFields, oBarcodeDataFields[i].dataField)].type === com.sap.me.production.view.DataType.CHECKBOX)
                            {
                                var fieldValue = oBarcodeDataFields[i].value;
                                if (fieldValue !== null && fieldValue.length>0)
                                {
                                    // Set Selected Value to Checked / Unchecked
                                    if (fieldValue.toUpperCase() === "TRUE" || fieldValue.toUpperCase() === "1" || fieldValue.toUpperCase() === "CHECKED")
                                    {
                                        oInputControl.setSelected(true);
                                    } else
                                    {
                                        oInputControl.setSelected(false);
                                    }
                                }
                            } // If a List
                            else if (oAssyDataFields[this.getControlIndex(oAssyDataFields, oBarcodeDataFields[i].dataField)].type === com.sap.me.production.view.DataType.LIST) {
                                var fieldValue = oBarcodeDataFields[i].value;
                                var items = oInputControl.getItems();

                                for (s=0; s<items.length; s++)
                                {
                                    var oData = items[s].getCustomData();
                                    if (oData && oData.length > 0) {
                                        oValue = oData[0].getValue();

                                        if (oValue === fieldValue) {
                                            oInputControl.setSelectedItem(items[s]);
                                        }
                                    }
                                }
                            } else
                            {
                                oInputControl.setValue(oBarcodeDataFields[i].value);
                            }   
                        }
                    }
                }

                // Clear the text
                var oInputControl = oView.byId("barcodeHeaderText");
                if (oInputControl) {
                    oInputControl.setValue("");
                }
            }
        }
    },

    /**
    * find Component (ENTER) was invoked
    **/
    findComponentKeyEvent: function (oControlEvent) {
        var componentToSearch = oControlEvent.mParameters.newValue;

        // A Component was found
        if (componentToSearch && !util.StringUtil.isBlank(componentToSearch)) {
            var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
            var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

            // Get Revision
            var selectedComponentRevision ="#";

            // Get Quantity
            var oInputControl = oView.byId("componentHeaderQty");
            var selectedComponentQuantity;

            // Get Component
            var selectedComponent = componentToSearch;

            // Uppercase the Component
            if (selectedComponent) {
                selectedComponent = selectedComponent.toUpperCase();
            }

            // Find Component in the List
            var oComponent = com.sap.me.production.view.AssyUtils.findComponent(selectedComponent, selectedComponentRevision);

            // A Component was found (set Description and Assembly type)
            if (oComponent) {
                // Check if already assembled
                if (oComponent.displayAssembled === true) {
                    var message = util.I18NUtility.getErrorText("13659.simple");
                    sap.m.MessageBox.alert(message);
                    com.sap.me.production.view.AssyUtils.setValue(this.getView(), "findComponentHeaderText", "");
                    return;
                }

                currentComponentIndex = oComponent.index;
                util.Model.setData("SELECTED_COMPONENT_INDEX", oComponent.index);
                util.Model.setData(util.ModelKey.SelectedComponent, selectedComponent);
                util.Model.setData(util.ModelKey.SelectedComponentRevision, oComponent.componentRevision);
                util.Model.setData(util.ModelKey.SelectedComponentDescription, oComponent.description);
                util.Model.setData(util.ModelKey.SelectedComponentQuantity, oComponent.remainingQty);
                util.Model.setData(util.ModelKey.SelectedComponentSequence, oComponent.sequence);
                util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, com.sap.me.production.view.AssemblyHandler.calculateQtyEntryField(oComponent.assembledQty, oComponent.qtyToAssemble, oComponent.lotSize));
                util.Model.setData(util.ModelKey.SelectedLotSize, oComponent.lotSize);
                util.Model.setData(util.ModelKey.SelectedAssemblyOperation, oComponent.assemblyOperation);
                
                

                // Set Assembly Selection and Button Text
                // var oControl = oView.byId("assemblyButton");
                if (oComponent.hasAssyData) {
                    util.Model.setData(util.ModelKey.SelectedHasAssyData, "TRUE");
                } else {
                    util.Model.setData(util.ModelKey.SelectedHasAssyData, "FALSE");
                }

                com.sap.me.production.view.AssyUtils.setValue(this.getView(), "findComponentHeaderText", "");
                this.lotSizeCheck(false);
                this.updatePageValues(false);
                return;
            } else {
                sap.m.MessageBox.alert(msgComponentNotFound);
                return false;
            }
        }
    },


    onAfterShow: function (evt) {

    },

    closeTap: function () {

        // unsaved data? then prompt
        if (util.Model.isUnsavedDataDefined()) {

            var thisController = this;
            this.resetAllSfcs();        // Reset All SFCs Settings
            
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
            var bus = sap.ui.getCore().getEventBus();
            bus.publish("nav", "to", {
                id: "Home"
            });
        }
    },

    /**
    * Show Find Component
    **/
    showFindComponent: function()
    {
        var oView = this.getView();
        // Allow Scan
        var oFindComponent = oView.byId("findComponent");
        // If Choose, the findComponent is visible.
        if (oFindComponent) {
            oFindComponent.setVisible(true);
            jQuery.sap.delayedCall(500, this, com.sap.me.production.view.AssyUtils.setFocus, [oView, "findComponentHeaderText"]);
        }
        
    },

    /**
    * Show Barcode
    **/
    showBarcode: function () {
        var oView = this.getView();
        // Allow Scan
        var oBarcode = oView.byId("barcode");
        // Barcode is visible.
        if (oBarcode) {
            oBarcode.setVisible(true);
            var oBarcodeField = oView.byId("barcodeHeaderText");
            if (oBarcodeField) {
                oBarcodeField.onsaptabnext = this.barcodeTabPressed;
                oBarcodeField.setValue("");
            }
            jQuery.sap.delayedCall(500, this, com.sap.me.production.view.AssyUtils.setFocus, [oView, "barcodeHeaderText"]);
        }

    },

    /**
    * Hide Barcode
    **/
    hideBarcode: function() {
        var oView = this.getView();
        // Allow Scan
        var oBarcode = oView.byId("barcode");
        // Barcode is visible.
        if (oBarcode) {
            oBarcode.setVisible(false);
        }
    },

    addButtonTap: function (evt) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("AssemblyDataEntry.addButtonTap: view for controller not defined");
            return;
        }
        
        var oDataValues = undefined;

        // Get Qty to assemble from Field
        var oEnterQty = oView.byId("componentHeaderQty");
        if (oEnterQty) {
            util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, oEnterQty.getValue());
            var selectedComponentQuantity = util.Model.getData(util.ModelKey.SelectedComponentQuantity);
            var remainingQty = com.sap.me.production.view.AssyUtils.formatDecimal(selectedComponentQuantity);
            var checkValidNumber = com.sap.me.production.view.AssyUtils.validateNumber(util.Model.getData(util.ModelKey.SelectedDefaultComponentQuantity), qtyField, remainingQty);

            if (checkValidNumber === false) {
                return;
            }
        }


        // Send oData Request to Assemble the Component
        var selectedHasAssyData = util.Model.getData(util.ModelKey.SelectedHasAssyData);
        if (selectedHasAssyData === "TRUE") {

            var oAssyDataList = util.Model.getData("TEMP_Assy_ComponentList");
            if (!oAssyDataList) {
                //  17214.simple=Data to Collect list is missing
                var message = util.I18NUtility.getErrorText("17214.simple");
                sap.m.MessageBox.alert(message);
                return;
            }

            // Get Assembly Data Values
            try{
                oDataValues = com.sap.me.production.view.AssemblyComponentConfigurator.getDataValues(oView, oAssyDataList);
            } catch (err) {
                jQuery.sap.log.error(err.message);
                sap.m.MessageBox.alert(err.message);
                return;
            }

            // Create JSON String of assembly Data Values
            if (oDataValues) {
                util.Model.setData(util.ModelKey.SelectedAssemblyData, oDataValues);
            } else {
                util.Model.removeData(util.ModelKey.SelectedAssemblyData);
                return;
            }
        }

        // Assemble the Components
        var assyResult = com.sap.me.production.view.AssemblyHandler.assembleComponent();
        // Update Assemly Component Model 
        if (assyResult && assyResult > 0) {
            com.sap.me.production.view.AssyUtils.updateAssembledComponentModel(util.Model.getData(util.ModelKey.SelectedComponent), util.Model.getData(util.ModelKey.SelectedDefaultComponentQuantity));
        }

        // Set the correct Collection Type
        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var areAllComponentsAssembled = false;
        if (collectionType !== "SFC") {
	        var savedCollectionType = util.Model.getData("TEMP_SelectedCollectionType");    // Save current Collection Type
	        util.Model.setData("TEMP_SelectedCollectionType", collectionType);
	        
	        // Get the Component List
	        var component = com.sap.me.production.view.AssemblyHandler.getComponentList();
	        util.Model.setData("AFTER_ASSY_COMPONENT_LIST", component);
	        
	        // Restore the Collection Type
	        util.Model.setData("TEMP_SelectedCollectionType", savedCollectionType);
	        // Check if All Components are Assembled.
	        areAllComponentsAssembled = com.sap.me.production.view.AssyUtils.allComponentsAssembledNotSfc();

        } else {
        	// Get the Component List
	        var component = com.sap.me.production.view.AssemblyHandler.getComponentList();
	        util.Model.setData("COMPONENT_LIST", component);
        	areAllComponentsAssembled = com.sap.me.production.view.AssyUtils.allComponentsAssembled();
        }
        
        // Check if Assembly was successful (if not an error will be displayed by the assembleComponent() )
        if (assyResult || assyResult === 0) {

            this.clearAssemblyDataEntryList();

            // ** Handle "All SFCs" Checkbox selection.
            // If allSfcsProcessed returns 'undefined', then this functionality is not applicable (and is skipped)
            var response = undefined;
            if (util.Model.getData(util.ModelKey.SelectedCollectionType) !== "SFC") {                
                response = com.sap.me.production.view.AssyUtils.getNextSfcComponentToAssemble(true, false);

                // If all SFCs option is enabled and all have been processed
                if (areAllComponentsAssembled === true) {
                    sap.m.MessageToast.show(msgMultipleAdded, {
                        duration: 6000,
                        animationDuration: 500
                    });

                    // They have, so clear and return to Assembly screen
                    // Clear Header
                    this.clearHeaderValues();
                    com.sap.me.production.view.AssyUtils.clearSelectedFields();
                    util.Model.setUnsavedDataDefined(false);
                    com.sap.me.production.view.AssyUtils.clearAll();
                    var bus = sap.ui.getCore().getEventBus();
                    bus.publish("nav", "to", {
                        id: "Assembly",
                        data: {
                            namespace: "com.sap.me.production.view"
                        }
                    });
                    return;
                } else if (response.allComponentsAssembled === false) {

                    // If Component has changed, perform Lot Size Check
                    if (response.currentComponent != response.nextComponent.component) {
                        this.lotSizeCheck(false);
                    }

                    // Assign Component List
                    if (response.currentComponentList !== undefined) {
                        util.Model.setData("COMPONENT_LIST", response.currentComponentList);
                    }

                    // More Components / SFCs left to assemble
                    if (response.nextSfc !== undefined) {                        
                        util.Model.setData("TEMP_SelectedCollectionValue", response.nextSfc);                        
                        com.sap.me.production.view.AssyUtils.setText(oView, "allSfcSFC", response.nextSfc);
                    }


                    // Clear Component Details
                    if (util.Model.getData("ASSEMBLY_MODE") === "CHOOSE" ) {                        
                        if (response.currentComponent !== response.nextComponent.component) {
                            // Clear Header
                            this.clearHeaderValues();
                            com.sap.me.production.view.AssyUtils.clearSelectedFields();
                            util.Model.setUnsavedDataDefined(false);                            
                            this.updatePageValues(false);                   // Update with the next SFC+Component to assemble
                            this.showFindComponent();
                        } else {
                        	this.updatePageValues(false);                   // Update with the next SFC+Component to assemble
                        }
                    } else if (util.Model.getData("ASSEMBLY_MODE") === "CHOOSE_AUTO_NEXT") {                        
                        com.sap.me.production.view.AssyUtils.setFocus(oView, "findComponentHeaderText");
                        this.updatePageValues(false);                   // Update with the next SFC+Component to assemble        
                        this.showFindComponent();
                        util.Model.setUnsavedDataDefined(false);
                    } else {
                        this.updatePageValues(false);                   // Update with the next SFC+Component to assemble
                    }

                    // Display Component(s) assembled message
                    sap.m.MessageToast.show(msgComponentAssembled.replace("%SFCS%", assyResult), {
                        duration: 6000,
                        animationDuration: 500
                    });

                    return;
                }
            }

            // If Choose, show findComponent
            if (util.Model.getData("ASSEMBLY_MODE") === "CHOOSE" || util.Model.getData("ASSEMBLY_MODE") === "CHOOSE_AUTO_NEXT") {

                // Clear Header
                this.clearHeaderValues();
                com.sap.me.production.view.AssyUtils.clearSelectedFields();
                util.Model.setUnsavedDataDefined(false);
                // Allow Scan
                this.showFindComponent();
            }

            // If Automatic Select of Next Component is Enabled
            if (util.Model.getData("ASSEMBLY_MODE") === "CHOOSE_AUTO_NEXT" || util.Model.getData("ASSEMBLY_MODE") === "SEQUENCE") {                

                // If there were any Skipped components
                var currentComponentIndex = util.Model.getData("SELECTED_COMPONENT_INDEX");
                var oComponentData = util.Model.getData("COMPONENT_LIST");
                if ( (oComponentData && oComponentData.length > 0) && (currentComponentIndex + 1 === oComponentData.length)) {
                    util.Model.setData("SELECTED_COMPONENT_INDEX", 0);
                }

                if (util.Model.getData(util.ModelKey.SelectedCollectionType) !== "SFC") {
                    // If PL/SFC
                    nextComponent = response.nextComponent;
                }
                else {
                    // If SFC
                    nextComponent = com.sap.me.production.view.AssyUtils.findNextUnassembledComponent(false, false);
                }

                if (nextComponent && nextComponent !== undefined ) {
                    util.Model.setData(util.ModelKey.SelectedComponent, nextComponent.component);
                    util.Model.setData(util.ModelKey.SelectedComponentRevision, nextComponent.componentRevision);
                    util.Model.setData(util.ModelKey.SelectedComponentDescription, nextComponent.description);
                    util.Model.setData(util.ModelKey.SelectedComponentQuantity, nextComponent.remainingQty);
                    util.Model.setData(util.ModelKey.SelectedComponentSequence, nextComponent.sequence);
                    util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, com.sap.me.production.view.AssemblyHandler.calculateQtyEntryField(nextComponent.assembledQty, nextComponent.qtyToAssemble, nextComponent.lotSize));
                    util.Model.setData(util.ModelKey.SelectedLotSize, nextComponent.lotSize);
                    util.Model.setData(util.ModelKey.SelectedAssemblyOperation, nextComponent.assemblyOperation);
                    
                    if (nextComponent.hasAssyData === true) {
                        util.Model.setData(util.ModelKey.SelectedHasAssyData, "TRUE");
                    } else {
                        util.Model.setData(util.ModelKey.SelectedHasAssyData, "FALSE");
                    }

                    this.lotSizeCheck(false);
                    util.Model.setUnsavedDataDefined(true);
                    this.updatePageValues(false);
                    // Show Component Assembled
                    sap.m.MessageToast.show(msgComponentAssembled.replace("%SFCS%", assyResult), {
                        duration: 6000,
                        animationDuration: 500
                    });
                    return;
                } else {

                    // Next Component wasn't found, return to assembly.
                    com.sap.me.production.view.AssyUtils.clearSelectedFields();
                    util.Model.setUnsavedDataDefined(false);
                    com.sap.me.production.view.AssyUtils.clearAll();
                    var bus = sap.ui.getCore().getEventBus();
                    bus.publish("nav", "to", {
                        id: "Assembly",
                        data: {
                            namespace: "com.sap.me.production.view"
                        }
                    });
                }

            } else {
                // Clear previous Component Values
                var lastViewId = this.fromViewId;
                if (lastViewId) {
                    com.sap.me.production.view.AssyUtils.clearSelectedFields();
                }
            }

            // No components assembled as they were previously already assembled.
            if (assyResult === 0) {
                sap.m.MessageToast.show(msgComponentsAlreadyAssembled, {
                    duration: 6000,
                    animationDuration: 500
                });
                return;
            }

            // Check if All components have been assembled
            if ( areAllComponentsAssembled === true) {
                sap.m.MessageToast.show(msgMultipleAdded, {
                    duration: 6000,
                    animationDuration: 500
                });

                // They have, so clear and return to Assembly screen
                com.sap.me.production.view.AssyUtils.clearSelectedFields();
                util.Model.setUnsavedDataDefined(false);
                com.sap.me.production.view.AssyUtils.clearAll();
                var bus = sap.ui.getCore().getEventBus();
                bus.publish("nav", "to", {
                    id: "Assembly",
                    data: {
                        namespace: "com.sap.me.production.view"
                    }
                });
            } else {
                sap.m.MessageToast.show(msgComponentAssembled.replace("%SFCS%", assyResult), {
                    duration: 6000,
                    animationDuration: 500
                });
            }
        }
        

    },

    clearButtonTap: function () {
        com.sap.me.production.view.AssyUtils.setValue(this.getView(), "componentHeaderQty", "");

        var oComponentList = util.Model.getData("TEMP_Assy_ComponentList");
        if (!oComponentList) {
            return;
        }

        try {
            com.sap.me.production.view.AssemblyComponentConfigurator.clearControls(this.getView(), oComponentList);           
        } catch (err) {
            jQuery.sap.log.error(err.message);
            sap.m.MessageToast.show(err.message, {
                duration: 6000,
                animationDuration: 500
            });
            return;
        }
    },

    /**
    * Skip Button was pressed
    **/
    skipButtonTap: function () {
        var oView = this.getView();

        // If there were any Skipped components
        var currentComponentIndex = util.Model.getData("SELECTED_COMPONENT_INDEX");
        var oComponentData = util.Model.getData("COMPONENT_LIST");
        if ((oComponentData && oComponentData.length > 0) && (currentComponentIndex + 1 === oComponentData.length)) {
            util.Model.setData("SELECTED_COMPONENT_INDEX", -1);
        }

        var nextComponent = undefined;

        // If PL/SO
        if (util.Model.getData(util.ModelKey.SelectedCollectionType) !== "SFC") {
            var response = com.sap.me.production.view.AssyUtils.getNextSfcComponentToAssemble(true, true);

            // Assign Component List
            if (response.currentComponentList !== undefined) {
                util.Model.setData("COMPONENT_LIST", response.currentComponentList);
            }

            // If Component has changed, perform Lot Size Check
            this.lotSizeCheck(true);


            if (util.Model.getData("ASSEMBLY_MODE") === "CHOOSE_AUTO_NEXT" || util.Model.getData("ASSEMBLY_MODE") === "CHOOSE") {
                this.showFindComponent();
            }

            //this.updatePageValues(false);                   // Update with the next SFC+Component to assemble

            // More Components / SFCs left to assemble
            if (response.nextSfc !== undefined) {
                util.Model.setData("TEMP_SelectedCollectionValue", response.nextSfc);
                com.sap.me.production.view.AssyUtils.setText(oView, "allSfcSFC", response.nextSfc);
            }

            // Set next Component (if SO/PL)
            nextComponent = response.nextComponent;
        } else {
            // Set next Component (SFC)
            nextComponent = com.sap.me.production.view.AssyUtils.findNextUnassembledComponent(false, true);
        }

        if (nextComponent && nextComponent !== undefined) {
            util.Model.setData(util.ModelKey.SelectedComponent, nextComponent.component);
            util.Model.setData(util.ModelKey.SelectedComponentRevision, nextComponent.componentRevision);
            util.Model.setData(util.ModelKey.SelectedComponentDescription, nextComponent.description);
            util.Model.setData(util.ModelKey.SelectedComponentQuantity, nextComponent.remainingQty);
            util.Model.setData(util.ModelKey.SelectedComponentSequence, nextComponent.sequence);
            util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, nextComponent.defaultQty);
            util.Model.setData(util.ModelKey.SelectedLotSize, nextComponent.lotSize);
            util.Model.setData(util.ModelKey.SelectedAssemblyOperation, nextComponent.assemblyOperation);
            if (nextComponent.hasAssyData === true) {
                util.Model.setData(util.ModelKey.SelectedHasAssyData, "TRUE");
            } else {
                util.Model.setData(util.ModelKey.SelectedHasAssyData, "FALSE");
            }

            util.Model.setUnsavedDataDefined(true);
            this.updatePageValues(true);
            return;
        }
    },

    addSuccessCallback: function (oData) {

        sap.m.MessageBox.show(
              util.I18NUtility.getLocaleSpecificText("ME_MOBILE.nc_logged.TEXT"),
              sap.m.MessageBox.Icon.INFORMATION,
              "",
              sap.m.MessageBox.Action.OK,
              function (oAction) {
                  var bus = sap.ui.getCore().getEventBus();
                  bus.publish("nav", "to", {
                      id: "AssemblyComponent",
                      data: {
                          namespace: "com.sap.me.production.view"
                      }
                  });
              }
         );
    },

    addErrorCallback: function (errorCode, errorMessage) {
        if (errorMessage) {
            jQuery.sap.log.debug("Assembly Error: " + errorMessage);
            sap.m.MessageBox.alert(errorMessage);
        }
    },

    navButtonTap: function (evt) {
        //com.sap.me.production.view.AssyUtils.clearAll();
        var bus = sap.ui.getCore().getEventBus();
        var currentMode = util.Model.getData("ASSEMBLY_MODE");
        // If Sequence, the findComponent is not visible.
        if (currentMode && currentMode === "SEQUENCE") {
            bus.publish("nav", "to", {
                id: "AssemblyComponentBrowse",
                data: {
                    namespace: "com.sap.me.production.view"
                }
            });
        } else {
            bus.publish("nav", "back", {
                id: "AssemblyComponentBrowse",
                data: {
                    namespace: "com.sap.me.production.view"
                }
            });
        }
    }

  

});