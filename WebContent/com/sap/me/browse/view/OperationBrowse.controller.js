
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.browse.view.OperationBrowse", {

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

            var operation = util.Model.getData("TEMP_OperationFilterValue");

            var sFilterOperator = undefined;
            if (!util.StringUtil.isBlank(operation)) {
                sFilterOperator = "operation eq '" + operation + "'";
            }

            var oModel = util.IOUtil.getEntitySetModel("/manufacturing-odata/Production.svc/", "Operations", sFilterOperator);
            if (oModel) {
                sap.ui.getCore().setModel(oModel, "operationsModel");
            }

        } else {
           jQuery.sap.log.debug("OperationBrowse.onBeforeShow: browseList not found");
        }
    },

    browseListTap : function(evt) {

        var oSource = evt.getSource();
        if (oSource) {
            // jQuery.sap.log.debug("OperationBrowse.browseListTap: Operation = " + oSource.getTitle());
            util.Model.setData(util.ModelKey.SelectedOperation, oSource.getTitle());
            var sValue = oSource.data("Version");
            if (sValue) {
                util.Model.setData(util.ModelKey.SelectedOperationRevision, sValue);
            } else {
                jQuery.sap.log.error("OperationBrowse.browseListTap: operation revision is undefined");
            }
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
    },

});