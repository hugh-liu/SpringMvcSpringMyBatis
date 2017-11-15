sap.ui.jsview("com.sap.me.browse.view.OperationBrowse", {

    getControllerName: function() {
        return "com.sap.me.browse.view.OperationBrowse";
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
            path : "operationsModel>/Operations",
            template : new sap.m.StandardListItem({
                title : "{operationsModel>operation}",
                description : "{operationsModel>i18NDescription}",
                type : sap.m.ListType.Navigation,
                tap : [ oCon.browseListTap, oCon ],
                customData : [
                    new sap.ui.core.CustomData({
                        key: "Version",
                        value: "{operationsModel>revision}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "Status",
                        value: "{operationsModel>status}"
                    })
                ]
            })
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('operationBrowsePage'),
            title : util.I18NUtility.getLocaleSpecificText("OPERATION_BROWSE.title.TEXT"),
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