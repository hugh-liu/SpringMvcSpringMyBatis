jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.sap.me.datacollection.view.ComponentConfigurator");
jQuery.sap.require("com.sap.me.datacollection.view.DCTypes");

sap.ui.controller("com.sap.me.datacollection.view.DCDataEntry", {
   
    onInit : function() {
    	
    },

    onBeforeShow : function(evt) {
    	processedComps = undefined;
        if (evt.data && evt.data.context) {
            oView.setBindingContext(evt.data.context);
        }

        // save where this view was launched from
        this.fromViewId = evt.fromId;
        this.fromNamespace = evt.data.namespace;

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("DCDataEntry.loadPage: view for controller not defined");
            sap.m.MessageBox.alert("DCDataEntry.loadPage: view for controller not defined.");
            return;
        }

        // set the visibility of the save button and apply to all check box
        var oButtonControl = oView.byId("saveButtonCenter");
        if (oButtonControl) {
            oButtonControl.setVisible(false);
        }
        oButtonControl = oView.byId("saveButtonRight");
        if (oButtonControl) {
            oButtonControl.setVisible(false);
        }
        oButtonControl = oView.byId("clearButtonCenter");
        if (oButtonControl) {
            oButtonControl.setVisible(false);
        }
        oButtonControl = oView.byId("previousButton");
        if (oButtonControl) {
            oButtonControl.setVisible(false);
        }
        oButtonControl = oView.byId("nextButton");
        if (oButtonControl) {
            oButtonControl.setVisible(false);
        }
        var oAllHBoxControl = oView.byId("allHBox");
        if (oAllHBoxControl) {
            oAllHBoxControl.setVisible(false);
        }

        var sView = util.Model.getData(util.ModelKey.CurrentApplicationView);

        // loading from start - default to true
        if (this.fromViewId === sView || this.fromViewId  === "DCGroupList") {
            this.bApplyToAll = true;
            var oCheckBoxControl = oView.byId("allCheckBox");
            if (oCheckBoxControl) {
                oCheckBoxControl.setSelected(true);
            }
        }

        // load initial page
        this.iCurrentSfcIndex = 0;
        this.iCurrentGroupListIndex = 0;
        var oLoadResults = this.loadPage(this.iCurrentGroupListIndex);

    },

    loadPage : function(iGroupListIndex) {

       util.Model.setUnsavedDataDefined(false);

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("DCDataEntry.loadPage: view for controller not defined");
            sap.m.MessageBox.alert("DCDataEntry.loadPage: view for controller not defined.");
            return {success: false, done: true, authenticating: false};
        }

        var oSelectedDcGroupList = util.Model.getData(util.ModelKey.SelectedDCGroupList);
        if (!oSelectedDcGroupList) {
            // var message = util.I18NUtility.getErrorText("17214.simple");
            sap.m.MessageBox.alert("DC Group not selected!");
            return {success: false, done: true, authenticating: false};
        }

        this.oDcGroupList = [];
        if (util.Model.getData("DC_AUTO_NEXT")) {
            if (oSelectedDcGroupList && oSelectedDcGroupList.length > iGroupListIndex) {
                this.oDcGroupList[0] = oSelectedDcGroupList[iGroupListIndex];
            } else {
                return {success: true, done: true, authenticating: false};
            }
        } else {
            this.oDcGroupList = oSelectedDcGroupList;
        }

        if (!this.oDcGroupList || this.oDcGroupList.length == 0) {
            return {success: true, done: true, authenticating: false};
        }

        // determine whether to show Apply To All or not
        // this.bApplyToAll = true;
        this.bShowApplyToAll = false;
        if (util.Model.getData("TEMPDC_SHOW_APPLY_TO_ALL")) {
            if (this.oDcGroupList.length == 1) {
                if (this.oDcGroupList[0].resolvedCollectMethod ===  "MULTIPLE_GROUP") {
                    if (this.oDcGroupList[0].sfcList.length > 1) {
                        this.bShowApplyToAll = true;
                    }
                }
            }
        }

        // if PROCESS_ALL_DC_GROUPS is in effect, use single mode only
        if (util.Model.getData("DC_PROCESS_ALL_DC_GROUPS")) {
            this.bApplyToAll = false; // only single mode supported
            this.bShowApplyToAll = false;

        // PROCESS_ALL_DC_GROUPS not in effect - check if DC Group is Manual-Single
        } else {
            if (this.oDcGroupList.length == 1) {
                if (this.oDcGroupList[0].resolvedCollectMethod ===  "MULTIPLE_SEQUENTIAL") {
                    this.bApplyToAll = false; // only single mode supported
                    this.bShowApplyToAll = false;
                } else if (this.oDcGroupList[0].resolvedCollectMethod ===  "MULTIPLE_GROUP") {
                    oControl = oView.byId("allCheckBox");
                    if (oControl) {
                        this.bApplyToAll = oControl.getSelected();
                    }
                }
            }
        }

        // set the fullfilled group flag if data already collected
        var bFullfilled = this.setFullfilledGroupFlags();

        // calculate page (sfc) to display next unfullfilled SFC (except for when allow multiple data collection is enabled)
        this.iCurrentSfcPageIndex = 0;
        if (!bFullfilled && !util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION")) {

            // get current SFC to process - for single mode that will be the first unfullfilled SFC
            if (this.oDcGroupList.length == 1 && this.oDcGroupList[0].sfcList.length > 1) {
                if ( !this.bShowApplyToAll || (!this.bApplyToAll && this.bShowApplyToAll) ) {
                    for (var j = 0; j < this.oDcGroupList[0].sfcList.length; j++) {
                        if (!this.oDcGroupList[0].sfcList[j].fullfilled) {
                            this.iCurrentSfcPageIndex = j;
                            break;
                        }
                    }
                }
            }
        }

        // set footer bar based on show to all flag
        this.setFooterBar(bFullfilled);

        // check if authentication is needed for auto_next DC Group (first one already checked) and nothing collected
        if (!bFullfilled && util.Model.getData("DC_AUTO_NEXT") && iGroupListIndex > 0) {
            this.oDcGroupList[0].authenticatedUserId = null;
            if (this.oDcGroupList[0].authenticationRequired && !util.StringUtil.isBlank(this.oDcGroupList[0].certificationRef)) {

                // show success message before authentication dialog is displayed
                this.showPendingSuccessMessage();

                // do authentication
                this.oDcGroupList[0].authenticatedUserRef = null;
                this.authenticateUser(this.oDcGroupList[0]);
                return {success: true, done: false, authenticating: true};
            }
        }

        // no authentication required just load page and go
        var oBuildResults = this.buildPage();

        // show success message now that screen is built
        this.showPendingSuccessMessage();

        return oBuildResults;
    },

    setFooterBar : function(bAllFullfilled) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("DCDataEntry.setFooterBar: view for controller not defined");
            return;
        }

        if (bAllFullfilled && !util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION")) {
            var oControl = oView.byId("saveButtonCenter");
            if (oControl) {
                oControl.setVisible(false);
            }
            oControl = oView.byId("saveButtonRight");
            if (oControl) {
                oControl.setVisible(false);
            }
            oControl = oView.byId("clearButtonCenter");
            if (oControl) {
                oControl.setVisible(false);
            }
            oControl = oView.byId("allHBox");
            if (oControl) {
                oControl.setVisible(false);
            }
            var bVisible = false;
            if (this.oDcGroupList.length == 1 && this.oDcGroupList[0].sfcList.length > 1) {
                bVisible = true;
            }
            oControl = oView.byId("previousButton");
            if (oControl) {
                oControl.setVisible(bVisible);
            }
            oControl = oView.byId("nextButton");
            if (oControl) {
                oControl.setVisible(bVisible);
            }
        } else {
            var oControl = oView.byId("saveButtonCenter");
            if (oControl) {
                oControl.setVisible(!this.bShowApplyToAll);
            }
            oControl = oView.byId("saveButtonRight");
            if (oControl) {
                oControl.setVisible(this.bShowApplyToAll);
            }
            oControl = oView.byId("allHBox");
            if (oControl) {
                oControl.setVisible(this.bShowApplyToAll);
            }
            oControl = oView.byId("clearButtonCenter");
            if (oControl) {
                oControl.setVisible(true);
            }
            if (this.bShowApplyToAll) {
                oControl = oView.byId("allCheckBox");
                if (oControl) {
                    oControl.setSelected(this.bApplyToAll);
                }

            // add pagers if multiple data collection allowed
            } else if (util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION")) {
                var bVisible = false;
                if (this.oDcGroupList.length == 1 && this.oDcGroupList[0].sfcList.length > 1) {
                    bVisible = true;
                }
                oControl = oView.byId("previousButton");
                if (oControl) {
                    oControl.setVisible(bVisible);
                }
                oControl = oView.byId("nextButton");
                if (oControl) {
                    oControl.setVisible(bVisible);
                }
            }
        }
    },

    setFullfilledGroupFlags : function() {

        // If anything has been collected and logged for any of these DC Groups set the fullfilled flag
        var bFullfilled = false;
        for (var i = 0; i < this.oDcGroupList.length; i++) {
            if (com.sap.me.datacollection.view.DCGroupLoader.isDcGroupFullfilled(this.oDcGroupList[i])) {
                bFullfilled =  true;
                break;
            }
        }
        if (bFullfilled) {
            for (var i = 0; i < this.oDcGroupList.length; i++) {
                this.oDcGroupList[i].fullfilled = true;
                this.oDcGroupList[i].displayFullfilled = this.oDcGroupList[i].fullfilled;
                if (util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION")) {
                    this.oDcGroupList[i].displayFullfilled = false;
                }
            }
        }

        return bFullfilled;
    },

    buildPage : function() {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("DCDataEntry.loadPage: view for controller not defined");
            sap.m.MessageBox.alert("DCDataEntry.loadPage: view for controller not defined.");
            return {success: false, done: true, authenticating: false};
        }

        if (!this.oDcGroupList || this.oDcGroupList.length == 0) {
            return {success: true, done: true, authenticating: false};
        }

        // set SFC collection mode
        this.bMultipleSfcMode = false;
        if (this.oDcGroupList.length == 1 && this.bApplyToAll) {
            if (this.oDcGroupList[0].resolvedCollectMethod ===  "MULTIPLE_GROUP") {
                if (this.oDcGroupList[0].sfcList.length > 1) {
                    this.bMultipleSfcMode = true;
                }
            }
        }

        // add the data type fields
        var oDataEntryPage = oView.byId("dataEntryPage");
        if (oDataEntryPage) {

            var bMultipleDataCollection = util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION");

            oDataEntryPage.destroyContent();

            this.iCurrentSfcIndex = com.sap.me.datacollection.view.ComponentConfigurator.getControls(oView, this, this.oDcGroupList, this.bShowApplyToAll, this.bApplyToAll, bMultipleDataCollection, this.iCurrentSfcPageIndex);
        }

        return {success: true, done: false, authenticating: false};
    },

    onAfterShow : function(evt) {
    	processedComps = undefined;
    },

    dataEntryChange : function(oEvent) {
        if (oEvent) {
            var oSource = oEvent.getSource(); // this is the control
            if (!oSource.getEnabled()) {
                return;
            }
            var oData = oSource.getCustomData();
            // reset any error condition
            if (oSource.getValueState() === sap.ui.core.ValueState.Error) {
                oSource.setValueState(sap.ui.core.ValueState.None);
                oSource.setValueStateText("");
            }
            util.Model.setUnsavedDataDefined(true);
            util.Model.setCustomDataValue(oData, "bChanged", true);
        }
    },

    userDataEntryChange : function(oEvent) {
        if (oEvent) {

            var oSource = oEvent.getSource(); // this is the control
            if (!oSource.getEnabled()) {
                return;
            }
            var oData = oSource.getCustomData();

            // reset any error condition
            if (oSource.getValueState() === sap.ui.core.ValueState.Error) {
                oSource.setValueState(sap.ui.core.ValueState.None);
                oSource.setValueStateText("");
            }

            util.Model.setUnsavedDataDefined(true);
            util.Model.setCustomDataValue(oData, "bChanged", true);
        }
    },

    allCheckBoxChange : function(oEvent) {
        var oSource = oEvent.getSource(); // this is the control
        if (oSource) {
            this.bApplyToAll = oSource.getSelected();
            this.buildPage();
        }
    },

    previousButtonTap : function() {
        this.iCurrentSfcPageIndex--;
        if (this.iCurrentSfcPageIndex < 0) {
            this.iCurrentSfcPageIndex = 0;
        }
        this.buildPage();
    },

    nextButtonTap : function() {
        this.iCurrentSfcPageIndex++;
        if (this.iCurrentSfcPageIndex >= this.oDcGroupList[0].sfcList.length) {
            this.iCurrentSfcPageIndex = this.oDcGroupList[0].sfcList.length - 1;
        }
        this.buildPage();
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
                          util.Model.setUnsavedDataDefined(false);
                          thisController.exitProcessing();
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
              this.exitProcessing();
              var bus = sap.ui.getCore().getEventBus();
              bus.publish("nav", "to", {
                    id : "Home"
              });
        }
    },

    clearButtonTap : function() {
        if (!this.oDcGroupList) {
            return;
        }

        var oView = this.getView();
        if (!oView) {
            return;
        }

        try {
            com.sap.me.datacollection.view.ComponentConfigurator.clearTextFields(oView, this.oDcGroupList);
        } catch (err) {
            jQuery.sap.log.error(err.message);
            sap.m.MessageToast.show(err.message, {
                duration: 5000,
                animationDuration: 500
            });
            return;
        }
    },

    saveButtonTap : function(evt) {

        // clear to make sure old errors do not re-display
        util.Model.removeData("TEMP_DCSaveResults");
        this.sPendingSuccessMessage = undefined;

        if (!this.oDcGroupList) {
            //  17214.simple=Data to Collect list is missing
            var message = util.I18NUtility.getErrorText("17214.simple");
            sap.m.MessageBox.alert(message);
            return;
        }

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("DCDataEntry.saveButtonTap: view for controller not defined");
            return;
        }

        var oDataValues = undefined;
        try {
            oDataValues = com.sap.me.datacollection.view.ComponentConfigurator.getDataValues(oView, this, this.oDcGroupList, this.iCurrentSfcIndex, this.bApplyToAll);
        } catch (err) {
        	jQuery.sap.log.error(err.message);
        	if ( err instanceof Error) {
        		jQuery.sap.log.error(err.message);
        		sap.m.MessageToast.show(err.message, {
        			duration: 5000,
        			animationDuration: 500
        		});
        	} else {
        		sap.m.MessageBox.show(
        				err.popupmessage,
        				sap.m.MessageBox.Icon.QUESTION,
        				util.I18NUtility.getLocaleSpecificText("confirm.title.TEXT"),
        				[sap.m.MessageBox.Action.OK,sap.m.MessageBox.Action.CANCEL ],
        				function(oAction) {
        					if (oAction) {
        						if (oAction === sap.m.MessageBox.Action.CANCEL) {
        							err.comp.setValueState(sap.ui.core.ValueState.Error);
        							err.comp.setValueStateText(err.message);
        							if ( err.controller.processedComps) {
        								err.controller.processedComps[err.comp.getId()] = undefined;
        							}
        						} else {
        							err.comp.setValueState(sap.ui.core.ValueState.SUCCESS);
        							err.comp.setValueStateText("");
        							if ( ! err.controller.processedComps) {
        								err.controller.processedComps = new Array();
        							}
        							err.controller.processedComps[err.comp.getId()] = err.comp;
        							err.controller.saveButtonTap(evt);
        						}
        					}
        				});  
        	}

        	return;
        }

        if (oDataValues && oDataValues.length > 0) {

            var jsonString = JSON.stringify(oDataValues);

            // jQuery.sap.log.debug("saveButtonTap: post data = " + jsonString);

            util.IOUtil.remoteRequest("/manufacturing-odata/DataCollect.svc/DcParameters", "POST", jsonString, this.saveSuccessCallback, this.addErrorCallback, this);

            var results = util.Model.getData("TEMP_DCSaveResults");
            if (results && results.length > 0) {

                var bSuccess = true;
                var finalMessage = "";
                for (var i = 0; i < results.length; i++) {
                    if (i > 0) {
                        finalMessage = finalMessage + "\n";
                    }
                    finalMessage = finalMessage + results[i].message;
                    if (results[i].status === "ERROR") {
                        bSuccess = false;
                    }
                }

                var bDone = true;
                var bShowMessage = true;
                if (bSuccess) {

                    // save this for auto_next and multiple sfc - single mode
                    this.sPendingSuccessMessage = finalMessage

                    // set up group index - if auto stepping through groups index is 0
                    var iGroupIndex = this.iCurrentGroupListIndex;
                    if (util.Model.getData("DC_AUTO_NEXT")) {
                        iGroupIndex = 0;
                    }

                    // multiple mode - update local fullfilled flags and go to next DC group
                    if (this.bMultipleSfcMode) {
                        for (var i = 0; i < this.oDcGroupList[iGroupIndex].sfcList.length; i++) {
                            this.oDcGroupList[iGroupIndex].sfcList[i].fullfilled = true;
                        }
                        this.oDcGroupList[iGroupIndex].fullfilled = true;
                        this.oDcGroupList[iGroupIndex].displayFullfilled = true;
                        if (util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION")) {
                            this.oDcGroupList[iGroupIndex].displayFullfilled = false;
                        }

                    // single sfc mode - update single SFC and set fullfilled flag
                    } else {

                        // when procesing all DC Groups, need to check all DC Groups for fullfilled state
                        var iGroupStartIndex =  iGroupIndex;
                        var iGroupCount = iGroupIndex + 1;
                        if (util.Model.getData("DC_PROCESS_ALL_DC_GROUPS")) {
                            iGroupStartIndex =  0;
                            iGroupCount = this.oDcGroupList.length;
                        }

                        // set fullfilled flags for SFC's and DC Group(s)
                        var bAllFullfilled = true;
                        var bLastSfcProcessed = false;
                        for (var g = iGroupStartIndex; g < iGroupCount; g++) {

                            // set current sfc to fullfilled
                            this.oDcGroupList[g].sfcList[this.iCurrentSfcIndex].fullfilled = true;

                            // set DC Group fullfiled flag if all SFC's have been fullfilled
                            for (var i = 0; i < this.oDcGroupList[g].sfcList.length; i++) {
                                if (!this.oDcGroupList[g].sfcList[i].fullfilled) {
                                    bAllFullfilled = false;
                                    break;
                                }
                            }
                            this.oDcGroupList[g].fullfilled = bAllFullfilled;
                            this.oDcGroupList[g].displayFullfilled = bAllFullfilled;
                            bLastSfcProcessed = bAllFullfilled;
                            if (util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION")) {
                                this.oDcGroupList[g].displayFullfilled = false;

                                // check if this is the last SFC for this group SFC list
                                if (this.iCurrentSfcIndex < (this.oDcGroupList[g].sfcList.length-1)) {
                                    bLastSfcProcessed = false;
                                }
                            }
                        }

                        // not all fullfilled, process next SFC
                        if (!bAllFullfilled || !bLastSfcProcessed) {

                            // once something was saved and applied to all SFC's, stop showing check box
                            if (!this.bApplyToAll && this.bShowApplyToAll) {
                                this.bShowApplyToAll = false;

                                // set footer bar based on show to all flag
                                this.setFooterBar(bAllFullfilled);
                            }

                            // increment to next page
                            this.iCurrentSfcPageIndex++;

                            // build next page
                            this.buildPage();

                            // show success message now that screen is built
                            this.showPendingSuccessMessage();

                            return;
                        }
                    }

                    // load next page
                    if (util.Model.getData("DC_AUTO_NEXT")) {
                        this.iCurrentGroupListIndex++;
                        var oResult = this.loadPage(this.iCurrentGroupListIndex);
                        if (oResult.authenticating) {
                            return;
                        }
                        bDone = oResult.done;
                        bShowMessage = false;

                        if (bDone && !util.StringUtil.isBlank(this.sPendingSuccessMessage)) {
                            bShowMessage = true;
                            finalMessage = this.sPendingSuccessMessage;
                            this.sPendingSuccessMessage = undefined;
                        }

                    }
                }

                var bFinished = bSuccess && bDone;

                this.processNext(bFinished, finalMessage, bShowMessage, this.fromViewId, this.fromNamespace);  // was "Data Collection"
            }

        // nothing to save - can be caused when save on optional parameters with nothing entered
        } else {

            // load next page
            if (util.Model.getData("DC_AUTO_NEXT")) {x
                this.iCurrentGroupListIndex++;
                var oResult = this.loadPage(this.iCurrentGroupListIndex);
                if (oResult.authenticating) {
                    return;
                }
            }

            this.processNext(true, "", false, this.fromViewId, this.fromNamespace);
        }
    },

    saveSuccessCallback : function(oData) {
        this.processedComps = undefined;
        // create message to display
        var collectTypeName = undefined;
        var collectType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        for (var i = 0; i < 3; i++) {
            if (collectType === com.sap.me.datacollection.view.DCTypes[i].value) {
                collectTypeName = util.I18NUtility.getLocaleSpecificText(com.sap.me.datacollection.view.DCTypes[i].name);
                break;
            }
        }
        var collectValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var oProperties = jQuery.sap.properties();
        oProperties.setProperty("%TYPE%",collectTypeName);
        oProperties.setProperty("%VALUE%",collectValue);
        var messageText = util.I18NUtility.getLocaleSpecificText("DC.collected.MESSAGE", oProperties);

        var results = util.Model.getData("TEMP_DCSaveResults");
        if (!results) {
            results = [];
        }

        // just return if duplicate message
        if (results.length > 0) {
            for (var i = 0; i < results.length; i++) {
                if (messageText === results[i].message) {
                    return;
                }
            }
        }

        var count = results.length;
        results[count] = {
            status : "SUCCESS",
            message : messageText
        };
        util.Model.setData("TEMP_DCSaveResults", results);
    },

    addErrorCallback : function(errorCode, errorMessage) {
    	 this.processedComps = undefined;
         if (errorMessage) {
            jQuery.sap.log.debug("Data Collection Error: " + errorMessage);
            var results = util.Model.getData("TEMP_DCSaveResults");
            if (!results) {
                results = [];
            }
            var count = results.length;
            results[count] = {
                status : "ERROR",
                message : errorMessage
            };
            util.Model.setData("TEMP_DCSaveResults", results);
         }
    },

    authenticateUser : function(oDcGroup) {

        var oUserInfo = com.sap.me.security.view.SecurityUtility.getCurrentUser();
        var sUserId = "";
        if (oUserInfo && !util.StringUtil.isBlank(oUserInfo.user)) {
            sUserId = oUserInfo.user;
        }

        var sMessage = util.I18NUtility.getLocaleSpecificText("dcGroup.default.LABEL") + ":  " + oDcGroup.description;

        com.sap.me.security.view.UserAuthenticationDialog.show({
                title : util.I18NUtility.getLocaleSpecificText("dcAuth.title.TEXT"),
                message : sMessage,
                messageJustifyContent : sap.m.FlexJustifyContent.Center,
                userId : sUserId,
                onClose : [this.authenticationComplete, this]
        });
    },

    authenticationComplete : function(oData) {

        if (oData) {

            // cancel selected?
            if (!oData.authenticated) {
                this.processNext(true, "", false, this.fromViewId, this.fromNamespace);  // was DCGroupList

            // authentication
            } else {

                if (oData.userRef) {
                    this.oDcGroupList[0].authenticatedUserRef = oData.userRef;
                    this.oDcGroupList[0].authenticatedUserId = oData.userId;
                }

                // check certification
                var bFinished = false;
                var bShowMessage = false;
                var sMessage = "";
                var bCertified = false;
                if (oData.userRef && this.oDcGroupList[0].certificationRef) {
                    try {
                        bCertified = com.sap.me.security.view.SecurityUtility.validateUserCertification(oData.userRef, this.oDcGroupList[0].certificationRef);
                    } catch (err) {
                        jQuery.sap.log.error(err.message);
                        sMessage = err.message;
                        bShowMessage = true;
                        bCertified = false;
                    }
                }

                if (!bCertified && !bShowMessage) {
                    //  15242.simple=User is not certified to collect data for data collection group %GROUP_NAME%,%GROUP_REVISION%
                    var oProperties = jQuery.sap.properties();
                    oProperties.setProperty("%GROUP_NAME%", this.oDcGroupList[0].dcGroup);
                    oProperties.setProperty("%GROUP_REVISION%", this.oDcGroupList[0].dcGroupRevision);
                    sMessage = util.I18NUtility.getErrorText("15242.simple", oProperties);
                    bShowMessage = true;
                }

                // successfull certification
                if (bCertified) {
                    var oResult = this.buildPage();
                    if (oResult.done) {
                        var sView = util.Model.getData(util.ModelKey.CurrentApplicationView);
                        var sNamespace = util.Model.setData(util.ModelKey.CurrentApplicationNamespace);
                        this.processNext(true, "", false, sView, sNamespace);
                    }

                // could not authenticate,
                } else {
                    this.processNext(true, sMessage, bShowMessage, this.fromViewId, this.fromNamespace);
                }
            }
        }
    },

    showPendingSuccessMessage : function() {
        if (!util.StringUtil.isBlank(this.sPendingSuccessMessage)) {
            sap.m.MessageToast.show(this.sPendingSuccessMessage, {
                duration: 3000,
                animationDuration: 500
            });
            this.sPendingSuccessMessage = undefined;
        }
    },

    processNext : function(bDone, sMessage, bShowMessage, sNextViewId, sNextNamespace) {

        var oPendingMessage = {
            showMessage : bShowMessage,
            message : sMessage,
            messageType: "toast"
        };

        if (bDone) {
            this.sPendingSuccessMessage = undefined;
            this.updateParametricData();
            util.Model.removeData("TEMP_DCSaveResults");
            this.oDcGroupList = undefined;
            util.Model.setUnsavedDataDefined(false);
            var bus = sap.ui.getCore().getEventBus();
            bus.publish("nav", "to", {
                id : sNextViewId,
                data : {
                    namespace : sNextNamespace,
                    pendingMessage: oPendingMessage
                }
            });

        } else if (bShowMessage && !util.StringUtil.isBlank(sMessage)) {
            jQuery.sap.log.error(sMessage);
            sap.m.MessageToast.show(sMessage, {
                duration: 5000,
                animationDuration: 500
            });
        }

    },

    updateParametricData : function() {

        var oSelectedGroupList = util.Model.getData(util.ModelKey.SelectedDCGroupList);
        if (oSelectedGroupList && oSelectedGroupList.length > 0) {
            var oModel = sap.ui.getCore().getModel("dcGroupsModel");
            if (oModel) {
                var oGroupData = oModel.getData();
                var oGroupList = oGroupData.DcGroups;

                // for all defined groups in the model
                for (var i = 0; i < oGroupData.DcGroups.length; i++) {

                    // for the currently selected groups
                    for (var j = 0; j < oSelectedGroupList.length; j++) {
                        if (oGroupData.DcGroups[i].dcGroupRef === oSelectedGroupList[j].dcGroupRef) {
                            if (!oGroupData.DcGroups[i].fullfilled) {
                                var oSfcs = oGroupData.DcGroups[i].sfcList;
                                for (var k = 0; k < oSfcs.length; k++) {
                                    oSfcs[k].fullfilled = com.sap.me.datacollection.view.DCGroupLoader.loadParametricData(oGroupData.DcGroups[i], oSfcs[k], oGroupData.DcGroups[i].parameterList);
                                }
                                oGroupData.DcGroups[i].sfcList = oSfcs;
                                oGroupData.DcGroups[i].fullfilled = com.sap.me.datacollection.view.DCGroupLoader.isDcGroupFullfilled(oGroupData.DcGroups[i]);

                                oGroupData.DcGroups[i].displayFullfilled = oGroupData.DcGroups[i].fullfilled;
                                if (util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION")) {
                                    oGroupData.DcGroups[i].displayFullfilled = false;
                                }
                            }
                        }
                    }
                }

                // sort final DC group list
                oGroupData.DcGroups = com.sap.me.datacollection.view.DCGroupLoader.sortByCollectMethodAndSequence(oGroupData.DcGroups);

            }
        }
    },

    navButtonTap : function(evt) {

        var lastViewId = this.fromViewId;
        var lastNamespace = this.fromNamespace;

        var oPendingMessage = {
            showMessage : false,
            message : "",
            messageType: "toast"
        };
        this.sPendingSuccessMessage = undefined;
        this.updateParametricData();
        util.Model.removeData("TEMP_DCSaveResults");
        this.oDcGroupList = undefined;
        util.Model.setUnsavedDataDefined(false);
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
                id : lastViewId,
                data : {
                    namespace : lastNamespace,
                    pendingMessage: oPendingMessage
                }
        });
    },

    exitProcessing : function() {
        this.sPendingSuccessMessage = undefined;
        util.Model.removeData("TEMP_DCSaveResults");
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