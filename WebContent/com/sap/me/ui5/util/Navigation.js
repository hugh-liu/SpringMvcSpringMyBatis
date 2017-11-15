jQuery.sap.declare("util.Navigation");

jQuery.sap.require("util.Activity");

util.Navigation = {

    /**
     * transfer control to input activity
     *
     * @param {string} sActivityId Activity to go to
     * @param {string} sFromId View ID of caller
     * @param {string} sNamespace Namespace of caller
     * @param {object} oData Optional data object to pass
     * @throw Error if failure to go to activity
     * @public
     */
    gotoActivity :  function(sActivityId, sViewId, sNamespace, oData) {

        var oActivityConfig = util.Activity.getMobileConfiguration(sActivityId);
        if (!oActivityConfig) {
            // 16008.simple=Activity %ACTIVITY_BO.(1)% not defined
            var oProperties = jQuery.sap.properties();
            oProperties.setProperty("%ACTIVITY_BO.(1)%", sActivityId);
            var message = util.I18NUtility.getErrorText("16008.simple", oProperties);
            throw Error(message);
        }

        var nextView = oActivityConfig.view;
        var nextNamespace = oActivityConfig.namespace;

        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", {
            id : nextView,
            data : {
                namespace : nextNamespace,
                activityId: oActivityConfig.activityId,
                fromViewId: sViewId,
                fromNamespace: sNamespace,
                data: oData
            }
        });
    }
};