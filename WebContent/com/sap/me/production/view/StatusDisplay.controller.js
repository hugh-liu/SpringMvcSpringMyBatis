
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.production.view.StatusDisplay", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {
        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        this.fromViewId = evt.fromId;

        this.requestData = evt.data.requestData;
        if (this.requestData && !util.StringUtil.isBlank(this.requestData.entityType)) {
            var sTitle = "";
            if (this.requestData.entityType === "SFC") {
                sTitle = util.I18NUtility.getLocaleSpecificText("MOBILE_STATUS.sfcList.TITLE");
            } else if (this.requestData.entityType === "SHOP_ORDER"  ) {
                 sTitle = util.I18NUtility.getLocaleSpecificText("MOBILE_STATUS.shopOrderList.TITLE");
            } else if (this.requestData.entityType === "PROCESS_LOT"  ) {
                 sTitle = util.I18NUtility.getLocaleSpecificText("MOBILE_STATUS.processLotList.TITLE");
            }
            this.getView().page.setTitle(sTitle);
        }

        // get status information
        this.oStatusInfoList = undefined;
        if (this.requestData) {
            try {
                this.oStatusInfoList = this.getStatusInformation(this.requestData);
            } catch (error) {
                sap.m.MessageBox.show (
                      error.message,
                      sap.m.MessageBox.Icon.ERROR,
                      "",
                      sap.m.MessageBox.Action.OK
                );
                return;
            }
        }

        // nothing found, notify user
        if (!this.oStatusInfoList || this.oStatusInfoList.length <= 0) {

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
            jQuery.sap.log.error("StatusDisplay.onBeforeShow: view for controller not defined");
            sap.m.MessageBox.alert("StatusDisplay.onBeforeShow: view for controller not defined.");
            return;
        }

        // add the data type fields
        var oPage = oView.byId("statusDisplayListPage");
        if (oPage) {
            oPage.destroyContent();
            this.createControls(oView, this, this.oStatusInfoList, this.requestData.entityType);
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

    showSfcsTap : function(evt) {
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "StatusSfcs",
            data : {
                namespace : "com.sap.me.production.view",
                fromId : "StatusDisplay",
                fromNamespace : "com.sap.me.production.view",
                sfcs: this.sSfcs
            }
        });
    },

    navButtonTap : function(evt) {
        this.exitProcessing();
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back", {
                id : "StatusInfo",
                data : {
                    namespace : "com.sap.me.production.view"
                }
        });
    },

    exitProcessing : function() {
        var oView = this.getView();
        if (oView) {
            var oPage = oView.byId("statusDisplayListPage");
            if (oPage) {
                oPage.destroyContent();
            }
        }
        this.oStatusInfoList = undefined;
    },

    getStatusInformation : function(oRequestData) {

        if (!oRequestData || !oRequestData.columnList || oRequestData.columnList.length == 0) {
            return undefined;
        }

        // build the columnList string
        var sColumnList = "";
        for (var i = 0; i < oRequestData.columnList.length; i++) {
            if (i > 0) {
                sColumnList = sColumnList + "~";
            }
            sColumnList = sColumnList + oRequestData.columnList[i].columnId;
        }

        var url = "/manufacturing-odata/Status.svc/";
        if (oRequestData.entityType === "SFC") {
            url = url + "GetSfcStatus?Sfc='" + oRequestData.entityValue + "'&ColumnNames='" + sColumnList +  "'";
            if (!util.StringUtil.isBlank(oRequestData.operation)) {
                url = url + "&Operation='" + oRequestData.operation + "'";
            }
        } else if (oRequestData.entityType === "SHOP_ORDER"  ) {
             url = url + "GetShopOrderStatus?ShopOrder='" + oRequestData.entityValue + "'&ColumnNames='" + sColumnList + "'";
        } else  if (oRequestData.entityType === "PROCESS_LOT"  ) {
             url = url + "GetProcessLotStatus?ProcessLot='" + oRequestData.entityValue + "'&ColumnNames='" + sColumnList + "'";
        }

        // this throws Error if fails
        var oResults = util.IOUtil.getODataRequestResults(url, false);

        var oInfoList = [];
        if (oResults && oResults.length > 0) {
            for (var i = 0; i < oRequestData.columnList.length; i++) {
                var oInfo = {};
                oInfo.columnId = oRequestData.columnList[i].columnId;
                oInfo.label = oRequestData.columnList[i].description;
                oInfo.description = "";
                for (var j = 0; j < oResults.length; j++) {
                    if (oRequestData.columnList[i].columnId === oResults[j].attribute) {
                        oInfo.description = oResults[j].value;
                        break;
                    }
                }
                oInfoList[oInfoList.length] = oInfo;
            }
        }
        return oInfoList;
    },

    createControls : function(oView, oController, oStatusInfoList, sEntityType) {

        // create vertical box layout to hold Status Info list
        var oVbox = new sap.m.VBox({
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("statusInfoVBox");

        oView.page.addContent(oVbox);

        var oStatusDisplayList = new sap.m.List({
            id: oView.createId("statusDisplayList"),
            inset : true
        });

        oVbox.addItem(oStatusDisplayList);

        for (var i = 0; i < oStatusInfoList.length; i++) {
            var component = this.createControl(oStatusInfoList[i], oView, oController, sEntityType);
            if (component) {
                var oItem = new sap.m.CustomListItem();
                oItem.addStyleClass("statusInfoRowItem");
                oItem.addContent(component);
                oStatusDisplayList.addItem(oItem);
            }
        }
    },

    createControl : function(oStatusInfo, oView, oController, sEntityType) {

        var sId = "statusInfo_" + oStatusInfo.columnId;

        var oHbox = new sap.m.HBox({
            id: oView.createId(sId + "_row"),
            alignItems: sap.m.FlexAlignItems.Start
        });
        oHbox.addStyleClass("statusInfoRow");

        var descriptionLabel = new sap.m.Label({
            id: oView.createId(sId + "_label"),
            text: oStatusInfo.label,
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });

        var valueLabel = null;
        if (oStatusInfo.columnId === "STATUS_ICON") {
            valueLabel = new sap.m.Image({
                id: oView.createId(sId + "_desc"),
                src: oStatusInfo.description
            });
            valueLabel.addStyleClass("statusInfoRowImageValue");
            descriptionLabel.addStyleClass("statusInfoRowImageLabel truncatedLabel");

        // need link to list of SFC's
        } else if (oStatusInfo.columnId === "SFC" && sEntityType !== "SFC") {
            valueLabel = new sap.m.Image({
                id: oView.createId(sId + "_desc"),
                src: "img/action_40.png",
                tap: [oController.showSfcsTap, oController]
            });
            valueLabel.addStyleClass("statusInfoRowImageValue");
            descriptionLabel.addStyleClass("statusInfoRowImageLabel truncatedLabel");
            oController.sSfcs = oStatusInfo.description;

        } else {
            valueLabel = new sap.m.Label({
                id: oView.createId(sId + "_desc"),
                text: oStatusInfo.description,
                textAlign: sap.ui.core.TextAlign.Left,
            });
            valueLabel.addStyleClass("statusInfoRowTextValue  truncatedLabel");
            descriptionLabel.addStyleClass("statusInfoRowTextLabel truncatedLabel");
        }

        oHbox.addItem(descriptionLabel);
        oHbox.addItem(valueLabel);

        return oHbox;
    }
});