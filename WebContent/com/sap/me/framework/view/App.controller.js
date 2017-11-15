
jQuery.sap.require("jquery.sap.history");

sap.ui.controller("com.sap.me.framework.view.App", {

    onInit : function() {
        // subscribe to event bus
        var bus = sap.ui.getCore().getEventBus();
        bus.subscribe("nav", "to", this.navToHandler, this);
        bus.subscribe("nav", "back", this.navBackHandler, this);
        bus.subscribe("nav", "home", this.navHomeHandler, this);

        jQuery.sap.history({
            routes: [{
                // This handler is executed when you navigate back to the history state on the path "page"
                path : "page", handler: jQuery.proxy(this.historyPageHandler, this)
            }],
            // The default handler is executed when you navigate back to the history state with an empty hash
            defaultHandler: jQuery.proxy(this.historyDefaultHandler, this)
        });

    },

    historyPageHandler : function(oEvent) {
        this.navTo("Home", true, "to", null);
    },
    historyDefaultHandler : function(oEvent) {
        this.navTo("Home", true, "to", null);
    },

    navToHandler : function(channelId, eventId, data) {
        if (data && data.id) {
            this.navTo(data.id, true, "to", data.data);
        } else {
            jQuery.sap.log.error("nav-to event cannot be processed. Invalid data: " + data);
        }
    },

    navBackHandler : function(channelId, eventId, data) {
        if (data && data.id) {
            this.navTo(data.id, true, "back", data.data);
        } else {
            jQuery.sap.log.error("nav-to event cannot be processed. Invalid data: " + data);
        }
    },

    navHomeHandler : function(channelId, eventId, data) {
        this.navTo("Home", true, "to", null);
    },

    navTo : function(id, writeHistory, navType, data) {

        // check param
        if (id === undefined || id === null) {
            jQuery.sap.log.error("navTo failed due to missing id");
            return;
        }

        if (data && data.activityType) {
            if (data.activityType !== "M") {
                jQuery.sap.log.info("navTo - external url = " + id);
                // sap.m.URLHelper.redirect(id, true);
                util.IOUtil.redirect(id, true);
                return;
            }
        }

        var namespace = "com.sap.me.framework.view";
        if (data && data.namespace) {
            if (data.namespace != "") {
                sap.ui.localResources(data.namespace);
                namespace = data.namespace;
            }
        }

        // check for and process Executable type views
        var oExecutable = this.getExecutable(namespace + "." + id);
        if (oExecutable) {

            try {
                oExecutable.setActivityId(data.activityId);
                oExecutable.setViewId(data.fromViewId);
                oExecutable.setNamespace(data.fromNamespace);
                if (data.data) {
                    oExecutable.setData(data.data);
                }
                oExecutable.execute();
            } catch (err) {
                 jQuery.sap.log.error(namespace + "." + id + " Error: " + err.message);
                 sap.m.MessageBox.alert(err.message);
            }
            return;
        }

        // navigate on app
        var app = this.getView().app;
        if (navType && navType.toLowerCase() === "back") {
            if (sap.m.InstanceManager.hasOpenDialog()) {
                sap.m.InstanceManager.closeAllDialogs();
            } else {
                app.backToPage(id, data);
            }

        } else if (id.toLowerCase() === "home") {
             app.backToTop(data);

        } else {

            // lazy load view
            if (app.getPage(id) === null) {

                jQuery.sap.log.info("now loading page '" + namespace + "." + id + "'");

                // Register new path if context passed in addition to view name (i.e.;  "/manufacturing-mobile-ext/com.vendor.ext.production.view.WipProcessing")
                // This is required so that the page loader will use the correct context in the url.
                if (jQuery.sap.startsWith(namespace, "/")) {
                    var pathArray = window.location.href.split( '/' );
                    var protocol = pathArray[0];
                    var host = pathArray[2];
                    var fullpath = protocol + '//' + host +  namespace;
                    var moduleNamePrefix = fullpath.substring(fullpath.lastIndexOf("/") + 1, fullpath.lastIndexOf("."));
                    var sURL = fullpath.substring(0, fullpath.lastIndexOf("/") + 1) + moduleNamePrefix.replace(/\./g,"/");
                    namespace = fullpath.substring(fullpath.lastIndexOf("/") + 1);
                    jQuery.sap.registerModulePath(moduleNamePrefix, sURL);
                }

                if(jQuery.sap.startsWith(namespace, "com.training.mymobile")){
					app.addPage(sap.ui.xmlview(id, namespace + "." + id));
				}else{
					app.addPage(sap.ui.jsview(id, namespace + "." + id));
				}
            }
            app.to(id, data);
        }

        // write history
        if (writeHistory === undefined || writeHistory) {
            jQuery.sap.history.addHistory("page", {id: id}, false);
        }

        // log
        jQuery.sap.log.info("navTo '" + id + "' (" + writeHistory + "," + navType + ")");
    },

    getExecutable : function(sExecutableClass) {

            try {
                jQuery.sap.require(sExecutableClass);
            } catch (err) {
                return undefined;
            }

            var oClass = jQuery.sap.getObject(sExecutableClass);
            if (!oClass) {
                jQuery.sap.assert(oClass !== undefined, "The specified Executable \"" + sExecutableClass + "\" could not be found!");
                return undefined;
            }

            var oExecutable = new oClass();
            if (oExecutable instanceof com.sap.me.framework.view.Executable) {
                return oExecutable;
            }

            jQuery.sap.assert(oExecutable instanceof com.sap.me.framework.view.Executable, "The specified class \"" + sExecutableClass + "\" must be an instance of com.sap.me.framework.view.Executable!");
            return undefined;
    }

});