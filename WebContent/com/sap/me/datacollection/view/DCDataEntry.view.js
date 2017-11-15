sap.ui.jsview("com.sap.me.datacollection.view.DCDataEntry", {

    getControllerName: function() {
        return "com.sap.me.datacollection.view.DCDataEntry";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        var previousButton = new sap.m.Button({
            id: this.createId('previousButton'),
            icon: "themes/sap_me/icons/large/BtnPreviousStep.png",
            text: util.I18NUtility.getLocaleSpecificText("ME_MOBILE.back.LABEL"),
            enabled: true,
            visible: false,
            tap : [ oCon.previousButtonTap, oCon ]
        });

        var nextButton = new sap.m.Button({
            id: this.createId('nextButton'),
            icon: "themes/sap_me/icons/large/BtnNextStep.png",
            text: util.I18NUtility.getLocaleSpecificText("ME_MOBILE.next.LABEL"),
            enabled: true,
            visible: false,
            tap : [ oCon.nextButtonTap, oCon ]
        });

        var saveButtonCenter = new sap.m.Button({
            id: this.createId('saveButtonCenter'),
            type: sap.m.ButtonType.Default,
            icon: util.I18NUtility.getLocaleSpecificText("NC_DATA_ENTRY.add.ICON"),
            text: util.I18NUtility.getLocaleSpecificText("save.default.BUTTON"),
            enabled: true,
            visible: true,
            tap : [ oCon.saveButtonTap, oCon ]
        });

        var saveButtonRight = new sap.m.Button({
            id: this.createId('saveButtonRight'),
            type: sap.m.ButtonType.Default,
            icon: util.I18NUtility.getLocaleSpecificText("NC_DATA_ENTRY.add.ICON"),
            text: util.I18NUtility.getLocaleSpecificText("save.default.BUTTON"),
            enabled: true,
            visible: false,
            tap : [ oCon.saveButtonTap, oCon ]
        });

        var clearButton = new sap.m.Button({
            id: this.createId('clearButtonCenter'),
            type: sap.m.ButtonType.Default,
            icon: "sap-icon://eraser",
            // text: util.I18NUtility.getLocaleSpecificText("clear.default.BUTTON"),
            enabled: true,
            visible: true,
            tap : [ oCon.clearButtonTap, oCon ]
        });

        var allCheckBox = new sap.m.CheckBox({
            id: this.createId('allCheckBox'),
            enabled: true,
            selected: true,
            select: [ oCon.allCheckBoxChange, oCon ]
        });

        var allLabel = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText("applyToAllSFCs.default.LABEL"),
            textAlign: sap.ui.core.TextAlign.Left
        });
        allLabel.addStyleClass("dataCollectionApplyToAllLabel");

        var oAllHbox = new sap.m.HBox({
            id: this.createId('allHBox'),
            visible: false,
            alignItems: sap.m.FlexAlignItems.Start
        });

        oAllHbox.addItem(allCheckBox);
        oAllHbox.addItem(allLabel);

        var footerBar = new sap.m.Bar({
            contentLeft: [oAllHbox, previousButton],
            contentMiddle: [saveButtonCenter],
            contentRight: [saveButtonRight, nextButton]
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('dataEntryPage'),
            title : util.I18NUtility.getLocaleSpecificText("DataCollectionEntry.title.LABEL"),
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent : [
                clearButton,
                new sap.m.Button({
                    icon: sap.ui.core.IconPool.getIconURI("home"),
                    tap : [ oCon.closeTap, oCon ]
                })
            ],
            footer: footerBar
        });

        return this.page;
    }
});
