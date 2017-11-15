sap.ui.jsview("com.sap.me.browse.view.ToolNumberBrowse", {

    getControllerName: function() {
        return "com.sap.me.browse.view.ToolNumberBrowse";
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
            path : "toolNumbersModel>/ToolNumbers",
            template : new sap.m.StandardListItem({
                title : "{toolNumbersModel>toolNumber}",
                description : "{toolNumbersModel>i18NDescription}",
                type : sap.m.ListType.Navigation,
                info: "{toolNumbersModel>i18NStatus}",
                tap : [ oCon.browseListTap, oCon ]
            })
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('toolNumberBrowsePage'),
            title : util.I18NUtility.getLocaleSpecificText("TOOL_NUMBER_BROWSE.title.TEXT"),
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