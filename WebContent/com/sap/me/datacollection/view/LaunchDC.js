jQuery.sap.declare("com.sap.me.datacollection.view.LaunchDC");

jQuery.sap.require("com.sap.me.datacollection.view.DataCollectionHelper");
jQuery.sap.require("com.sap.me.framework.view.Executable");
jQuery.sap.require("util.Activity");

com.sap.me.framework.view.Executable.extend("com.sap.me.datacollection.view.LaunchDC", {

    execute: function() {

        // validate data loaded
        this.validateDataLoaded();

        // must have this activities activity ID
        if (util.StringUtil.isBlank(this.getActivityId())) {
            jQuery.sap.log.error("LaunchDC.execute: Activity ID is undefined");
            var message = this.getMissingErrorMessage(util.I18NUtility.getLocaleSpecificText("ACTIVITY.default.LABEL"));
            throw new Error(message);
        }

        // get the DC activity in order to get the rules
        var rules = util.Activity.getRules(this.getActivityId());
        if (!rules || rules.length == 0) {
            jQuery.sap.log.error("LaunchDC.execute: " + this.getActivityId() + " must have DC_ACTIVITY rule defined");
            var message = this.getMissingErrorMessage("DC_ACTIVITY");
            throw new Error(message);
        }
        var sDcActivityId = undefined;
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].attribute === "DC_ACTIVITY") {
                sDcActivityId = rules[i].value;
                break;
            }
        }

        if (util.StringUtil.isBlank(sDcActivityId)) {
            jQuery.sap.log.error("LaunchDC.execute: " + this.getActivityId() + " must have DC_ACTIVITY rule defined");
            var message = this.getMissingErrorMessage("DC_ACTIVITY");
            throw new Error(message);
        }

        // set up global model data
        var dcActivityRules = util.Activity.getRules(sDcActivityId);
        com.sap.me.datacollection.view.DataCollectionHelper.initializeDataModel(dcActivityRules);

        // set up where to go back to after data collection
        util.Model.setData(util.ModelKey.CurrentApplicationView, this.getViewId());
        util.Model.setData(util.ModelKey.CurrentApplicationNamespace, this.getNamespace());

        // collect the data
        com.sap.me.datacollection.view.DataCollectionHelper.collectData();
    },

    validateDataLoaded: function() {

        if (util.StringUtil.isBlank(this.getViewId())) {
            var message = this.getMissingErrorMessage("View ID");
            throw new Error(message);
        }

        if (util.StringUtil.isBlank(this.getNamespace())) {
            var message = this.getMissingErrorMessage("Namespace");
            throw new Error(message);
        }

        var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
        if (util.StringUtil.isBlank(selectedOperation)) {
            var message = this.getMissingErrorMessage(util.I18NUtility.getLocaleSpecificText("OPERATION.default.LABEL"));
            throw new Error(message);
        }

        var selectedResource = util.Model.getData(util.ModelKey.SelectedResource);
        if (util.StringUtil.isBlank(selectedResource)) {
            var message = this.getMissingErrorMessage(util.I18NUtility.getLocaleSpecificText("RESOURCE.default.LABEL"));
            throw new Error(message);
        }

        var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        if (util.StringUtil.isBlank(selectedType)) {
            var message = this.getMissingErrorMessage(util.I18NUtility.getLocaleSpecificText("TYPE.default.LABEL"));
            throw new Error(message);
        }

        var selectedTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        if (util.StringUtil.isBlank(selectedTypeValue)) {
            var message = undefined;
            if (selectedType === "SFC") {
                message = this.getMissingErrorMessage(util.I18NUtility.getLocaleSpecificText("SFC.default.LABEL"));
            } else if (selectedType === "") {
                message = this.getMissingErrorMessage(util.I18NUtility.getLocaleSpecificText("shop_order.default.LABEL"));
            } else {
                message = this.getMissingErrorMessage(util.I18NUtility.getLocaleSpecificText("processLot.default.LABEL"));
            }
            throw new Error(message);
        }

        return true;
    },

    getMissingErrorMessage: function(sValue) {
        var oProperties = jQuery.sap.properties();
        oProperties.setProperty("%VALUE%", sValue);
        return util.I18NUtility.getErrorText("15258.simple", oProperties);
    }
});