sap.ui.jsview("com.sap.me.browse.view.ReasonCodeBrowse", {

    getControllerName: function() {
        return "com.sap.me.browse.view.ReasonCodeBrowse";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    createContent : function(oCon) {

        // create browse list
        this.browseList = new sap.m.List({
            id: this.createId('browseList'),
            showNoData : false,
            includeItemInSelection : true,
            inset : true
        });

        this.browseList.bindAggregation("items", {
            path : "reasonCodesModel>/ReasonCodes",
            template : new sap.m.StandardListItem({
                title : "{reasonCodesModel>reasonCode}",
                description : "{reasonCodesModel>i18NDescription}",
                type : sap.m.ListType.Navigation,
                tap : [ oCon.browseListTap, oCon ]
            })
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('reasonCodeBrowsePage'),
            title : util.I18NUtility.getLocaleSpecificText("REASON_BROWSE.title.TEXT"),
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            content : [
                this.browseList
            ]
        });

        return this.page;
    }
});