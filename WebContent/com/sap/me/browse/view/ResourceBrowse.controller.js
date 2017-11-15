
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.browse.view.ResourceBrowse", {

    onInit : function() {

    },

    onBeforeShow : function(evt) {

        jQuery.sap.log.debug("ResourceBrowse.onBeforeShow: Hi");

        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        util.Model.setData("TEMP_FromId", evt.data.fromId);
        util.Model.setData("TEMP_FromNamespace", evt.data.fromNamespace);

        var oListControl = this.getView().byId("browseList");
        if (oListControl) {
            var resource = util.Model.getData("TEMP_ResourceFilterValue");

            var sFilterOperator = undefined;
            if (!util.StringUtil.isBlank(resource)) {
                sFilterOperator = "resource eq '" + resource + "'";
            }

            var oModel = util.IOUtil.getEntitySetModel("/manufacturing-odata/Production.svc/", "Resources", sFilterOperator);
            if (oModel) {
                sap.ui.getCore().setModel(oModel, "resourcesModel");
            }
        }
    },

    browseListTap : function(evt) {

        var oSource = evt.getSource();
        if (oSource) {
            // jQuery.sap.log.debug("ResourceBrowse.browseListTap: Operation = " + oSource.getTitle());
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