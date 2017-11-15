jQuery.sap.require("com.sap.me.framework.view.ProcessTypes");
jQuery.sap.require("com.sap.me.control.Input");

sap.ui.jsview("com.sap.me.production.view.StatusInfo", {

    getControllerName: function() {
        return "com.sap.me.production.view.StatusInfo";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        var nextButton = new sap.m.Button({
            id: this.createId('nextButton'),
            type: sap.m.ButtonType.Default,
            icon: "themes/sap_me/icons/large/BtnNextStep.png",
            text: util.I18NUtility.getLocaleSpecificText("ME_MOBILE.next.LABEL"),
            enabled: true,
            tap : [ oCon.nextTap, oCon ]
        });

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
            contentMiddle: [nextButton],
            contentRight: []
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('statusPage'),
            title : "",
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent : [clearButton],
            footer: footerBar
        });

        var statusList = new sap.m.List({inset : true});

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
            id: this.createId("statusType"),
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
        statusList.addItem(oItem);

        oItem = new sap.m.CustomListItem();
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
        statusList.addItem(oItem);

        var oItem = new sap.m.CustomListItem();
        var oHbox = new sap.m.HBox({
            id: this.createId('operationHBox'),
        });
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
        statusList.addItem(oItem);


        this.page.addContent(statusList);


        return this.page;
    }
});