jQuery.sap.declare("util.Activity");

jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.IOUtil");

util.Activity = {

    /**
     * Gets the activity rules for the input activity id
     *
     * @param {string} sActivityId Activity to get rules for
     * @return array of rules "{attribute: "&sRule", value : &sRuleValue}", undefined if sActivityId is not defined
     * @public
     */
    getRules :  function(sActivityId) {
        if (util.StringUtil.isBlank(sActivityId)) {
            jQuery.sap.log.error("Activity.getRules: sActivityId is undefined");
            return undefined;
        }
        var url =  "/manufacturing-odata/AppConfig.svc/GetActivityRules?ActivityId='" + sActivityId + "'";
        return util.IOUtil.getODataRequestResults(url, false);
    },

    /**
     * Gets the activity configuration for the input activity id
     *
     * @param {string} sActivityId Activity to get rules for
     * @return activity configuration if found, else undefined
     * <pre>
     *       {
     *           "activityRef": activity reference,
     *           "activityId":  activity ID,
     *           "activityType": activity type,
     *           "description": activity description,
     *           "classOrProgram": activity class or program
     *      }
     * </pre>
     * @throws error if activity not found or no permissions to activity
     * @public
     */
    getConfiguration :  function(sActivityId) {
        if (util.StringUtil.isBlank(sActivityId)) {
            jQuery.sap.log.error("Activity.getConfiguration: sActivityId is undefined");
            return undefined;
        }
        var url =  "/manufacturing-odata/AppConfig.svc/GetActivityConfiguration?ActivityId='" + sActivityId + "'";
        var aResults = util.IOUtil.getODataRequestResults(url, false);
        if (aResults && jQuery.type(aResults) === "array"  && aResults.length == 1) {
            return aResults[0];
        }
        return undefined;
    },

    /**
     * Gets the Mobile activity configuration for the input activity id
     *
     * @param {string} sActivityId Activity to get rules for
     * @return activity configuration if found, else undefined
     * <pre>
     *       {
     *           "activityRef": activity reference,
     *           "activityId":  activity ID,
     *            "activityType": activity type,
     *           "description": activity description,
     *           "namespace": activity namespace,
     *           "view": activity view name
     *      }
     * </pre>
     * @throws error if activity not found, no permissions to activity or not supported by mobile
     * @public
     */
    getMobileConfiguration :  function(sActivityId) {
        if (util.StringUtil.isBlank(sActivityId)) {
            jQuery.sap.log.error("Activity.getMobileConfiguration: sActivityId is undefined");
            return undefined;
        }
        var url =  "/manufacturing-odata/AppConfig.svc/GetMobileActivityConfiguration?ActivityId='" + sActivityId + "'";
        var aResults = util.IOUtil.getODataRequestResults(url, false);
        if (aResults && jQuery.type(aResults) === "array"  && aResults.length == 1) {
            return aResults[0];
        }
        return undefined;
    }
};