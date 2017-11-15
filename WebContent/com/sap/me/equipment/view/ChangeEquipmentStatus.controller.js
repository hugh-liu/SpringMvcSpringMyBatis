jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.equipment.view.ChangeEquipmentStatus", {

    loadRules : function() {

        // load rules into global model
        this.bCommentRequired = false;
        this.bReasonCodeRequired = true;
        this.bDisplayResource = true;
        this.bDisplayToolGroup = true;
        this.bDisplayToolNumber = true;
        this.bDisplayWorkCenter = true;

        var oActivityRules = util.Model.getData(util.ModelKey.CurrentApplicationRules);

        // load overrides of activity rules
        if (oActivityRules && oActivityRules.length > 0) {
            for (var i=0; i<oActivityRules.length; i++) {
                var option = oActivityRules[i];
                var bValue = false;
                if (option.value && (option.value === "YES" || option.value === "TRUE") ) {
                    bValue = true;
                }
                if (option.key === "COMMENT_REQUIRED") {
                    this.bCommentRequired = bValue;
                } else if (option.key === "REASON_CODE_REQUIRED") {
                    this.bReasonCodeRequired = bValue;
                } else if (option.key === "DISPLAY_RESOURCE") {
                    this.bDisplayResource = bValue;
                } else if (option.key === "DISPLAY_TOOL_GROUP") {
                    this.bDisplayToolGroup = bValue;
                } else if (option.key === "DISPLAY_TOOL_NUMBER") {
                    this.bDisplayToolNumber = bValue;
                } else if (option.key === "DISPLAY_WORK_CENTER") {
                    this.bDisplayWorkCenter = bValue;
                }
            }
        }
    },

    /*
    * Set the field focus
    */
    setFieldFocus: function (focusField) {
        jQuery.sap.delayedCall(800, this, util.StringUtil.setFocus, [this.getView(), focusField]);
    },

    onBeforeShow : function(evt) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.debug("onBeforeShow: view not found");
            return;
        }

        if (!evt.data) {
            return;
        }

        if (evt.fromId === "Home") {
            if (!util.StringUtil.isBlank(evt.data.appName)) {
                var oView = this.getView();
                if (oView) {
                    oView.page.setTitle(evt.data.appName);
                }
            }
        }

        if (evt.data.context) {
            oView.setBindingContext(evt.data.context);
        }

        // no unsaved data set, initialize default values
        if (!util.Model.isUnsavedDataDefined() && evt.firstTime) {

            var value = util.Model.getData(util.ModelKey.SelectedEquipmentChangeType);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedEquipmentChangeType + "_DEFAULT", value);
            }
            value = util.Model.getData(util.ModelKey.SelectedOperation);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedOperation + "_DEFAULT", value);
            }
            value = util.Model.getData(util.ModelKey.SelectedResource);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedResource + "_DEFAULT", value);
            }
            value = util.Model.getData(util.ModelKey.SelectedToolGroup);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedToolGroup + "_DEFAULT", value);
            }
            value = util.Model.getData(util.ModelKey.SelectedToolNumber);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedToolNumber + "_DEFAULT", value);
            }
            value = util.Model.getData(util.ModelKey.SelectedWorkCenter);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedWorkCenter + "_DEFAULT", value);
            }
            value = util.Model.getData(util.ModelKey.SelectedStatusCode);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedStatusCode + "_DEFAULT", value);
            }
            value = util.Model.getData(util.ModelKey.SelectedStatusCodeDescription);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedStatusCodeDescription + "_DEFAULT", value);
            }
            value = util.Model.getData(util.ModelKey.SelectedReasonCode);
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedReasonCode + "_DEFAULT", value);
            }

             util.Model.setData("CHANGE_EQUIPMENT_COMMENTS_DEFAULT", "");
        }

    },

    onAfterShow : function(evt) {
        this.validateInputFieldChanges(evt.firstTime, evt.fromId);
        this.setFieldFocus("reasonCodeField");
    },

    selectByTypeChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "SelectByTypeChange");
    },

    selectStatusCodeTap : function(evt) {
        this.validateInputFieldChanges(false, "SelectStatusCode");
    },

    operationChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "OperationChange");
    },

    resourceChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ResourceChange");
    },

    toolGroupChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ToolGroupChange");
    },

    toolNumberChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ToolNumberChange");
    },

    workCenterChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "WorkCenterChange");
    },

    reasonCodeChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ReasonCodeChange");
    },

    commentsChange : function(oControlEvent) {
        this.validateInputFieldChanges(false, "CommentsChange");
    },

    clearOperationTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "OperationChange");
    },

    clearResourceTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ResourceChange");
    },

    clearToolGroupTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ToolGroupChange");
    },

    clearToolNumberTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ToolNumberChange");
    },

    clearWorkCenterTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "WorkCenterChange");
    },

    clearReasonCodeTap : function(oControlEvent) {
        this.validateInputFieldChanges(false, "ReasonCodeChange");
    },

    validateInputFieldChanges : function(bFirstTime, sFromId) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.debug("ChangeEquipmentStatus.validateInputFieldChanges: view not found");
            return;
        }

        var sSelectByType = util.Model.getData(util.ModelKey.SelectedEquipmentChangeType);
        var selectedResource = util.Model.getData(util.ModelKey.SelectedResource);
        var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
        var selectedToolGroup = util.Model.getData(util.ModelKey.SelectedToolGroup);
        var selectedToolNumber = util.Model.getData(util.ModelKey.SelectedToolNumber);
        var selectedWorkCenter = util.Model.getData(util.ModelKey.SelectedWorkCenter);
        var selectedStatusCode = util.Model.getData(util.ModelKey.SelectedStatusCode);
        var selectedStatusCodeDescription = util.Model.getData(util.ModelKey.SelectedStatusCodeDescription);
        var selectedReasonCode = util.Model.getData(util.ModelKey.SelectedReasonCode);
        var selectedComments = util.Model.getData("CHANGE_EQUIPMENT_COMMENTS_DEFAULT");

        // first time in page - set initial values
        if (bFirstTime) {

            if (sSelectByType === "RESOURCE") {
                // Apply Common Settings
                util.Common.applyCommonSettings(null, null, oView.byId("selectByTypeInput1"), oView.byId("selectByTypeInput2"));

            } else if (sSelectByType === "TOOL_GROUP") {
                if (!util.StringUtil.isBlank(selectedToolGroup)) {
                    var oInputControl = oView.byId("selectByTypeInput1");
                    if (oInputControl && oInputControl.getVisible() ) {
                        oInputControl.setValue(selectedToolGroup.toUpperCase());
                    }
                }
            } else if (sSelectByType === "TOOL_NUMBER") {
                if (!util.StringUtil.isBlank(selectedToolNumber)) {
                    var oInputControl = oView.byId("selectByTypeInput1");
                    if (oInputControl && oInputControl.getVisible() ) {
                        oInputControl.setValue(selectedToolNumber.toUpperCase());
                    }
                }
            } else if (sSelectByType === "WORK_CENTER") {
                if (!util.StringUtil.isBlank(selectedWorkCenter)) {
                    var oInputControl = oView.byId("selectByTypeInput1");
                    if (oInputControl && oInputControl.getVisible() ) {
                        oInputControl.setValue(selectedWorkCenter.toUpperCase());
                    }
                }
            }

        // else a change has occured
        } else {

            if (sFromId == "Home")
            {
                var selectedType = util.Model.getData(util.ModelKey.SelectedEquipmentChangeType);
                if (!util.StringUtil.isBlank(selectedType)) {
                    if (selectedType === "RESOURCE") {
                        // Apply Common Settings
                        util.Common.applyCommonSettings(null, null, oView.byId("selectByTypeInput1"), oView.byId("selectByTypeInput2"));
                    }
                }
            }
            else if (sFromId == "SelectByTypeChange") {
                var oInputControl = oView.byId("selectByType");
                if (oInputControl) {
                    var oItem = oInputControl.getSelectedItem();
                    if (oItem) {
                        var sValue = oItem.getKey();
                        if (!util.StringUtil.isBlank(sValue)) {
                            var newSelectedType = sValue.toUpperCase();

                            var selectedType = util.Model.getData(util.ModelKey.SelectedEquipmentChangeType);
                            if (util.StringUtil.isBlank(selectedType)) {
                                selectedType = util.Model.getData(util.ModelKey.SelectedEquipmentChangeType + "_DEFAULT");
                            }


                            // type is changing, update page with new controls
                            if (!util.StringUtil.isBlank(selectedType) && selectedType != newSelectedType) {
                                util.Model.setData(util.ModelKey.SelectedEquipmentChangeType, newSelectedType);

                                // clear previously saved data from model
                                if (selectedType === "RESOURCE") {
                                    // Apply Common Settings
                                    util.Common.applyCommonSettings(null, null, oView.byId("selectByTypeInput1"), oView.byId("selectByTypeInput2"));
                                } else if (selectedType === "TOOL_GROUP") {
                                    util.Model.removeData(util.ModelKey.SelectedToolGroup);
                                } else if (selectedType === "TOOL_NUMBER") {
                                    util.Model.removeData(util.ModelKey.SelectedToolNumber);
                                } else if (selectedType === "WORK_CENTER") {
                                    util.Model.removeData(util.ModelKey.SelectedWorkCenter);
                                }

                                // load new control(s)
                                oView.updateListDisplay(this, oInputControl, newSelectedType);
                                return;
                            }
                        }
                    }
                }

            } else if (sFromId == "OperationBrowse") {
                if (!util.StringUtil.isBlank(selectedOperation)) {
                    var oInputControl = oView.byId("selectByTypeInput1");
                    if (oInputControl) {
                        oInputControl.setValue(selectedOperation.toUpperCase());
                    }
                }
            } else if (sFromId == "OperationChange") {
                var oInputControl = oView.byId("selectByTypeInput1");
                if (oInputControl) {
                    var sValue = oInputControl.getValue();
                    if (!util.StringUtil.isBlank(sValue)) {
                        selectedOperation = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedOperation, selectedOperation);
                    } else {
                        util.Model.removeData(util.ModelKey.SelectedOperation);
                    }
                }
            } else if (sFromId == "OperationResourceBrowse") {
                if (!util.StringUtil.isBlank(selectedResource)) {
                    var oInputControl = oView.byId("selectByTypeInput2");
                    if (oInputControl) {
                        if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                            oInputControl.setValueState(sap.ui.core.ValueState.None);
                            oInputControl.setValueStateText("");
                        }
                        oInputControl.setValue(selectedResource.toUpperCase());
                    }
                }
            } else if (sFromId == "ResourceChange") {
                var oInputControl = oView.byId("selectByTypeInput2");
                if (oInputControl) {
                    if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                        oInputControl.setValueState(sap.ui.core.ValueState.None);
                        oInputControl.setValueStateText("");
                    }
                    var sValue = oInputControl.getValue();
                    if (!util.StringUtil.isBlank(sValue)) {
                        selectedResource = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedResource, selectedResource);
                    } else {
                        util.Model.removeData(util.ModelKey.SelectedResource);
                    }
                }
            } else if (sFromId == "ToolGroupBrowse") {
                if (!util.StringUtil.isBlank(selectedToolGroup)) {
                    var oInputControl = oView.byId("selectByTypeInput1");
                    if (oInputControl) {
                        if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                            oInputControl.setValueState(sap.ui.core.ValueState.None);
                            oInputControl.setValueStateText("");
                        }
                        oInputControl.setValue(selectedToolGroup.toUpperCase());
                    }
                }
            } else if (sFromId == "ToolGroupChange") {
                var oInputControl = oView.byId("selectByTypeInput1");
                if (oInputControl) {
                    if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                        oInputControl.setValueState(sap.ui.core.ValueState.None);
                        oInputControl.setValueStateText("");
                    }
                    var sValue = oInputControl.getValue();
                    if (!util.StringUtil.isBlank(sValue)) {
                        selectedToolGroup = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedToolGroup, selectedToolGroup);
                    } else {
                        util.Model.removeData(util.ModelKey.SelectedToolGroup);
                    }
                }
            } else if (sFromId == "ToolNumberBrowse") {
                if (!util.StringUtil.isBlank(selectedToolNumber)) {
                    var oInputControl = oView.byId("selectByTypeInput1");
                    if (oInputControl) {
                        if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                            oInputControl.setValueState(sap.ui.core.ValueState.None);
                            oInputControl.setValueStateText("");
                        }
                        oInputControl.setValue(selectedToolNumber.toUpperCase());
                    }
                }
            } else if (sFromId == "ToolNumberChange") {
                var oInputControl = oView.byId("selectByTypeInput1");
                if (oInputControl) {
                    if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                        oInputControl.setValueState(sap.ui.core.ValueState.None);
                        oInputControl.setValueStateText("");
                    }
                    var sValue = oInputControl.getValue();
                    if (!util.StringUtil.isBlank(sValue)) {
                        selectedToolNumber = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedToolNumber, selectedToolNumber);
                    } else {
                        util.Model.removeData(util.ModelKey.SelectedToolNumber);
                    }
                }
            } else if (sFromId == "WorkCenterBrowse") {
                if (!util.StringUtil.isBlank(selectedWorkCenter)) {
                    var oInputControl = oView.byId("selectByTypeInput1");
                    if (oInputControl) {
                        if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                            oInputControl.setValueState(sap.ui.core.ValueState.None);
                            oInputControl.setValueStateText("");
                        }
                        oInputControl.setValue(selectedWorkCenter.toUpperCase());
                    }
                }
            } else if (sFromId == "WorkCenterChange") {
                var oInputControl = oView.byId("selectByTypeInput1");
                if (oInputControl) {
                    if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                        oInputControl.setValueState(sap.ui.core.ValueState.None);
                        oInputControl.setValueStateText("");
                    }
                    var sValue = oInputControl.getValue();
                    if (!util.StringUtil.isBlank(sValue)) {
                        selectedWorkCenter = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedWorkCenter, selectedWorkCenter);
                    } else {
                        util.Model.removeData(util.ModelKey.SelectedWorkCenter);
                    }
                }
            } else if (sFromId == "SelectStatusCode") {

                var oInputControl = oView.byId("selectStatusCode");
                if (oInputControl) {
                    var oItem = oInputControl.getSelectedItem();
                    if (oItem) {
                        var sValue = oItem.getKey();
                        if (!util.StringUtil.isBlank(sValue)) {
                            var newSelectedCode = sValue.toUpperCase();
                            if (!util.StringUtil.isBlank(newSelectedCode)) {
                                util.Model.setData(util.ModelKey.SelectedStatusCode, newSelectedCode);
                                util.Model.setData(util.ModelKey.SelectedStatusCodeDescription, oItem.getText());
                            } else {
                                util.Model.removeData(util.ModelKey.SelectedStatusCode);
                                util.Model.removeData(util.ModelKey.SelectedStatusCodeDescription);
                            }
                                return;
                        }
                    }
                }

            } else if (sFromId == "ReasonCodeBrowse") {
                if (!util.StringUtil.isBlank(selectedReasonCode)) {
                    var oInputControl = oView.byId("reasonCodeField");
                    if (oInputControl) {
                        if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                            oInputControl.setValueState(sap.ui.core.ValueState.None);
                            oInputControl.setValueStateText("");
                        }
                        oInputControl.setValue(selectedReasonCode.toUpperCase());
                    }
                }
            } else if (sFromId == "ReasonCodeChange") {
                var oInputControl = oView.byId("reasonCodeField");
                if (oInputControl) {
                    if (oInputControl.getValueState() === sap.ui.core.ValueState.Error) {
                        oInputControl.setValueState(sap.ui.core.ValueState.None);
                        oInputControl.setValueStateText("");
                    }
                    var sValue = oInputControl.getValue();
                    if (!util.StringUtil.isBlank(sValue)) {
                        selectedReasonCode = sValue.toUpperCase();
                        util.Model.setData(util.ModelKey.SelectedReasonCode, selectedReasonCode);
                    } else {
                        util.Model.removeData(util.ModelKey.SelectedReasonCode);
                    }
                }
            } else if (sFromId == "CommentsChange") {
                var oTextControl = oView.byId("commentsField");
                if (oTextControl) {
                    if (oTextControl.getValueState() === sap.ui.core.ValueState.Error) {
                        oTextControl.setValueState(sap.ui.core.ValueState.None);
                        oTextControl.setValueStateText("");
                    }
                    var sValue = oTextControl.getValue();
                    if (!util.StringUtil.isBlank(sValue)) {
                        selectedComments = sValue.toUpperCase();
                        util.Model.setData("CHANGE_EQUIPMENT_COMMENTS", selectedComments);
                    } else {
                        util.Model.removeData("CHANGE_EQUIPMENT_COMMENTS");
                    }
                }
            }
        }

        // set unsaved data flag
        this.checkUnsavedData();
    },

    checkUnsavedData : function() {

        // if already set just return
        if (util.Model.isUnsavedDataDefined()) {
            return;
        }

        var newValue = util.Model.getData(util.ModelKey.SelectedOperation);
        var defaultValue = util.Model.getData(util.ModelKey.SelectedOperation + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData(util.ModelKey.SelectedResource);
        defaultValue = util.Model.getData(util.ModelKey.SelectedResource + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData(util.ModelKey.SelectedToolGroup);
        defaultValue = util.Model.getData(util.ModelKey.SelectedToolGroup + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData(util.ModelKey.SelectedToolNumber);
        defaultValue = util.Model.getData(util.ModelKey.SelectedToolNumber + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData(util.ModelKey.SelectedWorkCenter);
        defaultValue = util.Model.getData(util.ModelKey.SelectedWorkCenter + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData(util.ModelKey.SelectedStatusCode);
        defaultValue = util.Model.getData(util.ModelKey.SelectedStatusCode + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData(util.ModelKey.SelectedReasonCode);
        defaultValue = util.Model.getData(util.ModelKey.SelectedReasonCode + "_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

        newValue = util.Model.getData("CHANGE_EQUIPMENT_COMMENTS");
        defaultValue = util.Model.getData("CHANGE_EQUIPMENT_COMMENTS_DEFAULT");
        if (defaultValue && newValue) {
            if (defaultValue != newValue) {
                util.Model.setUnsavedDataDefined(true);
            }
        } else if ((newValue && !defaultValue) ||  (!newValue && defaultValue)) {
            util.Model.setUnsavedDataDefined(true);
        }

    },

    browseOperationTap : function(evt) {

        util.Model.removeData("TEMP_OperationFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("selectByTypeInput1");
                if (oInputControl) {
                    util.Model.setData("TEMP_OperationFilterValue", oInputControl.getValue().toUpperCase());
                }
        }
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "OperationBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "ChangeEquipmentStatus",
                fromNamespace : "com.sap.me.equipment.view"
            }
        });
        this.setFieldFocus("reasonCodeField");
    },

    browseResourceTap : function(evt) {

        util.Model.removeData("TEMP_OperationResourceFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("selectByTypeInput2");
                if (oInputControl) {
                    util.Model.setData("TEMP_OperationResourceFilterValue", oInputControl.getValue().toUpperCase());
                }
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "OperationResourceBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "ChangeEquipmentStatus",
                fromNamespace : "com.sap.me.equipment.view"
            }
        });
        this.setFieldFocus("reasonCodeField");
    },

    browseToolGroupTap : function(evt) {
        util.Model.removeData("TEMP_ToolGroupFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("selectByTypeInput1");
                if (oInputControl) {
                    util.Model.setData("TEMP_ToolGroupFilterValue", oInputControl.getValue().toUpperCase());
                }
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "ToolGroupBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "ChangeEquipmentStatus",
                fromNamespace : "com.sap.me.equipment.view"
            }
        });
    },

    browseToolNumberTap : function(evt) {
        util.Model.removeData("TEMP_ToolNumberFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("selectByTypeInput1");
                if (oInputControl) {
                    util.Model.setData("TEMP_ToolNumberFilterValue", oInputControl.getValue().toUpperCase());
                }
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "ToolNumberBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "ChangeEquipmentStatus",
                fromNamespace : "com.sap.me.equipment.view"
            }
        });
    },

    browseWorkCenterTap : function(evt) {
        util.Model.removeData("TEMP_WorkCenterFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("selectByTypeInput1");
                if (oInputControl) {
                    util.Model.setData("TEMP_ToolNumberFilterValue", oInputControl.getValue().toUpperCase());
                }
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "WorkCenterBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "ChangeEquipmentStatus",
                fromNamespace : "com.sap.me.equipment.view"
            }
        });
    },

    browseReasonCodeTap : function(evt) {
        util.Model.removeData("TEMP_ReasonCodeFilterValue");
        var oView = this.getView();
        if (oView) {
                var oInputControl = oView.byId("reasonCodeField");
                if (oInputControl) {
                    util.Model.setData("TEMP_ReasonCodeFilterValue", oInputControl.getValue().toUpperCase());
                }
        }
        util.Model.setData(util.ModelKey.SelectedReasonCodeCategory, "EQUIPMENTSTATUS");

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "ReasonCodeBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "ChangeEquipmentStatus",
                fromNamespace : "com.sap.me.equipment.view"
            }
        });
    },

    clearButtonTap : function() {

        var oView = this.getView();
        if (!oView) {
            return;
        }
        var oInputControl = oView.byId("selectByTypeInput1");
        if (oInputControl) {
            oInputControl.setValue("");
        }

        oInputControl = oView.byId("selectByTypeInput2");
        if (oInputControl) {
            oInputControl.setValue("");
        }

        oInputControl = oView.byId("reasonCodeField");
        if (oInputControl) {
            oInputControl.setValue("");
        }

        oInputControl = oView.byId("commentsField");
        if (oInputControl) {
            oInputControl.setValue("");
        }

        util.Model.removeData(util.ModelKey.SelectedOperation);
        util.Model.removeData(util.ModelKey.SelectedResource);
        util.Model.removeData(util.ModelKey.SelectedToolGroup);
        util.Model.removeData(util.ModelKey.SelectedToolNumber);
        util.Model.removeData(util.ModelKey.SelectedWorkCenter);
        util.Model.removeData("CHANGE_EQUIPMENT_COMMENTS");

        var oSelectControl = oView.byId("selectByType");
        if (oSelectControl) {
            var oItems = oSelectControl.getItems();
            if (oItems && oItems.length > 0) {
                oSelectControl.setSelectedItem(oItems[0]);
                var sDefaultValue = util.Model.getData(util.ModelKey.SelectedEquipmentChangeType + "_DEFAULT");
                util.Model.setData(util.ModelKey.SelectedEquipmentChangeType, sDefaultValue);
                oView.updateListDisplay(this, oSelectControl, sDefaultValue);
            }
        }

        oSelectControl = oView.byId("selectStatusCode");
        if (oSelectControl) {
            var oItem = oSelectControl.getSelectedItem();
            var oItems = oSelectControl.getItems();
            if (oItems && oItems.length > 0) {
                oSelectControl.setSelectedItem(oItems[0]);
                util.Model.setData(util.ModelKey.SelectedStatusCode, oItems[0].getKey());
                util.Model.setData(util.ModelKey.SelectedStatusCodeDescription, oItems[0].getText());
            }
        }

    },

    changeButtonTap : function() {

        var oView = this.getView();
        if (!oView) {
            return;
        }
        var sChangeType = util.Model.getData(util.ModelKey.SelectedEquipmentChangeType);
        var sSubjectValue = undefined;
        var sStatusCode = undefined;
        var sReasonCode = undefined;
        var sComments = undefined;

        var oSubjectControl = undefined;
        var oInputControl = oView.byId("selectByTypeInput1");
        if (oInputControl) {
            sSubjectValue = oInputControl.getValue();
            oSubjectControl = oInputControl;
        }
        oInputControl = oView.byId("selectByTypeInput2");
        if (oInputControl) {
            sSubjectValue = oInputControl.getValue();
            oSubjectControl = oInputControl;
        }

        if (util.StringUtil.isBlank(sSubjectValue)) {
            var sTextKey = "";
            if (sChangeType === "RESOURCE") {
                sTextKey = util.I18NUtility.getLocaleSpecificText("RESOURCE_BROWSE.default.LABEL");
            } else if (sChangeType === "TOOL_GROUP") {
                sTextKey = util.I18NUtility.getLocaleSpecificText("TOOL_GROUP_BROWSE.default.LABEL");
            } else if (sChangeType === "TOOL_NUMBER") {
                sTextKey = util.I18NUtility.getLocaleSpecificText("TOOL_NUMBER_BROWSE.default.LABEL");
            } else if (sChangeType === "WORK_CENTER") {
                sTextKey = util.I18NUtility.getLocaleSpecificText("WORK_CENTER_BROWSE.default.LABEL");
            }
            // 10015.simple=Required value "%NAME%" missing; enter a value in the %NAME% field
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%NAME%", sTextKey);
            var message = util.I18NUtility.getErrorText("10015.simple", oProperties);
            oSubjectControl.setValueState(sap.ui.core.ValueState.Error);
            oSubjectControl.setValueStateText(message);
            sap.m.MessageToast.show(message, {
                duration: 5000,
                animationDuration: 500
            });
            return;
        }

        sStatusCode = util.Model.getData(util.ModelKey.SelectedStatusCode);
        if (util.StringUtil.isBlank(sStatusCode)) {
            // 10015.simple=Required value "%NAME%" missing; enter a value in the %NAME% field
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%NAME%", util.I18NUtility.getLocaleSpecificText("STATUS_BROWSE.default.LABEL"));
            var message = util.I18NUtility.getErrorText("10015.simple", oProperties);
            oInputControl.setValueState(sap.ui.core.ValueState.Error);
            oInputControl.setValueStateText(message);
            sap.m.MessageToast.show(message, {
                duration: 5000,
                animationDuration: 500
            });
            return;
        }

        oInputControl = oView.byId("reasonCodeField");
        if (oInputControl) {
            sReasonCode = oInputControl.getValue();

            if (this.bReasonCodeRequired && util.StringUtil.isBlank(sReasonCode)) {
                // 10015.simple=Required value "%NAME%" missing; enter a value in the %NAME% field
                var oProperties = jQuery.sap.properties();
                oProperties.setProperty("%NAME%", util.I18NUtility.getLocaleSpecificText("REASON_BROWSE.default.LABEL"));
                var message = util.I18NUtility.getErrorText("10015.simple", oProperties);
                oInputControl.setValueState(sap.ui.core.ValueState.Error);
                oInputControl.setValueStateText(message);
                sap.m.MessageToast.show(message, {
                    duration: 5000,
                    animationDuration: 500
                });
                return;
            }
        }
        oInputControl = oView.byId("commentsField");
        if (oInputControl) {
            sComments = oInputControl.getValue();
            if (this.bCommentRequired && util.StringUtil.isBlank(sComments)) {
                // 10015.simple=Required value "%NAME%" missing; enter a value in the %NAME% field
                var oProperties = jQuery.sap.properties();
                oProperties.setProperty("%NAME%", util.I18NUtility.getLocaleSpecificText("COMMENTS.default.LABEL"));
                var message = util.I18NUtility.getErrorText("10015.simple", oProperties);
                oInputControl.setValueState(sap.ui.core.ValueState.Error);
                oInputControl.setValueStateText(message);
                sap.m.MessageToast.show(message, {
                    duration: 5000,
                    animationDuration: 500
                });
                return;
            }
        }

        var oParameters = {
                EquipmentType : sChangeType,
                NewStatus : sStatusCode,
                SubjectVal : sSubjectValue,
                ReasonCode : sReasonCode,
                Comments : sComments
        };

        var sParameters = JSON.stringify(oParameters);

        var url = "/manufacturing-odata/Production.svc/Resources";

        util.IOUtil.remoteRequest(url, "POST", sParameters, this.successCallback, this.errorCallback, this);
    },

    successCallback : function(oData) {
        var sCount = "" + oData;
        var sChangeType = util.Model.getData(util.ModelKey.SelectedEquipmentChangeType);
        var sMessageKey = "CHG_EQUIP_STATUS.successfulComplete.resource.MESSAGE";
        if (sChangeType === "RESOURCE" || sChangeType === "WORK_CENTER") {
            sMessageKey = "CHG_EQUIP_STATUS.successfulComplete.resource.MESSAGE";
        } else if (sChangeType === "TOOL_GROUP" || sChangeType === "TOOL_NUMBER") {
            sMessageKey = "CHG_EQUIP_STATUS.successfulComplete.tool.MESSAGE";
        }

        var oProperties = jQuery.sap.properties();
        oProperties.setProperty("%COUNT%",sCount);
        var sMessage = util.I18NUtility.getLocaleSpecificText(sMessageKey, oProperties);

        sap.m.MessageToast.show(sMessage, {
            duration: 5000,
            animationDuration: 500
        });
    },

    errorCallback : function(errorCode, errorMessage) {
         if (errorMessage) {
             jQuery.sap.log.error("Change Equipment Status Error: " + errorMessage);
             sap.m.MessageBox.alert(errorMessage);
         }
    },

    closeTap : function() {

        // unsaved data? then prompt
        if (util.Model.isUnsavedDataDefined()) {

            var thisController = this;
            sap.m.MessageBox.show (
               util.I18NUtility.getLocaleSpecificText("ME_MOBILE.unsavedData.message.TEXT"),
               sap.m.MessageBox.Icon.QUESTION,
               util.I18NUtility.getLocaleSpecificText("ME_MOBILE.unsavedData.title.TEXT"),
               [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
               function(oAction) {
                  if (oAction) {
                      if (oAction === sap.m.MessageBox.Action.YES) {
                          thisController.navButtonTap();
                      }
                  }
               }
            );

        // no unsaved data - just return
        } else {
            this.navButtonTap();
        }
    },

    navButtonTap : function(evt) {
        this.saveModel();
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
              id : "Home"
        });
    },

    saveModel : function() {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.debug("saveModel: view not found");
            return;
        }

        util.Model.removeData(util.ModelKey.SelectedToolGroup);
        util.Model.removeData(util.ModelKey.SelectedToolNumber);
        util.Model.removeData(util.ModelKey.SelectedWorkCenter);
        util.Model.removeData(util.ModelKey.SelectedStatusCode);
        util.Model.removeData(util.ModelKey.SelectedStatusCodeDescription);
        util.Model.removeData(util.ModelKey.SelectedReasonCode);
        util.Model.removeData("CHANGE_EQUIPMENT_COMMENTS");

        var sSelectByType = "";
        var oInputControl = oView.byId("selectedByType");
        if (oInputControl) {
            sSelectByType = oInputControl.getValue();
        }
        if (util.StringUtil.isBlank(sSelectByType)) {
            sSelectByType = "RESOURCE";
        }

        if (sSelectByType === "RESOURCE") {
            // Save Common Settings
            util.Common.saveCommonSettings(null, null, oView.byId("selectByTypeInput1"), oView.byId("selectByTypeInput2"));
        }

        var oInputControl = oView.byId("selectByTypeInput1");
        if (oInputControl) {
            var value = oInputControl.getValue();
            if (!util.StringUtil.isBlank(value)) {
                if (sSelectByType === "TOOL_GROUP") {
                    util.Model.setData(util.ModelKey.SelectedToolGroup, value.toUpperCase());
                } else if (sSelectByType === "TOOL_NUMBER") {
                    util.Model.setData(util.ModelKey.SelectedToolNumber, value.toUpperCase());
                } else if (sSelectByType === "WORK_CENTER") {
                    util.Model.setData(util.ModelKey.SelectedWorkCenter, value.toUpperCase());
                }
            }
        }

        oInputControl = oView.byId("selectByTypeInput2");
        if (oInputControl) {
            var value = oInputControl.getValue();
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedResource, value.toUpperCase());
            }
        }

        oInputControl = oView.byId("commentsField");
        if (oInputControl) {
            var value = oInputControl.getValue();
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData("CHANGE_EQUIPMENT_COMMENTS", value.toUpperCase());
            }
        }

    }

});