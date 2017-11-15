jQuery.sap.declare("util.I18NUtility");

util.I18NUtility = {

    /**
     * Returns a locale-specific string value for the given key sKey.
     *
     * The text is searched in this resource bundle according to the fallback chain described in
     * {@link jQuery.sap.util.ResourceBundle}. If no text could be found, the key itself is used as text.
     *
     * If text parameters are given, then any occurrences of the pattern "{<i>n</i>}" with <i>n</i> being an integer
     * are replaced by the parameter value with index <i>n</i>.  Note: This replacement is also applied if no text had been found (key).
     *
     * @param {string} sKey
     * @param {jQuery.sap.util.Properties} [oProperties] Map parameters which should replace the place holders "%...%" tokens in the found locale-specific string value.
     * @return {string} The value belonging to the key, if found; otherwise the key itself.
     */
    getLocaleSpecificText :  function(sKey, oProperties) {
        return this.getText("INFO", sKey, oProperties);
    },

    /**
     * Returns a locale-specific string value for the given error key sKey.
     *
     * The text is searched in this resource bundle according to the fallback chain described in
     * {@link jQuery.sap.util.ResourceBundle}. If no text could be found, the key itself is used as text.
     *
     * If text parameters are given, then any occurrences of the pattern "%<i>s</i>%" with <i>s</i> being a string value
     * are replaced by the parameter value with key "%<i>s</i>%".  Note: This replacement is also applied if no text had been found (key).
     *
     * @param {string} sKey key in bundle to get value for
     * @param {jQuery.sap.util.Properties} [oProperties] Map parameters which should replace the place holders "%...%" tokens in the found locale-specific string value.
     * @return {string} The value belonging to the key, if found; otherwise the key itself.
     */
    getErrorText :  function(sKey, oProperties) {
        return this.getText("ERROR", sKey, oProperties);
    },

    /**
     * Returns a locale-specific string value for the given key sKey.
     *
     * The text is searched in this resource bundle according to the fallback chain described in
     * {@link jQuery.sap.util.ResourceBundle}. If no text could be found, the key itself is used as text.
     *
     * If text parameters are given, then any occurrences of the pattern "%<i>s</i>%" with <i>s</i> being a string value
     * are replaced by the parameter value with key "%<i>s</i>%".  Note: This replacement is also applied if no text had been found (key).
     *
     * @param {string} sMsgType Type of text to get (eg; "ERROR" or "INFO")
     * @param {string} sKey key in bundle to get value for
     * @param {jQuery.sap.util.Properties} [oProperties] Map parameters which should replace the place holders "%...%" tokens in the found locale-specific string value.
     * @return {string} The value belonging to the key, if found; otherwise the key itself.
     */
    getText :  function(sMsgType, sKey, oProperties) {
        if (!sKey) {
             jQuery.sap.log.error("I18NUtility.getText: sKey is undefined");
            return "";
        }

        // if no parameters try to get result value from cache
        var bCacheValue = false;
        if (!oProperties || oProperties.getKeys().length == 0) {
            bCacheValue = true;
            var oCachedValue = this.getCachedText(sKey);
            if (oCachedValue && oCachedValue.length > 0) {
                //jQuery.sap.log.debug("I18NUtility.getText: cached value for " + sKey + " = " + oCachedValue);
                return oCachedValue;
            } else {
                //jQuery.sap.log.debug("I18NUtility.getText: cached value for " + sKey + " not found");
            }
        }

        // set up message bundle type to get text from
        var parameters="?key='" + sKey + "'";
        if (sMsgType && sMsgType.length > 0) {
            parameters = parameters +  "&msgtype='" + sMsgType + "'";
        }

        // add parameter map if define
        if (oProperties) {
            var aKeys = oProperties.getKeys();
            if (aKeys.length > 0) {
                var oJson = undefined;
                for (var i=0; i<aKeys.length; i++) {
                    var sValue = oProperties.getProperty(aKeys[i]);
                    if (sValue && sValue.length > 0) {
                        if (!oJson) {
                            oJson = {};
                        }
                        oJson[aKeys[i]] = sValue
                    }
                }
                if (oJson) {
                    parameters = parameters +  "&values='" + util.StringUtil.encodeString(JSON.stringify(oJson)) + "'";
                }
            }
        }

        // get value from server
        var oValue = util.IOUtil.remoteRequest("/manufacturing-odata/GapiUtility.svc/LocalizedText" + parameters, "GET", null, this.successCallback, this.errorCallback, this);

        //jQuery.sap.log.debug("I18NUtility.getText(1): oValue for " + sKey + " = " + oValue);

        // if not defined here, check if found by callback
        if (!oValue) {
            oValue = util.Model.getData("LocaleSpecificTextValue");
            //jQuery.sap.log.debug("I18NUtility.getText(2): oValue for " + sKey + " = " + oValue);
        }
        util.Model.removeData("LocaleSpecificTextValue");

        // if found, cache value
        if (oValue) {
            if (oValue.d) {
                var result = oValue.d.LocalizedText;
                if (result) {
                    // convert any html to text (in case result is encoded chinese)
                    oValue = jQuery("<div/>").html(result).text();
                } else {
                    //jQuery.sap.log.error("I18NUtility.getText: oValue.d.LocalizedText is undefined!");
                }
            } else {
                //jQuery.sap.log.error("I18NUtility.getText: oValue.d is undefined!");
            }

            //jQuery.sap.log.debug("I18NUtility.getText: final value for " + sKey + " = " + oValue);
            if (bCacheValue) {
                this.setCachedText(sKey, oValue);
                //jQuery.sap.log.debug("I18NUtility.getText: put value for " + sKey + " into cache");
            }
            return oValue;
        }

        // not found, return key
        return sKey;
    },

    successCallback : function(oData) {
         //jQuery.sap.log.debug("I18NUtility.successCallback: oData = " + oData);
         util.Model.setData("LocaleSpecificTextValue", oData);
    },

    errorCallback : function(errorCode, errorMessage) {
         jQuery.sap.log.error("I18NUtility.errorCallback: " + errorMessage);
         if (errorMessage) {
             util.Model.removeData("LocaleSpecificTextValue");
         }
    },

    /**
     * Returns a locale-specific string value for the given key sKey from cached values
     *
     * @param {string} sKey key in cache to get value for
     * @return {string} The value belonging to the key, if found; otherwise undefined.
     */
    getCachedText :  function(sKey) {
        if (!sKey) {
             jQuery.sap.log.error("I18NUtility.getCachedText: sKey is undefined - bye");
            return undefined;
        }

        var oModel = sap.ui.getCore().getModel("LocalizationModel");
        if (!oModel) {
             //jQuery.sap.log.debug("I18NUtility.getCachedText: oModel is undefined - bye");
            return undefined;
        }

        // get property from model
        if (!oModel.properties) {
            //jQuery.sap.log.debug("I18NUtility.getCachedText: oModel.properties is undefined");
            return undefined;
        }

        // find value for key from properties array
        var oValue = undefined;
        for (var i = 0 ; i < oModel.properties.length ; i ++) {
            if (oModel.properties[i].key === sKey) {
                oValue = oModel.properties[i].value;
                break;
            }
        }

        if (!oValue) {
            //jQuery.sap.log.debug("I18NUtility.getCachedText: value for " + sKey + " is undefined");
            return undefined;
        }
        //jQuery.sap.log.debug("I18NUtility.getCachedText: value for " + sKey + " = " + oValue);
        return  oValue;
    },

    /**
     * Returns a locale-specific string value for the given key sKey from cached values
     *
     * @param {string} sKey key in cache to get value for
     * @param {string} oValue the vlue to place in cache
     */
    setCachedText :  function(sKey, oValue) {
        if (!sKey) {
            jQuery.sap.log.error("I18NUtility.setCachedText: sKey is undefined - bye");
            return;
        }

        var oModel = sap.ui.getCore().getModel("LocalizationModel");
        if (!oModel) {
            oModel = new sap.ui.model.json.JSONModel();
        }

        // update the JSON model
        if (!oModel.properties) {
            oModel.properties = [];
        }

        // find and update existing value for key from existing properties array
        var bUpdated = false;
        for (var i = 0 ; i < oModel.properties.length ; i ++) {
            if (oModel.properties[i].key === sKey) {
                 oModel.properties[i] =oValue;
                 bUpdated = true;
                break;
            }
        }

        // not updated, add to properties array
        if (!bUpdated) {
            oModel.properties[oModel.properties.length] = {
                key : sKey,
                value : oValue
            };
        }

        //jQuery.sap.log.debug("I18NUtility.setCachedText: Set '" + oValue + "' into oModel for key = " + sKey);

        sap.ui.getCore().setModel(oModel, "LocalizationModel");
    }
};