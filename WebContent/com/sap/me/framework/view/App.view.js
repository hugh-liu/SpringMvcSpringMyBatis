jQuery.sap.require("util.ModelKey");
jQuery.sap.require("util.I18NUtility");
jQuery.sap.require("util.StringUtil");
jQuery.sap.declare("util.IOUtil");
jQuery.sap.require("com.sap.me.framework.view.WorkstationLoader");

sap.ui.jsview("com.sap.me.framework.view.App", {

    getControllerName: function() {
        return "com.sap.me.framework.view.App";
    },

    createContent : function(oCon) {
        // Before doing anything else:
        // Find the site for the current user.  this will be the default site. If there is no default, the first
        // site the user is defined within is obtained.
        var curSite = undefined;
        try {
            curSite = util.IOUtil.getODataRequestResults("/manufacturing-odata/AppConfig.svc/GetSiteForUser", true);
            if ( curSite) {
                util.Model.setData(util.CommonKey.CurrentSite, curSite.GetSiteForUser.site);
            } else {
                jQuery.sap.log.error("Unable to find a site for the current user." );
                return;
            }
        } catch (err) {
            jQuery.sap.log.error(err.message);
            return;
        }

        // get workstation to display
        var sWorkstation = jQuery.sap.getUriParameters().get("WORKSTATION");
        if (sWorkstation == undefined || sWorkstation == null) {
            sWorkstation = jQuery.sap.getUriParameters().get("workstation");
            if (sWorkstation == undefined || sWorkstation == null) {
                sWorkstation = "MOBILE_DEF";
            }
        }
        if (!util.StringUtil.isBlank(sWorkstation)) {
            util.Model.setData(util.ModelKey.Workstation,sWorkstation.toUpperCase());
        }

        // get current theme
        var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();

        // check for query parameter theme (i.e.; ?sap-ui-theme=my-theme@/sap/public/bc/themes/~client-111)
        // if defined, we do not want to override it
        var sNewTheme = jQuery.sap.getUriParameters().get("sap-ui-theme");

        // if theme not specified in query parameter, check default theme
        if (util.StringUtil.isBlank(sNewTheme)) {
            sNewTheme = util.I18NUtility.getLocaleSpecificText("ME_MOBILE.theme.TEXT");
            if (!util.StringUtil.isBlank(sNewTheme) && sNewTheme !== sCurrentTheme) {
                sap.ui.getCore().applyTheme(sNewTheme);
            }
        }

        // add first pages (the rest is lazy loaded)
        this.app = new sap.m.App();
        this.app.addPage(sap.ui.jsview("Home", "com.sap.me.framework.view.MEMain")); // this will be defined as "Initial" page

        return this.app;
    }
});