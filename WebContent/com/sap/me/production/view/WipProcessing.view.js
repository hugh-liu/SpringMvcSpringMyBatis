jQuery.sap.require("com.sap.me.framework.view.ProcessTypes");
jQuery.sap.require("com.sap.me.control.Input");

sap.ui.jsview("com.sap.me.production.view.WipProcessing", {

    getControllerName: function() {
        return "com.sap.me.production.view.WipProcessing";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        var startButton = new sap.m.Button({
            id: this.createId('startButton'),
            type: sap.m.ButtonType.Default,
            icon: util.I18NUtility.getLocaleSpecificText("WIP_PROCESSING.startButton.ICON"),
            text: util.I18NUtility.getLocaleSpecificText("WIP_PROCESSING.startButton.LABEL"),
            enabled: true,
            tap : [ oCon.startSfcTap, oCon ]
        });
        startButton.addStyleClass("footerBarButtonPadding");

        var signoffButton = new sap.m.Button({
            id: this.createId('signoffButton'),
            type: sap.m.ButtonType.Default,
            icon: util.I18NUtility.getLocaleSpecificText("WIP_PROCESSING.signoffButton.ICON"),
            text: util.I18NUtility.getLocaleSpecificText("WIP_PROCESSING.signoffButton.LABEL"),
            enabled: true,
            tap : [ oCon.signoffTap, oCon ]
        });
        signoffButton.addStyleClass("footerBarButtonPadding");

        var completeButton = new sap.m.Button({
            id: this.createId('completeButton'),
            type: sap.m.ButtonType.Default,
            icon: util.I18NUtility.getLocaleSpecificText("WIP_PROCESSING.completeButton.ICON"),
            text: util.I18NUtility.getLocaleSpecificText("WIP_PROCESSING.completeButton.LABEL"),
            enabled: true,
            tap : [ oCon.completeSfcTap, oCon ]
        });
        completeButton.addStyleClass("footerBarButtonPadding");

        var clearButton = new sap.m.Button({
            id: this.createId('clearButton'),
            type: sap.m.ButtonType.Default,
            icon: "sap-icon://eraser",
            // text: util.I18NUtility.getLocaleSpecificText("clear.default.BUTTON"),
            enabled: true,
            visible: true,
            tap : [ oCon.clearButtonTap, oCon ]
        });

        var wipProcessingFooterBar = new sap.m.Bar({
            contentLeft: [],
            contentMiddle: [startButton, signoffButton, completeButton],
            contentRight: []
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('wipProcessingPage'),
            title : "",
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent : [clearButton],
            footer: wipProcessingFooterBar
        });

        var wipProcessingList = new sap.m.List({inset : true, mode: sap.m.ListMode.None});

        var oItem = new sap.m.CustomListItem();
        oItem.setType(sap.m.ListType.Inactive);

        var oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var operInputField = new com.sap.me.control.Input({
            id: this.createId('operationInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText("OPERATION_BROWSE.default.LABEL"),
            showClear: true,
            showBrowse: true,
            upperCase: true,
            browseTap: [ oCon.browseOperationTap, oCon ]
        });
        oHbox.addItem(operInputField);
        oItem.addContent(oHbox);
        wipProcessingList.addItem(oItem);

        oItem = new sap.m.CustomListItem();
        oItem.setType(sap.m.ListType.Inactive);
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);

        var resourceInputField = new com.sap.me.control.Input({
            id: this.createId('resourceInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText("RESOURCE_BROWSE.default.LABEL"),
            showClear: true,
            showBrowse: true,
            upperCase: true,
            browseTap: [ oCon.browseResourceTap, oCon ]
        });
        oHbox.addItem(resourceInputField);
        oItem.addContent(oHbox);
        wipProcessingList.addItem(oItem);

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
        oItem.setType(sap.m.ListType.Inactive);
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var selectField = new sap.m.Select({
            id: this.createId("wipProcessType"),
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
        wipProcessingList.addItem(oItem);

        oItem = new sap.m.CustomListItem();
        oItem.setType(sap.m.ListType.Inactive);
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var shopEntityInputField = new com.sap.me.control.Input({
            id: this.createId('shopEntityInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText(ptypes[0].name),
            showClear: true,
            upperCase: true
        });
        oHbox.addItem(shopEntityInputField);

        oItem.addContent(oHbox);
        wipProcessingList.addItem(oItem);

        this.page.addContent(wipProcessingList);


        return this.page;
    }
});