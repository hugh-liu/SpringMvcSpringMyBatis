sap.ui.jsview("com.sap.me.framework.view.ChangeSite", {

    getControllerName: function() {
        return "com.sap.me.framework.view.ChangeSite";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    createContent : function(oCon) {

        // create browse list
        this.siteList = new sap.m.List({
            id: this.createId('siteList'),
            showNoData : false,
            includeItemInSelection : true,
            inset : true
        });

        this.siteList.bindAggregation("items", {
            path : "sitesModel>/Sites",
            template : new sap.m.StandardListItem({
                title : "{sitesModel>site}",
                description : "{sitesModel>i18NDescription}",
                type : sap.m.ListType.Navigation,
                tap : [ oCon.siteListTap, oCon ]
            })
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('siteListPage'),
            title : util.I18NUtility.getLocaleSpecificText("SiteSelection.title.TEXT"),
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            content : [
                this.siteList
            ]
        });

        return this.page;
    }
});