
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.nonconformance.view.NCGroupBrowse", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        var operation = util.Model.getData(util.ModelKey.SelectedOperation);
        var revision = util.Model.getData(util.ModelKey.SelectedOperationRevision);
        var ncGroupMask = util.Model.getData(util.ModelKey.SelectedNCGroup);
        if ( ! ncGroupMask) {
            ncGroupMask = util.Model.getData("TEMP_NCGroupFilterValue");
        }
        var queryParameters = "&Oper=" + operation ;
        if (revision) {
            if (revision = "#")
            {
                revision = "%23";
            }
        	queryParameters = queryParameters + "&OperRev=" + revision;
        }
        if ( ncGroupMask ) {
        	queryParameters = queryParameters + "&NcGroup="  + ncGroupMask;
        }
        
        var originalParameters = util.Model.getData("TEMP_NCGroupBrowseParameters");
        var oModel = sap.ui.getCore().getModel("ncGroupsModel");

        // jQuery.sap.log.debug("NCGroupBrowse.onBeforeShow: queryParameters = " + queryParameters + ", originalParameters = " + originalParameters);

        // if model not defined or the custom query parameters are changing, create new model
        if (!oModel || !originalParameters || (originalParameters != queryParameters)) {
            if (oModel) {
                sap.ui.getCore().setModel(undefined, "ncGroupsModel");
            }
            util.Model.setData("TEMP_NCGroupBrowseParameters", queryParameters);

            try {
                oModel = util.IOUtil.getEntitySetModel("/manufacturing-odata/LogNc.svc/", "NcGroups", null, queryParameters);
            } catch (error) {
                sap.m.MessageBox.show(
                     error.message,
                     sap.m.MessageBox.Icon.ERROR,
                     "",
                     sap.m.MessageBox.Action.OK
               );
            }
            
            if (oModel) {
                sap.ui.getCore().setModel(oModel, "ncGroupsModel");
            }

        }

    },

    browseListTap : function(evt) {

        var oSource = evt.getSource();
        if (oSource) {
            jQuery.sap.log.debug("NCGroupBrowse.browseListTap: NC Group = " + oSource.getTitle());
            util.Model.setData(util.ModelKey.SelectedNCGroup, oSource.getTitle());
            util.Model.setUnsavedDataDefined(true);
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "NCCodeBrowse",
            data : {
                namespace : "com.sap.me.nonconformance.view",
                ncGroup : oSource.getTitle()
            }
        });
    },

    closeTap : function() {

        // unsaved data? then prompt
        if (util.Model.isUnsavedDataDefined()) {

            var thisController = this;
            sap.m.MessageBox.show (
               util.I18NUtility.getLocaleSpecificText("ME_MOBILE.unsavedData.message.TEXT"),
               sap.m.MessageBox.Icon.QUESTION,
               util.I18NUtility.getLocaleSpecificText("ME_MOBILE.unsavedData.title.TEXT"),
               [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
               function(oAction) {
                  if (oAction) {
                      if (oAction === sap.m.MessageBox.Action.YES) {
                          util.Model.removeData(util.ModelKey.SelectedNCGroup);
                          util.Model.removeData(util.ModelKey.SelectedNCCode);
                          var bus = sap.ui.getCore().getEventBus();
                          bus.publish("nav", "to", {
                                id : "Home"
                          });
                      }
                  }
               }
            );

        // no unsaved data - just return
        } else {
           util.Model.removeData(util.ModelKey.SelectedNCGroup);
           util.Model.removeData(util.ModelKey.SelectedNCCode);
           var bus = sap.ui.getCore().getEventBus();
           bus.publish("nav", "to", {
                id : "Home"
           });
        }
    },

    navButtonTap : function(evt) {
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back", {
                id : "LogNC",
                data : {
                    namespace : "com.sap.me.nonconformance.view"
                }
        });
    }

});