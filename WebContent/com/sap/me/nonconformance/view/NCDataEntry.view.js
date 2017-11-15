sap.ui.jsview("com.sap.me.nonconformance.view.NCDataEntry", {

    getControllerName: function() {
        return "com.sap.me.nonconformance.view.NCDataEntry";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        var addButton = new sap.m.Button({
            id: this.createId('addButton'),
            type: sap.m.ButtonType.Default,
            icon: "themes/sap_me/icons/medium/success.png",
            text: util.I18NUtility.getLocaleSpecificText("ME_MOBILE.add.LABEL"),
            enabled: true,
            tap : [ oCon.addButtonTap, oCon ]
        });
        addButton.addStyleClass("footerBarButtonPadding");

        var clearButton = new sap.m.Button({
            id: this.createId('clearButtonCenter'),
            type: sap.m.ButtonType.Default,
            icon: "sap-icon://eraser",
            // text: util.I18NUtility.getLocaleSpecificText("clear.default.BUTTON"),
            enabled: true,
            visible: true,
            tap : [ oCon.clearButtonTap, oCon ]
        });

        var footerBar = new sap.m.Bar({
            contentLeft: [],
            contentMiddle: [addButton],
            contentRight: []
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('dataEntryPage'),
            title : util.I18NUtility.getLocaleSpecificText("NC_DATA_ENTRY.title.TEXT"),
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

        var dataEntryList = new sap.m.List({
            id: this.createId("dataEntryList"),
            inset : true
        });

        this.page.addContent(dataEntryList);

        return this.page;
    }
});