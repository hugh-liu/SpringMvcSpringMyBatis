jQuery.sap.require("com.sap.me.datacollection.view.DCTypes");
jQuery.sap.require("com.sap.me.control.Input");

sap.ui.jsview("com.sap.me.datacollection.view.DataCollection", {

    getControllerName: function() {
        return "com.sap.me.datacollection.view.DataCollection";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        var collectButton = new sap.m.Button({
            id: this.createId('collectButton'),
            type: sap.m.ButtonType.Default,
            icon: util.I18NUtility.getLocaleSpecificText("DC.collect.ICON"),
            text: util.I18NUtility.getLocaleSpecificText("Collect.default.BUTTON"),
            enabled: true,
            tap : [ oCon.collectButtonTap, oCon ]
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
            contentMiddle: [collectButton],
            contentRight: []
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('dcPage'),
            title : util.I18NUtility.getLocaleSpecificText("DATA_COLLECTION.default.LABEL"),
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent : [
                clearButton
            ],
            footer: footerBar
        });

        var dcList = new sap.m.List({inset : true});

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
        dcList.addItem(oItem);

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
        dcList.addItem(oItem);

        var selectField = new sap.m.Select({
            id: this.createId("collectionType"),
            width: "256px",
            enabled: true,
            change: [oCon.collectionTypeChange, oCon]
        });

        var sTypes = com.sap.me.datacollection.view.DCTypes;
        //util.Model.setData(util.ModelKey.SelectedCollectionType, "SFC");
        util.Model.setData(util.ModelKey.SelectedCollectionType + "_DEFAULT", "SFC");

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
        dcList.addItem(oItem);

        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var collectionInputField = new com.sap.me.control.Input({
            id: this.createId('collectionTypeInput'),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText(sTypes[0].name),
            liveChange: [oCon.collectionInputChange, oCon],
            showClear: true,
            upperCase: true,
            clearTap: [ oCon.clearCollectionInputTap, oCon ]
        });
        oHbox.addItem(collectionInputField);

        oItem.addContent(oHbox);
        dcList.addItem(oItem);

        this.page.addContent(dcList);

        return this.page;
    }
});