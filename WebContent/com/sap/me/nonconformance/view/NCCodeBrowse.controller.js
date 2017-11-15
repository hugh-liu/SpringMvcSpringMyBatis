
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("com.sap.me.nonconformance.view.NCCodeBrowse", {

    onInit : function() {
    },

    onBeforeShow : function(evt) {

        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        var ncGroup = util.Model.getData(util.ModelKey.SelectedNCGroup);

        var originalNcGroup = util.Model.getData(util.ModelKey.SelectedNCGroup + "_ORIGINAL");

        // jQuery.sap.log.debug("NCCodeBrowse.onBeforeShow: ncGroup = " + ncGroup + ", originalNcGroup = " + originalNcGroup);

        var oListControl = this.getView().byId("browseList");
        if (oListControl) {
            util.Model.setData(util.ModelKey.SelectedNCGroup + "_ORIGINAL", ncGroup);

            // remove any previous list item data
            var oModel = sap.ui.getCore().getModel("ncCodesModel");
            if (oModel) {
                sap.ui.getCore().setModel(undefined, "ncCodesModel");
            }
            if (oListControl.getAggregation("items")) {
                oListControl.removeAggregation("items", false);
            }
            oListControl.destroyItems();
            // get new nc codes
            var path = undefined;
            var bypassGroup = util.Model.getData(util.ModelKey.BypassNcGroup);
            if (bypassGroup) {
                var oper = util.Model.getData(util.ModelKey.SelectedOperation);
                var operRev = util.Model.getData(util.ModelKey.SelectedOperationRevision);
                var ncCodeMask = util.Model.getData(util.ModelKey.SelectedNCCode);
                if ( ! ncCodeMask) {
                    ncCodeMask = util.Model.getData("TEMP_NCCodeFilterValue");
                }
                var queryParameters = "&Oper=" + oper ;
                if ( operRev) {
                    queryParameters = queryParameters + "&OperRev=" + operRev;
                }
                if ( ncCodeMask ) {
                    queryParameters = queryParameters + "&NcCodeMask="  + ncCodeMask;
                }
                path = "ncCodesModel>/NcCodes";
                oModel = util.IOUtil.getEntitySetModel("/manufacturing-odata/LogNc.svc/", "NcCodes", null, queryParameters);
            } else {
                path = "ncCodesModel>/NcGroups"
                    oModel = util.IOUtil.getEntitySetModel("/manufacturing-odata/LogNc.svc/", "NcGroups('" + ncGroup + "')/ncCodeMemberList");
            }

            if (oModel) {
                this.shiftDefaultNcCodetoTop(oModel);
                sap.ui.getCore().setModel(oModel, "ncCodesModel");
            }

            // define new binding
            oListControl.bindAggregation("items", {
                path : path,
                template : new sap.m.StandardListItem({
                    title : "{ncCodesModel>ncCode}",
                    description : "{ncCodesModel>description}",
                    type : sap.m.ListType.Navigation,
                    info: "{ncCodesModel>info}",
                    infoState: "{ncCodesModel>infoState}",
                    customData : [
                          new sap.ui.core.CustomData({
                              key: "ref",
                              value: "{ncCodesModel>ref}"
                          })
                          ],
                          tap : [ this.browseListTap, this ]
                })
            });
        }

    },

    browseListTap : function(evt) {

        var oSource = evt.getSource();
        if (oSource) {
            jQuery.sap.log.debug("NCCodeBrowse.browseListTap: title = " + oSource.getTitle());
            util.Model.setData(util.ModelKey.SelectedNCCode, oSource.getTitle());
            util.Model.setUnsavedDataDefined(true);
        }

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "NCDataEntry",
            data : {
                namespace : "com.sap.me.nonconformance.view",
                ncCode : oSource.getTitle()
            }
        });
    },

    closeTap : function() {

        // unsaved data? then prompt
        if (util.Model.isUnsavedDataDefined()) {

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
        var bypassGroup = util.Model.getData(util.ModelKey.BypassNcGroup);
        if ( bypassGroup ) {
            bus.publish("nav", "back", {
                id : "LogNC",
                data : {
                    namespace : "com.sap.me.nonconformance.view"
                }
            });
        } else {
            bus.publish("nav", "back", {
                id : "NCGroupBrowse",
                data : {
                    namespace : "com.sap.me.nonconformance.view"
                }
            });
        }
    },

    getDefaultNcCode : function() {
        var oper = util.Model.getData(util.ModelKey.SelectedOperation);
        var operRev = util.Model.getData(util.ModelKey.SelectedOperationRevision);
        var filter = "operation eq " +  util.StringUtil.wrapWithQuote(oper)
        if ( ! (util.StringUtil.isBlank(operRev) || operRev === "#") ) {
            filter.concat("and revision eq " + util.StringUtil.wrapWithQuote(operRev));
        }
        var oParameters= {
             "$filter" : filter,
        };

        var servletUrl = "/manufacturing-odata/Production.svc/Operations";
        var curSite = util.Model.getData(util.CommonKey.CurrentSite);
        if (curSite) {
            servletUrl = servletUrl + "?SITE=" + curSite;
        }
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.loadData(servletUrl, oParameters, false, "GET", false, false, "");
        var oRes = oModel.getProperty("/d/results/0/defaultNCCodeRef");
        if ( oRes) {
            return oRes.split(",")[1];
        }
        return undefined;

    },

    shiftDefaultNcCodetoTop: function (oModel) {
        if (oModel) {
            var oResults = undefined;
            if ( oModel.oData.NcCodes ) {
                oResults  = oModel.oData.NcCodes;
            } else {
                oResults  = oModel.oData.NcGroups;
            }
            if ( ! oResults) {
                return;
            }

            var defaultNcCode = this.getDefaultNcCode();

            var index  = -1;
            for (var i = 0; i < oResults.length; i++) {
                var val = oResults[i].ncCode;
                if (defaultNcCode && defaultNcCode === val) {
                    oResults[i].info = util.I18NUtility.getLocaleSpecificText("mobileNC.defaultNcCode.LABEL");
                    oResults[i].infoState = sap.ui.core.ValueState.Success;
                    index = i;
                } else {
                    oResults[i].info = "";
                    oResults[i].infoState = sap.ui.core.ValueState.None;
                }
            }

            if ( index != -1) {
                var removed = oResults.splice(index,1);
                oResults.unshift(removed[0]);
            }
        }
    }


});