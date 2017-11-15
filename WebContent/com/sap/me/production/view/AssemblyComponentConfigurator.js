jQuery.sap.declare("com.sap.me.production.view.AssemblyComponentConfigurator");
jQuery.sap.require("com.sap.me.control.Input");
jQuery.sap.require("com.sap.me.control.TextArea");
jQuery.sap.require("com.sap.me.production.view.DataType");
jQuery.sap.require("com.sap.me.production.view.AssyUtils");

com.sap.me.production.view.AssemblyComponentConfigurator = {

    fieldMapper: function(oAssyDataList)
    {
        var oAssyDataFields = [];
        // Assign values
        for (var i = 0; i < oAssyDataList.length; i++) {

            var assyDataFields = {
                name: oAssyDataList[i].name,
                type: oAssyDataList[i].type,
                label: oAssyDataList[i].label,
                defaultValue: "",
                sequence: oAssyDataList[i].sequence,
                readOnly: false,
                enabled: true,
                required: oAssyDataList[i].required,
                upperCase: true,
                //maxLength: 20,
                browseId: "",
                legacyBrowse: false,
                customBrowse: false,
                multiSelectBrowse: false,
                validValues: oAssyDataList[i].validValues
            };

            oAssyDataFields[oAssyDataFields.length] = assyDataFields;
        }

        return oAssyDataFields;
    },

    /**
    saptabnext - Called whenever the "Tab" key is pressed on a field that has been registered to react to the event.
        Example Trigger Code:
            textAreaField.onsaptabnext = this.saptabnext;
    **/
    saptabnext: function(evt)
    {
 
        // Check if AutoAdd on Tab is enabled
        if (util.Model.getData("AUTO_ADD_ON_TABOUT") === true) {
            var assyOnTabEnabled = util.Model.getData("ASSY_TAB_ENABLED");

            if (assyOnTabEnabled === false)
            {
                return;     // Not enabled, so exit
            }

            var assyOnTabField = util.Model.getData("ASSY_TAB_FIELD");

            // Resulting Field Value is similar to:
            //      "AssemblyDataEntry--EXTERNAL_LOT-inner"
            var rawFieldName = evt.srcElement.id;
            // Get just the field name we are looking for:
            var fieldName = undefined;
            if (rawFieldName !== undefined && rawFieldName !== null && rawFieldName.length > 0) {
                var prefix = "AssemblyDataEntry--";
                var suffix = "-inner";
                var prefixPos = rawFieldName.indexOf(prefix);
                var suffixPos = rawFieldName.indexOf(suffix);
                // Get the Field Name
                if (prefixPos > -1 && prefixPos > -1) {
                    fieldName = rawFieldName.substr(prefixPos + prefix.length, suffixPos - (prefixPos + prefix.length));
                }
            }

            // If a match of the fieldName to the Assy Data Field exists,
            // Add the Component!
            if (fieldName === assyOnTabField.name) {
                util.Model.setData("FIRE_ASSY_TAB_ADD", true);      // This value will get picked up by the AssemblyDataEntry(controller) and trigger the add.
                jQuery.sap.log.info("AssemblyDataEntry.lostFocus: ADD ON TAB FIRED on '" + fieldName + "'");
            }
        }        
    },


    /**
     * returns list of controls for Assembly.
     *
     * @param oAssyDataList [] list of  Objects containing control properties to generate
     *  <pre>
     *     name : name of assyDataItem
     *     type : com.sap.me.production.view.DataType
     *     label : text for label (or key in preoperties file)
     *     defaultValue : default value
     *     sequence : numeric sequence value defining the order
     *     readOnly : is value readonly field
     *     enabled : is control enabled
     *     required : is value required
     *     upperCase : is input upper case
     *     maxLength : maximum characters
     *     browseId : ID of browse
     *     legacyBrowse : is it a legacy browse
     *     customBrowse : is it a custom browse
     *     multiSelectBrowse : is browse multi-select
     *     validValues :  array of valid values for a list type control [
     *          ref : reference value for this list item value
     *          bDefault : true if this represents default value in list
     *          sequence : numeric sequence value
     *          value : value for list item to be stored
     *          label : Display value for list item
     *     ]
     *  </pre>
     * @return List of sap.m.CustomListItem controls containing data fields
     */
    getControls: function (oView, oAssyDataList) {
        if (!oAssyDataList || oAssyDataList.length <= 0) {
            return undefined;
        }

        var count = 0;
        var listItems = [];
        for (var i = 0; i < oAssyDataList.length; i++) {
            var assyDataItem = undefined;
            if (oAssyDataList[i].type === com.sap.me.production.view.DataType.LABEL) {
                assyDataItem = this.createLabel(oView, oAssyDataList[i]);
            } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.TEXT ||
                oAssyDataList[i].type === com.sap.me.production.view.DataType.NUMBER) {
                assyDataItem = this.createText(oView, oAssyDataList[i]);
            } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.TEXT_AREA) {
                assyDataItem = this.createTextArea(oView, oAssyDataList[i]);
            } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.DATE) {
                assyDataItem = this.createDate(oView, oAssyDataList[i]);
            } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.CHECKBOX) {
                assyDataItem = this.createCheckBox(oView, oAssyDataList[i]);
            } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.LIST) {
                assyDataItem = this.createList(oView, oAssyDataList[i]);
            } 
            if (assyDataItem) {
                listItems[count] = assyDataItem;
                count++;
            }
        }

        return listItems;
    },

    createLabel: function (oView, mParameters) {

        var dataLabelField = new sap.m.Input({
            id: oView.createId(mParameters.name),
            width: "100%"
        });
        dataLabelField.addStyleClass("dataCollectionField");
        dataLabelField.setEditable(false);
        if (mParameters.defaultValue) {
            dataLabelField.setValue(mParameters.defaultValue);
        }

        var labelField = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText(mParameters.label),
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });
        labelField.addStyleClass("dataCollectionLabel");
        labelField.setLabelFor(dataLabelField);
        if (mParameters.required) {
            labelField.setRequired(mParameters.required);
        }

        var oItem = new sap.m.CustomListItem();
        var oVbox = new sap.m.VBox({
            width: "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(dataLabelField);
        oItem.addContent(oVbox);

        return oItem;
    },

    /**
    * fieldChange
    *
    * Handles the validation of text while being entered.
    */
    fieldChange: function (dataEntryField) {
        var oAssyDataList = util.Model.getData("TEMP_Assy_ComponentList");
        var oView = sap.ui.getCore().byId("AssemblyDataEntry");
        var controlId = dataEntryField.mParameters.id.toString().replace("AssemblyDataEntry--", "");
        var oInputControl = oView.byId(controlId);

        for (var i = 0; i < oAssyDataList.length; i++) {
            if (oAssyDataList[i].name === controlId) {
                var oDataControl = oView.byId(oAssyDataList[i].name);
                if (oDataControl) {
                    var controlType = oAssyDataList[i].type;
                    var isBrowseable = oAssyDataList[i].browseable;
                    // Validate based on Control Type
                    if (controlType === com.sap.me.production.view.DataType.TEXT && isBrowseable === true) {
                        // Get the Value of the Object
                        var value = oInputControl.getValue();
                        value = com.sap.me.production.view.AssyUtils.validateSpecialCharacters(value);
                        oInputControl.setValue(value);
                    } else if (controlType === com.sap.me.production.view.DataType.NUMBER) {
                        // Get the Value of the Object
                        var value = oInputControl.getValue();
                        value = com.sap.me.production.view.AssyUtils.validateNumberCharacters(value);
                        oInputControl.setValue(value);
                    }
                }
            }
        }
    },

    createText: function (oView, mParameters) {

        var dataEntryField = new com.sap.me.control.Input({
            id: oView.createId(mParameters.name),
            width: "100%",
            showClear: true,
            liveChange: [this.fieldChange, mParameters],
            //change: [this.onfocusout, mParameters],
            upperCase: true
        });
        dataEntryField.addStyleClass("dataCollectionField");
       
        dataEntryField.onsaptabnext = this.saptabnext;
        //jQuery.sap.log.info("AssemblyComponentConfigurator.createText: registered-" + mParameters.name);

        if (mParameters.maxLength) {
            dataEntryField.setMaxLength(mParameters.maxLength);
        }
        if (mParameters.upperCase) {
            dataEntryField.addStyleClass("inputUpperCase");
        }
        if (mParameters.defaultValue) {
            dataEntryField.setValue(mParameters.defaultValue);
        }
        if (mParameters.readOnly) {
            dataEntryField.setEditable(false);
        }
        if (mParameters.enabled) {
            dataEntryField.setEnabled(mParameters.enabled);
        }

        var labelField = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText(mParameters.label),
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });
        labelField.addStyleClass("dataCollectionLabel");
        labelField.setLabelFor(dataEntryField);
        if (mParameters.required) {
            labelField.setRequired(mParameters.required);
        }

        var oItem = new sap.m.CustomListItem();
        var oVbox = new sap.m.VBox({
            width: "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(dataEntryField);
        oItem.addContent(oVbox);

        return oItem;
    },

    createTextArea: function (oView, mParameters) {

        var textAreaField = new com.sap.me.control.TextArea({
            id: oView.createId(mParameters.name),
            width: "100%",
            showClear: true,
            rows: 3
        });
        textAreaField.addStyleClass("dataCollectionField");
        textAreaField.onsaptabnext = this.saptabnext;

        if (mParameters.maxLength) {
            textAreaField.setMaxLength(mParameters.maxLength);
        }
        if (mParameters.defaultValue) {
            textAreaField.setValue(mParameters.defaultValue);
        }
        if (mParameters.readOnly) {
            textAreaField.setEditable(false);
        }
        if (mParameters.enabled) {
            textAreaField.setEnabled(mParameters.enabled);
        }

        var labelField = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText(mParameters.label),
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });
        labelField.addStyleClass("dataCollectionLabel");
        labelField.setLabelFor(textAreaField);
        if (mParameters.required) {
            labelField.setRequired(mParameters.required);
        }

        var oItem = new sap.m.CustomListItem();
        var oVbox = new sap.m.VBox({
            width: "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(textAreaField);
        oItem.addContent(oVbox);

        return oItem;
    },


    createDate: function (oView, mParameters) {

        var nNow = new Date().getTime();
        if (mParameters.defaultValue) {
            try {
                nNow = new Date(mParameters.defaultValue).getTime();
            } catch (e) {
                jQuery.sap.log.debug("createDate: bad default date value = " + mParameters.defaultValue);
            }
        }

        var dateField = new sap.m.DateTimeInput({
            id: oView.createId(mParameters.name),
            type: sap.m.DateTimeInputType.Date,
            dateValue: new Date(nNow),
            valueFormat: "dd-MM, yyyy",
            displayFormat: "dd MMMM, yyyy",
            width: "100%"
        });

        
        dateField.addStyleClass("dataCollectionField");
        if (mParameters.readOnly) {
            dateField.setEditable(false);
        }
        if (mParameters.enabled) {
            dateField.setEnabled(mParameters.enabled);
        }

        var labelField = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText(mParameters.label),
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });
        labelField.addStyleClass("dataCollectionLabel");
        labelField.setLabelFor(dateField);
        if (mParameters.required) {
            labelField.setRequired(mParameters.required);
        }

        var oItem = new sap.m.CustomListItem();
        var oVbox = new sap.m.VBox({
            width: "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(dateField);
        oItem.addContent(oVbox);

        return oItem;
    },

    createCheckBox: function (oView, mParameters) {

        var checkBoxField = new sap.m.CheckBox({
            id: oView.createId(mParameters.name)
        });
        checkBoxField.addStyleClass("dataCollectionField");
        if (mParameters.defaultValue) {
            checkBoxField.setSelected(mParameters.defaultValue);
        }
        if (mParameters.enabled) {
            checkBoxField.setEnabled(mParameters.enabled);
        }
        var labelField = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText(mParameters.label),
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });
        labelField.addStyleClass("dataCollectionLabel");
        labelField.setLabelFor(checkBoxField);
        if (mParameters.required) {
            labelField.setRequired(mParameters.required);
        }

        var oItem = new sap.m.CustomListItem();
        var oVbox = new sap.m.VBox({
            width: "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(checkBoxField);
        oItem.addContent(oVbox);

        return oItem;
    },


    createList: function (oView, mParameters) {

        if (!mParameters.validValues || mParameters.validValues.length <= 0) {
            return undefined;
        }

        var selectField = new sap.m.Select({
            id: oView.createId(mParameters.name),
            width: "100%"
        });
        selectField.addStyleClass("dataCollectionField");

        if (mParameters.enabled) {
            selectField.setEnabled(mParameters.enabled);
        }

        selectField.onsaptabnext = this.saptabnext;

        // sort by sequence number
        mParameters.validValues.sort(function (a, b) {
            if (!a.sequence && !b.sequence) {
                return 0;
            } else if (a.sequence && !b.sequence) {
                return 1;
            } else if (!a.sequence && b.sequence) {
                return -1;
            }
            var aseq = parseInt(a.sequence, 10);
            var bseq = parseInt(b.sequence, 10);
            return aseq - bseq;
        });

        // Add empty option
        var oItem = new sap.ui.core.ListItem({
            id: oView.createId(mParameters.name + "_DEFAULT"),
            text: "",
            customData: [
                new sap.ui.core.CustomData({
                    key: "value",
                    value: ""
                }),
                new sap.ui.core.CustomData({
                    key: "ref",
                    value: ""
                })
            ]
        });

        selectField.addItem(oItem);

        var selectionMade = false;
        for (var i = 0; i < mParameters.validValues.length; i++) {

            var validValue = mParameters.validValues[i];

            oItem = new sap.ui.core.ListItem({
                id: oView.createId(mParameters.name + "_" + validValue.value),
                text: util.I18NUtility.getLocaleSpecificText(validValue.value),
                customData: [
                    new sap.ui.core.CustomData({
                        key: "value",
                        value: validValue.value
                    }),
                    new sap.ui.core.CustomData({
                        key: "ref",
                        value: validValue.ref
                    })
                ]
            });

            selectField.addItem(oItem);

            if (validValue._default) {
                selectField.setSelectedItem(oItem);
                selectionMade = true;
            }

        }

        var labelField = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText(mParameters.label),
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });
        labelField.addStyleClass("dataCollectionLabel");
        labelField.setLabelFor(selectField);
        if (mParameters.required) {
            labelField.setRequired(mParameters.required);
        }

        var oItem = new sap.m.CustomListItem();
        var oVbox = new sap.m.VBox({
            width: "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(selectField);
        oItem.addContent(oVbox);

        return oItem;

    },

    /**
     * returns values from the assyDataItems created from the input assyDataItem list
     *
     * @param oAssyDataList [] list of  Objects containing control properties to generate
     *  <pre>
     *     name : name of assyDataItem
     *     type : com.sap.me.production.view.DataType
     *     readOnly : is value readonly field
     *     enabled : is control enabled
     *     required : is value required
     *     upperCase : is input upper case
     *  </pre>
     * @return JSON object {name : value, name2 : value2, ...}
     */
    getDataValues: function (oView, oAssyDataList) {
        if (!oAssyDataList || oAssyDataList.length <= 0) {
            return undefined;
        }

        var dataValues = {};
        for (var i = 0; i < oAssyDataList.length; i++) {

            var oDataControl = oView.byId(oAssyDataList[i].name);
            if (oDataControl) {

                var oValue = undefined;                

                if (oAssyDataList[i].type === com.sap.me.production.view.DataType.TEXT) {
                    oDataControl.setValueState(sap.ui.core.ValueState.None);
                    oValue = oDataControl.getValue();
                    if (oValue && oAssyDataList[i].upperCase) {
                        oValue = oValue.toUpperCase();
                    }

                } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.NUMBER) {
                    oDataControl.setValueState(sap.ui.core.ValueState.None);
                    oValue = oDataControl.getValue();

                } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.TEXT_AREA) {
                    oDataControl.setValueState(sap.ui.core.ValueState.None);
                    oValue = oDataControl.getValue();
                    if (oValue && oAssyDataList[i].upperCase) {
                        oValue = oValue.toUpperCase();
                    }

                } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.DATE) {
                    var oDate = oDataControl.getDateValue();
                    if (oDate) {
                        var nMilliseconds = oDate.getTime();
                        oValue = "Date(" + nMilliseconds + ")";
                    }

                } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.CHECKBOX) {
                    oValue = oDataControl.getSelected().toString();

                } else if (oAssyDataList[i].type === com.sap.me.production.view.DataType.LIST) {
                    var oItem = oDataControl.getSelectedItem();
                    if (oItem) {
                        var oData = oItem.getCustomData();
                        if (oData && oData.length > 0) {
                            oValue = oData[0].getValue();
                        }
                    }
                }

                if (oAssyDataList[i].required && oAssyDataList[i].type !== com.sap.me.production.view.DataType.CHECKBOX &&
                    oAssyDataList[i].required && oAssyDataList[i].type !== com.sap.me.production.view.DataType.LIST ) {
                    if (!oValue) {

                        // 10015.simple=Required value "%NAME%" missing; enter a value in the %NAME% field
                        var oProperties = jQuery.sap.properties();
                        oProperties.setProperty("%NAME%", util.I18NUtility.getLocaleSpecificText(oAssyDataList[i].label));
                        var message = util.I18NUtility.getErrorText("10015.simple", oProperties);
                        oDataControl.setValueState(sap.ui.core.ValueState.Error);
                        if (oAssyDataList[i].type === com.sap.me.production.view.DataType.TEXT ||
                            oAssyDataList[i].type === com.sap.me.production.view.DataType.TEXT_AREA ||
                            oAssyDataList[i].type === com.sap.me.production.view.DataType.NUMBER) {
                            oDataControl.setValueStateText(message);
                        }

                        throw new Error(message);
                    }
                }

                dataValues[oAssyDataList[i].name] = oValue;
            }
        }

        return dataValues;
    },

    /**
     * clear the components created from the input component list
     *
     * @param oComponentList [] list of  Objects containing control properties
     */
    clearControls: function (oView, oControlList) {
        if (!oControlList || oControlList.length <= 0) {
            return;
        }

        for (var i = 0; i < oControlList.length; i++) {

            var oDataControl = oView.byId(oControlList[i].name);
            if (oDataControl) {

                if (oControlList[i].type === com.sap.me.production.view.DataType.TEXT ||
                		oControlList[i].type === com.sap.me.production.view.DataType.TEXT_AREA) {
                    oDataControl.setValue("");

                } else if (oControlList[i].type === com.sap.me.production.view.DataType.NUMBER) {
                    oDataControl.setValue(null);

                } else if (oControlList[i].type === com.sap.me.production.view.DataType.DATE) {
                    oDataControl.setValue("Now");

                } else if (oControlList[i].type === com.sap.me.production.view.DataType.CHECKBOX) {
                    oValue = oDataControl.setSelected(false);
                } else if (oControlList[i].type === com.sap.me.production.view.DataType.LIST) {                        
                        
                        oDataControl.setSelectedItemId("");
                }                
            }
        }
    }
};