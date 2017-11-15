jQuery.sap.declare("com.sap.me.datacollection.view.ComponentConfigurator");
jQuery.sap.require("com.sap.me.datacollection.view.DataType");
jQuery.sap.require("com.sap.me.control.Input");
jQuery.sap.require("com.sap.me.control.TextArea");

com.sap.me.datacollection.view.ComponentConfigurator = {

    /**
     * returns list of controls.
     *
     * @param oView View the controlls will be assigned to
     * @param oController Controller for view
     * @param oDcGroupList[] list of  Objects containing control properties to generate (in sort order)
     *  <pre>
     *    dcGroupRef: DC Group Ref
     *    dcGroup: DC Group
     *    dcGroupRevision: DC Group revision
     *    description: DC Group description
     *    parameterListUri: URI to parameter list
     *    typeSelection: Type of selected value (SFC, shop-order or PROCESS_LOT)
     *    typeValue: Selected type value
     *    operation: Selected Operation
     *    revision:   Selected Operation revision
     *    resource: Selected Resource
     *    collectMethod: defined collection method
     *    resolvedCollectMethod: resolved collection method
     *    typeSelection: collectionType,
     *    typeValue: collectionValue,
     *    operation: operation,
     *    revision: revision,
     *    resource: resource
     *    parameterList:[{
     *        ref:  "DcParameterBO:DcGroupBO:*,DC_TEST,A,P1"
     *        overrideRequired: false
     *        overrideDone: false
     *        overrideStatus: "NONE"
     *        parameterName: "P1"
     *        dataType: "NUMBER"
     *        status: "StatusBO:*,101"
     *        parameterStatus: "ENABLED"
     *        allowMissingValue:false
     *        prompt: "Enter Param 1"
     *        minValue: "5"
     *        maxValue: "8"
     *        sequence: "10"
     *        performSPC: true
     *        displayChart: "ALWAYS"
     *        description: "Parameter 1"
     *        units: null
     *        displayDataInformation: true
     *        overrideMinMax: true
     *        valueMask: null
     *        expressionBuilder: null
     *        requiredDataEntries: "1"
     *        optionalDataEntries: "0"
     *        shortRun: false
     *        booleanZeroValue: null
     *        booleanOneValue: null
     *        qmCharType: null
     *        qmCritical: null
     *        udParameterList: [{
     *             dcParameterRef":"DcParameterBO:DcGroupBO:*,DCGROUP2,A,P1_N",
     *             prompt:" UDF Number 1",
     *             dataType: "NUMBER",
     *             required: false,
     *             sequence: "0",
     *             group:null,
     *             groupRevision:null,
     *             parentParameter:null
     *        }]
     *    }]
     *    sfcList : [{
     *        sfc: &sfc,
     *        parametricData: {
     *             parametricValues: [{
     *                  ref: "PM:PA:*,13,50"
     *                  parametricRef: "PA:*,13"
     *                  sequence: "50"
     *                  editedDateTime: null
     *                  erpSent: false
     *                  measureName: "P1"
     *                  measureGroup: "DCGRP5"
     *                  description: "param one"
     *                  componentType: null
     *                  pin: null
     *                  measureStatus: "PASS"
     *                  measureType: null
     *                  memo: null
     *                  unitOfMeasure: null
     *                  dataType: "NUMBER"
     *                  highLimit: null
     *                  lowLimit: null
     *                  expected: null
     *                  actual: "1"
     *                  actualNumber: "1"
     *                  dcComment: null
     *                  originalDCComment: null
     *                  testDateTime: "\/Date(1374055283000-0420)\/"
     *                  originalTestDateTime: "\/Date(1374055283000-0420)\/"
     *                  elapsedTime: null
     *                  originalActual: "1"
     *                  edited: false
     *                  internalMeasureId: null
     *                  firstSequenceNumber: null
     *                  dcGroupRevision: "A"
     *             }],
     *             udParametricValues: [{
     *                  ref: "PMC:PM:PA:*,30,135,70"
     *                  parametricMeasureRef: "PM:PA:*,30,135"
     *                  sequence: 70
     *                  gboRef: "SFCBO:*,291"
     *                  propertyName: "udf1"
     *                  propertyValue: 5
     *                  originalPropertyValue: 5
     *                  propertyType: "NUMBER"
     *                  propertyStatus: ""
     *                  unitOfMeasure: ""
     *                  edited: false
     *                  dateTime: "2013-07-19T09:02:52-07:00"
     *                  originalDateTime: "2013-07-19T09:02:52-07:00"
     *                  editedUserRef: "UserBO:*,SITE_ADMIN"
     *                  group: "DCGRP5"
     *                  groupRevision: "A"
     *                  parentParameter: "P1"
     *             }]
     *        }
     *    }]
     *  </pre>
     * @param bShowApplyToAll Is true if ApplyToAll check box is displayed, else false
     * @param bApplyToAll true if supposed to apply to all SFC's, else false
     * @param bMultipleDataCollection true if allowing to save multiple times, else false
     * @param iCurrentSfcPageIndex index of page (SFC) to create controls for
     * @return index of page (SFC) being collected if >= 0; -1 if nothing found
     */
    getControls : function(oView, oController, oDcGroupList, bShowApplyToAll, bApplyToAll, bMultipleDataCollection, iCurrentSfcPageIndex) {

        if (!oDcGroupList || oDcGroupList.length <= 0) {
            return -1;
        }
        oController.processedComps = undefined;
        // set page (sfc) to display
        var iCurrentSfcIndex = iCurrentSfcPageIndex;

        // first set the enabled state of the controls.  If anything has been collected and logged for
        // parameters in any DC Group it means the Data Collection has been saved and is now
        // fullfilled.  No controls should be enabled
        var bEnabled = true;
        if (!bMultipleDataCollection) {
            for (var i = 0; i < oDcGroupList.length; i++) {
                if (oDcGroupList[i] && oDcGroupList[i].fullfilled) {
                    bEnabled = false;
                    break;
                }
            }
        }

        // set the state of the save button if they are to be enabled
        if (bEnabled) {

            if (!bShowApplyToAll) {
                var oSaveButtonControl = oView.byId("saveButtonCenter");
                if (oSaveButtonControl) {
                    oSaveButtonControl.setEnabled(bEnabled);
                }
            } else {
                var oControl = oView.byId("saveButtonRight");
                if (oControl) {
                    oControl.setEnabled(bEnabled);
                }
                oControl = oView.byId("allCheckBox");
                if (oControl) {
                    oControl.setEnabled(bEnabled);
                }
            }
        }

        // create vertical box layout to hold DC Group list(s)
        var oVbox = new sap.m.VBox({
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });

        oView.page.addContent(oVbox);

        for (var i = 0; i < oDcGroupList.length; i++) {

            var dcGroupId = oDcGroupList[i].dcGroup;
            dcGroupId = util.StringUtil.replaceStrings(dcGroupId, " ", "_", 0);

            var dcGroupRevision = oDcGroupList[i].dcGroupRevision;
            dcGroupRevision = util.StringUtil.replaceStrings(dcGroupRevision, " ", "_", 0);

            var sId = dcGroupId + "_" + dcGroupRevision;

            // replace any special characters in the id
            sId = sId.replace(/\W/g, "_");

            var oDataEntryList = new sap.m.List({
                id: oView.createId("dataEntryList_" + sId),
                inset : true,
                mode: sap.m.ListMode.None
            });

            var oListVbox = new sap.m.VBox({
                width : "100%"
            });

            // set up group title
            var oDcGroupLabelTitle = new sap.m.Label({ text: util.I18NUtility.getLocaleSpecificText("dcGroup.default.LABEL") + ": " , design: sap.m.LabelDesign.Bold});
            oDcGroupLabelTitle.addStyleClass("dataCollectionGroupLabel");
            var oDcGroupLabel = new sap.m.Label({ text: oDcGroupList[i].description, design: sap.m.LabelDesign.Bold });
            var oDcGroupTitle = new sap.m.HBox({
                items : [
                      oDcGroupLabelTitle,
                      oDcGroupLabel
                ],
                alignItems : sap.m.FlexAlignItems.Center,
                fitContainer: true,
                justifyContent: sap.m.FlexJustifyContent.Center
            });
            oDcGroupTitle.addStyleClass("dataCollectionGroupTitle");

            // if from shop order or process lot - show SFC information
            var oSfcTitle = undefined;
            if (oDcGroupList[i].typeSelection !== "SFC") {

                // if all collected, set state of previous and next buttons
                var bViewingMultipleSfcs = false;
                if ((!bEnabled || bMultipleDataCollection) && oDcGroupList[i].sfcList.length > 1) {
                    bViewingMultipleSfcs = true;
                    var oButtonControl = oView.byId("previousButton");
                    if (oButtonControl) {
                        if (iCurrentSfcPageIndex > 0) {
                            oButtonControl.setEnabled(true);
                        } else {
                            oButtonControl.setEnabled(false);
                        }
                    }
                    var oButtonControl = oView.byId("nextButton");
                    if (oButtonControl) {
                        if (iCurrentSfcPageIndex < (oDcGroupList[i].sfcList.length - 1)) {
                            oButtonControl.setEnabled(true);
                        } else {
                            oButtonControl.setEnabled(false);
                        }
                    }

                }

                var sCount = oDcGroupList[i].sfcList.length + " ";

                var oSfcSelectedLabel = new sap.m.Label({ text: sCount + util.I18NUtility.getLocaleSpecificText("sfc_selected.default.LABEL"), design: sap.m.LabelDesign.Bold});
                oSfcSelectedLabel.addStyleClass("dataCollectionSfcSelectedLabel");

                var sfcCount = "0/" + oDcGroupList[i].sfcList.length;
                var sSfcValue = util.I18NUtility.getLocaleSpecificText("multiple.default.LABEL"); // (Multiple)
                if (bViewingMultipleSfcs || !bShowApplyToAll || (!bApplyToAll && bShowApplyToAll)) {
                    sSfcValue = oDcGroupList[i].sfcList[iCurrentSfcIndex].sfc;
                    sfcCount = (iCurrentSfcIndex + 1) + "/" + oDcGroupList[i].sfcList.length;
                }
                var oSfcLabel = new sap.m.Label({ text: util.I18NUtility.getLocaleSpecificText("sfc.default.LABEL") + ": " + sSfcValue, design: sap.m.LabelDesign.Bold});
                oSfcLabel.addStyleClass("dataCollectionSfcLabel");

                var oSfcCountLabel = new sap.m.Label({ text: sfcCount, design: sap.m.LabelDesign.Bold});
                oSfcCountLabel.addStyleClass("dataCollectionSfcCountLabel");

                oSfcTitle = new sap.m.HBox({
                    items : [
                          oSfcSelectedLabel,
                          oSfcLabel,
                          oSfcCountLabel
                    ],
                    alignItems : sap.m.FlexAlignItems.Center,
                    fitContainer: true,
                    justifyContent: sap.m.FlexJustifyContent.Center
                });
                oSfcTitle.addStyleClass("dataCollectionSfcTitle");
            }

            oListVbox.addItem(oDcGroupTitle);
            if (oSfcTitle) oListVbox.addItem(oSfcTitle);
            oListVbox.addItem(oDataEntryList);

            oVbox.addItem(oListVbox);

            var oSfc = oDcGroupList[i].sfcList[iCurrentSfcIndex];

            if (oDcGroupList[i] && oDcGroupList[i].parameterList) {

                for (var j = 0; j < oDcGroupList[i].parameterList.length; j++) {
                    var oParameter = oDcGroupList[i].parameterList[j];
                    var component = this.createControl(sId, oView, oController, oParameter, oSfc, bEnabled, bMultipleDataCollection);
                    if (component) {
                        oDataEntryList.addItem(component);
                    }

                    if (oParameter.udParameterList && oParameter.udParameterList.length > 0) {
                          var component = this.createUserDefinedControls(sId, oView, oController, oParameter, oSfc, bEnabled, bMultipleDataCollection);
                          if (component) {
                              oDataEntryList.addItem(component);
                          }
                    }
                }
            }
        }

        return iCurrentSfcIndex;
    },

    createControl : function(dcGroupId, oView, oController, mParameters, oSfc, bEnabled, bMultipleDataCollection) {

        var numEntries = Number(mParameters.requiredDataEntries) + Number(mParameters.optionalDataEntries);
        var countRequired = 0;
        var oItem = undefined;
        var oVbox = undefined;

        for (var i = 0; i < numEntries; i++) {

            var bRequired = false;
            if (countRequired < Number(mParameters.requiredDataEntries)) {
                countRequired++;
                bRequired = true;
            }

            var parameterId = dcGroupId + "_" + util.StringUtil.replaceStrings(mParameters.parameterName, " ", "_", 0);
            var sId = parameterId + "_" + i;

            // replace any special characters in the id
            sId = sId.replace(/\W/g, "_");

            var parametricRef = undefined;
            var parametricValue = undefined;
            if (!bMultipleDataCollection) {
                var oParametricData = com.sap.me.datacollection.view.DCGroupLoader.getParametricValue(oSfc, mParameters, i);
                if (oParametricData) {
                    parametricRef = oParametricData.ref;
                    parametricValue = oParametricData.actual;
                    if (mParameters.dataType === com.sap.me.datacollection.view.DataType.NUMBER) {
                        if (!util.StringUtil.isBlank(oParametricData.actualNumber)) {
                            parametricValue = oParametricData.actualNumber;
                        }
                    }
                }
            }

            var dataControl = undefined;

            // create checkbox
            if (mParameters.dataType === com.sap.me.datacollection.view.DataType.BOOLEAN) {

                dataControl = new sap.m.Select({
                    id: oView.createId(sId),
                    enabled: bEnabled,
                    select: [ oController.dataEntryChange, oController ],
                            customData : [
                                new sap.ui.core.CustomData({
                                    key: "parameterRef",
                                    value: mParameters.ref
                                }),
                                new sap.ui.core.CustomData({
                                    key: "parametricRef",
                                    value: parametricRef
                                }),
                                new sap.ui.core.CustomData({
                                    key: "dataType",
                                    value: mParameters.dataType
                                }),
                                new sap.ui.core.CustomData({
                                    key: "allowMissingValue",
                                    value: mParameters.allowMissingValue
                                }),
                                new sap.ui.core.CustomData({
                                    key: "bChanged",
                                    value: false
                                })
                            ]
                });

                var sTypes = [];
                sTypes[0] = "      ";
                if (!util.StringUtil.isBlank(mParameters.booleanOneValue)) {
                    sTypes[1] = mParameters.booleanOneValue;
                } else {
                    sTypes[1] = util.I18NUtility.getLocaleSpecificText("true.default.LABEL");
                }
                if (!util.StringUtil.isBlank(mParameters.booleanZeroValue)) {
                    sTypes[2] = mParameters.booleanZeroValue;
                } else {
                    sTypes[2] = util.I18NUtility.getLocaleSpecificText("false.default.LABEL");
                }

                for (var j = 0; j < sTypes.length; j++) {
                    var sItemId = sId + "_item" + j;
                    var oBooleanItem = new sap.ui.core.ListItem({
                        id: oView.createId(sItemId),
                        text: sTypes[j],
                        customData : [
                            new sap.ui.core.CustomData({
                                key: "value",
                                value: sTypes[j]
                            })
                        ]
                    });
                    dataControl.addItem(oBooleanItem);

                    // set selected
                    if (parametricValue && parametricValue.length > 0) {
                        if (parametricValue === sTypes[j]) {
                            dataControl.setSelectedItem(oBooleanItem);
                        }
                    } else if (j == 0) {
                        dataControl.setSelectedItem(oBooleanItem);
                    }
                }

            // create text field
            } else {
                dataControl = new com.sap.me.control.Input({
                    id: oView.createId(sId),
                    enabled: bEnabled,
                    change: [ oController.dataEntryChange, oController ],
                    showClear: true,
                    customData : [
                        new sap.ui.core.CustomData({
                            key: "parameterRef",
                            value: mParameters.ref
                        }),
                        new sap.ui.core.CustomData({
                            key: "parametricRef",
                            value: parametricRef
                        }),
                        new sap.ui.core.CustomData({
                            key: "dataType",
                            value: mParameters.dataType
                        }),
                        new sap.ui.core.CustomData({
                            key: "allowMissingValue",
                            value: mParameters.allowMissingValue
                        }),
                        new sap.ui.core.CustomData({
                            key: "minValue",
                            value: mParameters.minValue
                        }),
                        new sap.ui.core.CustomData({
                            key: "maxValue",
                            value: mParameters.maxValue
                        }),
                        new sap.ui.core.CustomData({
                            key: "overrideMinMax",
                            value: mParameters.overrideMinMax
                        }),
                        new sap.ui.core.CustomData({
                            key: "bChanged",
                            value: false
                        })
                    ]
                });
            }
            dataControl.addStyleClass("dataCollectionField");

            if ((mParameters.parameterStatus && mParameters.parameterStatus != "ENABLED") ||
                mParameters.dataType === com.sap.me.datacollection.view.DataType.FORMULA) {
                dataControl.setEnabled(false);
            }

            if (parametricValue && parametricValue.length > 0) {

               if (mParameters.dataType === com.sap.me.datacollection.view.DataType.FORMULA) {
                    dataControl.setValue(parametricValue);
                    dataControl.setEnabled(false);

                } else if (mParameters.dataType !== com.sap.me.datacollection.view.DataType.BOOLEAN) {
                    dataControl.setValue(parametricValue);
                }
            }

            if (i == 0) {

                var sDataType = "dc.Text.TEXT";
                if (mParameters.dataType === com.sap.me.datacollection.view.DataType.NUMBER) {
                    sDataType = "dc.Numeric.TEXT";
                } else if (mParameters.dataType === com.sap.me.datacollection.view.DataType.BOOLEAN) {
                    sDataType = "boolean.default.LABEL";
                } else if (mParameters.dataType === com.sap.me.datacollection.view.DataType.FORMULA) {
                    sDataType = "formula.default.LABEL";
                }

                var sPrompt = mParameters.description;
                if (!util.StringUtil.isBlank(mParameters.prompt)) {
                    sPrompt = mParameters.prompt;
                }

                var descriptionLabel = new sap.m.Label({
                    text: sPrompt,
                    textAlign: sap.ui.core.TextAlign.Left,
                    design: sap.m.LabelDesign.Bold
                });
                descriptionLabel.addStyleClass("dataCollectionLabel truncatedLabel");

                // only show label
                if (!mParameters.displayDataInformation) {
                    var oHbox = new sap.m.HBox({
                        alignItems: sap.m.FlexAlignItems.Start
                    });
                    oHbox.addStyleClass("dataCollectionParameterHeader");
                    oHbox.addItem(descriptionLabel);

                    oItem = new sap.m.CustomListItem();

                    oVbox = new sap.m.VBox({
                        alignItems: sap.m.FlexAlignItems.Start
                    });
                    oVbox.addStyleClass("dataCollectionItem");
                    oVbox.addItem(oHbox);

                // show data information
                } else {

                    var dataTypeLabel = new sap.m.Label({
                        text: util.I18NUtility.getLocaleSpecificText(sDataType),
                        textAlign: sap.ui.core.TextAlign.Left
                    });
                    dataTypeLabel.addStyleClass("dataCollectionDataTypeLabel");

                    var oFlexBox = new sap.m.FlexBox({ width : "100%"});
                    oFlexBox.addStyleClass("dataCollectionParameterHeader");

                    var oLeftVBox =  new sap.m.VBox();
                    oLeftVBox.addStyleClass("dataCollectionParameterHeaderLeft");

                    var oRightVBox =  new sap.m.VBox({alignItems : sap.m.FlexAlignItems.End});
                    oRightVBox.addStyleClass("dataCollectionParameterHeaderRight");

                    oFlexBox.addItem(oLeftVBox);
                    oFlexBox.addItem(oRightVBox);

                    oLeftVBox.addItem(descriptionLabel);
                    oRightVBox.addItem(dataTypeLabel);

                    if (mParameters.minValue) {
                        var oLeftHBox = new sap.m.HBox({alignItems : sap.m.FlexAlignItems.Start});

                        oLeftHBox.addStyleClass("dataCollectionLeftHBox");

                        var minTitleLabel = new sap.m.Label({
                            text: util.I18NUtility.getLocaleSpecificText("dc.MinValue.LABEL") + ": "
                        });
                        minTitleLabel.addStyleClass("dataCollectionMinMaxLabel  truncatedLabel");

                        var minValueLabel = new sap.m.Label({
                            text: mParameters.minValue
                        });
                        minValueLabel.addStyleClass("dataCollectionMinMaxLabel  truncatedLabel");
                        oLeftHBox.addItem(minTitleLabel);
                        oLeftHBox.addItem(minValueLabel);
                        oLeftVBox.addItem(oLeftHBox);
                   }

                    if (mParameters.maxValue) {
                        var oRightHBox = new sap.m.HBox({alignItems : sap.m.FlexAlignItems.Start});
                        oRightHBox.addStyleClass("dataCollectionRightHBoxHBox");

                        var maxTitleLabel = new sap.m.Label({
                            text: util.I18NUtility.getLocaleSpecificText("dc.MaxValue.LABEL") + ": "
                        });
                        maxTitleLabel.addStyleClass("dataCollectionMinMaxLabel  truncatedLabel");

                        var maxValueLabel = new sap.m.Label({
                            text: mParameters.maxValue
                        });
                        maxValueLabel.addStyleClass("dataCollectionMinMaxLabel  truncatedLabel");

                        oRightHBox.addItem(maxTitleLabel);
                        oRightHBox.addItem(maxValueLabel);
                        oRightVBox.addItem(oRightHBox);
                    }

                    if (mParameters.units) {
                        var oLeftHBox = new sap.m.HBox({alignItems : sap.m.FlexAlignItems.Start});

                        oLeftHBox.addStyleClass("dataCollectionLeftHBox");

                        var minTitleLabel = new sap.m.Label({
                            text: util.I18NUtility.getLocaleSpecificText("dc.Units.LABEL") + ": "
                        });
                        minTitleLabel.addStyleClass("dataCollectionUnitsLabel  truncatedLabel");

                        var minValueLabel = new sap.m.Label({
                            text: mParameters.units
                        });
                        minValueLabel.addStyleClass("dataCollectionUnitsLabel  truncatedLabel");
                        oLeftHBox.addItem(minTitleLabel);
                        oLeftHBox.addItem(minValueLabel);
                        oLeftVBox.addItem(oLeftHBox);
                   }

                    if (mParameters.valueMask) {
                        var oRightHBox = new sap.m.HBox({alignItems : sap.m.FlexAlignItems.Start});
                        oRightHBox.addStyleClass("dataCollectionRightHBoxHBox");

                        var maxTitleLabel = new sap.m.Label({
                            text: util.I18NUtility.getLocaleSpecificText("mask.default.LABEL") + ": "
                        });
                        maxTitleLabel.addStyleClass("dataCollectionMaskLabel  truncatedLabel");

                        var maxValueLabel = new sap.m.Label({
                            text: mParameters.valueMask
                        });
                        maxValueLabel.addStyleClass("dataCollectionMaskLabel  truncatedLabel");

                        oRightHBox.addItem(maxTitleLabel);
                        oRightHBox.addItem(maxValueLabel);
                        oRightVBox.addItem(oRightHBox);
                    }

                    oItem = new sap.m.CustomListItem();
                    oVbox = new sap.m.VBox({
                        alignItems: sap.m.FlexAlignItems.Start
                    });
                    oVbox.addStyleClass("dataCollectionItem");

                    oVbox.addItem(oFlexBox);
                }
            }

            var requiredLabelField = new sap.m.Label({
                text: "",
                design: sap.m.LabelDesign.Bold,
                required: bRequired
            });

            if (bRequired && mParameters.dataType !== com.sap.me.datacollection.view.DataType.FORMULA) {
                requiredLabelField.addStyleClass("dataCollectionRequiredLabel");
            } else {
                requiredLabelField.addStyleClass("dataCollectionNotRequiredLabel");
            }

            var oHbox = new sap.m.HBox({
                alignItems: sap.m.FlexAlignItems.Start
            });
            oHbox.addStyleClass("dataCollectionRequiredItem");
            oHbox.addItem(dataControl);
            oHbox.addItem(requiredLabelField);
            oVbox.addItem(oHbox);


            oItem.addContent(oVbox);
        }

        return oItem;
    },

    createUserDefinedControls : function(dcGroupId, oView, oController, mParameters, oSfc, bEnabled, bMultipleDataCollection) {

        if (!mParameters.udParameterList || mParameters.udParameterList.length <= 0) {
            return undefined;
        }

        var oItem = new sap.m.CustomListItem();
        var oVbox = undefined;

        for (var i = 0; i < mParameters.udParameterList.length; i++) {
            var oParameter = mParameters.udParameterList[i];

            var bRequired = oParameter.required;

            var parameterId = dcGroupId + "_" + util.StringUtil.replaceStrings(mParameters.parameterName, " ", "_", 0);
            var sId = parameterId + "_udf_" + oParameter.sequence;

            // replace any special characters in the id
            sId = sId.replace(/\W/g, "_");

            var parametricRef = undefined;
            var parametricMeasureRef = undefined;
            var parametricValue = undefined;

            if (!bMultipleDataCollection) {
                var oParametricData = com.sap.me.datacollection.view.DCGroupLoader.getUDParametricValue(oSfc, oParameter);
                if (oParametricData) {
                    parametricRef = oParametricData.ref;
                    parametricMeasureRef = oParametricData.parametricMeasureRef;
                    parametricValue = oParametricData.propertyValue;
                }
            }

            // create text field
            var dataControl = new com.sap.me.control.Input({
                id: oView.createId(sId),
                change: [ oController.userDataEntryChange, oController ],
                enabled: bEnabled,
                showClear: true,
                customData : [
                    new sap.ui.core.CustomData({
                        key: "parameterRef",
                        value: mParameters.ref
                    }),
                    new sap.ui.core.CustomData({
                        key: "parametricRef",
                        value: parametricRef
                    }),
                    new sap.ui.core.CustomData({
                        key: "parametricMeasureRef",
                        value: parametricMeasureRef
                    }),
                    new sap.ui.core.CustomData({
                        key: "dataType",
                        value: oParameter.dataType
                    }),
                    new sap.ui.core.CustomData({
                        key: "prompt",
                        value: oParameter.prompt
                    }),
                    new sap.ui.core.CustomData({
                        key: "bChanged",
                        value: false
                    })
                ]
            });

            dataControl.addStyleClass("dataCollectionField");

            if (mParameters.parameterStatus && mParameters.parameterStatus != "ENABLED") {
                dataControl.setEnabled(false);
            }

            if (parametricValue && parametricValue.length > 0) {
                dataControl.setValue(parametricValue);
            }

            var sDataType = "dc.Text.TEXT";
            if (oParameter.dataType === com.sap.me.datacollection.view.DataType.NUMBER) {
                sDataType = "dc.Numeric.TEXT";
            }

            var descriptionLabel = new sap.m.Label({
                text: util.I18NUtility.getLocaleSpecificText(oParameter.prompt),
                textAlign: sap.ui.core.TextAlign.Left,
                design: sap.m.LabelDesign.Bold
            });
            descriptionLabel.addStyleClass("dataCollectionUDFLabel truncatedLabel");

            var dataTypeLabel = new sap.m.Label({
                text: util.I18NUtility.getLocaleSpecificText(sDataType),
                textAlign: sap.ui.core.TextAlign.Left
            });
            dataTypeLabel.addStyleClass("dataCollectionDataTypeUDFLabel");

            var oFlexBox = new sap.m.FlexBox({ width : "100%"});
            oFlexBox.addStyleClass("dataCollectionParameterHeader");

            var oLeftVBox =  new sap.m.VBox();
            oLeftVBox.addStyleClass("dataCollectionParameterHeaderLeft");

            var oRightVBox =  new sap.m.VBox({alignItems : sap.m.FlexAlignItems.End});
            oRightVBox.addStyleClass("dataCollectionParameterHeaderRight");

            oFlexBox.addItem(oLeftVBox);
            oFlexBox.addItem(oRightVBox);

            oLeftVBox.addItem(descriptionLabel);
            oRightVBox.addItem(dataTypeLabel);


            oVbox = new sap.m.VBox({
                alignItems: sap.m.FlexAlignItems.Start
            });
            oVbox.addStyleClass("dataCollectionUDFItem");
            oVbox.addItem(oFlexBox);

            oItem.addContent(oVbox);

            var requiredLabelField = new sap.m.Label({
                text: "",
                design: sap.m.LabelDesign.Bold,
                required: bRequired
            });

            if (bRequired) {
                requiredLabelField.addStyleClass("dataCollectionRequiredUDFLabel");
            } else {
                requiredLabelField.addStyleClass("dataCollectionNotRequiredLabel");
            }

            var oHbox = new sap.m.HBox({
                alignItems: sap.m.FlexAlignItems.Start
            });
            oHbox.addStyleClass("dataCollectionRequiredUDFItem");
            oHbox.addItem(dataControl);
            oHbox.addItem(requiredLabelField);
            oVbox.addItem(oHbox);

            oItem.addContent(oVbox);
        }

        return oItem;
    },

    /**
     * returns values from the components created from the input component list
     *
     * @param oView View the controlls will be assigned to
     * @param oController Controller for view
     * @param oDcGroupList[] list of  Objects containing control properties to generate (in sort order)
     *  <pre>
     *    dcGroupRef: DC Group Ref
     *    dcGroup: DC Group
     *    dcGroupRevision: DC Group revision
     *    description: DC Group description
     *    parameterListUri: URI to parameter list
     *    authenticatedUserRef: User Ref of authorized user
     *    typeSelection: Type of selected value (SFC, shop-order or PROCESS_LOT)
     *    typeValue: Selected type value
     *    operation: Selected Operation
     *    revision:   Selected Operation revision
     *    resource: Selected Resource
     *    parameterList:[{
     *        ref:  "DcParameterBO:DcGroupBO:*,DC_TEST,A,P1"
     *        overrideRequired: false
     *        overrideDone: false
     *        overrideStatus: "NONE"
     *        parameterName: "P1"
     *        dataType: "NUMBER"
     *        status: "StatusBO:*,101"
     *        parameterStatus: "ENABLED"
     *        allowMissingValue:false
     *        prompt: "Enter Param 1"
     *        minValue: "5"
     *        maxValue: "8"
     *        sequence: "10"
     *        performSPC: true
     *        displayChart: "ALWAYS"
     *        description: "Parameter 1"
     *        units: null
     *        displayDataInformation: true
     *        overrideMinMax: true
     *        valueMask: null
     *        expressionBuilder: null
     *        requiredDataEntries: "1"
     *        optionalDataEntries: "0"
     *        shortRun: false
     *        booleanZeroValue: null
     *        booleanOneValue: null
     *        qmCharType: null
     *        qmCritical: null
     *        udParameterList: [{
     *             dcParameterRef":"DcParameterBO:DcGroupBO:*,DCGROUP2,A,P1_N",
     *             prompt:" UDF Number 1",
     *             dataType: "NUMBER",
     *             required: false,
     *             sequence: "0",
     *             group:null,
     *             groupRevision:null,
     *             parentParameter:null
     *        }],
     *        parametricValues: [{
     *             ref: "PM:PA:*,13,50"
     *             parametricRef: "PA:*,13"
     *             sequence: "50"
     *             editedDateTime: null
     *             erpSent: false
     *             measureName: "P1"
     *             measureGroup: "DCGRP5"
     *             description: "param one"
     *             componentType: null
     *             pin: null
     *             measureStatus: "PASS"
     *             measureType: null
     *             memo: null
     *             unitOfMeasure: null
     *             dataType: "NUMBER"
     *             highLimit: null
     *             lowLimit: null
     *             expected: null
     *             actual: "1"
     *             actualNumber: "1"
     *             dcComment: null
     *             originalDCComment: null
     *             testDateTime: "\/Date(1374055283000-0420)\/"
     *             originalTestDateTime: "\/Date(1374055283000-0420)\/"
     *             elapsedTime: null
     *             originalActual: "1"
     *             edited: false
     *             internalMeasureId: null
     *             firstSequenceNumber: null
     *             dcGroupRevision: "A"
     *        }],
     *        udParametricValues: [{
     *             ref: "PMC:PM:PA:*,30,135,70"
     *             parametricMeasureRef: "PM:PA:*,30,135"
     *             sequence: 70
     *             gboRef: "SFCBO:*,291"
     *             propertyName: "udf1"
     *             propertyValue: 5
     *             originalPropertyValue: 5
     *             propertyType: "NUMBER"
     *             propertyStatus: ""
     *             unitOfMeasure: ""
     *             edited: false
     *             dateTime: "2013-07-19T09:02:52-07:00"
     *             originalDateTime: "2013-07-19T09:02:52-07:00"
     *             editedUserRef: "UserBO:*,SITE_ADMIN"
     *             group: "DCGRP5"
     *             groupRevision: "A"
     *             parentParameter: "P1"
     *        }]
     *    }]
     *  </pre>
     * @param iCurrentSfcIndex index of SFC being collected if >= 0; else not used
     * @param bApplyToAll apply collection to all SFC's in the group, else only current one (iCurrentSfcIndex)
     * @return JSON array of objects:
     *         {
     *             DCGroup: DC Group
     *             GroupRev: DC Group Revision
     *             Resource:  Resource
     *             Operation:  Operation
     *             Sfc: SFC
     *             UserId: authenticated user id
     *             DCValues: [{RecordId: &value, ParamName: &value2}, {...}],
     *             UDFValues: [{Parent: &parentParamValue, RecordId: &value, UDParamName: &value}, {...}]
     *         }
     * @throws Error if required data is missing or numbers are not in range
     */
    getDataValues : function(oView, oController, oDcGroupList, iCurrentSfcIndex, bApplyToAll) {

        if (!oDcGroupList || oDcGroupList.length <= 0) {
            return undefined;
        }

        var oResults = [];

        for (var i = 0; i < oDcGroupList.length; i++) {

            var dcGroupId = oDcGroupList[i].dcGroup;
            dcGroupId = util.StringUtil.replaceStrings(dcGroupId, " ", "_", 0);

            var dcGroupRevision = oDcGroupList[i].dcGroupRevision;
            dcGroupRevision = util.StringUtil.replaceStrings(dcGroupRevision, " ", "_", 0);

            // replace any special characters in the id
            var sId = dcGroupId + "_" + dcGroupRevision;
            sId = sId.replace(/\W/g, "_");

            var sGroupListId = oView.createId("dataEntryList_" + sId);

            if (oDcGroupList[i] && oDcGroupList[i].parameterList) {

                var oDataValues=[];
                var oUDataValues=[];
                var dccount = 0;
                var udfcount = 0;

                for (var j = 0; j < oDcGroupList[i].parameterList.length; j++) {

                    var oParameter = oDcGroupList[i].parameterList[j];

                    var oDcValues = undefined;
                    var oUdfValues = undefined;
                    try {
                        if (oParameter.dataType !== com.sap.me.datacollection.view.DataType.FORMULA) {
                            oDcValues = this.getFieldDataValues(sId, oView, oController, oParameter);

                            if (oParameter.udParameterList && oParameter.udParameterList.length > 0) {
                                  oUdfValues = this.getUserDefinedFieldValues(sId, oView, oController, oParameter);
                            }
                        }
                    } catch (e) {
                        throw e;
                    }

                    if (oDcValues && oDcValues.length > 0) {
                        for (var k = 0; k < oDcValues.length; k++) {
                            oDataValues[dccount] = oDcValues[k];
                            dccount++;
                        }
                    }

                    if (oUdfValues && oUdfValues.length > 0) {
                        for (var k = 0; k < oUdfValues.length; k++) {
                            oUDataValues[udfcount] = oUdfValues[k];
                            udfcount++;
                        }
                    }
                }

                if (dccount > 0 || udfcount > 0) {

                    if (bApplyToAll) {
                        for (var j = 0; j < oDcGroupList[i].sfcList.length; j++) {
                            var oSfc = oDcGroupList[i].sfcList[j];
                            var oResult = {
                                DcGroup: oDcGroupList[i].dcGroup,
                                GroupRev: oDcGroupList[i].dcGroupRevision,
                                Resource: oDcGroupList[i].resource,
                                Operation: oDcGroupList[i].operation,
                                UserId: oDcGroupList[i].authenticatedUserId,
                                Sfc : oSfc.sfc,
                                DCValues: oDataValues,
                                UDFValues: oUDataValues
                            }
                            oResults[oResults.length] = oResult;
                        }

                    } else {

                        // was  oDcGroupList[i].typeValue when processing SFC type's
                        var oSfc = oDcGroupList[i].sfcList[iCurrentSfcIndex];
                        var oResult = {
                            DcGroup: oDcGroupList[i].dcGroup,
                            GroupRev: oDcGroupList[i].dcGroupRevision,
                            Resource: oDcGroupList[i].resource,
                            Operation: oDcGroupList[i].operation,
                            UserId: oDcGroupList[i].authenticatedUserId,
                            Sfc : oSfc.sfc,
                            DCValues: oDataValues,
                            UDFValues: oUDataValues
                        }

                        oResults[oResults.length] = oResult;
                    }
                }
            }
        }

        return oResults;
    },

    getFieldDataValues : function(dcGroupId, oView, oController, mParameters) {

        var numEntries = Number(mParameters.requiredDataEntries) + Number(mParameters.optionalDataEntries);
        var countRequired = 0;

        var oResult = [];

        for (var i = 0; i < numEntries; i++) {

            var bRequired = false;
            if (countRequired < Number(mParameters.requiredDataEntries)) {
                countRequired++;
                bRequired = true;
            }

            var parametricRef = undefined;
            if (mParameters.parametricValues && mParameters.parametricValues.length > 0) {
                if (i < mParameters.parametricValues.length) {
                    parametricRef = mParameters.parametricValues[i].ref;
                }
            }

            var parameterId = dcGroupId + "_" + util.StringUtil.replaceStrings(mParameters.parameterName, " ", "_", 0);
            var sId = parameterId + "_" + i;

            // replace any special characters in the id
            sId = sId.replace(/\W/g, "_");

            var oDataControl = oView.byId(sId);
            if (!oDataControl) {
                throw new Error("Data Control with id = '" + sId + "' is not defined");
            }

            var oValue = undefined;
            if (mParameters.dataType === com.sap.me.datacollection.view.DataType.BOOLEAN) {
                var oItem = oDataControl.getSelectedItem();
                if (oItem) {
                    var oData = oItem.getCustomData();
                    var sValue = undefined;
                    if (oData) {
                        sValue = util.Model.getCustomDataValue(oData, "value");
                    }
                    if (!util.StringUtil.isBlank(sValue)) {
                        oValue = sValue;
                    }
                }

            } else {

                var oTValue = oDataControl.getValue();
                if (mParameters.dataType === com.sap.me.datacollection.view.DataType.NUMBER) {

                    if (!util.StringUtil.isBlank(oTValue)) {
                        if (jQuery.isNumeric(oTValue)) {
                            oValue = oTValue;

                        } else {

                            var bIsMissingValueCharacter = false;
                            if (mParameters.allowMissingValue) {
                                // MDC.MISSING_VALUE=M
                                var missingValue = util.I18NUtility.getLocaleSpecificText("MDC.MISSING_VALUE");
                                if (!util.StringUtil.isBlank(missingValue) && missingValue === oTValue) {
                                    oValue = oTValue;
                                    bIsMissingValueCharacter = true;
                                }
                            }

                            if (!bIsMissingValueCharacter) {
                                //  100.simple=Invalid number "%NUMBER%"
                                var oProperties = jQuery.sap.properties();
                                oProperties.setProperty("%NUMBER%", oTValue);
                                var message = util.I18NUtility.getErrorText("100.simple", oProperties);
                                oDataControl.setValueState(sap.ui.core.ValueState.Error);
                                oDataControl.setValueStateText(message);
                                throw new Error(message);
                            }
                        }
                    } else {
                        oValue = oTValue;
                    }

                    // validate numeric type or is of missing value character type
                    if (mParameters.allowMissingValue) {
                        if (!util.StringUtil.isBlank(oTValue)) {
                            if (jQuery.isNumeric(oTValue)) {
                                oValue = oTValue;
                            } else {
                                // MDC.MISSING_VALUE=M
                                var missingValue = util.I18NUtility.getLocaleSpecificText("MDC.MISSING_VALUE");
                                if (!util.StringUtil.isBlank(missingValue) && missingValue === oTValue) {
                                    oValue = oTValue;
                                } else {
                                    //  100.simple=Invalid number "%NUMBER%"
                                    var oProperties = jQuery.sap.properties();
                                    oProperties.setProperty("%NUMBER%", oTValue);
                                    var message = util.I18NUtility.getErrorText("100.simple", oProperties);
                                    oDataControl.setValueState(sap.ui.core.ValueState.Error);
                                    oDataControl.setValueStateText(message);
                                    throw new Error(message);
                                }
                            }
                        } else {
                            oValue = oTValue;
                        }
                    } else {
                        oValue = oTValue.toString();
                    }
                } else {
                    oValue = oTValue;
                }

                if (util.StringUtil.isBlank(oValue)) {
                    if (bRequired) {
                        // 10015.simple=Required value "%NAME%" missing; enter a value in the %NAME% field
                        var oProperties = jQuery.sap.properties();
                        oProperties.setProperty("%NAME%", util.I18NUtility.getLocaleSpecificText(mParameters.description));
                        var message = util.I18NUtility.getErrorText("10015.simple", oProperties);
                        oDataControl.setValueState(sap.ui.core.ValueState.Error);
                        oDataControl.setValueStateText(message);
                        throw new Error(message);

                    } else {
                        var oData = oDataControl.getCustomData();
                        var bChanged = false;
                        if (oData) {
                            bChanged = util.Model.getCustomDataValue(oData, "bChanged");
                        }
                        if (!bChanged) {
                            continue;
                        }
                    }
                }

                if (mParameters.dataType === com.sap.me.datacollection.view.DataType.NUMBER) {
                    var bValidateMinMax = ( mParameters.overrideMinMax || mParameters.softLimitCheck ) ;
                    var number = undefined;
                    if (mParameters.allowMissingValue) {
                        if (jQuery.isNumeric(oValue)) {
                            number = Number(oValue);
                        // must be the Missing Value "M" value - do not validate
                        } else {
                             bValidateMinMax = false;
                        }
                    } else {
                        number = Number(oValue);
                    }
               
                    var message = "";                    
                    if (mParameters.minValue) {
                    	var nValue = Number(mParameters.minValue);
                    	if (number < nValue  && oDataControl.getEnabled()) { 
                    		// 12035.simple=%FIELD% is less than minimum limit (%VALUE% < %LIMIT%)
                			var oProperties = jQuery.sap.properties();
                			oProperties.setProperty("%FIELD%", util.I18NUtility.getLocaleSpecificText(mParameters.description));
                			oProperties.setProperty("%VALUE%", number.toString());
                			oProperties.setProperty("%LIMIT%", mParameters.minValue);
                			message = util.I18NUtility.getErrorText("12035.simple", oProperties);
                    		if (bValidateMinMax ) {                    			
                    			if ( ! (oController.processedComps && oController.processedComps[oDataControl.getId()] ))  { 
                    				var oProperties = jQuery.sap.properties();
                    				oProperties.setProperty("%PARAMETER%", util.I18NUtility.getLocaleSpecificText(mParameters.description));
                    				oProperties.setProperty("%VALUE%", number.toString());
                    				var popupMessage  = util.I18NUtility.getLocaleSpecificText("dc.softLimitCheck.MESSAGE", oProperties);
                    				var err = {'popupmessage':popupMessage, 'message': message ,'comp':oDataControl , 'controller': oController};
                    				throw err; 
                    			} else {
                    				oDataControl.setEnabled(false);                   	
                    			}
                    		} else {                    			
                    			oDataControl.setValueState(sap.ui.core.ValueState.Error);
                    			oDataControl.setValueStateText(message);
                    			throw new Error(message);
                    		}
                    	}
                    }

                    if (mParameters.maxValue) {
                        var nValue = Number(mParameters.maxValue);
                        if (number > nValue && oDataControl.getEnabled() ) {
                        	// 12034.simple=%FIELD% is greater than maximum limit (%VALUE% < %LIMIT%)
                            var oProperties = jQuery.sap.properties();
                            oProperties.setProperty("%FIELD%", util.I18NUtility.getLocaleSpecificText(mParameters.description));
                            oProperties.setProperty("%VALUE%", number.toString());
                            oProperties.setProperty("%LIMIT%", mParameters.maxValue);
                            message = util.I18NUtility.getErrorText("12034.simple", oProperties);
                        	if ( bValidateMinMax ) {                        		
                    			if ( ! (oController.processedComps && oController.processedComps[oDataControl.getId()] ))  {   
                    				var oProperties = jQuery.sap.properties();
                    				oProperties.setProperty("%PARAMETER%", util.I18NUtility.getLocaleSpecificText(mParameters.description));
                    				oProperties.setProperty("%VALUE%", number.toString());
                    				var popupMessage  = util.I18NUtility.getLocaleSpecificText("dc.softLimitCheck.MESSAGE", oProperties);
                    				var err = {'popupmessage':popupMessage, 'message': message ,'comp':oDataControl , 'controller': oController};
                    				throw err; 
                    			} else {
                    				oDataControl.setEnabled(false);
                    			}
                    		} else {                   
                    			oDataControl.setValueState(sap.ui.core.ValueState.Error);
                    			oDataControl.setValueStateText(message);
                    			throw new Error(message);
                    		}
                        }
                    }
                }
            }

            var oData = {};
            if (parametricRef) {
                oData["RecordId"] = parametricRef;
                oData[mParameters.parameterName] = oValue;
            } else {
                oData[mParameters.parameterName] = oValue;
            }
            if ( ! oDataControl.getEnabled()) {
            	oData["OverrideDone"]  = "true";
            }
            oResult[oResult.length] = oData;
        }

        return oResult;
    },

    getUserDefinedFieldValues : function(dcGroupId, oView, oController, mParameters) {

        if (!mParameters.udParameterList || mParameters.udParameterList.length <= 0) {
            return undefined;
        }

        var oResult = [];

        for (var i = 0; i < mParameters.udParameterList.length; i++) {

            var oParameter = mParameters.udParameterList[i];

            var parameterId = dcGroupId + "_" + util.StringUtil.replaceStrings(mParameters.parameterName, " ", "_", 0);
            var sId = parameterId + "_udf_" + oParameter.sequence;

            // replace any special characters in the id
            sId = sId.replace(/\W/g, "_");

            var oDataControl = oView.byId(sId);
            if (!oDataControl) {
                throw new Error("Data Control with id = '" + sId + "' is not defined");
            }

            if (!oDataControl.getEnabled()) {
                continue;
            }

            var parametricMeasureRef = undefined;
            var parametricValue = undefined;
            var parameterName = oParameter.prompt;
            var parentParameter = mParameters.parameterName;

            if (mParameters.udParametricValues && mParameters.parametricValues.length > 0) {
                for (var j = 0; j < mParameters.udParametricValues.length; j++) {
                    if (oParameter.prompt === mParameters.udParametricValues[j].propertyName) {
                        parametricMeasureRef = mParameters.udParametricValues[j].parametricMeasureRef;
                        parametricValue = mParameters.udParametricValues[j].propertyValue;
                        parameterName = mParameters.udParametricValues[j].propertyName;
                        parentParameter = mParameters.udParametricValues[j].parentParameter;
                        break;
                    }
                }
            }

            //  text field
            var oValue = undefined;
            var oTValue = oDataControl.getValue();
            if (oParameter.dataType === com.sap.me.datacollection.view.DataType.NUMBER) {
                oValue = oTValue.toString();
            } else {
                oValue = oTValue;
            }

            if (util.StringUtil.isBlank(oValue)) {
                if (oParameter.required) {
                    // 10015.simple=Required value "%NAME%" missing; enter a value in the %NAME% field
                    var oProperties = jQuery.sap.properties();
                    oProperties.setProperty("%NAME%", util.I18NUtility.getLocaleSpecificText(oParameter.prompt));
                    var message = util.I18NUtility.getErrorText("10015.simple", oProperties);
                    oDataControl.setValueState(sap.ui.core.ValueState.Error);
                    oDataControl.setValueStateText(message);
                    throw new Error(message);
                } else {
                    var oData = oDataControl.getCustomData();
                    var bChanged = false;
                    if (oData) {
                        bChanged = util.Model.getCustomDataValue(oData, "bChanged");
                    }
                    if (!bChanged) {
                        continue;
                    }
                }
            }

            var oData = {};
            if (parametricMeasureRef && parentParameter && parameterName) {
                oData["Parent"] = parentParameter;
                oData["RecordId"] = parametricMeasureRef;
                oData[parameterName] = oValue;
            } else {
                oData["Parent"] = parentParameter;
                oData[parameterName] = oValue;
            }

            oResult[oResult.length] = oData;

        }

        return oResult;
    },

    /**
     * Clear values from all text field components created from the input component list
     *
     * @param oView View the controlls will be assigned to
     * @param oDcGroupList[] list of  Objects containing control properties to generate (in sort order)
     */
    clearTextFields : function(oView, oDcGroupList) {

        if (!oDcGroupList || oDcGroupList.length <= 0) {
            return;
        }

        for (var i = 0; i < oDcGroupList.length; i++) {

            var dcGroupId = oDcGroupList[i].dcGroup;
            dcGroupId = util.StringUtil.replaceStrings(dcGroupId, " ", "_", 0);

            var dcGroupRevision = oDcGroupList[i].dcGroupRevision;
            dcGroupRevision = util.StringUtil.replaceStrings(dcGroupRevision, " ", "_", 0);

            // replace any special characters in the id
            var sId = dcGroupId + "_" + dcGroupRevision;
            sId = sId.replace(/\W/g, "_");

            var sGroupListId = oView.createId("dataEntryList_" + sId);

            if (oDcGroupList[i] && oDcGroupList[i].parameterList) {
                for (var j = 0; j < oDcGroupList[i].parameterList.length; j++) {
                    var oParameter = oDcGroupList[i].parameterList[j];
                    if (oParameter.dataType !== com.sap.me.datacollection.view.DataType.FORMULA) {
                        this.clearTextField(sId, oView, oParameter);

                        if (oParameter.udParameterList && oParameter.udParameterList.length > 0) {
                              this.clearUserDefinedTextField(sId, oView, oParameter);
                        }
                    }
                }
            }
        }
    },

    clearTextField : function(dcGroupId, oView, mParameters) {

        // ignore boolean types
        if (mParameters.dataType === com.sap.me.datacollection.view.DataType.BOOLEAN) {
            return;
        }

        var numEntries = Number(mParameters.requiredDataEntries) + Number(mParameters.optionalDataEntries);

        for (var i = 0; i < numEntries; i++) {

            var parameterId = dcGroupId + "_" + util.StringUtil.replaceStrings(mParameters.parameterName, " ", "_", 0);
            var sId = parameterId + "_" + i;

            // replace any special characters in the id
            sId = sId.replace(/\W/g, "_");

            var oDataControl = oView.byId(sId);
            if (!oDataControl) {
                throw new Error("Data Control with id = '" + sId + "' is not defined");
            }

            if (!oDataControl.getEnabled()) {
                continue;
            }

            if (mParameters.dataType === com.sap.me.datacollection.view.DataType.NUMBER) {
                oDataControl.setValue(null);
            } else {
                oDataControl.setValue("");
            }
        }
    },

    clearUserDefinedTextField : function(dcGroupId, oView, mParameters) {

        if (!mParameters.udParameterList || mParameters.udParameterList.length <= 0) {
            return;
        }

        for (var i = 0; i < mParameters.udParameterList.length; i++) {

            var oParameter = mParameters.udParameterList[i];

            var parameterId = dcGroupId + "_" + util.StringUtil.replaceStrings(mParameters.parameterName, " ", "_", 0);
            var sId = parameterId + "_udf_" + oParameter.sequence;

            // replace any special characters in the id
            sId = sId.replace(/\W/g, "_");

            var oDataControl = oView.byId(sId);
            if (!oDataControl) {
                throw new Error("Data Control with id = '" + sId + "' is not defined");
            }

            if (!oDataControl.getEnabled()) {
                continue;
            }

            if (oParameter.dataType === com.sap.me.datacollection.view.DataType.NUMBER) {
                oDataControl.setValue(null);
            } else {
                oDataControl.setValue("");
            }

        }
    }
    
};