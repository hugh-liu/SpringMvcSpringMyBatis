sap.ui.jsview("com.sap.me.production.view.AssemblyComponentBrowse", {

    getControllerName: function () {
        return "com.sap.me.production.view.AssemblyComponentBrowse";
    },

    onBeforeShow: function (evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow: function (evt) {
        this.getController().onAfterShow(evt);
    },

    onBeforeFirstShow: function (evt) {
        this.getController().onBeforeFirstShow(evt);
    },

    navButtonTap: function (evt) {
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back", {
            id: "AssemblyComponent"
        });
    },


    // Create Content for the page
    createContent: function (oCon) {

        // TODO: Replace these with Resource values
        var componentTitle = util.I18NUtility.getLocaleSpecificText("compList.default.BUTTON"); // "Component List"

        // Add Page Header
        // Assign Header Label (SFC: xxx Mode: ... SFC x Selected)\
        var headerList = new sap.m.List({ inset: true });
        var headerListItem = new sap.m.CustomListItem();
        var browseHeaderBox = new sap.m.HBox({ alignItems: sap.m.FlexAlignItems.Center });
        var browseHeader = new sap.m.Label({
            id: this.createId('browseHeader'),
            design: sap.m.LabelDesign.Bold       
        });
        browseHeaderBox.addItem(browseHeader);
        headerListItem.addContent(browseHeaderBox);
        headerList.addItem(headerListItem);

        // create browse list
        componentBrowseList = new sap.m.List({
            id: this.createId('componentBrowseList'),
            showNoData: false,
            includeItemInSelection: true,
            inset: true,
            width: "100%",
            alignItems: sap.m.FlexAlignItems.End
        });


        this.browseListTemplate = new sap.m.CustomListItem({
            content: [new sap.m.FlexBox({
                width: "100%",
                items: [
                    new sap.m.VBox({
                        width: "85%",
                        items: [
                            new sap.m.Label({ text: "{componentsModel>component}", design: sap.m.LabelDesign.Bold }),
                            new sap.m.Label({ text: "{componentsModel>description}" })
                        ]
                    }),
                    new sap.m.HBox({
                        width: "15%",
                        items: [
                            new sap.m.Image({
                                src: "themes/sap_me/icons/large/assemble fulfil.png",
                                visible: "{componentsModel>displayAssembled}",
                                alignItems: sap.m.FlexAlignItems.End
                            })
                        ],
                        alignItems: sap.m.FlexAlignItems.End
                    })
                ]
            }).addStyleClass("dcGroupListItem")
            ],
            type: sap.m.ListType.Navigation,
            tap: [oCon.browseListTap, oCon],
            customData: [
                    new sap.ui.core.CustomData({
                        key: "Index",
                        value: "{componentsModel>index}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "component",
                        value: "{componentsModel>component}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "Version",
                        value: "{componentsModel>componentRevision}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "Quantity",
                        value: "{componentsModel>remainingQty}"
                    })
                    ,
                    new sap.ui.core.CustomData({
                        key: "DefaultQuantity",                        
                        //value: com.sap.me.production.view.AssemblyHandler.calculateQtyEntryField("{componentsModel>assembledQty}", "{componentsModel>qtyToAssemble}", "{componentsModel>lotSize}")
                        value: "{componentsModel>defaultQty}"
                    })
                    ,
                    new sap.ui.core.CustomData({
                        key: "LotSize",
                        value: "{componentsModel>lotSize}"
                    })
                    ,
                    new sap.ui.core.CustomData({
                        key: "Description",
                        value: "{componentsModel>description}"
                    })
                    ,
                    new sap.ui.core.CustomData({
                        key: "Sequence",
                        value: "{componentsModel>sequence}"
                    })
                    ,
                    new sap.ui.core.CustomData({
                        key: "HasAssyData",
                        value: "{componentsModel>hasAssyData}"
                    })
                    ,
                    new sap.ui.core.CustomData({
                        key: "alreadyAssembled",
                        value: "{componentsModel>displayAssembled}"
                    })
                    ,
                    new sap.ui.core.CustomData({
                        key: "AssemblyOperation",
                        value: "{componentsModel>assemblyOperation}"
                    })
                    
            ]
        });

        componentBrowseList.bindAggregation("items", {
            path: "componentsModel>/Components",
            template: this.browseListTemplate
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('componentBrowsePage'),
            title: util.I18NUtility.getLocaleSpecificText(componentTitle),
            icon: util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton: true,
            navButtonTap: [oCon.navButtonTap, oCon],
            headerContent : [
                new sap.m.Button({
                    icon: sap.ui.core.IconPool.getIconURI("home"),
                    tap : [ oCon.closeTap, oCon ]
                })
            ],
            content: [
                    headerList
            ]
        });

        this.page.addContent(componentBrowseList);

        return this.page;
    }

});