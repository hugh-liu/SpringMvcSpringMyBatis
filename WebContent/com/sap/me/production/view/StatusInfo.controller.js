jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.production.view.StatusInfo", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("Status.onBeforeShow: view for controller not defined");
            return;
        }

        if (evt.data && evt.data.context) {
            oView.setBindingContext(evt.data.context);
        }

        if (evt.fromId === "Home") {
            if (evt.data && !util.StringUtil.isBlank(evt.data.appName)) {
                oView.page.setTitle(evt.data.appName);
            }
        }
        this.listNames = {
            sfcList: "SFC_DEFAULT",
            processLotList: "PROCESS_LOT_DEFAULT",
            shopOrderList: "ORDER_DEFAULT"
        };

        if (evt.data && evt.data.options && evt.data.options.length > 0) {
            for (var i=0; i<evt.data.options.length; i++) {
                var option = evt.data.options[i];

                if (option.key === "SFC_LIST") {
                    if (!util.StringUtil.isBlank(option.value)) {
                        this.listNames.sfcList = option.value;
                    }
                } else if (option.key === "SHOP_ORDER_LIST") {
                    if (!util.StringUtil.isBlank(option.value)) {
                        this.listNames.shopOrderList = option.value;
                    }
                } else if (option.key === "PROCESS_LOT_LIST") {
                    if (!util.StringUtil.isBlank(option.value)) {
                        this.listNames.processLotList = option.value;
                    }
                }
            }
        }

        this.setViewFields(evt);
    },

    /*
    * Set the field focus
    */
    setFieldFocus: function (focusField) {
        jQuery.sap.delayedCall(800, this, util.StringUtil.setFocus, [this.getView(), focusField]);
    },

    onAfterShow : function(evt) {
        this.setViewFields(evt);
        this.setFieldFocus("shopEntityInput");
    },

    setViewFields : function(evt) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("Status.setViewFields: view for controller not defined");
            return;
        }

        var selectedOperation = util.Model.getData(util.ModelKey.SelectedOperation);
        var oShopEntityControl = oView.byId("shopEntityInput");
        var selectedShopEntity = util.Model.getData(util.ModelKey.SelectedCollectionTypeValue);

        if (util.StringUtil.isBlank(selectedShopEntity)) {
            oShopEntityControl.setValue("");
        } else {
            oShopEntityControl.setValue(selectedShopEntity);
        }

        var selectedShopEntityType = util.Model.getData(util.ModelKey.SelectedCollectionType);
        if (util.StringUtil.isBlank(selectedShopEntityType)) {
            selectedShopEntityType = "SFC";
            util.Model.setData(util.ModelKey.SelectedCollectionType + "_DEFAULT", "SFC");
            util.Model.setData(util.ModelKey.SelectedCollectionType , "SFC");
        }

        var oTypeControl = oView.byId("statusType");
        var items = oTypeControl.getItems();
        for (var i = 0; i < items.length; i++) {
            var val = items[i].getKey();
            if ( val === selectedShopEntityType) {
                 oTypeControl.setSelectedItem(items[i]);
                 break;
            }
        }

        if (oShopEntityControl) {
            oShopEntityControl.setPlaceholder(oTypeControl.getSelectedItem().getText());
            if ( oShopEntityControl._$input ) {
                oShopEntityControl._$input.attr("placeholder", oTypeControl.getSelectedItem().getText());
            }
        }

        var bShowOperation = true;
        if (selectedShopEntityType != "SFC") {
            bShowOperation = false;
        }

        var oInputControl = oView.byId("operationHBox");
        if (oInputControl) {
            oInputControl.setVisible(bShowOperation);
        }

        if (bShowOperation && (evt.firstTime || evt.fromId == "OperationBrowse")) {
            if (!util.StringUtil.isBlank(selectedOperation)) {
                oInputControl = oView.byId("operationInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedOperation.toUpperCase());
                }
            }
        }

        if (evt.firstTime) {
            if (!util.StringUtil.isBlank(selectedShopEntity)) {
                oInputControl = oView.byId("shopEntityInput");
                if (oInputControl) {
                    oInputControl.setValue(selectedShopEntity.toUpperCase());
                }
            }

        }
    },


    processTypeChange: function(oControlEvent) {
        var oView = this.getView();
        if (oView === undefined || oView === null) {
            jQuery.sap.log.debug("Status.processTypeChange: view not found");
            return;
        }
        var oSelectControl = oView.byId("statusType");
        if (oSelectControl) {
            var oItem = oSelectControl.getSelectedItem();
            if (oItem) {
                var sValue = oItem.getKey();
                if (sValue && sValue.length > 0) {
                    var selectedType = util.Model.getData(util.ModelKey.SelectedCollectionType);
                    var newSelectedType = sValue.toUpperCase();

                    // type is changing, clear value field
                    if ( !selectedType || selectedType == null) {
                        selectedType= util.Model.getData(util.ModelKey.SelectedCollectionType + "_DEFAULT");
                    }
                    if (selectedType && selectedType != newSelectedType) {
                        util.Model.setData(util.ModelKey.SelectedCollectionType, newSelectedType);
                        var oInputControl = oView.byId("shopEntityInput");
                        if (oInputControl) {
                            oInputControl.setValue("");
                            util.Model.removeData(util.ModelKey.SelectedCollectionTypeValue);
                            oInputControl.setPlaceholder(oSelectControl.getSelectedItem().getText());
                            if ( oInputControl._$input) {
                                oInputControl._$input.attr("placeholder", oSelectControl.getSelectedItem().getText());
                            }
                        }
                        var oInputControl = oView.byId("operationHBox");
                        if (oInputControl) {
                            if (newSelectedType != "SFC") {
                                oInputControl.setVisible(false);
                            } else {
                                oInputControl.setVisible(true);
                            }
                        }
                    }
                    this.setFieldFocus("shopEntityInput");
                }
            }
        }
   },

    browseOperationTap : function(evt) {

        util.Model.removeData("TEMP_OperationFilterValue");

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("Status.browseOperationTap: view for controller not defined");
            return;
        }

        var oShopEntityControl = oView.byId("shopEntityInput");
        if (oShopEntityControl) {
            util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, oShopEntityControl.getValue());
        }

        var oInputControl = oView.byId("operationInput");
        if (oInputControl) {
            util.Model.setData("TEMP_OperationFilterValue", oInputControl.getValue().toUpperCase());
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "OperationBrowse",
            data : {
                namespace : "com.sap.me.browse.view",
                fromId : "StatusInfo",
                fromNamespace : "com.sap.me.production.view"
            }
        });
    },

    clearButtonTap : function() {

        var oView = this.getView();
        if (!oView) {
            return;
        }

        var oInputControl = oView.byId("operationInput");
        if (oInputControl) {
            oInputControl.setValue("");
        }

        oInputControl = oView.byId("shopEntityInput");
        if (oInputControl) {
            oInputControl.setValue("");
        }
    },

    nextTap : function(evt) {

        var requestData = this.getRequestData();
        if (!requestData) {
            return;
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "StatusDisplay",
            data : {
                namespace : "com.sap.me.production.view",
                fromId : "StatusInfo",
                fromNamespace : "com.sap.me.production.view",
                requestData: requestData
            }
        });
    },

    getRequestData : function() {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("Status.getRequestData: view for controller not defined");
            return;
        }

        var entityType = util.Model.getData(util.ModelKey.SelectedCollectionType);

        var entityValue = oView.byId("shopEntityInput").getValue();
        if (!entityValue) {
            var message = util.I18NUtility.getErrorText("12906.simple");
            if (entityType === "SHOP_ORDER"  ) {
                 message = util.I18NUtility.getErrorText("12907.simple");
            } else if (entityType === "PROCESS_LOT"  ) {
                 message = util.I18NUtility.getErrorText("12914.simple");
            }
            sap.m.MessageBox.alert(message);
            return undefined;
        }
        util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, entityValue.toUpperCase());

        // get the list for this entity type
        var sListName = this.listNames.sfcList;
        if (entityType === "SHOP_ORDER"  ) {
             sListName = this.listNames.shopOrderList;
        } else  if (entityType === "PROCESS_LOT"  ) {
             sListName = this.listNames.processLotList;
        }

        var operation = undefined;
        if (entityType === "SFC"  ) {
            operation = oView.byId("operationInput").getValue();
            if (!util.StringUtil.isBlank(operation)) {
                operation = operation.toUpperCase();
            }
        }

        var oColumnList = undefined;
        try {
            oColumnList = this.getListColumns(sListName);
        } catch (err) {
            jQuery.sap.log.error(err.message);
        }

        if (!oColumnList) {
            // 19957.simple=List configuration definitions for %TYPE% and %NAME% not found
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%TYPE%", "MOBILE_STATUS");
            oProperties.setProperty("%NAME%", sListName);
            var sMessage = util.I18NUtility.getErrorText("19957.simple", oProperties);
            sap.m.MessageBox.alert(sMessage);
            return undefined;
        }

        var requestData = {
            entityType : entityType,
            entityValue : entityValue.toUpperCase(),
            columnList: oColumnList,
            operation : operation
        };

        return requestData;
    },

    saveModel : function(evt) {

        var oView = this.getView();
        if (!oView) {
            jQuery.sap.log.error("Status.saveModel: view for controller not defined");
            return;
        }
        util.Model.removeData(util.ModelKey.SelectedOperation);
        util.Model.removeData(util.ModelKey.SelectedCollectionType);
        util.Model.removeData(util.ModelKey.SelectedCollectionTypeValue);

        var oInputControl = oView.byId("operationInput");
        if (oInputControl) {
            var value = oInputControl.getValue();
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedOperation, value.toUpperCase());
            }
        }

        oInputControl = oView.byId("statusType");
        if (oInputControl) {
            var oItem = oInputControl.getSelectedItem();
            if (oItem) {
                var sValue = oItem.getKey();
                if (sValue && !util.StringUtil.isBlank(sValue)) {
                    util.Model.setData(util.ModelKey.SelectedCollectionType, sValue.toUpperCase());
                }
            }
        }

        oInputControl = oView.byId("shopEntityInput");
        if (oInputControl) {
            var value = oInputControl.getValue();
            if (!util.StringUtil.isBlank(value)) {
                util.Model.setData(util.ModelKey.SelectedCollectionTypeValue, value.toUpperCase());
            }
        }
    },

    navButtonTap : function(evt) {
        this.saveModel();
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
              id : "Home"
        });
    },

    /**
     * Get the column list for the input list name
     *
     * @param {string} sListName Name of the list to get
     * @return undefined if no list found
     */
    getListColumns : function (sListName) {

        if (util.StringUtil.isBlank(sListName)) {
            return undefined;
        }

        if (this.oListColumns && this.oListColumns[sListName]) {
            return this.oListColumns[sListName];
        }

        var url = "/manufacturing-odata/ListConfig.svc/GetListColumns?ListType='MOBILE_STATUS'&ListName='" + sListName.toUpperCase() + "'";
        var oResults = util.IOUtil.getODataRequestResults(url, false);

        // check for error message
        if (!oResults || jQuery.type(oResults) !== "array") {
            return undefined;
        }

        var oMobileList = [];
        if (oResults && oResults.length > 0) {

            // sort list in ascending order
            oResults = this.sortBySequence(oResults);

            // load the column information for the list
            for (var i = 0; i < oResults.length; i++) {
                var sKey = "mobileStatus." + oResults[i].columnId + ".Col.LABEL";
                var sDescription = util.I18NUtility.getLocaleSpecificText(sKey);
                var oListData = {
                       columnId: oResults[i].columnId,
                       description: sDescription
                };

                oMobileList[oMobileList.length] = oListData;
            }
        }

        // cache for later use
        if (!this.oListColumns) {
            this.oListColumns = [];
        }
        this.oListColumns[sListName] = oMobileList;

        // return the list
        return oMobileList;
    },

    /**
     * sorts a list by the "sequence" number in the list object
     *
     * @param {array} oList to sort
     * @return sorted list
     */
    sortBySequence : function(oList) {

        var oSortedList = oList.sort(function(a, b) {
              var iNumberA = Number(a["sequence"]);
              var iNumberB = Number(b["sequence"]);
              if (isNaN(iNumberA)) {
                  return -1;
              }
              if (isNaN(iNumberB)) {
                  return 1;
              }
              return (iNumberA > iNumberB) ? 1 : ((iNumberA < iNumberB) ? -1 : 0);
        });

        return oSortedList;
    }

});