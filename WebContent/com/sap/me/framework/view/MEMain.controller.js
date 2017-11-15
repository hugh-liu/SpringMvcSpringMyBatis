jQuery.sap.require("util.ModelKey");
jQuery.sap.require("util.Model");

sap.ui.controller("com.sap.me.framework.view.MEMain", {

    onInit : function() {

    },

/************   event during initial rendering ************
 type = BeforeShow
 from = null
 fromId = null
 to = Element sap.ui.core.mvc.JSView#Home
 toId = Home
 firstTime = true
 isTo = false
 isBack = false
 isBackToPage = false
 isBackToTop = false
 direction = initial

 event when returning from other page:

 type = BeforeShow
 from = Element sap.ui.core.mvc.JSView#Settings
 fromId = Settings
 to = Element sap.ui.core.mvc.JSView#Home
 toId = Home
 firstTime = false
 isTo = false
 isBack = false
 isBackToPage = false
 isBackToTop = true
 direction = backToTop

************************************************************/

    onBeforeFirstShow : function(evt) {

        if (evt.data.context) {
            this.getView().setBindingContext(evt.data.context);
        }

        util.Model.setUnsavedDataDefined(false);
    },

    changeSiteErrorCallback : function(errorCode, errorMessage) {
         jQuery.sap.log.error("ME Main  Initialization Error: " + errorMessage);
     },

    defaultOperationErrorCallback : function(errorCode, errorMessage) {
         jQuery.sap.log.error("ME Main  Initialization Error: " + errorMessage);
         util.Model.removeData(util.ModelKey.SelectedOperation);
     },

    defaultResourceErrorCallback : function(errorCode, errorMessage) {
         jQuery.sap.log.error("ME Main Initialization Error: " + errorMessage);
         util.Model.removeData(util.ModelKey.SelectedResource);
    },

    onBeforeShow : function(oEvent) {
        if (oEvent.fromId === "ChangeSite") {
            var sNewSite = util.Model.getData(util.CommonKey.CurrentSite);
            if (!util.StringUtil.isBlank(this.savedCurrentSite) &&
                this.savedCurrentSite != sNewSite) {
                this.savedCurrentSite = sNewSite;
                var oView = this.getView();
                if (oView) {
                    oView.updateWorkstation(this);
                }
            }
        }
    },

    onAfterShow : function(oEvent) {
    },

    applicationListTap : function(evt) {

        // always clear unsaved data flag
        util.Model.setUnsavedDataDefined(false);

        var sView = evt.getSource().data("view");
        var sNamespace = evt.getSource().data("namespace");
        var oActivities = evt.getSource().data("activities");
        var oOptions = evt.getSource().data("options");

        util.Model.setData(util.ModelKey.CurrentApplicationView, sView);
        util.Model.setData(util.ModelKey.CurrentApplicationNamespace, sNamespace);
        util.Model.setData(util.ModelKey.CurrentApplicationRules, oOptions);

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : sView,
            data : {
                namespace : sNamespace,
                workstation : evt.getSource().data("applicationId"),
                activityRef : evt.getSource().data("activityRef"),
                activityType : evt.getSource().data("activityType"),
                workstation : evt.getSource().data("workstation"),
                activities : oActivities,
                options : oOptions,
                appName : evt.getSource().getTitle()
            }
        });
    },

    // logout of server on back end
    logoffButtonTap : function() {
        // Get the Query String
        var query = window.location.search;
        // Clear the local cache
        util.Model.clearAllData();
        // Redirect to the logout.jsp and include the query parameters
        util.IOUtil.redirect("logout.jsp" + query, false);
    },

    // allow user to change site
    changeSiteButtonTap : function() {

        this.savedCurrentSite = util.Model.getData(util.CommonKey.CurrentSite);

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : "ChangeSite",
            data : {
                namespace : "com.sap.me.framework.view",
                fromId : "Home",
                fromNamespace : "com.sap.me.framework.view"
            }
        });
    }

});