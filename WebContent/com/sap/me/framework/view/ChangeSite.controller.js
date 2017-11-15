
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.framework.view.ChangeSite", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }
        util.Model.setData("TEMP_FromId", evt.data.fromId);
        util.Model.setData("TEMP_FromNamespace", evt.data.fromNamespace);

        var oListControl = this.getView().byId("siteList");
        if (oListControl) {
            var oData = undefined;
            try {
                oData = util.IOUtil.getODataRequestResults("/manufacturing-odata/AppConfig.svc/GetAllSitesForUser", false);
                if (oData) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    var oBinding = {};
                    oBinding["Sites"] = oData;
                    oModel.setData(oBinding);
                    sap.ui.getCore().setModel(oModel, "sitesModel");
                }
            } catch (err) {
                jQuery.sap.log.error(err.message);
                return;
            }
        }
    },

    siteListTap : function(evt) {

        var oSource = evt.getSource();
        if (oSource) {
            util.Model.setData(util.CommonKey.CurrentSite, oSource.getTitle());
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