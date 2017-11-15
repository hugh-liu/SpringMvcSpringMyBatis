sap.ui.jsview("com.sap.me.production.view.StatusDisplay", {

    getControllerName: function() {
        return "com.sap.me.production.view.StatusDisplay";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {
        this.page = new sap.m.Page({
            id: this.createId('statusDisplayListPage'),
            title : "",
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent : [
                new sap.m.Button({
                    icon: sap.ui.core.IconPool.getIconURI("home"),
                    tap : [ oCon.closeTap, oCon ]
                })
            ]
        });

        return this.page;
    }
});