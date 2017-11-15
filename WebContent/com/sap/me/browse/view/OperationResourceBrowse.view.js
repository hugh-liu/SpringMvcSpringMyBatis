sap.ui.jsview("com.sap.me.browse.view.OperationResourceBrowse", {

    getControllerName: function() {
        return "com.sap.me.browse.view.OperationResourceBrowse";
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
            path : "operationResourcesModel>/Resources",
            template : new sap.m.StandardListItem({
                title : "{operationResourcesModel>resource}",
                description : "{operationResourcesModel>i18NDescription}",
                type : sap.m.ListType.Navigation,
                info: "{operationResourcesModel>i18NStatus}",
                tap : [ oCon.browseListTap, oCon ],
                customData : [
                    new sap.ui.core.CustomData({
                        key: "Status",
                        value: "{operationResourcesModel>status}"
                    })
                ]
            })
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('resourceBrowsePage'),
            title : util.I18NUtility.getLocaleSpecificText("RESOURCE_BROWSE.title.TEXT"),
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