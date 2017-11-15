jQuery.sap.declare("com.sap.me.production.view.AssemblyHandler");

jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.IOUtil");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.I18NUtility");

com.sap.me.production.view.AssemblyHandler = {



    /**
    * assembleComponent
    * Assembles Components in the format of:
    *       url = http://localhost:50000/manufacturing-odata/Assembly.svc/AssembleByAsBuiltComponents?Sfc='S1'&Operation='OP1'&Component='C2'&CompRev='A'&Resource='RES1'&Quantity='1'&Site='DEV'
    *             &AssemblyDataFields='%5B%20%7B%20EXTERNAL_LOT%3A%20%275%27%20%7D%20%5D'
    **/
    assembleComponent: function () {
        util.Model.setData("TEMP_ErrorResponse", undefined);
        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        var resource = util.Model.getData(util.ModelKey.SelectedResource);
        var component = util.Model.getData(util.ModelKey.SelectedComponent);
        var componentRev = util.Model.getData(util.ModelKey.SelectedComponentRevision);
        var componentSequence = util.Model.getData(util.ModelKey.SelectedComponentSequence);
        var sequenceParameter = "";
        
        if (componentSequence) {
        	sequenceParameter = "&Sequence='" + util.Model.getData("SelectedComponentSequence") + "'";
        }
        if (componentRev === undefined) {
            componentRev = "#";
        }
        var qty = util.Model.getData(util.ModelKey.SelectedDefaultComponentQuantity);

        // get list of SFC's
        var oSfcs = this.getSfcs(collectionType, collectionValue);
        if (!oSfcs || oSfcs.length <= 0) {
            return undefined;
        } else {
            util.Model.setData(util.ModelKey.SelectedTypeCount, oSfcs.length);
        }

        // Check if we have Assembly Data Fields to include
        var assyData = util.Model.getData(util.ModelKey.SelectedAssemblyData);
        var paramAssyData = "";
        if (assyData) {
            paramAssyData = "&AssemblyDataFields='[" +  util.StringUtil.encodeString(JSON.stringify(assyData)) + "]'";
        }

        // If TEMP_SelectedCollectionType is SFC (All SFC's is unchecked), use these values for Assembly:
        if (util.Model.getData("TEMP_SelectedCollectionType") === "SFC" && util.Model.getData("TEMP_SelectedCollectionValue") !== undefined) {
            collectionType = "SFC";
            collectionValue = util.Model.getData("TEMP_SelectedCollectionValue");
        }

        var url = undefined;
        if (collectionType === "SFC") {
            var parameters = "Sfc='" + collectionValue + "'&Operation='" + operation + "'&Resource='" + resource + "'&Component='" + component + "'&CompRev='" + componentRev + "'&Quantity='" + qty + "'" + sequenceParameter;
            url = "/manufacturing-odata/Assembly.svc/AssembleByComponents?" + parameters + paramAssyData;
        } else if (collectionType === "SHOP_ORDER") {
            var parameters = "ShopOrder='" + collectionValue + "'&Operation='" + operation + "'&Resource='" + resource + "'&Component='" + component + "'&CompRev='" + componentRev + "'&Quantity='" + qty + "'" + sequenceParameter;
            url = "/manufacturing-odata/Assembly.svc/AssembleByComponents?" + parameters + paramAssyData;
        } else if (collectionType === "PROCESS_LOT") {
            var parameters = "ProcessLot='" + collectionValue + "'&Operation='" + operation + "'&Resource='" + resource + "'&Component='" + component + "'&CompRev='" + componentRev + "'&Quantity='" + qty + "'" + sequenceParameter;
            url = "/manufacturing-odata/Assembly.svc/AssembleByComponents?" + parameters + paramAssyData;
        } else {
            throw new Error("Invalid collection type = " + collectionType);
        }

        var oValue = util.IOUtil.remoteRequest(url, "POST", null, this.successCallback, this.errorCallback, this);

        // Check if a component list has been retrieved.
        var errorMessage = util.Model.getData("TEMP_ErrorResponse");
        if (errorMessage && errorMessage.length > 0) 
        {
            if (errorMessage) {
                jQuery.sap.log.error(errorMessage);
                sap.m.MessageBox.alert(errorMessage);
                util.Model.removeData("TEMP_ErrorResponse");
            }
            return false;
        } else
        {
            // Return the Quantity Assembled
            if (oValue && oValue.d.results.length > 0) {
                return oValue.d.results.length;
            } else {
                return 0;
            }
        }       
    },

    /**
    * parseBarcode
    *   This function will parse the barcode and return an array of DataFieldRef and Values
    * Example URL:
    *       http://localhost:50000/manufacturing-odata/Assembly.svc/ParseBarcode?Barcode='[)%3E%1E06%1D12ZThis%20is%20a%20test%1D1T555%1E%04'&Site='DEV'&Component='C2'&CompRev='%23'
    **/
    parseBarcode: function(barcodeString)
    {
        // Get Current Component & component revision
        var component = util.Model.getData(util.ModelKey.SelectedComponent);
        var componentRev = util.Model.getData(util.ModelKey.SelectedComponentRevision);
        if (componentRev === undefined) {
            componentRev = "#";
        }

        // Create URL
        var parameters = "Barcode='" + barcodeString + "'&Component='" + component + "'&CompRev='" + componentRev + "'";
        url = "/manufacturing-odata/Assembly.svc/ParseBarcode?" +  parameters;

        // Send the Request
        var oResults = util.IOUtil.remoteRequest(url, "GET", null, this.successCallback, this.errorCallback, this);

        // Post Error if one was received
        var errorMessage = util.Model.getData("TEMP_ErrorResponse");
        if (errorMessage && errorMessage.length > 0) {
            if (errorMessage) {
                jQuery.sap.log.error(errorMessage);
                sap.m.MessageBox.alert(errorMessage);
                util.Model.removeData("TEMP_ErrorResponse");
                util.Model.setData("TEMP_ErrorPosted", true);
            }
            return false;
        }

        var oDataField = [];
        // Check if a DataField values have been retrieved.
        if (oResults && oResults !== undefined && oResults.d.results.length > 0) {

            // Assign values
            for (var i = 0; i < oResults.d.results.length; i++) {
                // Populate Response
                var dataField = {
                    index: i,
                    dataField: oResults.d.results[i].dataField,
                    value: oResults.d.results[i].value
                }
                oDataField[oDataField.length] = dataField;
            }
        }

        return oDataField;
    },


    /**
    * getAssyDataFields
    * Assembles Components in the format of:
    *       url = http://localhost:50000/manufacturing-odata/Assembly.svc/GetAssyDataFields?Sfc='S1'&Component='C2'&CompRev='A'
    **/
    getAssyDataFields: function () {
        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);        
        var component = util.Model.getData(util.ModelKey.SelectedComponent);
        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        var componentRev = util.Model.getData(util.ModelKey.SelectedComponentRevision);
        if (componentRev === undefined) {
            componentRev = "#";
        }

        // If TEMP_SelectedCollectionType is SFC (All SFC's is unchecked), use these values for Assembly:
        if (util.Model.getData("TEMP_SelectedCollectionType") === "SFC" && util.Model.getData("TEMP_SelectedCollectionValue") !== undefined) {
            collectionType = "SFC";
            collectionValue = util.Model.getData("TEMP_SelectedCollectionValue");
        }

        // get list of SFC's
        var oSfcs = this.getSfcs(collectionType, collectionValue);
        if (!oSfcs || oSfcs.length <= 0) {
            return undefined;
        } else {
            util.Model.setData(util.ModelKey.SelectedTypeCount, oSfcs.length);
        }

        var url = undefined;
        if (collectionType === "SFC") {
            var parameters = "Sfc='" + collectionValue + "'&Component='" + component + "'&CompRev='" + componentRev +"'" + "&Operation='" + operation + "'";
            url = "/manufacturing-odata/Assembly.svc/GetAssyDataFields?" + parameters;
        } else if (collectionType === "SHOP_ORDER") {
            // Pick the first SFC to be used determining the Data Fields
            if (oSfcs && oSfcs.length > 0) {
                var parameters = "Sfc='" + oSfcs[0].sfc + "'&Component='" + component + "'&CompRev='" + componentRev + "'"+ "&Operation='" + operation + "'";
                url = "/manufacturing-odata/Assembly.svc/GetAssyDataFields?" + parameters;
            }
        } else if (collectionType === "PROCESS_LOT") {
            // Pick the first SFC to be used determining the Data Fields
            if (oSfcs && oSfcs.length > 0) {
                var parameters = "Sfc='" + oSfcs[0].sfc + "'&Component='" + component + "'&CompRev='" + componentRev + "'"+ "&Operation='" + operation + "'";
                url = "/manufacturing-odata/Assembly.svc/GetAssyDataFields?" + parameters;
            }
        } else {
            throw new Error("Invalid collection type = " + collectionType);
        }

        var oResults = util.IOUtil.remoteRequest(url, "GET", null, this.successCallback, this.errorCallback, this);

        var oAssyDataFields = [];

        // Check if a Assembly Data has been retrieved.
        if (oResults && oResults !== undefined && oResults.d.results.length > 0) {
            // Example Response:

            //<element m:type="SAPME.DataFieldFullConfiguration">
            //<modifiedDateTime>2014-02-24T12:43:41-05:00</modifiedDateTime>
            //<name>FINISH</name>
            //<type>LIST</type>
            //<origin>CUSTOM</origin>
            //<description>List</description>
            //<label>Sheet Metal Finish</label>
            //<browseable>true</browseable>
            //<site>DEV</site>
            //<sequence>55</sequence>
            //<required>false</required>
            //<validValues>
            //[{"default":false,"sequence":10,"value":"NONE","label":"None"},{"default":false,"sequence":20,"value":"ANODIZE","label":"Anodize"},{"default":true,"sequence":30,"value":"CHROMATE","label":"Chromate"},{"default":false,"sequence":40,"value":"PAINT","label":"Paint"}]
            //</validValues>
            //</element>
            // Assign values
            for (var i = 0; i < oResults.d.results.length; i++) {

                var assyDataFields = {
                    index: i,
                    sequence: oResults.d.results[i].sequence,
                    modifiedDateTime: oResults.d.results[i].modifiedDateTime,
                    //ref: oResults.d.results[i].ref,
                    name: oResults.d.results[i].name,
                    type: oResults.d.results[i].type,
                    origin: oResults.d.results[i].origin,
                    description: oResults.d.results[i].description,
                    label: oResults.d.results[i].label,
                    //maskGroupRef: oResults.d.results[i].maskGroupRef,
                    browseable: oResults.d.results[i].browseable,
                    site: oResults.d.results[i].site,
                    //presaveActivityRef: oResults.d.results[i].presaveActivityRef,
                    required: oResults.d.results[i].required,
                    validValues: this.getValidValues(oResults.d.results[i].validValues)
                };

                oAssyDataFields[oAssyDataFields.length] = assyDataFields;
            }
        }

        return oAssyDataFields;

    },

    getValidValues: function (values) {
        var jsonValue = jQuery.parseJSON(values);
        // [{"ref":"DataValueListBO:DataFieldBO:DEV,FINISH,NONE","_default":false,"sequence":10,"value":"NONE","label":"None"}
        var values = [];

        if (jsonValue === null || jsonValue.length < 1) {
            return null;
        }

        for (var i = 0; i < jsonValue.length; i++) {
            var validItem = {
                ref: jsonValue[i].ref,
                _default: jsonValue[i]._default,
                sequence: jsonValue[i].sequence,
                value: jsonValue[i].value,
                label: jsonValue[i].label

            };
            values[values.length] = validItem;
        }

        if (jsonValue) {
            return values;
        } else {
            return null;
        }
    },

    /**
    * find the component data for a single component.
    **/
    findComponent: function (collectionType, collectionValue, component, componentRev) {
        // Set values needed prior to component retrieval
        util.Model.setData(util.ModelKey.SelectedCollectionType, collectionType);
        util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, collectionValue);

        var oComponents = [];
        oComponents = this.getComponentList();

        if (oComponents === false) {
            return;
        }

        // find match on component, if a match exists
        if (oComponents && oComponents.length>0)
        {
            for (var i = 0; i < oComponents.length; i++) {
                if (component && (component === oComponents[i].component) &&
                   (componentRev === oComponents[i].componentRevision) || 
                   (componentRev === "#")) {
                    return oComponents[i];
                }
            }
        }

        // Component wasn't found
        return undefined;
    },

    /**
    * getComponentList
    * Retrieves a list of components from the oData service in the format of:
    *       url = http://localhost:50000/manufacturing-odata/Assembly.svc/GetAllBomComponents?Sfc='S1'&Site='DEV'
    **/
    getComponentList: function () {

        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        util.Model.setData("TEMP_ErrorResponse", undefined);

        // If TEMP_SelectedCollectionType is SFC (All SFC's is unchecked), use these values for Assembly:
        if (util.Model.getData("TEMP_SelectedCollectionType") === "SFC" && util.Model.getData("TEMP_SelectedCollectionValue") !== undefined) {
            collectionType = "SFC";
            collectionValue = util.Model.getData("TEMP_SelectedCollectionValue");
        }

        // get list of SFC's
        var oSfcs = undefined;
        try {
            oSfcs = this.getSfcs(collectionType, collectionValue);
        } catch (err) {
            jQuery.sap.log.error(err.message);
            return undefined;
        }
        if (!oSfcs || oSfcs.length <= 0) {
            return undefined;
        } else {
            util.Model.setData(util.ModelKey.SelectedTypeCount, oSfcs.length);
        }

        var url = undefined;

        if (collectionType === "SFC") {
            url = "/manufacturing-odata/Assembly.svc/GetAllBomComponents?Sfc='" + collectionValue + "'&Operation='" + operation +"'";
        } else if (collectionType === "SHOP_ORDER") {
            // Pick the first SFC to be used determining the Component List
            if (oSfcs && oSfcs.length > 0) {
                url = "/manufacturing-odata/Assembly.svc/GetAllBomComponents?ShopOrder='" + collectionValue + "'&Operation='" + operation + "'";
            }
        } else if (collectionType === "PROCESS_LOT") {
            // Pick the first SFC to be used determining the Component List
            if (oSfcs && oSfcs.length > 0) {
                url = "/manufacturing-odata/Assembly.svc/GetAllBomComponents?ProcessLot='" + collectionValue + "'&Operation='" + operation + "'";
            }
        } else {
            throw new Error("Invalid collection type = " + collectionType);
        }

        var oResults = util.IOUtil.remoteRequest(url, "GET", null, this.successCallback, this.errorCallback, this);

        var errorMessage = util.Model.getData("TEMP_ErrorResponse");
        if (errorMessage && errorMessage.length > 0) {
            if (errorMessage) {
                jQuery.sap.log.error(errorMessage);
                sap.m.MessageBox.alert(errorMessage);
                util.Model.removeData("TEMP_ErrorResponse");
                util.Model.setData("TEMP_ErrorPosted", true);
            }
            return false;
        }

        var oComponents = [];
        // Check if a component list has been retrieved.
        if (oResults && oResults.d.results.length > 0) {
            // Example Response
            //<element m:type="SAPME.BomComponentProductionConfiguration">
            //<quantity>1</quantity>
            //<maximumUsage>0</maximumUsage>
            //<refDes m:null="true"/>
            //<useItemDefaults>true</useItemDefaults>
            //<panel>false</panel>
            //<lotSize>2</lotSize>
            //<collector>false</collector>
            //<createTrackableSfc>true</createTrackableSfc>
            //<testPart>false</testPart>
            //<description>Component 2</description>
            //<assembleAsReq>false</assembleAsReq>
            //<preAssembled>false</preAssembled>
            //<sequence>20</sequence>
            //<maximumNc>0</maximumNc>
            //<itemType>MANUFACTURED_PURCHASED</itemType>
            //<parentSequence m:null="true"/>
            //<bomComponentType>NORMAL</bomComponentType>
            //<phantomMember>false</phantomMember>
            //<site>DEV</site>
            //<bomComponentItem>C2</bomComponentItem>
            //<bom>BOM1</bom>
            //<bomRevision>C</bomRevision>
            //<bomType>U</bomType>
            //<site>DEV</site>
            //<bomComponentSequence>20</bomComponentSequence>
            //<component>C2</component>
            //<componentRevision>A</componentRevision>
            //<operation>OP1</operation>
            //<operationRevision>#</operationRevision>
            //<dataTypeCategory>ASSEMBLY</dataTypeCategory>
            //<dataType>EXTERNAL_LOT</dataType>
            //<assembledQty>1</assembledQty>
            //<assyId>648</assyId>
            //</element>
            // Assign values
            for (var i = 0; i < oResults.d.results.length; i++) {

                var componentData = {
                    index: i,
                    //bomComponentRef: oResults.d.results[i].bomComponentRef,
                    //bomRef: oResults.d.results[i].bomRef,                
                    //componentRef: oResults.d.results[i].componentRef,
                    //bomComponentTemplateRef: oResults.d.results[i].bomComponentTemplateRef,
                    //assemblyDataTypeRef: oResults.d.results[i].assemblyDataTypeRef,
                    //parentComponentRef: oResults.d.results[i].parentComponentRef,
                    //disassembleOperationRef: oResults.d.results[i].disassembleOperationRef,
                    site: oResults.d.results[i].site,
                    bomComponentItem: oResults.d.results[i].bomComponentItem,
                    bom: oResults.d.results[i].bom,
                    bomRevision: oResults.d.results[i].bomRevision,
                    bomType: oResults.d.results[i].bomType,
                    bomComponentSequence: oResults.d.results[i].bomComponentSequence,
                    component: oResults.d.results[i].component,
                    componentRevision: oResults.d.results[i].componentRevision,
                    operation: oResults.d.results[i].operation,
                    operationRevision: oResults.d.results[i].operationRevision,
                    dataTypeCategory: oResults.d.results[i].dataTypeCategory,
                    dataType: oResults.d.results[i].dataType,

                    quantity: oResults.d.results[i].quantity,
                    maximumUsage: oResults.d.results[i].maximumUsage,
                    refDes: oResults.d.results[i].refDes,
                    useItemDefaults: oResults.d.results[i].useItemDefaults,
                    panel: oResults.d.results[i].panel,
                    lotSize: oResults.d.results[i].lotSize,
                    collector: oResults.d.results[i].collector,                   
                    createTrackableSfc: oResults.d.results[i].createTrackableSfc,
                    testPart: oResults.d.results[i].testPart,
                    description: oResults.d.results[i].description,
                    assembleAsReq: oResults.d.results[i].assembleAsReq,
                    preAssembled: oResults.d.results[i].preAssembled,
                    sequence: oResults.d.results[i].sequence,
                    maximumNc: oResults.d.results[i].maximumNc,                   
                    parentSequence: oResults.d.results[i].parentSequence,
                    bomComponentType: oResults.d.results[i].bomComponentType,
                    phantomMember: oResults.d.results[i].phantomMember,                   
                    //componentName: this.findComponentFromRef(oResults.d.results[i].componentRef),
                    //componentRevision: this.findComponentRevisionFromRef(oResults.d.results[i].componentRef),
                    hasAssyData: this.hasAssyData(oResults.d.results[i].dataType),
                    assemblyOperation: oResults.d.results[i].operation,
                    assyId: oResults.d.results[i].assyId,
                    assembledQty: oResults.d.results[i].assembledQty,
                    qtyToAssemble: oResults.d.results[i].qtyToAssemble,
                    remainingQty: this.calculateRemainingQty(oResults.d.results[i].assembledQty, oResults.d.results[i].qtyToAssemble),
                    displayAssembled: this.displayAssembled(this.calculateRemainingQty(oResults.d.results[i].assembledQty, oResults.d.results[i].qtyToAssemble)), 
                    defaultQty: this.calculateQtyEntryField(oResults.d.results[i].assembledQty, oResults.d.results[i].qtyToAssemble, oResults.d.results[i].lotSize)
                };

                oComponents[oComponents.length] = componentData;
            }
        }

        return oComponents;
    },      

    /**
    *  Calculate the Qty to be used for the Qty Field
    *  If lotSize QTY is 1, use this value as the Qty.
    *  Otherwise, calcualte the qty based on the assembled qty + totalQty values.
    **/
    calculateQtyEntryField: function (assembledQty, totalQty, lotSize)
    {
        if (lotSize == 1)
        {
            return 1;
        } else {
            return this.calculateRemainingQty(assembledQty, totalQty);
        }

    },

    /**
    * Determines if the Assembled Icon should appear in the list.
    **/
    displayAssembled: function (value)
    {
        if (value > 0) {
            return false;
        } else {
            return true;
        }
    },

    /**
    * Calculate the remaining Quantity
    **/
    calculateRemainingQty: function (assembledQty, totalQty)
    {
        var remaining = 0;

        if (assembledQty < 0) {
            remaining= 0;
            return remaining;
        }
        remaining = totalQty;

        return remaining;
    },

    // Get the Component
    findComponentFromRef: function(ref)
    {
        if (ref.length > 0) {
            var result = ref.split(",");

            if (result.length > 1) {
                return result[1];
            }

        } else {
            return ref;
        }
    },

    // Check if Assy Data is defined for this component
    hasAssyData: function(dataType)
    {
        if (dataType.length > 0) {
            if (dataType === "NONE") {
                return false;
            }
            else {
                return true;
            }            
        } else {
            return false;
        }
    },

    // Returns the value from the Ref
    getRefValue: function(ref, position)
    {
        if (ref !== null && ref.length > 0) {
            var result = ref.split(",");

            if (result !==null && result.length > position) {
                return result[position];
            } else {
                return "";
            }

        } else {
            return "";
        }
    },

    // Get the Component Revision
    findComponentRevisionFromRef: function (ref) {
        if (ref.length > 0) {
            var result = ref.split(",");

            if (result.length > 1) {
                return result[2];
            }

        } else {
            return ref;
        }
    },


    /**
     * sorts a list by the "sequence" number in the list object
     *
     * @param {array} oList to sort
     * @return sorted list
     */
    sortBySequence : function(oList) {

        var oSortedList = oList.sort(function(a, b) {
            var iNumberA = Number(a["sequence"]);
            var iNumberB = Number(b["sequence"]);
            if (isNaN(iNumberA)) {
                return -1;
            }
            if (isNaN(iNumberB)) {
                return 1;
            }
            return (iNumberA > iNumberB) ? 1 : ((iNumberA < iNumberB) ? -1 : 0);
        });

        return oSortedList;
    },

    successCallback: function (oData) {
        util.Model.setData("TEMP_RemoteRequestResults", oData);
    },

    errorCallback: function (errorCode, errorMessage) {
        jQuery.sap.log.error("SystemRules.errorCallback: " + errorMessage);
        if (errorMessage) {
            util.Model.setData("TEMP_ErrorResponse", errorMessage);
        }
    },

    /**
    * Get's the status of the SFC
    **/
    getSfcStatus: function(collectionType, collectionValue)
    {
        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        var resource = util.Model.getData(util.ModelKey.SelectedResource);
        util.Model.setData("TEMP_ErrorResponse", undefined);
        var status = undefined;

        var url = "/manufacturing-odata/Status.svc/";
        if (collectionType === "SFC") {
            url = url + "GetSfcStatus?Sfc='" + collectionValue + "'";
        } else if (collectionType === "SHOP_ORDER") {
            url = url + "GetShopOrderStatus?ShopOrder='" + collectionValue + "'";
        } else if (collectionType === "PROCESS_LOT") {
            url = url + "GetProcessLotStatus?ProcessLot='" + collectionValue + "'";
        }
        url = url + "&Operation='" + operation + "'&OperRev='%23'" + "&Resource='" + resource + "'&ColumnNames='STATUS_CODE'";

        var oResults = util.IOUtil.remoteRequest(url, "GET", null, this.successCallback, this.errorCallback, this);

        // nothing found, notify user
        if (oResults === undefined || oResults.length <= 0) {

            // 10017.simple=No records found for %KEYS%
            var sKey = "SFC.default.LABEL";
            if (collectionType === "SHOP_ORDER") {
                sKey = "SHOP_ORDER.default.LABEL";
            } else if (collectionType === "PROCESS_LOT") {
                sKey = "PROCESS_LOT.default.LABEL";
            }
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%KEYS%", util.I18NUtility.getLocaleSpecificText(sKey));
            var message = util.I18NUtility.getErrorText("10017.simple", oProperties);
            sap.m.MessageBox.alert(message);
            return false;
        }

        // Check if an error occurred.
        var errorMessage = util.Model.getData("TEMP_ErrorResponse");
        if (errorMessage && errorMessage.length > 0) {
            if (errorMessage) {
                jQuery.sap.log.error(errorMessage);
                sap.m.MessageBox.alert(errorMessage);                
                util.Model.removeData("TEMP_ErrorResponse");
            }
            return false;
        } else {
            if (oResults && oResults.d.results.length > 0) {
                status = oResults.d.results[0].value.toUpperCase();
            }
        }

        return status;
    },


 /**
 * Returns the SFC's for Shop Order / Process Lot
 *
 * @param {string} collectionType ("SFC", "SHOP_ORDER" or "PROCESS_LOT")
 * @param {string) collectionValue (sfc, shop order or process lot number)
 * @return undefined or empty list if no SFC's found
 */
    getSfcs: function (collectionType, collectionValue) {
        var sfcs = [];
        if (collectionType === "SFC") {
            sfcs[0] = {
                sfc: collectionValue
            }
        } else if (collectionType === "SHOP_ORDER") {
            var url = "/manufacturing-odata/Production.svc/GetShopOrderMembers?ShopOrder='" + collectionValue + "'";
            sfcs = util.IOUtil.getODataRequestResults(url, false);

        } else if (collectionType === "PROCESS_LOT") {
            var url = "/manufacturing-odata/Production.svc/GetProcessLotMembers?ProcessLot='" + collectionValue + "'";
            sfcs = util.IOUtil.getODataRequestResults(url, false);

        } else {
            throw new Error("Invalid collection type = " + collectionType);
        }

        return sfcs;
    }

};

