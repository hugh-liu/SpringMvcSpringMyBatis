
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.browse.view.ToolNumberBrowse", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        util.Model.setData("TEMP_FromId", evt.data.fromId);
        util.Model.setData("TEMP_FromNamespace", evt.data.fromNamespace);

        var sFilterValue = util.Model.getData("TEMP_ToolNumberFilterValue");

        var url = "/manufacturing-odata/Production.svc/BrowseToolNumbers";
        if (!util.StringUtil.isBlank(sFilterValue)) {
            url = url + "?ToolNumberMask='" + sFilterValue + "'";
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
        oBinding["ToolNumbers"] = oResults;
        oModel.setData(oBinding);
        sap.ui.getCore().setModel(oModel, "toolNumbersModel");
    },

    browseListTap : function(evt) {
        var oSource = evt.getSource();
        if (oSource) {
            util.Model.setData(util.ModelKey.SelectedToolNumber, oSource.getTitle());
        }
        this.navButtonTap(evt);
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