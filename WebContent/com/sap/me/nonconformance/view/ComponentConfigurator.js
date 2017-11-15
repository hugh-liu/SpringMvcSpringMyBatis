jQuery.sap.declare("com.sap.me.nonconformance.view.ComponentConfigurator");
jQuery.sap.require("com.sap.me.nonconformance.view.DataType");
jQuery.sap.require("com.sap.me.control.Input");
jQuery.sap.require("com.sap.me.control.TextArea");

com.sap.me.nonconformance.view.ComponentConfigurator = {

    /**
     * returns list of controls for Log NC.
     *
     * @param oComponentList [] list of  Objects containing control properties to generate
     *  <pre>
     *     name : name of component
     *     type : com.sap.me.nonconformance.view.DataType
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
    getControls : function(oView, oComponentList) {
        if (!oComponentList || oComponentList.length <= 0) {
            return undefined;
        }

        // sort by sequence number
        oComponentList.sort(function(a, b){
             if (!a.sequence && !b.sequence) {
                 return 0;
             } else if (a.sequence && !b.sequence) {
                 return 1;
             } else if (!a.sequence && b.sequence) {
                 return -1;
             }
             return a.sequence-b.sequence;
        });
        var count = 0;
        var listItems=[];
        for (var i = 0; i < oComponentList.length; i++) {
              var component = undefined;
              if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.LABEL) {
                  component = this.createLabel(oView, oComponentList[i]) ;
              } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT ||
                  oComponentList[i].type === com.sap.me.nonconformance.view.DataType.NUMBER) {
                  component = this.createText(oView, oComponentList[i]) ;
              } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT_AREA) {
                  component = this.createTextArea(oView, oComponentList[i]) ;
              } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.DATE) {
                  component = this.createDate(oView, oComponentList[i]) ;
              } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.CHECKBOX) {
                  component = this.createCheckBox(oView, oComponentList[i]) ;
              } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.LIST) {
                  component = this.createList(oView, oComponentList[i]) ;
              }
              if (component) {
                  listItems[count] = component;
                  count++;
              }
        }

        return listItems;
    },

    createLabel : function(oView, mParameters) {

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
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(dataLabelField);
        oItem.addContent(oVbox);

        return oItem;
    },

    createText : function(oView, mParameters) {

        var dataEntryField = new com.sap.me.control.Input({
            id: oView.createId(mParameters.name),
            width: "100%",
            showClear: true

        });
        dataEntryField.addStyleClass("dataCollectionField");

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
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(dataEntryField);
        oItem.addContent(oVbox);

        return oItem;
    },

    createTextArea : function(oView, mParameters) {

        var textAreaField = new com.sap.me.control.TextArea({
            id: oView.createId(mParameters.name),
            width: "100%",
            rows: 3,
            showClear: true
        });
        textAreaField.addStyleClass("dataCollectionField");

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
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(textAreaField);
        oItem.addContent(oVbox);

        return oItem;
    },


    createDate : function(oView, mParameters) {

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
            dateValue : new Date(nNow),
            valueFormat : "dd-MM, yyyy",
            displayFormat : "dd MMMM, yyyy",
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
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(dateField);
        oItem.addContent(oVbox);

        return oItem;
    },

    createCheckBox : function(oView, mParameters) {

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
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(checkBoxField);
        oItem.addContent(oVbox);

        return oItem;
    },

    createList : function(oView, mParameters) {

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

        // sort by sequence number
        mParameters.validValues.sort(function(a, b) {
             if (!a.sequence && !b.sequence) {
                 return 0;
             } else if (a.sequence && !b.sequence) {
                 return 1;
             } else if (!a.sequence && b.sequence) {
                 return -1;
             }
             var aseq = parseInt(a.sequence,10);
             var bseq = parseInt(b.sequence,10);
             return aseq - bseq;
        });

        for (var i = 0; i < mParameters.validValues.length; i++) {

            var validValue = mParameters.validValues[i];

            var oItem = new sap.ui.core.ListItem({
                id: oView.createId(mParameters.name + "_" + validValue.value),
                text: util.I18NUtility.getLocaleSpecificText(validValue.label),
                customData : [
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

            if (validValue.bDefault) {
                selectField.setSelectedItem(oItem);
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
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });
        oVbox.addStyleClass("dataCollectionItem");
        oVbox.addItem(labelField);
        oVbox.addItem(selectField);
        oItem.addContent(oVbox);

        return oItem;

    },

    /**
     * returns values from the components created from the input component list
     *
     * @param oComponentList [] list of  Objects containing control properties to generate
     *  <pre>
     *     name : name of component
     *     type : com.sap.me.nonconformance.view.DataType
     *     readOnly : is value readonly field
     *     enabled : is control enabled
     *     required : is value required
     *     upperCase : is input upper case
     *  </pre>
     * @return JSON object {name : value, name2 : value2, ...}
     */
    getDataValues : function(oView, oComponentList) {
        if (!oComponentList || oComponentList.length <= 0) {
        	 jQuery.sap.log.error("ComponentConfigurator.getDataValues: Could find any data entry components.");
            return undefined;
        }
        for (var i = 0; i < oComponentList.length; i++) {
        	var oDataControl = oView.byId(oComponentList[i].name);
        	if ( oDataControl) {
        		// Clear the state of all components first
        		if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT) {
        			oDataControl.setValueStateText("");
        			oDataControl.setValueState(sap.ui.core.ValueState.None);
        		} else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.NUMBER) {
        			oDataControl.setValueStateText("");
        			oDataControl.setValueState(sap.ui.core.ValueState.None);
        		} else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT_AREA) {
        			oDataControl.setValueStateText("");
        			oDataControl.setValueState(sap.ui.core.ValueState.None);
        		} else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.DATE) {
        			oDataControl.setValueState(sap.ui.core.ValueState.None);
        		}
        	}
        }
        

        var dataValues={};
        for (var i = 0; i < oComponentList.length; i++) {

              var oDataControl = oView.byId(oComponentList[i].name);
              if (oDataControl) {

                  var oValue = undefined;

                  if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT) {             
                      oValue = oDataControl.getValue();
                      if (oValue && oComponentList[i].upperCase) {
                          oValue = oValue.toUpperCase();
                      }

                  } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.NUMBER) {
                      oValue = oDataControl.getValue();
                      if (oValue && ! jQuery.isNumeric(oValue)) {
                    	  // 100.simple=Invalid number "%NUMBER%"
                    	  var oProperties = jQuery.sap.properties();
                          oProperties.setProperty("%NUMBER%", oValue);
                          var message = util.I18NUtility.getErrorText("100.simple", oProperties);
                          oDataControl.setValueState(sap.ui.core.ValueState.Error);
                          oDataControl.setValueStateText(message);
                          throw new Error(message);
                      }

                  } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT_AREA) {
                      oValue = oDataControl.getValue();
                      if (oValue && oComponentList[i].upperCase) {
                          oValue = oValue.toUpperCase();
                      }

                  } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.DATE) {
                      var oDate = oDataControl.getDateValue();
                      if (oDate) {
                          var nMilliseconds = oDate.getTime();
                          oValue = "Date(" + nMilliseconds + ")";
                      }

                  } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.CHECKBOX) {
                      oValue = oDataControl.getSelected();

                  } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.LIST) {
                      var oItem = oDataControl.getSelectedItem();
                      if (oItem) {
                          var oData = oItem.getCustomData();
                          if (oData && oData.length > 0) {
                              oValue = oData[0].getValue();
                          }
                      }
                  }

                  if ( oComponentList[i].type != com.sap.me.nonconformance.view.DataType.CHECKBOX && oComponentList[i].required) {
                      if (!oValue) {
                          // 10015.simple=Required value "%NAME%" missing; enter a value in the %NAME% field
                          var oProperties = jQuery.sap.properties();
                          oProperties.setProperty("%NAME%", util.I18NUtility.getLocaleSpecificText(oComponentList[i].label));
                          var message = util.I18NUtility.getErrorText("10015.simple", oProperties);

                          if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT ||
                              oComponentList[i].type === com.sap.me.nonconformance.view.DataType.NUMBER ||
                              oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT_AREA) {
                              oDataControl.setValueStateText(message);
                              oDataControl.setValueState(sap.ui.core.ValueState.Error);
                          } else if (oComponentList[i].type !== com.sap.me.nonconformance.view.DataType.DATE) {
                              // oDataControl.setValueStateText(message);
                              oDataControl.setValueState(sap.ui.core.ValueState.Error);
                          }
                          throw new Error(message);
                      }
                  }

                 dataValues[oComponentList[i].name] = oValue;
              }
        }
        return dataValues;
    },

    /**
     * clear the components created from the input component list
     *
     * @param oComponentList [] list of  Objects containing control properties
     */
    clearControls : function(oView, oComponentList) {
        if (!oComponentList || oComponentList.length <= 0) {
            return;
        }

        for (var i = 0; i < oComponentList.length; i++) {

              var oDataControl = oView.byId(oComponentList[i].name);
              if (oDataControl) {

                  if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT ||
                      oComponentList[i].type === com.sap.me.nonconformance.view.DataType.TEXT_AREA) {
                      oDataControl.setValue("");

                  } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.NUMBER) {
                      oDataControl.setValue(null);

                  } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.DATE) {
                      oDataControl.setValue("Now");

                  } else if (oComponentList[i].type === com.sap.me.nonconformance.view.DataType.CHECKBOX) {
                      oValue = oDataControl.setSelected(false);
                  }
              }
        }
    }
};