jQuery.sap.declare("util.Common");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.StringUtil");

util.Common = {

    /**
     * Save the InputType and InputTypeValue
     *
     * @param {object} commonInputType - The common Input Type
     * @param {object} commonInputTypeValue The common Input Type Value
     * @public
     */
    saveCommonSettings: function (objCommonInputType, objCommonInputTypeValue, objCommonOperation, objCommonResource) {
        var sValue = undefined;
        var bTypeSet = false;

        // Assign Operation
        if (objCommonOperation) {
            var value = objCommonOperation.getValue();
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedOperation, value.toUpperCase());
            } else
            {
                util.Model.setData(util.ModelKey.SelectedOperation, "");
            }
        }

        // Assign Resource
        if (objCommonResource) {
            var value = objCommonResource.getValue();
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedResource, value.toUpperCase());
            } else {
                util.Model.setData(util.ModelKey.SelectedResource, "");
            }
        }

        // If there is no input type or type value, exit save
        if (objCommonInputType === null && objCommonInputTypeValue === null)
        {
            return;
        }

        // Check for Custom Data Value (searching for "PROCESS_LOT", "SFC", etc.)
        if (objCommonInputType) {
            var oItem = objCommonInputType.getSelectedItem();
            if (oItem) {
                var oData = oItem.getCustomData();
                
                if (oData) {
                    sValue = util.Model.getCustomDataValue(oData, "value");
                }
                if (!util.StringUtil.isBlank(sValue)) {
                    util.Model.setData(util.ModelKey.SelectedCollectionType, sValue.toUpperCase());
                    //util.Model.setData("TEMP_SelectedCollectionType", sValue.toUpperCase());
                    util.Model.setData(util.ModelKey.SelectedCollectionType + "_DEFAULT", sValue.toUpperCase());
                    bTypeSet = true;
                }
            }
        }

        // Check for Key Value  (searching for "PROCESS_LOT", "SFC", etc.)
        if (util.StringUtil.isBlank(sValue)) {
            var oItem = objCommonInputType.getSelectedItem();
            if (oItem) {
                sValue = oItem.getKey();
                if (!util.StringUtil.isBlank(sValue)) {
                    util.Model.setData(util.ModelKey.SelectedCollectionType, sValue.toUpperCase());
                    //util.Model.setData("TEMP_SelectedCollectionType", sValue.toUpperCase());
                    util.Model.setData(util.ModelKey.SelectedCollectionType + "_DEFAULT", sValue.toUpperCase());
                    bTypeSet = true;
                }
            }
        }

        // Set Input Type Value
        if (objCommonInputTypeValue) {
            var value = objCommonInputTypeValue.getValue();
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, value.toUpperCase());
                //util.Model.setData("TEMP_SelectedCollectionTypeValue", value.toUpperCase());
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue + "_DEFAULT", value.toUpperCase());
            }  else 
            {
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, "");
                //util.Model.setData("TEMP_SelectedCollectionTypeValue", value.toUpperCase());
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue + "_DEFAULT", "");
            }
        }

        if (bTypeSet === false) {
            util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, "");
        }
        
    },

    /**
     * Apply the InputType and InputTypeValue to their respective object (from the previously saved model)
     *
     * @param {object} commonInputType - The common Input Type
     * @param {object} commonInputTypeValue The common Input Type Value
     * @public
     */
    applyCommonSettings: function (objCommonInputType, objCommonInputTypeValue, objCommonOperation, objCommonResource) {

        var entityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        var entityTypeValue = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);
        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        var resource = util.Model.getData(util.ModelKey.SelectedResource);
        var bFoundType = false;       
        var placeHolderText = "";

        // If there is no input type or type value, exit save
        if (objCommonInputType !== null && objCommonInputTypeValue !== null) {

            // Try Custom Data Value method
            var items = objCommonInputType.getItems();
            for (var i = 0; i < items.length; i++) {
                var val = items[i].getCustomData();
                if (val) {
                    var customData = util.Model.getCustomDataValue(val, "value");
                    if (customData === entityType) {
                        // Assign the Selected Object
                        objCommonInputType.setSelectedItem(items[i]);
                        placeHolderText = objCommonInputType.getSelectedItem().getText();
                        bFoundType = true;
                        break;
                    }
                }
            }

            // Try Key Value 
            if (bFoundType == false) {
                items = objCommonInputType.getItems();
                for (var i = 0; i < items.length; i++) {
                    var val = items[i].getKey();
                    if (val === entityType) {
                        objCommonInputType.setSelectedItem(items[i]);
                        placeHolderText = objCommonInputType.getSelectedItem().getText();
                        bFoundType = true;
                        break;
                    }
                }
            }

            // Set Placeholder Text
            if (!util.StringUtil.isBlank(placeHolderText)) {
                objCommonInputTypeValue.setPlaceholder(placeHolderText);
            }
        }

        // Set values as-needed
        if (objCommonInputTypeValue && objCommonInputTypeValue !== null) {
            objCommonInputTypeValue.setValue(entityTypeValue);
        }

        if (objCommonOperation && objCommonOperation !== null) {
            objCommonOperation.setValue(operation);
        }

        if (objCommonResource && objCommonResource !== null) {
            objCommonResource.setValue(resource);
        }
    }

};