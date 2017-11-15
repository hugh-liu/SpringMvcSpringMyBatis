sap.ui.jsview("com.sap.me.production.view.StatusSfcs", {

    getControllerName: function() {
        return "com.sap.me.production.view.StatusSfcs";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {
        this.page = new sap.m.Page({
            id: this.createId('statusSfcsListPage'),
            title :  util.I18NUtility.getLocaleSpecificText("sfc_s.default.LABEL"),
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