jQuery.sap.declare("com.sap.me.datacollection.view.DataCollectionHelper");

jQuery.sap.require("com.sap.me.datacollection.view.DCGroupLoader");
jQuery.sap.require("com.sap.me.datacollection.view.DCTypes");
jQuery.sap.require("com.sap.me.security.view.SecurityUtility");
jQuery.sap.require("com.sap.me.security.view.UserAuthenticationDialog");

jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.IOUtil");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.I18NUtility");
jQuery.sap.require("util.SystemRules");


com.sap.me.datacollection.view.DataCollectionHelper = {

    initializeDataModel : function(dcActivityRules) {

        // set defaults for activity rules when called from MEMain
        util.Model.setData("TEMPDC_PROCESS_ALL_DC_GROUPS", true);
        util.Model.setData("TEMPDC_AUTO_NEXT", false);
        util.Model.setData("TEMPDC_ENFORCE_GROUP_MODE", false);
        util.Model.setData("TEMPDC_SHOW_APPLY_TO_ALL", true);

        // load overrides of activity rules
        if (dcActivityRules && dcActivityRules.length > 0) {
            for (var i=0; i<dcActivityRules.length; i++) {
                var option = dcActivityRules[i];
                var bValue = false;
                if (option.value && (option.value === "YES" || option.value === "TRUE") ) {
                    bValue = true;
                }
                var sName = undefined;
                if (!util.StringUtil.isBlank(option.key)) {
                    sName = option.key;
                } else if (!util.StringUtil.isBlank(option.attribute)) {
                    sName = option.attribute;
                }
                if (util.StringUtil.isBlank(sName)) {
                    jQuery.sap.log.error("DataCollectionHelper.initializeDataModel: error reading option key/attribute");
                    continue;
                }

                util.Model.setData("TEMPDC_" + sName, bValue);

                // jQuery.sap.log.debug("DataCollectionHelper.initializeDataModel: " + sName + " = " + option.value);
            }
        }

        // get system rule
        var bMultipleDataCollection = false;
        var sMultipleDataCollection = util.SystemRules.getRule("MULTIPLE_DATA_COLLECTION");
        if (!util.StringUtil.isBlank(sMultipleDataCollection)) {
            if (sMultipleDataCollection.toLowerCase() === "true") {
                bMultipleDataCollection = true;
            }
        }
        util.Model.setData("TEMPDC_MULTIPLE_DATA_COLLECTION", bMultipleDataCollection);
    },

    collectData : function() {

        // get DC Group List data
        this.oDcGroupList = undefined;
        try {
            this.oDcGroupList = com.sap.me.datacollection.view.DCGroupLoader.getDcGroupData();
        } catch (error) {
            sap.m.MessageBox.show (
                  error.message,
                  sap.m.MessageBox.Icon.ERROR,
                  "",
                  sap.m.MessageBox.Action.OK
            );
            return;
        }

        // nothing found, notify user
        if (!this.oDcGroupList || this.oDcGroupList.length <= 0) {
            // 11307.simple=No DC defined for this %KEY% at this Operation/Resource
            var collectionType = util.Model.getData(util.ModelKey.SelectedCollectionType);
            var collectionName = collectionType;
            var sTypes = com.sap.me.datacollection.view.DCTypes;
            for (var i = 0; i < sTypes.length; i++) {
                if (sTypes[i].value === collectionType) {
                    collectionName = sTypes[i].name;
                    break;
                }
            }
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%KEY%", util.I18NUtility.getLocaleSpecificText(collectionName));
            var message = util.I18NUtility.getErrorText("11307.simple", oProperties);
            sap.m.MessageToast.show(message, {
                duration: 3000,
                animationDuration: 500
            });
            return;
        }

        // remove any existing model
        var oModel = sap.ui.getCore().getModel("dcGroupsModel");
        if (oModel) {
            sap.ui.getCore().setModel(undefined, "dcGroupsModel");
        }
        oModel = new sap.ui.model.json.JSONModel();

        var oDcGroups = {
            DcGroups : this.oDcGroupList
        };
        oModel.setData(oDcGroups);

        sap.ui.getCore().setModel(oModel, "dcGroupsModel");

        // if user certifications need to be authenticated we disable processing all DC groups mode
        var bBypassGroupList = util.Model.getData("TEMPDC_PROCESS_ALL_DC_GROUPS");
        var bAutoNext = util.Model.getData("TEMPDC_AUTO_NEXT");
        if (bBypassGroupList && this.oDcGroupList.length > 1) {
            for (var i = 0; i < this.oDcGroupList.length; i++) {
                if (this.oDcGroupList[i].authenticationRequired && !util.StringUtil.isBlank(this.oDcGroupList[i].certificationRef)) {
                    bBypassGroupList = false;
                    break;
                }
            }
        }

        util.Model.setData("DC_PROCESS_ALL_DC_GROUPS",  bBypassGroupList);
        if (bBypassGroupList) {
            bAutoNext = false;
        }
        util.Model.setData("DC_AUTO_NEXT",  bAutoNext);

        var nextViewId = "DCGroupList";
        if (bBypassGroupList || this.oDcGroupList.length == 1) {
            nextViewId = "DCDataEntry";
            util.Model.setData(util.ModelKey.SelectedDCGroupList, this.oDcGroupList);

            // check user certification
            if (this.oDcGroupList.length == 1) {
                this.oDcGroupList[0].authenticatedUserId = null;
                if (this.oDcGroupList[0].authenticationRequired && !util.StringUtil.isBlank(this.oDcGroupList[0].certificationRef)) {
                   var bAllowMultipleDataCollection = util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION");
                   var bFullfilled = com.sap.me.datacollection.view.DCGroupLoader.isDcGroupFullfilled(this.oDcGroupList[0]);
                    if (bAllowMultipleDataCollection || !bFullfilled) {
                        this.oDcGroupList[0].authenticatedUserRef = null;
                        this.authenticateUser(this.oDcGroupList[0]);
                        return;
                    }
                }
            }
        }

        // save current view data
        //  this.saveModel();

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : nextViewId,
            data : {
                namespace : "com.sap.me.datacollection.view"
            }
        });
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

        if (oData && oData.authenticated) {

            if (oData.userRef) {
                this.oDcGroupList[0].authenticatedUserRef = oData.userRef;
                this.oDcGroupList[0].authenticatedUserId = oData.userId;
            }

            // check certification
            var bCertified = false;
            if (oData.userRef && this.oDcGroupList[0].certificationRef) {
                try {
                    bCertified = com.sap.me.security.view.SecurityUtility.validateUserCertification(oData.userRef, this.oDcGroupList[0].certificationRef);
                } catch (err) {
                    jQuery.sap.log.error(err.message);
                    sap.m.MessageToast.show(err.message, {
                        duration: 5000,
                        animationDuration: 500
                    });
                    return;
                }
            }

            // authorization complete
            if (bCertified) {
                // this.saveModel();
                var bus = sap.ui.getCore().getEventBus();
                bus.publish("nav", "to", {
                    id : "DCDataEntry",
                    data : {
                        namespace : "com.sap.me.datacollection.view"
                    }
                });

            // user not certified
            } else {
                //  15242.simple=User is not certified to collect data for data collection group %GROUP_NAME%,%GROUP_REVISION%
                var oProperties = jQuery.sap.properties();
                oProperties.setProperty("%GROUP_NAME%", this.oDcGroupList[0].dcGroup);
                oProperties.setProperty("%GROUP_REVISION%", this.oDcGroupList[0].dcGroupRevision);
                var message = util.I18NUtility.getErrorText("15242.simple", oProperties);
                sap.m.MessageToast.show(message, {
                    duration: 5000,
                    animationDuration: 500
                });
            }
        }
    }
};