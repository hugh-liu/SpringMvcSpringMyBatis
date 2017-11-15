
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.production.view.StatusSfcs", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {
        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        this.fromViewId = evt.fromId;

        this.sfcs = evt.data.sfcs;

        // nothing found, notify user
        if (util.StringUtil.isBlank(this.sfcs)) {

            // 10017.simple=No records found for %KEYS%

            var sKey = "SFC.default.LABEL";
            if (this.requestData.entityType === "SHOP_ORDER" ) {
                 sKey = "SHOP_ORDER.default.LABEL";
            } else if (this.requestData.entityType === "PROCESS_LOT" ) {
                 sKey = "PROCESS_LOT.default.LABEL";
            }
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%KEYS%", util.I18NUtility.getLocaleSpecificText(sKey));
            var message = util.I18NUtility.getErrorText("10017.simple", oProperties);
            sap.m.MessageToast.show(message, {
                duration: 5000,
                animationDuration: 500
            });
            return;
        }

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("StatusSfcs.onBeforeShow: view for controller not defined");
            sap.m.MessageBox.alert("StatusSfcs.onBeforeShow: view for controller not defined.");
            return;
        }

        // add the data type fields
        var oPage = oView.byId("statusSfcsListPage");
        if (oPage) {
            oPage.destroyContent();
            this.createControls(oView, this.sfcs);
        }
    },

    onAfterShow : function(evt) {
    },

    closeTap : function() {
        this.exitProcessing();
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "Home"
        });
    },

    navButtonTap : function(evt) {
        this.exitProcessing();
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back", {
                id : "StatusDisplay",
                data : {
                    namespace : "com.sap.me.production.view"
                }
        });
    },

    exitProcessing : function() {
        var oView = this.getView();
        if (oView) {
            var oPage = oView.byId("statusSfcsListPage");
            if (oPage) {
                oPage.destroyContent();
            }
        }
        this.sfcs = undefined;
    },

    getStatusInformation : function(aSfcs) {

        if (!aSfcs || aSfcs.length == 0) {
            return undefined;
        }

        var oSfcList = [];
        var sColumnList = "OPERATION~STATUS~STATUS_ICON";
        for (var i = 0; i < aSfcs.length; i++) {
            var url = "/manufacturing-odata/Status.svc/GetSfcStatus?Sfc='" + aSfcs[i] + "'&ColumnNames='" + sColumnList +  "'";
            var oResults = undefined;
            try {
                oResults = util.IOUtil.getODataRequestResults(url, false);
            } catch (err) {
                jQuery.sap.log.error(err.message);
                continue;
            }
            var oSfcData = {
                sfc: aSfcs[i]
            };
            if (oResults && oResults.length > 0) {
                for (var j = 0; j < oResults.length; j++) {
                    if (oResults[j].attribute) {
                        oSfcData[oResults[j].attribute] = oResults[j].value;
                    }
                }
            }
            oSfcList[oSfcList.length] = oSfcData;
        }

        return oSfcList;
    },

    createControls : function(oView, sSfcs) {

        var aSfcs = sSfcs.split("~");
        if (!aSfcs || aSfcs.length == 0) {
            return;
        }

        var oSfcList = this.getStatusInformation(aSfcs);
        if (!oSfcList || oSfcList.length == 0) {
            return;
        }

        // create vertical box layout to hold Status Info list
        var oVbox = new sap.m.VBox({
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("statusInfoVBox");

        oView.page.addContent(oVbox);

        var oStatusSfcsList = new sap.m.List({
            id: oView.createId("statusSfcsList"),
            inset : true
        });

        oVbox.addItem(oStatusSfcsList);

        for (var i = 0; i < oSfcList.length; i++) {
            var component = this.createControl(i, oSfcList[i], oView);
            if (component) {
                var oItem = new sap.m.CustomListItem();
                oItem.addStyleClass("statusInfoRowItem");
                oItem.addContent(component);
                oStatusSfcsList.addItem(oItem);
            }
        }
    },

    createControl : function(index, oSfcData, oView) {

        var sId = "sfc_" + index;

        var oHbox = new sap.m.HBox({
            id: oView.createId(sId + "_row"),
            alignItems: sap.m.FlexAlignItems.Start,
            width: "100%"
        });

        var oLeftVbox = new sap.m.VBox({
            id: oView.createId(sId + "_leftVbox"),
            alignItems: sap.m.FlexAlignItems.Start
        });
        oLeftVbox.addStyleClass("sfcStatusLeftVBox");
        oHbox.addItem(oLeftVbox);

        var oRightVbox = new sap.m.VBox({
            id: oView.createId(sId + "_rightVbox"),
            alignItems: sap.m.FlexAlignItems.Start
        });
        oRightVbox.addStyleClass("sfcStatusRightVBox");
        oHbox.addItem(oRightVbox);

        var sfcLabel = new sap.m.Label({
            id: oView.createId(sId + "_sfcLabel"),
            text: oSfcData.sfc,
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold,
            width: "100%"
        });
        sfcLabel.addStyleClass("sfcStatusSfcLabel");

        var operationLabel = new sap.m.Label({
            id: oView.createId(sId + "_operLabel"),
            text: oSfcData.OPERATION,
            textAlign: sap.ui.core.TextAlign.Left,
            width: "100%"
        });
        operationLabel.addStyleClass("sfcStatusOperLabel");

        oLeftVbox.addItem(sfcLabel);
        oLeftVbox.addItem(operationLabel);

        var sIconPath = util.StringUtil.replaceStrings(oSfcData.STATUS_ICON, "large", "small", 0);

        var statusIcon = new sap.m.Image({
            id: oView.createId(sId + "_statusIcon"),
            src: sIconPath
        });
        statusIcon.addStyleClass("sfcStatusIcon");

        var statusLabel = new sap.m.Label({
            id: oView.createId(sId + "_statusLabel"),
            text: oSfcData.STATUS,
            textAlign: sap.ui.core.TextAlign.Left
        });
        statusLabel.addStyleClass("sfcStatusLabel");

        oRightVbox.addItem(statusIcon);
        oRightVbox.addItem(statusLabel);


        return oHbox;
    }
});