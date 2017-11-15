jQuery.sap.require("com.sap.me.control.Input");
jQuery.sap.require("com.sap.me.control.TextArea");
jQuery.sap.require("com.sap.me.equipment.view.SelectByTypes");
jQuery.sap.require("com.sap.me.equipment.view.StatusCodes");

sap.ui.jsview("com.sap.me.equipment.view.ChangeEquipmentStatus", {

    getControllerName: function() {
        return "com.sap.me.equipment.view.ChangeEquipmentStatus";
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        // load activity rules
        oCon.loadRules();

        var clearButton = new sap.m.Button({
            id: this.createId("clearButton"),
            type: sap.m.ButtonType.Default,
            icon: "sap-icon://eraser",
            enabled: true,
            visible: true,
            tap : [ oCon.clearButtonTap, oCon ]
        });

        var changeButton = new sap.m.Button({
            id: this.createId("changeButton"),
            type: sap.m.ButtonType.Default,
            icon: util.I18NUtility.getLocaleSpecificText("chgEquipStatus.button.ICON"),
            text: util.I18NUtility.getLocaleSpecificText("chgEquipStatus.button.LABEL"),
            enabled: true,
            visible: true,
            tap : [ oCon.changeButtonTap, oCon ]
        });


        var footerBar = new sap.m.Bar({
            contentLeft: [],
            contentMiddle: [changeButton],
            contentRight: []
        });

        // create page
        this.page = new sap.m.Page({
            id: this.createId("changeEquipmentPage"),
            title : "",
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            showNavButton : true,
            navButtonTap : [ oCon.navButtonTap, oCon ],
            headerContent : [
                clearButton
            ],
            footer: footerBar
        });

        var changeEquipmentList = new sap.m.List({
            id: this.createId("changeEquipmentList"),
            inset : true
        });

        // add the combobox for selecting by the Resource, Tool Group, Tool Number or Work Center
        var oItem = new sap.m.CustomListItem();
        var oHbox = new sap.m.HBox();
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        var selectField = new sap.m.Select({
            id: this.createId("selectByType"),
            width: "256px",
            enabled: true,
            change: [oCon.selectByTypeChange, oCon]
        });

        var sbtypes = com.sap.me.equipment.view.SelectByTypes;
        var count = 0;
        var sSelectedByType = undefined;
        for (var i = 0; i < sbtypes.length; i++) {

            var sSelectByTypeName = sbtypes[i].name;
            var sSelectByTypeValue = sbtypes[i].value;

            // here we will filter out ones not to display..
            if ((sSelectByTypeValue === "RESOURCE" && !oCon.bDisplayResource) ||
                (sSelectByTypeValue === "TOOL_GROUP" && !oCon.bDisplayToolGroup) ||
                (sSelectByTypeValue === "TOOL_NUMBER" && !oCon.bDisplayToolNumber) ||
                (sSelectByTypeValue === "WORK_CENTER" && !oCon.bDisplayWorkCenter)) {
                continue;
            }

            // here we add the ones to display
            var oListItem = new sap.ui.core.Item({
                id: this.createId(sSelectByTypeValue),
                text: util.I18NUtility.getLocaleSpecificText(sSelectByTypeName),
                key : sSelectByTypeValue
            });

            selectField.addItem(oListItem);
            if (count == 0) {
                sSelectedByType = sSelectByTypeValue;
                util.Model.setData(util.ModelKey.SelectedEquipmentChangeType, sSelectByTypeValue);
                selectField.setSelectedItem(oListItem);
                count++;
            }
        }
        oHbox.addItem(selectField);
        oItem.addContent(oHbox);
        changeEquipmentList.addItem(oItem);  // index 0

        // add Status Code Browse
        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setWidth("270px");
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        oHbox.addStyleClass("requiredItem");
        var requiredLabelField = new sap.m.Label({
            text: "",
            design: sap.m.LabelDesign.Bold,
            required: oCon.bReasonCodeRequired
        });
        requiredLabelField.addStyleClass("requiredLabel");

        var selectStatusField = new sap.m.Select({
            id: this.createId("selectStatusCode"),
            width: "256px",
            enabled: true,
            change: [oCon.selectStatusCodeTap, oCon]
        });

        var scodes = com.sap.me.equipment.view.StatusCodes;
        var count = 0;
        var sStatusCodeDescription = undefined;
        for (var i = 0; i < scodes.length; i++) {

            var sStatusCodeName = util.I18NUtility.getLocaleSpecificText(scodes[i].name);
            var sStatusCodeValue = scodes[i].value;

            var oListItem = new sap.ui.core.Item({
                id: this.createId(sStatusCodeValue),
                text: sStatusCodeName,
                key : sStatusCodeValue
            });

            selectStatusField.addItem(oListItem);
            if (count == 0) {
                util.Model.removeData(util.ModelKey.SelectedStatusCode);
                util.Model.setData(util.ModelKey.SelectedStatusCodeDescription, sStatusCodeName);
                selectStatusField.setSelectedItem(oListItem);
                count++;
            }
        }
        oHbox.addItem(selectStatusField);
        oHbox.addItem(requiredLabelField);
        oItem.addContent(oHbox);
        changeEquipmentList.addItem(oItem);

        // add Reason Code Browse
        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.setWidth("270px");
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        oHbox.addStyleClass("requiredItem");

        requiredLabelField = new sap.m.Label({
            text: "",
            design: sap.m.LabelDesign.Bold,
            required: oCon.bReasonCodeRequired
        });

        if (oCon.bReasonCodeRequired) {
            requiredLabelField.addStyleClass("requiredLabel");
        } else {
            requiredLabelField.addStyleClass("notRequiredLabel");
        }

        var reasonCodeField = new com.sap.me.control.Input({
            id: this.createId("reasonCodeField"),
            maxLength: 40,
            width: "256px",
            placeholder: util.I18NUtility.getLocaleSpecificText("REASON_BROWSE.default.LABEL"),
            liveChange: [oCon.reasonCodeChange, oCon],
            showClear: true,
            showBrowse: true,
            upperCase: true,
            browseTap: [ oCon.browseReasonCodeTap, oCon ],
            clearTap: [ oCon.clearReasonCodeTap, oCon ]
        });
        oHbox.addItem(reasonCodeField);
        oHbox.addItem(requiredLabelField);
        oItem.addContent(oHbox);
        changeEquipmentList.addItem(oItem);

        // add comments text area
        oItem = new sap.m.CustomListItem();
        var oHbox = new sap.m.HBox();
        oHbox.setWidth("270px");
        oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
        oHbox.addStyleClass("requiredItem");

        requiredLabelField = new sap.m.Label({
            text: "",
            design: sap.m.LabelDesign.Bold,
            required: oCon.bCommentRequired
        });

        if (oCon.bCommentRequired) {
            requiredLabelField.addStyleClass("requiredLabel");
        } else {
            requiredLabelField.addStyleClass("notRequiredLabel");
        }

        var commentsField = new com.sap.me.control.TextArea({
            id: this.createId("commentsField"),
            liveChange: [oCon.commentsChange, oCon],
            width: "256px",
            rows: 3,
            showClear: true
        });
        oHbox.addItem(commentsField);
        oHbox.addItem(requiredLabelField);
        oItem.addContent(oHbox);
        changeEquipmentList.addItem(oItem);

        // initialize selectByType controls
        this.updateListDisplay(oCon, selectField, sSelectedByType);


        this.page.addContent(changeEquipmentList);

        return this.page;
    },

    updateListDisplay : function(oCon, oSelectControl, sSelectByType) {

        if (util.StringUtil.isBlank(sSelectByType)) {
            return;
        }

        var oChangeEquipmentStatusList = this.byId("changeEquipmentList");
        if (!oChangeEquipmentStatusList) {
            return;
        }

        // find and destroy current input controls (if any)
        var oTypeControls = [];
        oTypeControls[0] = this.byId("selectByTypeInput1");
        oTypeControls[1] = this.byId("selectByTypeInput2");
        if (oTypeControls && oTypeControls.length > 0 && jQuery.type(oTypeControls) === "array") {
            if (oTypeControls[1]) {
                oChangeEquipmentStatusList.removeItem(1);
                oTypeControls[1].destroy();
            }
            if (oTypeControls[0]) {
                oChangeEquipmentStatusList.removeItem(1);
                oTypeControls[0].destroy();
            }
        }
        oTypeControls[0] = undefined;
        oTypeControls[1] = undefined;

        // following fields are added to list based on "Select By" selection.
        if (sSelectByType === "RESOURCE") {
            var oItem = new sap.m.CustomListItem();
            var oHbox = new sap.m.HBox();
            oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
            oTypeControls[0] = new com.sap.me.control.Input({
                id: this.createId("selectByTypeInput1"),
                maxLength: 40,
                width: "256px",
                placeholder: util.I18NUtility.getLocaleSpecificText("OPERATION_BROWSE.default.LABEL"),
                liveChange: [oCon.operationChange, oCon],
                showClear: true,
                showBrowse: true,
                upperCase: true,
                browseTap: [ oCon.browseOperationTap, oCon ],
                clearTap: [ oCon.clearOperationTap, oCon ]
            });
            oHbox.addItem(oTypeControls[0]);
            oItem.addContent(oHbox);
            oChangeEquipmentStatusList.insertItem(oItem, 1);

            oItem = new sap.m.CustomListItem();
            oHbox = new sap.m.HBox();
            oHbox.setWidth("270px");
            oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
            oHbox.addStyleClass("requiredItem");
            var requiredLabelField = new sap.m.Label({
                text: "",
                design: sap.m.LabelDesign.Bold,
                required: oCon.bReasonCodeRequired
            });
            requiredLabelField.addStyleClass("requiredLabel");

            oTypeControls[1] = new com.sap.me.control.Input({
                id: this.createId("selectByTypeInput2"),
                maxLength: 40,
                width: "256px",
                placeholder: util.I18NUtility.getLocaleSpecificText("RESOURCE_BROWSE.default.LABEL"),
                liveChange: [oCon.resourceChange, oCon],
                showClear: true,
                showBrowse: true,
                upperCase: true,
                browseTap: [ oCon.browseResourceTap, oCon ],
                clearTap: [ oCon.clearResourceTap, oCon ]
            });
            oHbox.addItem(oTypeControls[1]);
            oHbox.addItem(requiredLabelField);
            oItem.addContent(oHbox);
            oChangeEquipmentStatusList.insertItem(oItem, 2);

        } else if (sSelectByType === "TOOL_GROUP") {
            var oItem = new sap.m.CustomListItem();
            var oHbox = new sap.m.HBox();
            oHbox.setWidth("270px");
            oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
            oHbox.addStyleClass("requiredItem");
            var requiredLabelField = new sap.m.Label({
                text: "",
                design: sap.m.LabelDesign.Bold,
                required: oCon.bReasonCodeRequired
            });
            requiredLabelField.addStyleClass("requiredLabel");
            oTypeControls[0] = new com.sap.me.control.Input({
                id: this.createId("selectByTypeInput1"),
                maxLength: 40,
                width: "256px",
                placeholder: util.I18NUtility.getLocaleSpecificText("TOOL_GROUP_BROWSE.default.LABEL"),
                liveChange: [oCon.toolGroupChange, oCon],
                showClear: true,
                showBrowse: true,
                upperCase: true,
                browseTap: [ oCon.browseToolGroupTap, oCon ],
                clearTap: [ oCon.clearToolGroupTap, oCon ]
            });
            oHbox.addItem(oTypeControls[0]);
            oHbox.addItem(requiredLabelField);
            oItem.addContent(oHbox);
            oChangeEquipmentStatusList.insertItem(oItem, 1);

        } else if (sSelectByType === "TOOL_NUMBER") {
            var oItem = new sap.m.CustomListItem();
            var oHbox = new sap.m.HBox();
            oHbox.setWidth("270px");
            oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
            oHbox.addStyleClass("requiredItem");
            var requiredLabelField = new sap.m.Label({
                text: "",
                design: sap.m.LabelDesign.Bold,
                required: oCon.bReasonCodeRequired
            });
            requiredLabelField.addStyleClass("requiredLabel");
            oTypeControls[0] = new com.sap.me.control.Input({
                id: this.createId("selectByTypeInput1"),
                maxLength: 40,
                width: "256px",
                placeholder: util.I18NUtility.getLocaleSpecificText("TOOL_NUMBER_BROWSE.default.LABEL"),
                liveChange: [oCon.toolNumberChange, oCon],
                showClear: true,
                showBrowse: true,
                upperCase: true,
                browseTap: [ oCon.browseToolNumberTap, oCon ],
                clearTap: [ oCon.clearToolNumberTap, oCon ]
            });
            oHbox.addItem(oTypeControls[0]);
            oHbox.addItem(requiredLabelField);
            oItem.addContent(oHbox);
            oChangeEquipmentStatusList.insertItem(oItem, 1);

        } else if (sSelectByType === "WORK_CENTER") {
            var oItem = new sap.m.CustomListItem();
            var oHbox = new sap.m.HBox();
            oHbox.setWidth("270px");
            oHbox.setAlignItems(sap.m.FlexAlignItems.Center);
            oHbox.addStyleClass("requiredItem");
            var requiredLabelField = new sap.m.Label({
                text: "",
                design: sap.m.LabelDesign.Bold,
                required: oCon.bReasonCodeRequired
            });
            requiredLabelField.addStyleClass("requiredLabel");
            oTypeControls[0] = new com.sap.me.control.Input({
                id: this.createId("selectByTypeInput1"),
                maxLength: 40,
                width: "256px",
                placeholder: util.I18NUtility.getLocaleSpecificText("WORK_CENTER_BROWSE.default.LABEL"),
                liveChange: [oCon.workCenterChange, oCon],
                showClear: true,
                showBrowse: true,
                upperCase: true,
                browseTap: [ oCon.browseWorkCenterTap, oCon ],
                clearTap: [ oCon.clearWorkCenterTap, oCon ]
            });
            oHbox.addItem(oTypeControls[0]);
            oHbox.addItem(requiredLabelField);
            oItem.addContent(oHbox);
            oChangeEquipmentStatusList.insertItem(oItem, 1);
        }

    }

});