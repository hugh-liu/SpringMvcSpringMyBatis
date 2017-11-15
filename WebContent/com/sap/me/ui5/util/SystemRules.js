jQuery.sap.declare("util.SystemRules");

jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.IOUtil");

util.SystemRules = {

    /**
     * Returns the system rule for the given key sKey.
     *
     * @param {string} sKey
     * @return {string} The system rule belonging to the key, if found; otherwise undefined if not found
     */
    getRule :  function(sKey) {

        if (util.StringUtil.isBlank(sKey)) {
            return undefined;
        }

        var aKeys = [];
        aKeys[0] = sKey;
        var oResults = this.getRules(aKeys);
        if (oResults && oResults.length == 1) {
            return oResults[0].value;
        }

        return undefined;
    },

    /**
     * Returns the system rules for the keys passed in.  Can optionally pass an array
     * of contexts in case you have overrides at the context specified.
     *
     * @param {array} aKeys Array of keys to get rules for
     * @param {array} aContexts Optional array of contexts in case you have overrides at the context specified
     * @return {array} Array of objects "{attribute: "&sKey", value : &value}", undefined if no key exists
     */
    getRules :  function(aKeys, aContexts) {

        if (!aKeys || aKeys.length == 0) {
            jQuery.sap.log.error("SystemRules.getRules: aKeys is undefined");
            return undefined;
        }

        // load up the keys
        var sKeys = "";
        for (var i = 0; i < aKeys.length; i++) {
            if (!util.StringUtil.isBlank(aKeys[i])) {
                if (!util.StringUtil.isBlank(sKeys)) {
                    sKeys = sKeys + "~";
                }
                sKeys = sKeys + aKeys[i];
            }
        }
        if (util.StringUtil.isBlank(sKeys)) {
            return undefined;
        }

        // load up the optional contexts
        var sContexts = "";
        if (aContexts && aContexts.length > 0) {
            for (var i = 0; i < aContexts.length; i++) {
                if (!util.StringUtil.isBlank(aContexts[i])) {
                    if (!util.StringUtil.isBlank(sContexts)) {
                        sContexts = sContexts + "~";
                    }
                    sContexts = sContexts + aContexts[i];
                }
            }
        }

        // set up the parameter
        var parameters="?Names='" + sKeys + "'";

        if (!util.StringUtil.isBlank(sContexts)) {
            parameters=parameters + "&Ctxs='" + sContexts + "'";
        }

        // get value from server
        var oValue = util.IOUtil.remoteRequest("/manufacturing-odata/AppConfig.svc/GetSystemRules" + parameters, "GET", null, this.successCallback, this.errorCallback, this);

        // if not defined here, check if found by callback
        if (!oValue) {
            oValue = util.Model.getData("SystemRulesResultsValue");
        }
        util.Model.removeData("SystemRulesResultsValue");

        // if found, return results array
        if (oValue && oValue.d && oValue.d.results) {
            return oValue.d.results;
        }

        // not found, return key
        return undefined;
    },

    successCallback : function(oData) {
         //jQuery.sap.log.debug("SystemRules.successCallback: oData = " + oData);
         util.Model.setData("SystemRulesResultsValue", oData);
    },

    errorCallback : function(errorCode, errorMessage) {
         jQuery.sap.log.error("SystemRules.errorCallback: " + errorMessage);
         if (errorMessage) {
             util.Model.removeData("SystemRulesResultsValue");
         }
    }
};