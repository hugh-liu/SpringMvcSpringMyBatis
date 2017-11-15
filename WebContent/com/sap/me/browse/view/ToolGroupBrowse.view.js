sap.ui.jsview("com.sap.me.browse.view.ToolGroupBrowse", {

    getControllerName: function() {
        return "com.sap.me.browse.view.ToolGroupBrowse";
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
            path : "toolGroupsModel>/ToolGroups",
            template : new sap.m.StandardListItem({
                title : "{toolGroupsModel>toolGroup}",
                description : "{toolGroupsModel>i18NDescription}",
                type : sap.m.ListType.Navigation,
                info: "{toolGroupsModel>i18NStatus}",
                tap : [ oCon.browseListTap, oCon ]
            })
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('toolGroupBrowsePage'),
            title : util.I18NUtility.getLocaleSpecificText("TOOL_GROUP_BROWSE.title.TEXT"),
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