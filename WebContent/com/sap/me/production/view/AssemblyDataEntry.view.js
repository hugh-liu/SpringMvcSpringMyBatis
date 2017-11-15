jQuery.sap.require("com.sap.me.production.view.AssyUtils");

sap.ui.jsview("com.sap.me.production.view.AssemblyDataEntry", {

    getControllerName: function () {
        return "com.sap.me.production.view.AssemblyDataEntry";
    },

    onBeforeShow: function (evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow: function (evt) {
        this.getController().onAfterShow(evt);
    },

    createContent: function (oCon) {
        // TODO: replace with Resource values
        var msgPageTitle = util.I18NUtility.getLocaleSpecificText("assembleComponents.default.LABEL");
        var msgFindComponent = util.I18NUtility.getLocaleSpecificText("asBuiltConfig.choose.LABEL");
        var skipButtonLabel = util.I18NUtility.getLocaleSpecificText("skip.default.BUTTON");       
        var msgQty = util.I18NUtility.getLocaleSpecificText("qty.default.LABEL");
        var msgSfc = util.I18NUtility.getLocaleSpecificText("SFC_BROWSE.default.LABEL");
        var msgBarcode = util.I18NUtility.getLocaleSpecificText("barcode.default.LABEL");

        // Add Page Header
        // Assign Header Label (SFC: xxx Mode: ... SFC x Selected)\
        var headerList = new sap.m.List({ id: this.createId('headerList'), inset: true });
        var headerListItem = new sap.m.CustomListItem();
        var browseHeaderBox = new sap.m.VBox({ alignItems: sap.m.FlexAlignItems.Center });

        var browseHeader = new sap.m.Label({
            id: this.createId('dataEntryHeader'),
            design: sap.m.LabelDesign.Bold
        });

        browseHeaderBox.addItem(browseHeader);        
        headerListItem.addContent(browseHeaderBox);
        headerList.addItem(headerListItem);

        var componentDetailHeader1 = new sap.m.CustomListItem({
            id: this.createId('headerLine2'),
            width: "100%",
            wrapping: true,
            content: [
                    new sap.m.HBox({
                        width: "100%",
                        items: [
                            new sap.m.HBox({
                                width: "100%",                                
                                wrapping: true,
                                alignItems: sap.m.FlexAlignItems.Left,
                                items: [
                                    new sap.m.HBox({
                                        width: "100%",
                                        wrapping: true,
                                        items: [
                                            new sap.m.Label({ id: this.createId('componentHeaderLine1'), design: sap.m.LabelDesign.Bold, alignItems: sap.m.FlexAlignItems.Left, width: "100%" })
                                        ]
                                    })
                                ]
                            }),
                        ]
                    }),
            ]
        });
        componentDetailHeader1.addStyleClass("footerBarButtonPadding");
        headerList.addItem(componentDetailHeader1);


        componentDetailHeader2 = new sap.m.CustomListItem({
            id: this.createId('headerLine3'),
            width: "100%",
            wrapping: true,
            content: [
                         new sap.m.HBox({
                             width: "100%",
                             wrapping: true,
                            items: [
                                new sap.m.HBox({
                                    width: "100%",
                                    wrapping: true,
                                    items: [
                                        new sap.m.Label({ id: this.createId('cHeaderLine2'), design: sap.m.LabelDesign.Bold, alignItems: sap.m.FlexAlignItems.Left, width: "100%" })
                                    ]
                                })
                            ]
                        }),
            ]
        });
        headerList.addItem(componentDetailHeader2);

        quantityDetailHeader1 = new sap.m.CustomListItem({
            id: this.createId('qtyDetailHeader'),
            width: "100%",
            content: [
                         new sap.m.HBox({
                             width: "100%",
                             wrapping: false,
                             alignItems: sap.m.FlexAlignItems.Center,
                             items: [
                                     new sap.m.HBox({
                                         width: "60%",
                                         items: [
                                             new sap.m.HBox({
                                                 alignItems: sap.m.FlexAlignItems.Center,
                                                 items: [
                                                    new sap.m.Label({ id: this.createId('componentHeaderQtyLabel'), alignItems: sap.m.FlexAlignItems.Left, design: sap.m.LabelDesign.Bold, text: msgQty + ":  ", width: "70px" }),
                                                    new com.sap.me.control.Input({
                                                        id: this.createId('componentHeaderQty'), design: sap.m.LabelDesign.Bold, width: "100px", showClear: true,
                                                        showBrowse: false,
                                                    })
                                                 ]
                                             }),
                                             
                                         ]
                                     }),
                                     new sap.m.VBox({                                         
                                         width: "40%",
                                         items: [
                                             new sap.m.Label({ id: this.createId('cQtyRemaining'), design: sap.m.LabelDesign.Bold }),
                                         ]
                                     }),
                                     
                             ]
                         }),
            ]
        });
        headerList.addItem(quantityDetailHeader1);
        
        var allSfc = new sap.m.CustomListItem({
            id: this.createId('allSfcItem'),
            width: "100%",
            visible: false,
            content: [
                    new sap.m.HBox({
                        width: "100%",
                        items: [
                            new sap.m.HBox({
                                width: "100%",
                                alignItems: sap.m.FlexAlignItems.Left,
                                items: [
                                     new sap.m.HBox({
                                         items: [
                                             new sap.m.Label({ id: this.createId('allSfcLabel'), design: sap.m.LabelDesign.Bold, text: msgSfc + ":  ", width: "150px" }),
                                             new sap.m.Label({
                                                 id: this.createId('allSfcSFC'), design: sap.m.LabelDesign.Bold, width: "256px"                                                 
                                             })
                                         ]
                                     }),
                                ]
                            }),
                        ]
                    }),
            ]
        });
        allSfc.addStyleClass("footerBarButtonPadding");
        headerList.addItem(allSfc);

        /**
        Barcode Field
        **/
        var barcode = new sap.m.CustomListItem({
            id: this.createId('barcode'),
            width: "100%",
            content: [
                    new sap.m.HBox({
                        width: "100%",
                        items: [
                            new sap.m.HBox({
                                width: "100%",
                                alignItems: sap.m.FlexAlignItems.Left,
                                items: [
                                     new sap.m.HBox({
                                         alignItems: sap.m.FlexAlignItems.Center,
                                         items: [
                                             new sap.m.Label({ id: this.createId('barcodeHeaderLabel'), design: sap.m.LabelDesign.Bold, text: msgBarcode + ":  ", width: "150px" }),
                                             new com.sap.me.control.TextArea({
                                                 id: this.createId('barcodeHeaderText'), design: sap.m.LabelDesign.Bold, width: "100%",
                                                 showClear: true,
                                                 upperCase: false,
                                                 showBrowse: false,
                                                 rows: 1,
                                                 liveChange: [oCon.barcodeKeyEvent, oCon],
                                             })
                                         ]
                                     }),
                                ]
                            }),
                        ]
                    }),
            ]
        });
        barcode.addStyleClass("footerBarButtonPadding");

        headerList.addItem(barcode);

        /**
        Find Component Field
        **/
        var findComponent = new sap.m.CustomListItem({
            id: this.createId('findComponent'),
            width: "100%",
            content: [
                    new sap.m.HBox({
                        width: "100%",
                        items: [
                            new sap.m.HBox({
                                width: "100%",
                                alignItems: sap.m.FlexAlignItems.Left,
                                items: [
                                     new sap.m.HBox({
                                         alignItems: sap.m.FlexAlignItems.Center,
                                         items: [
                                             new sap.m.Label({ id: this.createId('findComponentHeaderLabel'), design: sap.m.LabelDesign.Bold, text: msgFindComponent + ":  ", width: "150px" }),
                                             new com.sap.me.control.Input({
                                                 id: this.createId('findComponentHeaderText'), design: sap.m.LabelDesign.Bold, width: "100%",
                                                 showClear: true,
                                                 upperCase: true,
                                                 showBrowse: false,
                                                 change: [oCon.findComponentKeyEvent, oCon],
                                             })
                                         ]
                                     }),
                                ]
                            }),
                        ]
                    }),
            ]
        });
        findComponent.addStyleClass("footerBarButtonPadding");

        headerList.addItem(findComponent);


         
        // Create Add Button
        var addButton = new sap.m.Button({
            id: this.createId('addButton'),
            type: sap.m.ButtonType.Default,
            icon: "themes/sap_me/icons/medium/success.png",
            text: util.I18NUtility.getLocaleSpecificText("ME_MOBILE.add.LABEL"),
            enabled: true,
            tap: [oCon.addButtonTap, oCon]
        });
        addButton.addStyleClass("footerBarButtonPadding");

        var clearButton = new sap.m.Button({
            id: this.createId('clearButton'),
            type: sap.m.ButtonType.Default,
            icon: "sap-icon://eraser",
            enabled: true,
            visible: true,
            tap: [oCon.clearButtonTap, oCon]
        });

        // Create Skip Button
        var skipButton = new sap.m.Button({
            id: this.createId('skipButton'),
            type: sap.m.ButtonType.Default,
            icon: "themes/sap_me/icons/large/next.png",
            text: util.I18NUtility.getLocaleSpecificText(skipButtonLabel),
            enabled: true,
            tap: [oCon.skipButtonTap, oCon]
        });
        skipButton.addStyleClass("footerBarButtonPadding");

        var allCheckBox = new sap.m.CheckBox({
            id: this.createId('allCheckBox'),
            enabled: true,
            selected: true,
            select: [oCon.allCheckBoxChange, oCon]
        });
        //allCheckBox.addStyleClass("footerBarButtonPadding");

        var allLabel = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText("applyToAllSFCs.default.LABEL"),
            textAlign: sap.ui.core.TextAlign.Begin
        });
        //allLabel.addStyleClass("footerBarButtonPadding");

        var oAllHbox = new sap.m.HBox({
            id: this.createId('allHBox'),
            visible: false,
            alignItems: sap.m.FlexAlignItems.Start
        });

        oAllHbox.addItem(allCheckBox);
        oAllHbox.addItem(allLabel);
        oAllHbox.addStyleClass("footerBarButtonPadding");

        // Create Footer Bar
        var footerBar = new sap.m.Bar({
            contentLeft: [oAllHbox],
            contentMiddle: [addButton, skipButton],
            contentRight: []
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId('assemblyDataEntryPage'),
            title: util.I18NUtility.getLocaleSpecificText(msgPageTitle),
            icon: util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton: true,
            navButtonTap: [oCon.navButtonTap, oCon],
            headerContent: [
                clearButton,
                new sap.m.Button({
                    icon: sap.ui.core.IconPool.getIconURI("home"),
                    tap: [oCon.closeTap, oCon]
                })
            ],
            content: [
                headerList
                ],
            footer: footerBar
        });

        // Create Data Entry List
        var dataEntryList = new sap.m.List({
            id: this.createId("assemblyDataEntryList"),
            showNoData: false,
            liveChange: [oCon.fieldChange, oCon],            
            inset: true
        });

        // Add Content to Page
        this.page.addContent(dataEntryList);

        return this.page;
    }
});