jQuery.sap.require("com.sap.me.framework.view.ProcessTypes");
jQuery.sap.require("com.sap.me.control.Input");

sap.ui.jsview("com.sap.me.nonconformance.view.LogNC", {

    getControllerName: function() {
        return "com.sap.me.nonconformance.view.LogNC";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        var clearButton = new sap.m.Button({
            id: this.createId('clearButton'),
            type: sap.m.ButtonType.Default,
            icon: "sap-icon://eraser",
            // text: util.I18NUtility.getLocaleSpecificText("clear.default.BUTTON"),
            enabled: true,
            visible: true,
            tap : [ oCon.clearButtonTap, oCon ]
        });

        var footerBar = new sap.m.Bar({
            contentLeft: [],
            contentMiddle: [],
            contentRight: []
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('logNcPage'),
            title : "",
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent : [
                clearButton
            ],
            footer: footerBar
        });

        var logNcList = new sap.m.List({inset : true});

        var oItem = new sap.m.CustomListItem();
        var oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var operInputField = new com.sap.me.control.Input({
            id: this.createId('operationInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText("OPERATION_BROWSE.default.LABEL"),
            liveChange: [oCon.operationChange, oCon],
            showClear: true,
            showBrowse: true,
            upperCase: true,
            browseTap: [ oCon.browseOperationTap, oCon ],
            clearTap: [ oCon.clearOperationTap, oCon ]
        });
        oHbox.addItem(operInputField);
        oItem.addContent(oHbox);
        logNcList.addItem(oItem);

        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);

        var resourceInputField = new com.sap.me.control.Input({
            id: this.createId('resourceInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText("RESOURCE_BROWSE.default.LABEL"),
            liveChange: [oCon.resourceChange, oCon],
            showClear: true,
            showBrowse: true,
            upperCase: true,
            browseTap: [ oCon.browseResourceTap, oCon ],
            clearTap: [ oCon.clearResourceTap, oCon ]
        });
        oHbox.addItem(resourceInputField);
        oItem.addContent(oHbox);
        logNcList.addItem(oItem);

        var mainInputTitle = undefined;
        var wsconfig = util.Model.getData(util.ModelKey.WorkstationConfiguration);
        if (wsconfig) {
            mainInputTitle = wsconfig.i18nMainInput;
            if (!mainInputTitle || mainInputTitle == "") {
                mainInputTitle = wsconfig.mainInput;
            }
            if (!mainInputTitle || mainInputTitle == "") {
                mainInputTitle = util.I18NUtility.getLocaleSpecificText("SFC_BROWSE.default.LABEL");
            }
        }

        // add the combobox for selecting the SFC,ShopOrder, ProcessLot
        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var selectField = new sap.m.Select({
            id: this.createId("logNcProcessType"),
            width: "256px",
            enabled: true,
            change: [oCon.processTypeChange, oCon]
        });
        var ptypes = com.sap.me.framework.view.ProcessTypes;
        for (var i = 0; i < ptypes.length; i++) {
            var oListItem = new sap.ui.core.Item({
                id: this.createId(ptypes[i].value),
                text: util.I18NUtility.getLocaleSpecificText(ptypes[i].name),
                key : ptypes[i].value
            });

            selectField.addItem(oListItem);
            if (i == 0) {
                selectField.setSelectedItem(oListItem);
            }
        }
        oHbox.addItem(selectField);
        oItem.addContent(oHbox);
        logNcList.addItem(oItem);


        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var sfcInputField = new com.sap.me.control.Input({
            id: this.createId('shopEntity'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText(ptypes[0].name),
            liveChange: [oCon.shopEntityChange, oCon],
            showClear: true,
            upperCase: true,
            clearTap: [ oCon.clearShopEntityTap, oCon ]
        });
        oHbox.addItem(sfcInputField);

        oItem.addContent(oHbox);
        logNcList.addItem(oItem);

        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var ncGroupField = new com.sap.me.control.Input({
            id: this.createId('ncGroupInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText("NCGROUP_BROWSE.default.LABEL"),
            liveChange: [oCon.ncGroupChange, oCon],
            showClear: true,
            showBrowse: true,
            upperCase: true,
            browseTap: [ oCon.browseNCGroupTap, oCon ],
            clearTap: [ oCon.clearNCGroupTap, oCon ]
        });
        oHbox.addItem(ncGroupField);
        oItem.addContent(oHbox);

        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var ncCodeField = new com.sap.me.control.Input({
            id: this.createId('ncCodeInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText("NCCODE_BROWSE.default.LABEL"),
            liveChange: [oCon.ncCodeChange, oCon],
            showClear: true,
            showBrowse: true,
            upperCase: true,
            browseTap: [ oCon.browseNCCodeTap, oCon ],
            clearTap: [ oCon.clearNCCodeTap, oCon ]
        });
        oHbox.addItem(ncCodeField);
        oItem.addContent(oHbox);
        logNcList.addItem(oItem);

        this.page.addContent(logNcList);

        return this.page;
    }
});