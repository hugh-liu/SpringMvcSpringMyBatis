jQuery.sap.declare("com.sap.me.datacollection.view.DCGroupLoader");

jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.IOUtil");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.I18NUtility");

com.sap.me.datacollection.view.DCGroupLoader = {

    /**
     * Returns the list of DC Groups and parameters for the SFC, Shop Order or Process Lot and
     * the list of SFC's and the DC Groups with parametric data.
     *
     * @return undefined if no DC Groups found, else List of DC Groups. Each DC Group contains the following data:
     * <pre>
     *   {
     *        parameterList : list of parameters and user defined parameters
     *        fullfiled : true if all data collected; else false,
     *        sfcList = list of SFC objects {sfc: &sfc, parametricData: {parametricValues: &list, udParametricValues: &list}}
     *   }
     * </pre>
     */
    getDcGroupData : function () {

        var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var collectionValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        var revision = util.Model.getData(util.ModelKey.SelectedOperationRevision);
        if (revision && revision == "#") {
            revision = "%23";
        }
        var resource = util.Model.getData(util.ModelKey.SelectedResource);

        // get list of SFC's
        var oSfcs = undefined;
        try {
            oSfcs = this.getSfcs (collectionType, collectionValue);
        } catch (err) {
           jQuery.sap.log.error(err.message);
           throw err;
        }
        if (!oSfcs || oSfcs.length <= 0) {
            return undefined;
        }

        // get the DC Groups
        var oDcGroupList = this.getDcGroups(collectionType, collectionValue, operation, revision, resource);
        if (!oDcGroupList || oDcGroupList.length <= 0) {
            return undefined;
        }

        // load the DC Group parameters and user defined parameters (filters out DC Groups with no parameters)
        var oFinalDcGroupList = [];
        for (var i = 0; i < oDcGroupList.length; i++) {

            var oResult = this.getDcGroupParameters(oDcGroupList[i]);
            var oParameterList = undefined;
            var oAllUDParameters = undefined;
            if (oResult) {
                oParameterList = oResult.parameterList;
                oAllUDParameters = oResult.udParameterList;
            }

            if (oParameterList && oParameterList.length > 0) {
                oDcGroupList[i].parameterList = oParameterList;
                if (oAllUDParameters && oAllUDParameters.length > 0) {
                    for (var k = 0; k < oDcGroupList[i].parameterList.length; k++) {

                        // check for and add user defined parameters for each parameter
                        if (oAllUDParameters && oAllUDParameters.length > 0) {
                            var oUDParameters = [];
                            for (var j = 0; j < oAllUDParameters.length; j++) {
                                if (oAllUDParameters[j].parentParameter === oParameterList[k].parameterName) {
                                    oUDParameters[oUDParameters.length] = oAllUDParameters[j];
                                }
                            }
                            if (oUDParameters && oUDParameters.length > 0) {
                                oUDParameters = this.sortBySequence(oUDParameters);
                                oDcGroupList[i].parameterList[k].udParameterList = oUDParameters;
                            }
                        }
                    }
                }
                oFinalDcGroupList[oFinalDcGroupList.length] = oDcGroupList[i];
            }
        }

        // load the sfc's and sfc's parametric data for each DC Group
        for (var j = 0; j < oFinalDcGroupList.length; j++) {
            var oList = [];
            for (var i = 0; i < oSfcs.length; i++) {
                var oSfc = {
                    sfc:  oSfcs[i].sfc
                };
                oSfc.fullfilled = this.loadParametricData(oFinalDcGroupList[j], oSfc, oFinalDcGroupList[j].parameterList);
                oList[oList.length] = oSfc;
            }
            oFinalDcGroupList[j].sfcList = oList;
            oFinalDcGroupList[j].fullfilled = this.isDcGroupFullfilled(oFinalDcGroupList[j]);
            oFinalDcGroupList[j].displayFullfilled = oFinalDcGroupList[j].fullfilled;
            if (util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION")) {
                oFinalDcGroupList[j].displayFullfilled = false;
            }
        }

        // validate collection methods
        this.validateDcGroupCollectionMethods(oFinalDcGroupList);

        // sort final DC group list
        oFinalDcGroupList = this.sortByCollectMethodAndSequence(oFinalDcGroupList);
        //reindex it because ethe records may have been moved around after the sort.
        for (var i = 0; i < oFinalDcGroupList.length; i++) {
        	oFinalDcGroupList[i].index = i;
        }

        return oFinalDcGroupList;
    },

    /**
     * Returns the DC Groups for the input information
     *
     * @param {string} collectionType ("SFC", "SHOP_ORDER" or "PROCESS_LOT")
     * @param {string) collectionValue (sfc, shop order or process lot number)
     * @param {string) operation
     * @param {string) revision
     * @param {string) resource
     * @return undefined if no DC Groups found
     */
    getDcGroups : function (collectionType, collectionValue, operation, revision, resource) {

        var queryParameters = collectionValue + "'&Operation='" + operation + "'&OperRev='" + revision + "'&Resource='" + resource + "'";

        var url = undefined;
        if (collectionType === "SFC") {
            url = "/manufacturing-odata/DataCollect.svc/GetDcGroupsForSfc?Sfc='" + queryParameters;
        } else if (collectionType === "SHOP_ORDER") {
            url = "/manufacturing-odata/DataCollect.svc/GetDcGroupsForShopOrder?ShopOrder='" + queryParameters;
        } else if (collectionType === "PROCESS_LOT") {
            url = "/manufacturing-odata/DataCollect.svc/GetDcGroupsForProcessLot?ProcessLot='" + queryParameters;
        } else {
            throw new Error("Invalid collection type = " + collectionType);
        }

        var oResults = undefined;
        try {
            oResults = util.IOUtil.getODataRequestResults(url, false);
        } catch (err) {
            jQuery.sap.log.error(err.message);
            throw err;
        }

        var oDcGroupList = [];
        if (oResults && oResults.length > 0) {

            // sort list in ascending order
            oResults = this.sortBySequence(oResults);

            for (var i = 0; i < oResults.length; i++) {

                if (oResults[i].dcParameterList && oResults[i].dcParameterList.__deferred) {
                    oResults[i].parameterListUri = oResults[i].dcParameterList.__deferred.uri;
                }

                var dcGroupData = {
                       index: i,
                       dcGroupRef: oResults[i].dcGroupRef,
                       dcGroup: oResults[i].dcGroup,
                       dcGroupRevision: oResults[i].revision,
                       dcGroupVersion: oResults[i].dcGroup + "/" + oResults[i].revision,
                       description: oResults[i].description,
                       parameterListUri: oResults[i].parameterListUri,
                       certificationRef: oResults[i].certificationRef,
                       site: oResults[i].site,
                       authenticationRequired: oResults[i].authenticationRequired,
                       collectMethod: oResults[i].collectMethod,
                       sequence: oResults[i].sequence,
                       typeSelection: collectionType,
                       typeValue: collectionValue,
                       operation: operation,
                       revision: revision,
                       resource: resource
                };

                oDcGroupList[oDcGroupList.length] = dcGroupData;
            }
        }

        return oDcGroupList;
    },

    /**
     * Returns the SFC's for Shop Order / Process Lot
     *
     * @param {string} collectionType ("SFC", "SHOP_ORDER" or "PROCESS_LOT")
     * @param {string) collectionValue (sfc, shop order or process lot number)
     * @return undefined or empty list if no SFC's found
     * @throws Error if exception getting results
     */
    getSfcs : function (collectionType, collectionValue) {

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
    },

    /**
     * Returns the DC Groups parameters
     *
     * @param {object} oDcGroup DC Group data
     * @return undefined or object containing parameters {parameterList: &list, udParameterList: &list}
     */
    getDcGroupParameters : function(oDcGroup) {

        var dcGroup = oDcGroup.dcGroup;
        var dcGroupRev = oDcGroup.dcGroupRevision;

        // get parameters for selected DC Group
        var url = "/manufacturing-odata/DataCollect.svc/GetDcGroupParameters?DcGroup='" + dcGroup + "'&GroupRev='" + dcGroupRev + "'";
        var oParameterList = undefined;
        try {
            oParameterList = util.IOUtil.getODataRequestResults(url, false);
        } catch (err) {
            jQuery.sap.log.error(err.message);
            return undefined;
        }
        if (!oParameterList || oParameterList.length <= 0) {
            return undefined;
        }

        // sort list in ascending order
        oParameterList = this.sortBySequence(oParameterList);

        // get all user defined parameters for the DC Group
        url = "/manufacturing-odata/DataCollect.svc/GetAllUserDefinedParameters?DcGroup='" + dcGroup + "'&GroupRev='" + dcGroupRev + "'";
        var oAllUDParameters = undefined;
        try {
            oAllUDParameters = util.IOUtil.getODataRequestResults(url, false);
        } catch (err) {
            jQuery.sap.log.error(err.message);
        }

        var oResult = {
            parameterList: oParameterList,
            udParameterList: oAllUDParameters
        };

        return oResult;
    },

    /**
     * Returns the DC Group parameters parametric data for the input SFC
     *
     * @param {object} oDcGroup DC Group data
     * @param {string} sSfc SFC to get parametric data for
     * @return an object containing values {parametricValues: &list, udParametricValues: &list}
     */
    getParametricData : function(oDcGroup, sSfc) {

        // get all the parametric values for the DC Group and SFC
        var dcGroup = oDcGroup.dcGroup;
        var dcGroupRev = oDcGroup.dcGroupRevision;
        var operation = oDcGroup.operation;
        var revision = oDcGroup.revision;
        if (revision && revision == "#") {
            revision = "%23";
        }

        // set up query string for getting parametric data
        var queryParameters ="?DcGroup='" + dcGroup + "'&GroupRev='" + dcGroupRev + "'&Sfc='" + sSfc + "'&Operation='" + operation + "'&OperRev='" + revision + "'";

        // get all parametric values
        url = "/manufacturing-odata/DataCollect.svc/GetParametricValues" + queryParameters;
        var oParametricValues = undefined;
        try {
            oParametricValues = util.IOUtil.getODataRequestResults(url, false);
        } catch (err) {
            jQuery.sap.log.error(err.message);
        }
        if (oParametricValues && oParametricValues.length > 0) {
            oParametricValues = this.sortBySequence(oParametricValues);
        }

        // get all the user defined parametric values for the DC Group
        url = "/manufacturing-odata/DataCollect.svc/GetAllUserDefinedParametricValues" + queryParameters;
        var oUDParametricValues = undefined;
        try {
            oUDParametricValues = util.IOUtil.getODataRequestResults(url, false);
        } catch (err) {
            jQuery.sap.log.error(err.message);
        }

        var oResults = {
            parametricValues: oParametricValues,
            udParametricValues: oUDParametricValues
        };

        return oResults;
    },

    /**
     * Loads the parametric data for the DC Group and SFC and loads the parametric data
     * into the SFC object.
     *
     * @param {object} oDcGroup DC Group to update
     * @param {object} oSfc SFC to load paramteric data to
     * @param {object} oParameterList Parameter List to get parametric values
     * @return true if fullfilled, else false
     */
    loadParametricData : function (oDcGroup, oSfc, oParameterList) {

        // get parametric data for the DC Group and SFC
        var oParametricData = this.getParametricData(oDcGroup, oSfc.sfc);
        var oParametricValues = undefined;
        var oUDParametricValues = undefined;
        if (oParametricData) {
            oParametricValues = oParametricData.parametricValues;
            oUDParametricValues = oParametricData.udParametricValues;
        }

        // add parametricData to SFC
        oSfc.parametricData = oParametricData;

        // check to see if parametric data already defined (i.e. fullfilled)
        for (var k = 0; k < oParameterList.length; k++) {
            if (oParametricValues && oParametricValues.length > 0) {
                for (var l = 0; l <oParametricValues.length; l++) {
                    if (oParametricValues[l].measureName === oParameterList[k].parameterName) {
                        return true;
                    }
                }
            }
        }

        // nothing fullfiled for this DC Group and SFC
        return false;
    },

    /**
     * validates the DC Groups collection modes against the ENFORCE_GROUP_MODE rule
     * <pre>
     *     1) If 1 SFC - Single mode - No Error
     *     2) SFC's are partially collected - Error if enforce group mode, else single mode
     *
     *     The following error cannot occur in Mobile DC since individual SFC's cannot be selected
     *     3) Group not attached to all SFC's
     * </pre>
     *
     * @param {array} oDcGroupList List of DC Groups to validate
     */
    validateDcGroupCollectionMethods : function(oDcGroupList) {

        var bEnforceGroupMode = util.Model.getData("TEMPDC_ENFORCE_GROUP_MODE");
        if (bEnforceGroupMode === undefined || bEnforceGroupMode === null) {
            bEnforceGroupMode = false;
        }

        // for single SFC case - force sequential mode
        if (oDcGroupList && oDcGroupList.length <= 1) {
            oDcGroupList[0].resolvedCollectMethod = oDcGroupList[0].collectMethod;
            if (oDcGroupList[0].collectMethod === "MULTIPLE_GROUP") {
                if (oDcGroupList[0].sfcList.length == 1) {
                    oDcGroupList[0].resolvedCollectMethod = "MULTIPLE_SEQUENTIAL";
                    return;
                }
            }
        }

        for (var j = 0; j < oDcGroupList.length; j++) {

            oDcGroupList[j].resolvedCollectMethod = oDcGroupList[j].collectMethod;

            // DC Group SFC's not fullfiled - check if any SFC's have been fullfiled?
            if (!oDcGroupList[j].fullfilled) {

                // each SFC parametric data must be fullfilled
                var unfullfilledSfcList = [];
                for (var i = 0; i < oDcGroupList[j].sfcList.length; i++) {

                    // no parametric for this SFC - return false
                    if (oDcGroupList[j].sfcList[i].fullfilled) {

                        // if enforce group mode, throw error
                        if (bEnforceGroupMode) {
                            if (oDcGroupList[j].typeSelection === "SHOP_ORDER" ||
                                oDcGroupList[j].typeSelection === "PROCESS_LOT") {

                                // 16646.simple=SFCs in "%VALUE%" cannot be processed as a group because data was previously collected for DC group "%DC_GROUP%"
                                var oProperties = jQuery.sap.properties();
                                oProperties.setProperty("%VALUE%", oDcGroupList[j].typeValue);
                                oProperties.setProperty("%DC_GROUP%", oDcGroupList[j].dcGroup);

                                var sMessage = util.I18NUtility.getErrorText("16646.simple", oProperties);

                                throw new Error(sMessage);

                            // defer SFC error to build list of uncollected sfcs
                            } else {
                                unfullfilledSfcList[unfullfilledSfcList.length] = oDcGroupList[j].sfcList[i].sfc;
                            }

                        // not enforce group mode, change to sequential mode
                        } else  if (oDcGroupList[j].collectMethod === "MULTIPLE_GROUP") {
                            oDcGroupList[j].resolvedCollectMethod = "MULTIPLE_SEQUENTIAL";
                            break;
                        }
                    }
                }

                // unfullfilled sfcs found and enforce group mode
                if (unfullfilledSfcList && unfullfilledSfcList.length > 0) {
                    // 16644.simple=Selected SFCs (%SFC_LIST%) cannot be processed as a group because data was previously collected for DC group "%DC_GROUP%"
                    var sfcs = "";
                    for (var k = 0; k < unfullfilledSfcList.length; k++) {
                        if (k > 0) {
                            sfcs = sfcs + ", ";
                        }
                        sfcs = sfcs + unfullfilledSfcList[k];
                    }
                    var oProperties = jQuery.sap.properties();
                    oProperties.setProperty("%SFC_LIST%", sfcs);
                    oProperties.setProperty("%DC_GROUP%", oDcGroupList[j].dcGroup);
                    var sMessage = util.I18NUtility.getErrorText("16646.simple", oProperties);
                    throw new Error(sMessage);
                }
            }
        }
    },

    /**
     * checks if the input DC Group has been fullfiled.  All SFC's parametric data
     * must be loaded for this to be true.
     *
     * @param {object} oDcGroup DC Group data to check (Must be fully loaded)
     * @return undefined or empty list if no parametric data found
     */
    isDcGroupFullfilled : function(oDcGroup) {

        // assume all SFC's parametric data fullfiled

        if (oDcGroup && oDcGroup.sfcList && oDcGroup.sfcList.length > 0) {

            // each SFC parametric data must be fullfilled
            for (var i = 0; i < oDcGroup.sfcList.length; i++) {

                // no parametric for this SFC - return false
                if (!oDcGroup.sfcList[i].parametricData) {
                    return false;
                }

                var oParametricValues = oDcGroup.sfcList[i].parametricData.parametricValues;
                if (!oParametricValues || oParametricValues.length <= 0) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Returns the parametric data for the SFC and input parameter name
     *
     * @param {object} oSfc SFC to get paramteric data from
     * @param {object} oParameter Parameter to get parametric data for
     * @param {integer} iIndex index of control to get parameter for (based on # of required & optionals defined)
     * @return {object} Parametric data object if found, else false
     */
    getParametricValue : function (oSfc, oParameter, iIndex) {

        if (!oSfc || !oSfc.parametricData) {
            return undefined;
        }
        var oParametricValues = oSfc.parametricData.parametricValues;

        // check parametric values
        if (oParametricValues && oParametricValues.length > 0) {
            var count = 0;
            for (var l = 0; l <oParametricValues.length; l++) {
                if (oParametricValues[l].measureName === oParameter.parameterName) {
                    if (count == iIndex) {
                        return oParametricValues[l];
                    }
                    count++;
                }
            }
        }

        return undefined;
    },

    /**
     * Returns the parametric data for the SFC and input user defined parameter
     *
     * @param {object} oSfc SFC to get paramteric data from
     * @param {object} oParameter Parameter to get parametric data for
     * @return {object} Parametric data object if found, else false
     */
    getUDParametricValue : function (oSfc, oParameter) {

        if (!oSfc || !oSfc.parametricData) {
            return undefined;
        }
        var oUDParametricValues = oSfc.parametricData.udParametricValues;

        // check user defined parametric values
        if (oUDParametricValues && oUDParametricValues.length > 0) {
           for (var l = 0; l <oUDParametricValues.length; l++) {
               if (oUDParametricValues[l].propertyName === oParameter.prompt) {
                   return oUDParametricValues[l];
                }
            }
        }

        return undefined;
    },


    /**
     * sorts a list by the resolved collection method and secondarily the "sequence" number in the list object
     *
     * @param {array} oList to sort
     * @return sorted list
     */
    sortByCollectMethodAndSequence : function(oList) {

        var oSortedList = oList.sort(function(a, b) {
              var sCollectMethodA = a["resolvedCollectMethod"];
              var sCollectMethodB = b["resolvedCollectMethod"];
              var iNumberA = Number(a["sequence"]);
              var iNumberB = Number(b["sequence"]);

              if (util.StringUtil.isBlank(sCollectMethodA)) {
                  return -1;
              }
              if (util.StringUtil.isBlank(sCollectMethodB)) {
                  return 1;
              }
              if (isNaN(iNumberA)) {
                  return -1;
              }
              if (isNaN(iNumberB)) {
                  return 1;
              }
              if (sCollectMethodA !== sCollectMethodB) {
                  if (sCollectMethodA === "MULTIPLE_SEQUENTIAL") {
                      return -1;
                  } else if (sCollectMethodB === "MULTIPLE_SEQUENTIAL") {
                      return 1;
                  }
              }
              return (iNumberA > iNumberB) ? 1 : ((iNumberA < iNumberB) ? -1 : 0);
        });

        return oSortedList;
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
    }


};
