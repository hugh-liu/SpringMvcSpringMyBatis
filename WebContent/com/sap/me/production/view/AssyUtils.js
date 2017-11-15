jQuery.sap.declare("com.sap.me.production.view.AssyUtils");

jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.IOUtil");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.I18NUtility");
jQuery.sap.require("com.sap.me.production.view.AssemblyHandler");

com.sap.me.production.view.AssyUtils = {

    /**
    * These default rules are used *ONLY* in the event the Activity Rules are not configured
    **/
    setDefaultRules: function () {
        util.Model.setData("ALLOW_SKIP", "NO");
        util.Model.setData("ASSEMBLY_MODE", "SEQUENCE");
        util.Model.setData("AUTO_ADD_ON_TABOUT", "YES");
        util.Model.setData("DISPLAY_BARCODE", "YES");
        util.Model.setData("ENFORCE_ASSY_STATES", "TRUE");
    },

    /**
    * Clear All Data Values
    **/
    clearAll: function () {
        util.Model.setUnsavedDataDefined(false);
        util.Model.setData("SELECTED_COMPONENT_INDEX", undefined);
        util.Model.setData("COMPONENT_LIST", undefined);
        util.Model.setData("TEMP_SelectedCollectionValue", undefined);
        util.Model.setData("TEMP_SelectedCollectionType", undefined);
        util.Model.setData(util.ModelKey.SelectedComponent, undefined);
    },

    
    /**
    * Exit Processing of Page
    **/
    exitProcessing: function (view, pageId) {
        var oView = view;
        if (oView) {
            var oPage = oView.byId(pageId);
            if (oPage) {
                oPage.destroyContent();
            }
        }
    },

    /**
    * Validate if Special Characters exist.
    * - if they do, strip them from the response and return a valid string.
    *  Invalid Characters:
    *  & (ampersand)
    *  ' (apostrophe)
    *  * (asterisk)
    *  / (slash)
    *  \ (backslash)
    *  : (colon)
    *  , (comma)
    *  > (greater than)
    *  < (less than)
    *  % (percent sign)
    *  ? (question mark)
    *  " (quotation marks)
    */
    validateSpecialCharacters: function(input)
    {
        var response = input;

        // Replace Special Characters
        if (response && response != null) {
            response = response.replace("&", "");
            response = response.replace("'", "");
            response = response.replace("*", "");
            response = response.replace("/", "");
            response = response.replace("\\", "");
            response = response.replace(":", "");
            response = response.replace(",", "");
            response = response.replace(">", "");
            response = response.replace("<", "");
            response = response.replace("%", "");
            response = response.replace("?", "");
            response = response.replace("\"", "");
            response = response.toUpperCase();
        }

        return response;
    },

    /**
    * Validates that only whole numbers are used
    */
    validateNumberCharacters: function(input)
    {
        var charsAllowed = "0123456789";
        var allowed;
        for (var i = 0; i < input.length; i++) {
            allowed = false;
            for (var j = 0; j < charsAllowed.length; j++) {
                if (input.charAt(i) == charsAllowed.charAt(j)) 
                { 
                    allowed = true; 
                }
            }
            if (allowed == false) 
            { 
                input = input.replace(input.charAt(i), ""); 
                i--; 
            }
        }
        return input;
    },

    /**
    * Validate number and post error if not
    **/
    validateNumber: function(number, labelText, remQty)
    {
    	// Check if number entered is greater than the remaining qty.
    	if (parseFloat(number) > parseFloat(remQty) ) {    		
    		var message = util.I18NUtility.getErrorText("13211.simple", oProperties);
            sap.m.MessageBox.alert(message);
            return false;
    	}
    	
        if (jQuery.isNumeric(number)) {
            return true;
        } else if (util.StringUtil.isBlank(number))
        {            
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%NAME%", util.I18NUtility.getLocaleSpecificText(labelText));
            var message = util.I18NUtility.getErrorText("10015.simple", oProperties);
            sap.m.MessageBox.alert(message);
            return false;
        } else {
            //  100.simple=Invalid number "%NUMBER%"
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%NUMBER%", number);
            var message = util.I18NUtility.getErrorText("100.simple", oProperties);
            sap.m.MessageBox.alert(message);
            return false;
        }
    },

    /**
    *  Create Assembly Header Text
    **/
    assemblyHeaderText: function () {
        // TODO:  Assign as REsources
        
        var headerTypeSfc = util.I18NUtility.getLocaleSpecificText("SFC_BROWSE.default.LABEL");
        var headerTypeShopOrder = util.I18NUtility.getLocaleSpecificText("shop_order.default.LABEL");
        var headerTypeProcessLot = util.I18NUtility.getLocaleSpecificText("processLot.default.LABEL");
        var headerMode = util.I18NUtility.getLocaleSpecificText("CT500.title.Mode.TEXT");
        var headerSelectedCount = util.I18NUtility.getLocaleSpecificText("SFCS_SELECTED.default.LABEL");

        // Get Selection Type and Value
        var message = "";
        var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

        // Get Selection Count
        var count = com.sap.me.production.view.AssemblyHandler.getSfcs(selectedType, selectedTypeValue);
        var valueCount = 0;
        if (count && count !== undefined) {
            valueCount = count.length;
        }

        var headerType = "";
        if (selectedType === "SFC") {
            headerType = headerTypeSfc;
        } else if (selectedType === "SHOP_ORDER") {
            headerType = headerTypeShopOrder;
        } else if (selectedType === "PROCESS_LOT") {
            headerType = headerTypeProcessLot;
        }

        // Get from Activity Rule
        var assemblyModeText = com.sap.me.production.view.AssyUtils.assemblyModeText();

        message = headerType + ": " + selectedTypeValue + "  " + headerMode + ": " + assemblyModeText + "  " + valueCount + " " +  headerSelectedCount;

        // Return the Message
        return message;

    },

    /**
    * Sorts the Component List such that unassembled components remain on the top
    * and assembled components appear near the bottom.
    */
    sortComponentAssembledList: function() {
        // Get list of Components
        var components = util.Model.getData("COMPONENT_LIST");
        var changeMade = false;

        // Search for match and update the remaining Qty and if the display assembled flag should be set.
        if (components && components.length > 0) {
            for (var i = 0; i < components.length; i++) {
                // Check if Component is assembled (or not)
                if (components[i].displayAssembled === true) {
                    for (var y = components.length-1; y > i; y--) {
                        // Check if unassembled, if it is move it
                        if (components[y].displayAssembled === false) {
                            var tmpComponent = components[i];
                            components[i] = components[y];
                            components[y] = tmpComponent;
                            chamgeMade = true;
                            break;
                        }
                    }

                }
            }
        }

        // Update Component Model
        return components;
    },

    /**
    *  Create Assembly Header Text
    **/
    assemblyHeaderComponent: function () {
        // TODO:  Assign as REsources
        var headerTypeSfc = util.I18NUtility.getLocaleSpecificText("SFC_BROWSE.default.LABEL");
        var headerTypeShopOrder = util.I18NUtility.getLocaleSpecificText("shop_order.default.LABEL");
        var headerTypeProcessLot = util.I18NUtility.getLocaleSpecificText("processLot.default.LABEL");
        var headerMode = util.I18NUtility.getLocaleSpecificText("CT500.title.Mode.TEXT");
        var headerSelectedCount = util.I18NUtility.getLocaleSpecificText("SFCS_SELECTED.default.LABEL");

        // Get Selection Type and Value
        var message = "";
        var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

        // Get Selection Count
        var count = com.sap.me.production.view.AssemblyHandler.getSfcs(selectedType, selectedTypeValue);
        var valueCount = 0;
        if (count && count !== undefined) {
            valueCount = count.length;
        }

        var headerType = "";
        if (selectedType === "SFC") {
            headerType = headerTypeSfc;
        } else if (selectedType === "SHOP_ORDER") {
            headerType = headerTypeShopOrder;
        } else if (selectedType === "PROCESS_LOT") {
            headerType = headerTypeProcessLot;
        }

        // Get from Activity Rule
        var assemblyModeText = com.sap.me.production.view.AssyUtils.assemblyModeText();

        message = headerType + ": " + selectedTypeValue + "  " + valueCount + " " + headerSelectedCount;

        // Return the Message
        return message;

    },

    getNextSfcToAssemble: function(allowComponentAssignment) {
        var response = this.getNextSfcComponentToAssemble(allowComponentAssignment, false);

        if (response.nextSfc !== undefined) {
            return response.nextSfc;
        }

        return undefined;
    },

    /**
    * Gets the next SFC and Component to assemble based on:
    *   - Current SFC
    *   - Current Component
    *   
    *  Functions performed:
    *  1.  Based on the current SFC and Component, move to the next SFC (in PL or SO) and see if the current component is unassembled.
    *  2.  If the current component is unassembled, return the SFC and Component to assemble.  If all components assembled, return the first SFC with a Component that is unassembled.
    *  3.  If all components on all SFC's have been processed, return a response indicating this.
    * 
    *  Response Parameters:
    *   nextSfc - Next SFC to be processed.
    *   action - Next action to be performed (based on Mode).  Values: showBrowse, nextComponent
    *   nextComponent - The component to be assembled next (undefined, or actual component name i.e. 'C2')
    *   allComponentsAssembled - true/false
    **/
    getNextSfcComponentToAssemble: function(allowComponentAssignment, skip) {
        var response = {
            nextSfc: "",                            // Next SFC to be processed
            action: "",                             // Action to be performed
            nextComponent: "",                      // Next Component
            currentComponent: "",                   // Current Component
            allComponentsAssembled: undefined,      // All Components Assembled (boolean)
            currentComponentAssembled: undefined,   // Current Component Assembled (boolean)
            currentComponentList: undefined,        // List of Components for the current SFC
            noComponentsFound: undefined            // No Components Found
        };

        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var oSfcs = com.sap.me.production.view.AssemblyHandler.getSfcs(collectionType, collectionValue);
        // Set Current Index for SFC in List
        util.Model.setData("ALL_SFC_LIST", oSfcs);

        var oSfcs = util.Model.getData("ALL_SFC_LIST");
        // SFC All not enabled and no SFC's to process
        if (oSfcs === null || oSfcs === undefined) {
            return response;
        }
        var currentComponent = util.Model.getData(util.ModelKey.SelectedComponent);     // Current Component
        var currentSfcIndex = util.Model.getData("ALL_SFC_INDEX");                      // Current SFC Index
        var assemblyMode = util.Model.getData("ASSEMBLY_MODE");                         // Assembly Mode
        // JW: var savedCollectionType = collectionType;                                       // Save current Collection Type
        var savedCollectionType = util.Model.getData("TEMP_SelectedCollectionType");    // Save current Collection Type

        // Search PL/SO to see if the component is fully assembled.
        var componentList = this.getAllBomComponentsBySelectedType();

        // No Components Found
        if (componentList === undefined || componentList === null) {
            response.nextSfc = "";
            response.action = "";
            response.nextComponent = "";
            response.allComponentsAssembled = false;
            response.currentComponentAssembled = false;
            response.currentComponentList = undefined;
            response.noComponentsFound = true;
            return response;
        } else {
            // Set response that Components have been found
            response.noComponentsFound = false;
        }

        // No Current Component Selected
        if (currentComponent === undefined || currentComponent === null) {
            // Assign first Component in the List
            currentComponent = componentList[0].component;
        }

        for (i = 0; i < componentList.length; i++) {

            // Skip this Component
            if (skip === true) {
                if (currentComponent === componentList[i].component) {
                    if (i + 1 < componentList.length) {
                        currentComponent = componentList[i + 1].component;
                        skip = false;
                        continue;
                    } else {
                        currentComponent = componentList[0].component;
                        i = -1;
                        skip = false;
                        continue;
                    }
                }
            }

            var assyCompQty = parseFloat(componentList[i].assembledQty);
            var totalCompQty = parseFloat(componentList[i].qtyToAssemble);

            if (currentComponent === componentList[i].component) {
                // Component was found in the list
                if ( totalCompQty >0) {
                    // COMPONENT NOT FULLY ASSEMBLED

                    // Find the SFC that does not have the component assembled.
                    for (s = 0; s < oSfcs.length; s++) {
                        // Get Component List for the SFC
                        var searchSfc = oSfcs[s].sfc;
                        util.Model.setData("TEMP_SelectedCollectionValue", searchSfc);
                        util.Model.setData("TEMP_SelectedCollectionType", "SFC");
                        // Get Component List for the current SFC
                        var sfcComponentList = com.sap.me.production.view.AssemblyHandler.getComponentList();
                        for (sl = 0; sl < sfcComponentList.length; sl++) {
                            // Find the Component that is not assembled.
                            if (sfcComponentList[sl].component === currentComponent) {
                                var assyQty = parseFloat(sfcComponentList[sl].assembledQty);
                                var totalQty = parseFloat(sfcComponentList[sl].qtyToAssemble);
                                if ( totalQty>0 ) {
                                    util.Model.setData("ALL_SFC_INDEX", sl);        // Set Index
                                    // Assign this component as the current component
                                    if (allowComponentAssignment === true) {                                        
                                        util.Model.setData(util.ModelKey.SelectedComponent, sfcComponentList[sl].component);
                                        util.Model.setData(util.ModelKey.SelectedComponentRevision, sfcComponentList[sl].componentRevision);
                                        util.Model.setData(util.ModelKey.SelectedComponentDescription, sfcComponentList[sl].description);
                                        util.Model.setData(util.ModelKey.SelectedComponentQuantity, sfcComponentList[sl].remainingQty);
                                        util.Model.setData(util.ModelKey.SelectedComponentSequence, sfcComponentList[sl].sequence);
                                        util.Model.setData(util.ModelKey.SelectedLotSize, sfcComponentList[sl].lotSize);
                                        util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, com.sap.me.production.view.AssemblyHandler.calculateQtyEntryField(sfcComponentList[sl].assembledQty, sfcComponentList[sl].qtyToAssemble, sfcComponentList[sl].lotSize));
                                        if (sfcComponentList[sl].hasAssyData === true) {
                                            util.Model.setData(util.ModelKey.SelectedHasAssyData, "TRUE");
                                        } else {
                                            util.Model.setData(util.ModelKey.SelectedHasAssyData, "FALSE");
                                        }
                                    }

                                    if (savedCollectionType === "SFC") {
                                        util.Model.setData("COMPONENT_LIST", sfcComponentList);
                                    } else {
                                        util.Model.setData("COMPONENT_LIST", componentList);
                                    }

                                    // Found the next SFC to Assemble
                                    response.nextSfc = searchSfc;
                                    response.currentComponent = currentComponent;
                                    response.nextComponent = sfcComponentList[sl];
                                    response.allComponentsAssembled = false;
                                    response.currentComponentAssembled = false;
                                    response.currentComponentList = sfcComponentList;
                                    util.Model.setData("TEMP_SelectedCollectionType", savedCollectionType);
                                    return response;
                                }
                            }
                        }
                    }
                } else if (totalCompQty === 0) {
                    // COMPONENT FULLY ASSEMBLED, SEARCH NEXT COMPONENT
                    // Find the next Component to Assemble
                    for (cl = 0; cl < componentList.length; cl++) {
                        var assyCLQty = parseFloat(componentList[cl].assembledQty);
                        var totalCLQty = parseFloat(componentList[cl].qtyToAssemble);
                        if (totalCLQty !==0 ) {
                            // This is the next Component to be worked
                            // Find the associated SFC that has not been assembled.
                            var nextComponent = componentList[cl].component;
                            // Find the SFC that does not have the component assembled.
                            for (s = 0; s < oSfcs.length; s++) {
                                // Get Component List for the SFC
                                var searchSfc = oSfcs[s].sfc;
                                util.Model.setData("TEMP_SelectedCollectionValue", searchSfc);
                                util.Model.setData("TEMP_SelectedCollectionType", "SFC");
                                // Get Component List for the current SFC
                                var sfcComponentList = com.sap.me.production.view.AssemblyHandler.getComponentList();
                                for (sl = 0; sl < sfcComponentList.length; sl++) {
                                    // Find the Component that is not assembled.
                                    if (sfcComponentList[sl].component === nextComponent) {
                                        var assyQty = parseFloat(sfcComponentList[sl].assembledQty);
                                        var totalQty = parseFloat(sfcComponentList[sl].qtyToAssemble);
                                        if ( totalQty > 0) {
                                            util.Model.setData("ALL_SFC_INDEX", sl);        // Set Index
                                            // Assign this component as the current component
                                            if (allowComponentAssignment === true) {
                                                util.Model.setData(util.ModelKey.SelectedComponent, sfcComponentList[sl].component);
                                                util.Model.setData(util.ModelKey.SelectedComponentRevision, sfcComponentList[sl].componentRevision);
                                                util.Model.setData(util.ModelKey.SelectedComponentDescription, sfcComponentList[sl].description);
                                                util.Model.setData(util.ModelKey.SelectedComponentQuantity, sfcComponentList[sl].remainingQty);
                                                util.Model.setData(util.ModelKey.SelectedComponentSequence, sfcComponentList[sl].sequence);
                                                util.Model.setData(util.ModelKey.SelectedLotSize, sfcComponentList[sl].lotSize);
                                                util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, com.sap.me.production.view.AssemblyHandler.calculateQtyEntryField(sfcComponentList[sl].assembledQty, sfcComponentList[sl].qtyToAssemble, sfcComponentList[sl].lotSize));
                                                
                                                if (sfcComponentList[sl].hasAssyData === true) {
                                                    util.Model.setData(util.ModelKey.SelectedHasAssyData, "TRUE");
                                                } else {
                                                    util.Model.setData(util.ModelKey.SelectedHasAssyData, "FALSE");
                                                }
                                            }

                                            if (savedCollectionType === "SFC") {
                                                util.Model.setData("COMPONENT_LIST", sfcComponentList);
                                            } else {
                                                util.Model.setData("COMPONENT_LIST", componentList);
                                            }
                                            // Found the next SFC to Assemble
                                            response.nextSfc = searchSfc;
                                            response.currentComponent = currentComponent;
                                            response.nextComponent = sfcComponentList[sl];
                                            response.allComponentsAssembled = false;
                                            response.currentComponentAssembled = true;
                                            response.currentComponentList = sfcComponentList;
                                            util.Model.setData("TEMP_SelectedCollectionType", savedCollectionType);
                                            return response;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // All Components Assembled
        response.nextSfc = undefined;
        response.nextComponent = undefined;
        response.currentComponent = currentComponent;
        response.allComponentsAssembled = true;
        response.currentComponentAssembled = true;
        response.currentComponentList = undefined;
        util.Model.setData("TEMP_SelectedCollectionType", savedCollectionType);
        return response;                
        
    },

    /**
    * Format for Decimals
    **/
    formatDecimal: function (value) {
        if (this.isFloat(value)) {
            var num = parseFloat(value);            
            var result = Number(num.toFixed(6))
            return result;
            
        } else {
            return value;
        }
    },


    /**
    * Check if the number is a float
    **/
    isFloat: function (n) {
        return ((typeof n === 'number') && (n % 1 !== 0));
    },

    /**
    *  Retrieves the list of components by the selected type (not the overriden value of the TEMP_SelectedType).
    *  When done, it restores the TEMP_SelectedType
    **/
    getAllBomComponentsBySelectedType: function () {
        var currentType = util.Model.getData("TEMP_SelectedCollectionType");    // Save type
        util.Model.setData("TEMP_SelectedCollectionType", "");                  // Clear TEMP_SelectedType
        // Get list of Components (for ProcessLot/ShopOrder)
        var compList = com.sap.me.production.view.AssemblyHandler.getComponentList();
        util.Model.setData("TEMP_SelectedCollectionType", currentType);         // Restore Type

        return compList;
    },

    /**
    * Checks if all SFC's option is done processing
    **/
    checkAllSfcsDone: function() {
        var returnValue = undefined;        // All processing is done (all components assembled)

        var bAllSfcMode = util.Model.getData("ALL_SFC_ENABLED");
        
        // Check if there are any more SFC's that require assembly
        var nextSfc = this.getNextSfcToAssemble(false);

        if (nextSfc && nextSfc !== undefined) {
            // There are other SFC's to Assemble.
            return false;
        }
        return true;

        // No more to Assemble
        return returnValue;
    },


    /**
    * Check if all Components have been assembled for a given SFC
    **/
    allComponentsAssembledBySfc: function(sfc)
    {
        // Set values needed for getComponentList search
        util.Model.setData("TEMP_SelectedCollectionType", "SFC");
        util.Model.setData("TEMP_SelectedCollectionValue", sfc);

        // Get Component List
        var compList = com.sap.me.production.view.AssemblyHandler.getComponentList();
        // Set the model
        util.Model.setData("COMPONENT_LIST", compList);

        // Check if all Components Assembled
        return this.allComponentsAssembled();
    },

    /**
     * Checks if all components have been assembled (or not) after an Assemble Action
     * returns: true/false
     **/
     allComponentsAssembledNotSfc: function(){
         var components = util.Model.getData("AFTER_ASSY_COMPONENT_LIST");

         var allAssembled = true;
         if (components && components.length>0)
             {
             for (var i = 0; i < components.length; i++) {
                 if (components[i].displayAssembled === false) {
                     allAssembled = false;
                     return allAssembled;
                 }
             }
         }

         return allAssembled;
     },
     
    /**
    * Checks if all components have been assembled (or not)
    * returns: true/false
    **/
    allComponentsAssembled: function(){
        var components = util.Model.getData("COMPONENT_LIST");

        var allAssembled = true;
        if (components && components.length>0)
            {
            for (var i = 0; i < components.length; i++) {
                if (components[i].displayAssembled === false) {
                    allAssembled = false;
                    return allAssembled;
                }
            }
        }

        return allAssembled;
    },

    // Finds the next component
    findNextComponent: function () {
        var currentComponentIndex = util.Model.getData("SELECTED_COMPONENT_INDEX");
        var oComponentData = util.Model.getData("COMPONENT_LIST");

        if (oComponentData && oComponentData.length > 0) {
            var componentCount = oComponentData.length;
            if (currentComponentIndex > -1 && (currentComponentIndex <  componentCount)) {
                currentComponentIndex++;
                util.Model.setData("SELECTED_COMPONENT_INDEX", currentComponentIndex);
                return oComponentData[currentComponentIndex];
            } else {
                util.Model.setData("SELECTED_COMPONENT_INDEX", undefined);
            }
        }

        return undefined;

    },

    /**
    * Find the next Unassembled Component
    **/
    findNextUnassembledComponent: function(force, skip)
    {
        var response = this.getNextSfcComponentToAssemble(force, skip);

        if (response.nextComponent !== undefined) {
            return response.nextComponent;
        }

        return undefined;
    },


    /**
    * Update model after Assembly
    **/
    updateAssembledComponentModel: function(component, remainingQty)
    {
        // Get list of Components
        var components = util.Model.getData("COMPONENT_LIST");

        // Search for match and update the remaining Qty and if the display assembled flag should be set.
        if (components && components.length > 0) {
            for (var i = 0; i < components.length; i++) {
                if (components[i].component === component) {
                	
                    // Match found, update values
                    components[i].remainingQty = com.sap.me.production.view.AssemblyHandler.calculateRemainingQty(components[i].assembledQty, components[i].qtyToAssemble);
                	components[i].defaultQty = com.sap.me.production.view.AssemblyHandler.calculateQtyEntryField(components[i].assembledQty, components[i].qtyToAssemble, components[i].lotSize);
                    if (components[i].qtyToAssemble === 0) {
                        components[i].displayAssembled = true;
                    } else {
                        components[i].displayAssembled = false;
                    }
                    // Save model
                    util.Model.setData("COMPONENT_LIST", components);
                    return;
                }
            }
        }
    },

    assemblyModeText: function () {
        // TODO: Place this in resource files...
        var msgModeChoose = util.I18NUtility.getLocaleSpecificText("CT500.choose.LABEL");
        var msgModeSequential = util.I18NUtility.getLocaleSpecificText("CT500.sequence.LABEL");
        var msgModeChooseAutoNext = util.I18NUtility.getLocaleSpecificText("CT500.chooseAutoNext.LABEL");
        var msgModeUnknown = " - ";

        // Get the Current Assembly Mode
        var currentMode = util.Model.getData("ASSEMBLY_MODE");
        var result = "";
        if (currentMode === "CHOOSE") {
            result = msgModeChoose;
        } else if (currentMode === "SEQUENCE") {
            result = msgModeSequential;
        } else if (currentMode === "CHOOSE_AUTO_NEXT") {
            result = msgModeChooseAutoNext;
        } else {
            result = msgModeUnknown;
        }

        return result;
    },


    defaultOperationErrorCallback: function (errorCode, errorMessage) {
        util.Model.setData("TEMP_INVALID_OPERATION", true);
        sap.m.MessageBox.alert(errorMessage);
    },

    defaultResourceErrorCallback: function (errorCode, errorMessage) {
        util.Model.setData("TEMP_INVALID_RESOURCE", true);
        sap.m.MessageBox.alert(errorMessage);
    },

    /**
    * Verify the values entered for Operation, Resource and Collection Value are valid.
    **/
    verifyValidValues: function () {
        // Set Defaults
        util.Model.setData("TEMP_INVALID_OPERATION", false);
        util.Model.setData("TEMP_INVALID_RESOURCE", false);
        // Get Selected Operation & Resource
        var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
        var selectedResource = util.Model.getData(util.ModelKey.SelectedResource);

        // Validate Operation        
        var parameters = "?operation='" + selectedOperation.toUpperCase() + "'";
        util.IOUtil.remoteRequest("/manufacturing-odata/Production.svc/ValidateOperation" + parameters, "GET", null, null, this.defaultOperationErrorCallback, this);

        // If Invalid Operation, return false
        if (util.Model.getData("TEMP_INVALID_OPERATION") === true) {
            return false;
        }

        // Validate Resource
        var parameters = "?resource='" + selectedResource.toUpperCase() + "'";
        util.IOUtil.remoteRequest("/manufacturing-odata/Production.svc/ValidateResource" + parameters, "GET", null, null, this.defaultResourceErrorCallback, this);

        // If Invalid Resource, return false
        if (util.Model.getData("TEMP_INVALID_RESOURCE") === true) {
            return false;
        }

        // Validate Collection Value
        var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

        // Get the status of the Selected Type Value
        var status = com.sap.me.production.view.AssemblyHandler.getSfcStatus(selectedType, selectedTypeValue);

        if (status === false) {
            return false;
        }

        if (status === false) {
            // SFC Not found
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%SFC_BO.(2)%", selectedTypeValue);
            var sMessage = util.I18NUtility.getErrorText("13005.simple", oProperties);
            sap.m.MessageBox.alert(sMessage);
            return false;
        }

        return true;
    },

    /**
    * find the component data for a single component.
    **/
    findComponent: function (component, componentRev) {

        oComponents = util.Model.getData("COMPONENT_LIST");

        // find match on component, if a match exists
        if (oComponents && oComponents.length > 0) {
            for (var i = 0; i < oComponents.length; i++) {
                if (component === oComponents[i].component &&
                   ( (componentRev === oComponents[i].componentRevision) ||
                   componentRev === "#")) {
                    return oComponents[i];
                }
            }
        }

        // Component wasn't found
        return undefined;
    },

    sfcStatusErrorMessage: function (selectedType, selectedTypeValue, selectedOperation, statusDescription) {

        // SFC is not ACTIVE
        var oProperties = jQuery.sap.properties();
        var sMessage = "";
        if (selectedType === "SFC") {
            oProperties.setProperty("%SFC%", selectedTypeValue);
            oProperties.setProperty("%STATUS_DESCRIPTION%", statusDescription);
            oProperties.setProperty("%OPER%", selectedOperation);
            sMessage = util.I18NUtility.getErrorText("16652.simple", oProperties);
        } else {
        	oProperties.setProperty("%value%", selectedTypeValue);
        	oProperties.setProperty("%OPER%", selectedOperation);
            oProperties.setProperty("%OPERATION_BO.(2)%", selectedOperation);
            // 13097.simple
            sMessage = util.I18NUtility.getErrorText("16653.simple", oProperties);
        }
        sap.m.MessageBox.alert(sMessage);
        return false;        
    },

    /** 
    * Check's the Activity rule to determine
    *  A) POD Operation matches the Assembly Operation
    *  B) Selected SFC's are in an Active State
    *
    * Returns True if:
    *   The Activity Rule is set to False (no check is to be performed)
    *   The Operations match and the SFC's are active.
    *
    * Returns False if:
    *   The Rule is set to true and the POD Operation does not match the assembly operation
    *   The Selected SFC's are not in an Active State
    *   -Note- An error message will be displayed from this method in the event the rule fails along with a boolean to
    *   allow termination of the calling method.
    **/
    assemblyStateCheckOK: function()
    {
        // TODO: Replace with Resource value.
        var msgOperationMisMatch = util.I18NUtility.getLocaleSpecificText("COMPONENT_NOT_OPERATION.default.TEXT"); // "Component may only be assembled at operation '%OPERATION%'";
        var msgAssyOperationNotDefinedOnBOM = util.I18NUtility.getLocaleSpecificText("ASSY_OPERATION_UNDEFINED.default.TEXT"); // "An Assembly Operation is not defined on the BOM for this component";

        // Check if the Activity Rule is enabled.
        var performCheck = util.Model.getData("ENFORCE_ASSY_STATES");

        if (performCheck) {

            // Get values needed to perform check
            var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
            var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
            var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
            var selectedAssemblyOperation = util.Model.getData(util.ModelKey.SelectedAssemblyOperation);
               
            // Don't allow assembly of a component that does not have an Assembly Operation assigned on the BOM for the component.
            if (selectedAssemblyOperation === "" || selectedAssemblyOperation === null) {
                sap.m.MessageToast.show(msgAssyOperationNotDefinedOnBOM, {
                    duration: 6000,
                    animationDuration: 500
                });
                return false;
            }

            // Verify current Operation matches the Assembly Operation
            if (selectedOperation !== selectedAssemblyOperation) {
                sap.m.MessageToast.show(msgOperationMisMatch.replace("%OPERATION%", selectedAssemblyOperation), {
                    duration: 6000,
                    animationDuration: 500
                });
                return false;
            }

            // Get the Status of the SFC(s)
            var sfcStatus=undefined;
            if (selectedType === "SFC") {
                // Get the status of the SFC
                sfcStatus = com.sap.me.production.view.AssemblyHandler.getSfcStatus(selectedType, selectedTypeValue);
                if (sfcStatus && sfcStatus === "403") {
                    return true;
                } else {
                    return this.sfcStatusErrorMessage(selectedType, selectedTypeValue, selectedOperation, sfcStatus);
                }
            } else if (selectedType === "SHOP_ORDER") {
                // Get the status of the SFC
                var soStatus = com.sap.me.production.view.AssemblyHandler.getSfcStatus(selectedType, selectedTypeValue);
                if (soStatus && soStatus === "403") {
                    return true;
                } else {
                    return this.sfcStatusErrorMessage(selectedType, selectedTypeValue, selectedOperation, soStatus);
                }
                return true;
            } else if (selectedType === "PROCESS_LOT") {
                // Get the status of the SFC
                var plStatus = com.sap.me.production.view.AssemblyHandler.getSfcStatus(selectedType, selectedTypeValue);
                if (plStatus && plStatus === "403") {
                    return true;
                } else {
                    return this.sfcStatusErrorMessage(selectedType, selectedTypeValue, selectedOperation, plStatus);
                }
                return true;
            }
        } else {
            return true;
        }

    },

    /** 
    * Check's the Activity rule to determine
    * if the Selected SFC's are in an Active State
    *
    * Returns True if:
    *   The Activity Rule is set to False (no check is to be performed)
    *   The SFC is in an Active State.
    *
    * Returns False if:
    *   The Selected SFC's are not in an Active State
    *   -Note- An error message will be displayed from this method in the event the rule fails along with a boolean to
    *   allow termination of the calling method.
    **/
    assemblyStatusCheckOK: function () {
        // TODO: Replace with Resource value.
        //var msgSfcNotActive = "SFC is not Active at operation '%OPERATION%'";

        // Check if the Activity Rule is enabled.
        var performCheck = util.Model.getData("ENFORCE_ASSY_STATES");

        if (performCheck) {

            // Get values needed to perform check
            var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
            var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
            var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);

            // Get the Status of the SFC(s)
            var sfcStatus = undefined;
            if (selectedType === "SFC") {
                // Get the status of the SFC
                sfcStatus = com.sap.me.production.view.AssemblyHandler.getSfcStatus(selectedType, selectedTypeValue);
                if (sfcStatus && sfcStatus === "403") {
                    return true;
                } else {
                    return this.sfcStatusErrorMessage(selectedType, selectedTypeValue, selectedOperation, sfcStatus);
                }
            } else if (selectedType === "SHOP_ORDER") {
                // Get the status of the SFC
                sfcStatus = com.sap.me.production.view.AssemblyHandler.getSfcStatus(selectedType, selectedTypeValue);
                if (sfcStatus && sfcStatus === "403") {
                    return true;
                } else {
                    return this.sfcStatusErrorMessage(selectedType, selectedTypeValue, selectedOperation, sfcStatus);
                }
            } else if (selectedType === "PROCESS_LOT") {
                // Get the status of the SFC
                sfcStatus = com.sap.me.production.view.AssemblyHandler.getSfcStatus(selectedType, selectedTypeValue);
                if (sfcStatus && sfcStatus === "403") {
                    return true;
                } else {
                    return this.sfcStatusErrorMessage(selectedType, selectedTypeValue, selectedOperation, sfcStatus);
                }
            }
        } else {
            return true;
        }

    },

    /**
    * Clears the selected fields
    **/
    clearSelectedFields: function () {
        util.Model.setData(util.ModelKey.SelectedComponent, undefined);
        util.Model.setData(util.ModelKey.SelectedHasAssyData, "FALSE");
        util.Model.setData(util.ModelKey.SelectedComponentRevision, undefined);
        util.Model.setData(util.ModelKey.SelectedComponentDescription, undefined);
        util.Model.setData(util.ModelKey.SelectedComponentQuantity, undefined);
        util.Model.setData(util.ModelKey.SelectedComponentSequence, undefined);
        util.Model.setData(util.ModelKey.SelectedDefaultComponentQuantity, undefined);
        util.Model.setData(util.ModelKey.SelectedAssemblyData, undefined);
        util.Model.setUnsavedDataDefined(false);
    },
    

    /**
    * Sets focus when passed the view (this.getView();) and the control id.
    * * WARNING * - This method must be used within the onAfterShow() of the controller.
    **/
    setFocus: function (view, control) {
        var focusedControl = view.byId(control);
        focusedControl.focus();
    },

    /**
    * Set Text
    **/
    setText: function (view, control, value) {
        var control = view.byId(control);
        if (control) {
            control.setText(value);
        }
    },

    /**
    * Set Value
    **/
    setValue: function (view, control, value) {
        var control = view.byId(control);
        if (control) {
            control.setValue(value);
        }
    },
};