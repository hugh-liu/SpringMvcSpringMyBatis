sap.ui.jsview("com.sap.me.nonconformance.view.NCGroupBrowse", {

    getControllerName: function() {
        return "com.sap.me.nonconformance.view.NCGroupBrowse";
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
            path : "ncGroupsModel>/NcGroups",
            template : new sap.m.StandardListItem({
                title : "{ncGroupsModel>ncGroup}",
                description : "{ncGroupsModel>description}",
                type : sap.m.ListType.Navigation,
                tap : [ oCon.browseListTap, oCon ]
            })
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('ncGroupBrowsePage'),
            title : util.I18NUtility.getLocaleSpecificText("NCGROUP_BROWSE.title.TEXT"),
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