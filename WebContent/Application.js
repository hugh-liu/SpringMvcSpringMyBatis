jQuery.sap.declare("Application");
jQuery.sap.require("ApplicationBase");
jQuery.sap.require("util.IOUtil");
jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.I18NUtility");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("util.Common");

ApplicationBase.extend("Application", {

    init : function() {

    },

    main : function() {

        // create app view and put to html root element
        var root = this.getRoot();
        var sView = this.getAppView();  // was "view.App"
        sap.ui.jsview("app", sView).placeAt(root);
    },

    // just clear current data in model
    onBeforeExit : function() {
        util.Model.clearAllData();
    }

});
