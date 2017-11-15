sap.ui.jsview("com.sap.me.nonconformance.view.NCCodeBrowse", {

    getControllerName: function() {
        return "com.sap.me.nonconformance.view.NCCodeBrowse";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    createContent : function(oCon) {

        // create browse list  (binding is set in controller)
        this.browseList = new sap.m.List({
            id: this.createId('browseList'),
            showNoData : false,
            includeItemInSelection : true,
            inset : true
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('ncCodeBrowsePage'),
            title : util.I18NUtility.getLocaleSpecificText("NCCODE_BROWSE.title.TEXT"),
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent : [
                new sap.m.Button({
                    icon: sap.ui.core.IconPool.getIconURI("home"),
                    tap : [ oCon.closeTap, oCon ]
                })
            ],
            content : [
                this.browseList
            ]
        });

        return this.page;
    }
});