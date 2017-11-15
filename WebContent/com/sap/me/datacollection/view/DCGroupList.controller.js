
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.sap.me.datacollection.view.DCGroupLoader");
jQuery.sap.require("com.sap.me.security.view.SecurityUtility");
jQuery.sap.require("com.sap.me.security.view.UserAuthenticationDialog");

sap.ui.controller("com.sap.me.datacollection.view.DCGroupList", {

    onInit : function() {
    },

    onBeforeFirstShow : function(evt) {

    },

    onBeforeShow : function(evt) {
        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        // save where this view was launched from
        this.fromViewId = evt.fromId;
        this.fromNamespace = evt.data.namespace;

        this.pendingMessage = evt.data.pendingMessage;
    },

    onAfterShow : function(evt) {

        // returning from DC Entry screen. check for messages
        if (this.fromViewId === "DCDataEntry") {

            // update the list with any updates to model
            var oModel = sap.ui.getCore().getModel("dcGroupsModel");
            oModel.refresh();

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
    },

    browseListTap : function(evt) {

        var oDcGroupList = [];

        var oSource = evt.getSource();
        if (oSource) {

            var oData = oSource.getCustomData();

            var iCurrentDcGroup = util.Model.getCustomDataValue(oData, "index");

            var oGroupList = undefined;
            var oModel = sap.ui.getCore().getModel("dcGroupsModel");
            if (oModel) {
                var oGroupData = oModel.getData();
                oGroupList = oGroupData.DcGroups;
            }

            // for auto next, get list of selected DC groups from model starting with selected one
            if (util.Model.getData("DC_AUTO_NEXT")) {
                if (oGroupList && oGroupList.length > iCurrentDcGroup) {
                    for (var i = iCurrentDcGroup; i < oGroupList.length; i++) {
                        oDcGroupList[oDcGroupList.length] = oGroupList[i];
                    }
                }

            // not auto next, using selected one
            } else {
                oDcGroupList[0] = oGroupList[iCurrentDcGroup];
            }
        }

        if (oDcGroupList.length > 0) {

            util.Model.setData(util.ModelKey.SelectedDCGroupList, oDcGroupList);

            var bAllowMultipleDataCollection = util.Model.getData("TEMPDC_MULTIPLE_DATA_COLLECTION");

            var bFullfilled = com.sap.me.datacollection.view.DCGroupLoader.isDcGroupFullfilled(oDcGroupList[0]);

            // if not fullfiled and authentication required...
            oDcGroupList[0].authenticatedUserId = null;
            if ((bAllowMultipleDataCollection || !bFullfilled) && oDcGroupList[0].authenticationRequired && !util.StringUtil.isBlank(oDcGroupList[0].certificationRef)) {
                oDcGroupList[0].authenticatedUserRef = null;
                this.authenticateUser(oDcGroupList[0]);
                return;
            }

            var bus = sap.ui.getCore().getEventBus();
            bus.publish("nav", "to", {
                id : "DCDataEntry",
                data : {
                    namespace : "com.sap.me.datacollection.view"
                }
            });
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

        if (oData && oData.authenticated) {

            var oDcGroupList = util.Model.getData(util.ModelKey.SelectedDCGroupList);

            if (oData.userRef) {
                oDcGroupList[0].authenticatedUserRef = oData.userRef;
                oDcGroupList[0].authenticatedUserId = oData.userId;
            }

            // check certification
            var bCertified = false;
            if (oData.userRef && oDcGroupList[0].certificationRef) {
                try {
                    bCertified = com.sap.me.security.view.SecurityUtility.validateUserCertification(oData.userRef, oDcGroupList[0].certificationRef);
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
                util.Model.setData(util.ModelKey.SelectedDCGroupList, oDcGroupList);
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
                oProperties.setProperty("%GROUP_NAME%", oDcGroupList[0].dcGroup);
                oProperties.setProperty("%GROUP_REVISION%", oDcGroupList[0].dcGroupRevision);
                var message = util.I18NUtility.getErrorText("15242.simple", oProperties);
                sap.m.MessageToast.show(message, {
                    duration: 5000,
                    animationDuration: 500
                });
            }
        }
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

    navButtonTap : function(evt) {

        var sView = util.Model.getData(util.ModelKey.CurrentApplicationView);
        var sNamespace = util.Model.getData(util.ModelKey.CurrentApplicationNamespace);

        util.Model.setUnsavedDataDefined(false);
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back", {
                id : sView,
                data : {
                    namespace : sNamespace
                }
        });
    },

    exitProcessing : function() {
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