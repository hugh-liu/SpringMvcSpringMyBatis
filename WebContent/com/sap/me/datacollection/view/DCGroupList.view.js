sap.ui.jsview("com.sap.me.datacollection.view.DCGroupList", {

    getControllerName: function() {
        return "com.sap.me.datacollection.view.DCGroupList";
    },

    onBeforeFirstShow : function(evt) {
        this.getController().onBeforeFirstShow(evt);
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        // create browse list
        this.browseList = new sap.m.List({
            id: this.createId('browseList'),
            showNoData : false,
            includeItemInSelection : true,
            inset : true
        });

        this.browseListTemplate = new sap.m.CustomListItem({
                content : [ new sap.m.FlexBox({ width : "100%",
                     items : [
                         new sap.m.VBox({ width : "85%",
                              items : [
                                  new sap.m.Label({ text :  "{dcGroupsModel>dcGroupVersion}"  , design: sap.m.LabelDesign.Bold}),
                                  new sap.m.Label({ text :  "{dcGroupsModel>description}" })
                                 ]
                              }),
                         new sap.m.HBox({ width : "15%",
                              items : [
                                  new sap.m.Image({ src :  "themes/sap_me/icons/large/data_col_fulfil.png",
                                                                   visible : "{dcGroupsModel>displayFullfilled}",
                                                                   alignItems : sap.m.FlexAlignItems.End
                                  })
                              ],
                              alignItems : sap.m.FlexAlignItems.End
                        })
                    ]
                    }).addStyleClass("dcGroupListItem")
                ],
                type : sap.m.ListType.Navigation,
                tap : [ oCon.browseListTap, oCon ],
                customData : [
                    new sap.ui.core.CustomData({
                        key: "index",
                        value: "{dcGroupsModel>index}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "dcGroupRef",
                        value: "{dcGroupsModel>dcGroupRef}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "dcGroup",
                        value: "{dcGroupsModel>dcGroup}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "dcGroupRevision",
                        value: "{dcGroupsModel>dcGroupRevision}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "description",
                        value: "{dcGroupsModel>description}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "parameterListUri",
                        value: "{dcGroupsModel>parameterListUri}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "certificationRef",
                        value: "{dcGroupsModel>certificationRef}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "site",
                        value: "{dcGroupsModel>site}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "authenticationRequired",
                        value: "{dcGroupsModel>authenticationRequired}"
                    })
                ]
         });

        this.browseList.bindAggregation("items", {
            path : "dcGroupsModel>/DcGroups",
            template : this.browseListTemplate
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('dcGroupListPage'),
            title : util.I18NUtility.getLocaleSpecificText("dcGroupList.default.LABEL"),
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