
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.browse.view.OperationResourceBrowse", {

    onInit : function() {

    },

    onBeforeShow : function(evt) {

        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        util.Model.setData("TEMP_FromId", evt.data.fromId);
        util.Model.setData("TEMP_FromNamespace", evt.data.fromNamespace);

        var oListControl = this.getView().byId("browseList");
        if (oListControl) {
            var sOperation = util.Model.getData(util.ModelKey.SelectedOperation);
            var sFilterValue = util.Model.getData("TEMP_OperationResourceFilterValue");

            var url = "/manufacturing-odata/Production.svc/BrowseResourcesForOper";

            var sToken = "?";
            if (!util.StringUtil.isBlank(sOperation)) {
                url = url + sToken + "OperName='" + sOperation + "'";
                sToken = "&";
            }
            if (!util.StringUtil.isBlank(sFilterValue)) {
                url = url + sToken + "ResourceMask='" + sFilterValue + "'";
            }

            var oResults = undefined;
            try {
                oResults = util.IOUtil.getODataRequestResults(url, false);
            } catch (err) {
                jQuery.sap.log.error(err.message);
                return undefined;
            }

            oModel = new sap.ui.model.json.JSONModel();
            var oBinding = {};
            oBinding["Resources"] = oResults;
            oModel.setData(oBinding);
            sap.ui.getCore().setModel(oModel, "operationResourcesModel");
        }
    },

    browseListTap : function(evt) {

        var oSource = evt.getSource();
        if (oSource) {
            util.Model.setData(util.ModelKey.SelectedResource, oSource.getTitle());
        }

        this.navButtonTap();
    },

    navButtonTap : function(evt) {
        var fromId = util.Model.getData("TEMP_FromId");
        var fromNamespace = util.Model.getData("TEMP_FromNamespace");
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back", {
                id : fromId,
                data : {
                    namespace : fromNamespace
                }
        });
    }

});