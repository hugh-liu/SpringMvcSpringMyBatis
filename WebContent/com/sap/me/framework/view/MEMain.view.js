jQuery.sap.require("util.ModelKey");
jQuery.sap.require("sap.ui.model.odata.Filter");
jQuery.sap.require("sap.ui.model.Sorter");

sap.ui.jsview("com.sap.me.framework.view.MEMain", {

    getControllerName: function() {
        return "com.sap.me.framework.view.MEMain";
    },

    onBeforeFirstShow : function(evt) {
        this.getController().onBeforeFirstShow(evt);
    },

    onBeforeShow : function(evt) {
        this.getController().onBeforeShow(evt);
    },

    onAfterShow : function(evt) {
        this.getController().onAfterShow(evt);
    },

    createContent : function(oCon) {

        // create application list
        this.applicationList = new sap.m.List({
            id : this.createId('applicationsList'),
            showNoData : false,
            includeItemInSelection : true,
            inset : true
        });

        this.oListTemplate = new sap.m.StandardListItem({
                title : "{applicationModel>label}",
                icon : "{applicationModel>iconPath}",
                iconInset : false,
                iconDensityAware : false,
                type : sap.m.ListType.Navigation,
                customData : [
                    new sap.ui.core.CustomData({
                        key: "workstation",
                        value: "{applicationModel>workstation}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "applicationId",
                        value: "{applicationModel>applicationId}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "activityType",
                        value: "{applicationModel>activityType}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "activityRef",
                        value: "{applicationModel>activityRef}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "namespace",
                        value: "{applicationModel>namespace}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "view",
                        value: "{applicationModel>view}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "activities",
                        value: "{applicationModel>activities}"
                    }),
                    new sap.ui.core.CustomData({
                        key: "options",
                        value: "{applicationModel>options}"
                    })
                ],
                tap : [ oCon.applicationListTap, oCon ]
        });

        var sWorkstationTitle = "";
        try {
            this.loadWorkstation();
            sWorkstationTitle = this.loadApplications(oCon);
        } catch(err) {
            sap.m.MessageBox.alert(err.message);
        }

        // create page
        this.page = new sap.m.Page({
            id : this.createId('mainPage'),
            title : sWorkstationTitle,
            icon : util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.ICON"),
            headerContent : [
                 new sap.m.Button({
                     icon: sap.ui.core.IconPool.getIconURI("factory"),
                     tap : [ oCon.changeSiteButtonTap, oCon ]
                 })  ,
                 new sap.m.Button({
                     icon: sap.ui.core.IconPool.getIconURI("log"),
                     tap : [ oCon.logoffButtonTap, oCon ]
                 })
             ],
            content : [
                this.applicationList
            ]
        });

        return this.page;
    },

    loadApplications : function(oCon) {

        var workstation = undefined;
        var sWorkstationTitle = "";
        var wsconfig = util.Model.getData(util.ModelKey.WorkstationConfiguration);
        if (wsconfig) {
             workstation = wsconfig.workstation;
             sWorkstationTitle = wsconfig.i18nDescription;
             if (util.StringUtil.isBlank(sWorkstationTitle)) {
                 sWorkstationTitle = util.I18NUtility.getLocaleSpecificText("ME_MOBILE.title.TEXT");
             }
             document.title = sWorkstationTitle;
        }
        sWorkstationTitle = sWorkstationTitle + " - " + util.I18NUtility.getLocaleSpecificText("SITE.default.LABEL") + ": " + util.Model.getData(util.CommonKey.CurrentSite);

        this.applicationList.bindItems("applicationModel>/Applications", this.oListTemplate);

        return sWorkstationTitle;

    },

    loadWorkstation : function() {

        var sWorkstation = util.Model.getData(util.ModelKey.Workstation);

        if (!util.StringUtil.isBlank(sWorkstation)) {
            try {
                com.sap.me.framework.view.WorkstationLoader.loadWorkstation(sWorkstation);
            } catch(err) {
                throw err;
            }
        }

        var wsconfig = util.Model.getData(util.ModelKey.WorkstationConfiguration);

        if (wsconfig) {

            if (wsconfig.defaultOperation && wsconfig.defaultOperation !== "") {
                util.Model.setData(util.ModelKey.SelectedOperation, wsconfig.defaultOperation);
                util.Model.setData(util.ModelKey.SelectedOperationRevision, wsconfig.defaultOperationRev);
            } else {
                var sDefaultOperation = jQuery.sap.getUriParameters().get("OPERATION");
                if (sDefaultOperation == undefined || sDefaultOperation == null) {
                    sDefaultOperation = jQuery.sap.getUriParameters().get("operation");
                }
                if (sDefaultOperation) {
                    var parameters="?operation='" + sDefaultOperation.toUpperCase() + "'";
                    try {
                        util.IOUtil.getODataRequestResults("/manufacturing-odata/Production.svc/ValidateOperation" + parameters, true);
                        util.Model.setData(util.ModelKey.SelectedOperation,sDefaultOperation.toUpperCase());
                    } catch (err) {
                        jQuery.sap.log.error(err.message);
                    }
                }
            }

            if (wsconfig.defaultResource && wsconfig.defaultResource !== "") {
                util.Model.setData(util.ModelKey.SelectedResource, wsconfig.defaultResource);
            } else {
                var sDefaultResource = jQuery.sap.getUriParameters().get("RESOURCE");
                if (sDefaultResource == undefined || sDefaultResource == null) {
                    sDefaultResource = jQuery.sap.getUriParameters().get("resource");
                }
                if (sDefaultResource) {
                    var parameters="?resource='" + sDefaultResource.toUpperCase() + "'";
                    try {
                        util.IOUtil.getODataRequestResults("/manufacturing-odata/Production.svc/ValidateResource" + parameters, true);
                        util.Model.setData(util.ModelKey.SelectedResource,sDefaultResource.toUpperCase());
                    } catch (err) {
                        jQuery.sap.log.error(err.message);
                    }
                }
            }
        }
    },

    updateWorkstation : function(oCon) {

        // remove any existing model
        var oModel = sap.ui.getCore().getModel("applicationModel");
        if (oModel) {
            sap.ui.getCore().setModel(undefined, "applicationModel");
        }

        // load new workstation
        var sErrorMessage = undefined;
        try {
            this.loadWorkstation();
            var sWorkstationTitle = this.loadApplications(oCon);
            this.page.setTitle(sWorkstationTitle);
        } catch(err) {
            sErrorMessage = err.message;
            this.page.setTitle("");
            this.applicationList.unbindItems();
        }

        this.applicationList.rerender();

        if (!util.StringUtil.isBlank(sErrorMessage)) {
            sap.m.MessageBox.alert(sErrorMessage);
        }
    }

});