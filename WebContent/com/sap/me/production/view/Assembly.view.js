jQuery.sap.require("com.sap.me.control.Input");
jQuery.sap.require("com.sap.me.production.view.AssyTypes");
jQuery.sap.require("util.I18NUtility");

sap.ui.jsview("com.sap.me.production.view.Assembly", {

    getControllerName: function() {
        return "com.sap.me.production.view.Assembly";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {
        // TODO: Localize these resources
        var assemblyText = util.I18NUtility.getLocaleSpecificText("assemblyPoint.default.BUTTON"); // "Assemble";

        var assemblyButton = new sap.m.Button({
            id: this.createId('assemblyButton'),
            type: sap.m.ButtonType.Default,
            icon: "themes/sap_me/icons/large/assemble.png",
            text: assemblyText,
            enabled: true,
            tap : [ oCon.assemblyButtonTap, oCon ]
        });

        assemblyButton.addStyleClass("footerBarButtonPadding");

        var clearButton = new sap.m.Button({
            id: this.createId('clearButton'),
            type: sap.m.ButtonType.Default,
            icon: "sap-icon://eraser",
            enabled: true,
            visible: true,
            tap: [oCon.clearButtonTap, oCon]
        });

        var footerBar = new sap.m.Bar({
            contentLeft: [],
            contentMiddle: [assemblyButton],
            contentRight: []
        });
        

        // create page
        this.page = new sap.m.Page({
            id: this.createId('assyPage'),
            title: util.I18NUtility.getLocaleSpecificText("ASSEMBLY.default.LABEL"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent: [
                clearButton
            ],
            footer: footerBar
        });

        var assyList = new sap.m.List({inset : true});

        var oItem = new sap.m.CustomListItem();
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
            browseTap: [oCon.browseOperationTap, oCon]
        });

        operInputField.addStyleClass("inputUpperCase");
        oHbox.addItem(operInputField);
        oItem.addContent(oHbox);
        assyList.addItem(oItem);

        oItem = new sap.m.CustomListItem();
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
            browseTap: [oCon.browseResourceTap, oCon]
        });
        resourceInputField.addStyleClass("inputUpperCase");
        oHbox.addItem(resourceInputField);
        oItem.addContent(oHbox);
        assyList.addItem(oItem);

        var selectField = new sap.m.Select({
            id: this.createId("collectionType"),
            width: "256px",
            enabled: true,
            change: [oCon.collectionTypeChange, oCon]
        });

        var sTypes = com.sap.me.production.view.AssyTypes;

        for (var i = 0; i < sTypes.length; i++) {
            var sTextLabel = util.I18NUtility.getLocaleSpecificText(sTypes[i].name);
            var oItem = new sap.ui.core.ListItem({
                id: this.createId(sTypes[i].value),
                text: sTextLabel,
                customData : [
                    new sap.ui.core.CustomData({
                        key: "value",
                        value: sTypes[i].value
                    }),
                    new sap.ui.core.CustomData({
                        key: "text",
                        value: sTextLabel
                    })
                ]
            });

            selectField.addItem(oItem);
            if (i == 0) {
                selectField.setSelectedItem(oItem);
            }
        }

        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        oHbox.addItem(selectField);
        oItem.addContent(oHbox);
        assyList.addItem(oItem);

        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);

        var collectionInputField = new com.sap.me.control.Input({
            id: this.createId('collectionTypeInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText(sTypes[0].name),
            liveChange: [oCon.collectionInputChange, oCon],
            showClear: true
        });

        collectionInputField.addStyleClass("inputUpperCase");
        oHbox.addItem(collectionInputField);

        oItem.addContent(oHbox);
        assyList.addItem(oItem);

        this.page.addContent(assyList);

        return this.page;
    }
});