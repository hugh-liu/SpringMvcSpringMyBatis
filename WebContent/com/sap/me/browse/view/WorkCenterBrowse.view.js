sap.ui.jsview("com.sap.me.browse.view.WorkCenterBrowse", {

    getControllerName: function() {
        return "com.sap.me.browse.view.WorkCenterBrowse";
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
            path : "workCentersModel>/WorkCenters",
            template : new sap.m.StandardListItem({
                title : "{workCentersModel>workCenter}",
                description : "{workCentersModel>i18NDescription}",
                type : sap.m.ListType.Navigation,
                tap : [ oCon.browseListTap, oCon ]
            })
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('workCenterBrowsePage'),
            title : util.I18NUtility.getLocaleSpecificText("WORK_CENTER_BROWSE.title.TEXT"),
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