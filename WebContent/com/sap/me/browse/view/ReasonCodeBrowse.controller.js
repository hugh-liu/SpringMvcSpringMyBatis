
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.browse.view.ReasonCodeBrowse", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        util.Model.setData("TEMP_FromId", evt.data.fromId);
        util.Model.setData("TEMP_FromNamespace", evt.data.fromNamespace);

        var sCategory = util.Model.getData(util.ModelKey.SelectedReasonCodeCategory);
        if (!util.StringUtil.isBlank(sCategory)) {
            var sFilterValue = util.Model.getData("TEMP_ReasonCodeFilterValue");
            var url = "/manufacturing-odata/Production.svc/BrowseReasonCodes?Category='" + sCategory + "'";
            if (!util.StringUtil.isBlank(sFilterValue)) {
                url = url + "&ReasonCodeMask='" + sFilterValue + "'";
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
            oBinding["ReasonCodes"] = oResults;
            oModel.setData(oBinding);
            sap.ui.getCore().setModel(oModel, "reasonCodesModel");
        }

    },

    browseListTap : function(evt) {
        var oSource = evt.getSource();
        if (oSource) {
            util.Model.setData(util.ModelKey.SelectedReasonCode, oSource.getTitle());
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