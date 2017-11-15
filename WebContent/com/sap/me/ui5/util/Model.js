jQuery.sap.declare("util.Model");
jQuery.sap.require("jquery.sap.storage");

util.Model = {

    /**
     * Will get JSON data from local storage using input key.
     *
     * @param key unique key to use to store data to
     */
    getData :  function(key) {
        var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        return oStorage.get(key);
    },

    /**
     * Will store data into local storage using input key.
     *
     * @param key unique key to use to store data to
     * @param data JSON formatted data to store
     */
    setData :  function(key, data) {
        var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        oStorage.put(key, data);
    },

    /**
     * Will remove data into local storage using input key.
     *
     * @param key unique key to use to remove data
     */
    removeData :  function(key) {
        var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        oStorage.remove(key);
    },

    /**
     * Will remove all local storage data.
     */
    clearAllData :  function() {
        var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        oStorage.clear();
    },

    /**
     * Sets whether unsaved data currently exists in model
     *
     * @param bUnsaved boolean true if unsaved data exists, else false
     */
    setUnsavedDataDefined :  function(bUnsaved) {
        this.setData("UnsavedDataDefinedState", bUnsaved);
    },

    /**
     * Sets whether unsaved data currently exists in model
     *
     * @return true if unsaved data exists; else false
     */
    isUnsavedDataDefined :  function() {
        return this.getData("UnsavedDataDefinedState");
    },

    /**
     * Gets the data assigned to a
     *
     * @param  oData array of {sap.ui.core.CustomData} objects
     * @param  sKey Key of data to get
     * @return if found returns the value associated with key, else undefined if not found
     */
    getCustomDataValue : function(oData, sKey) {
        var oCustomData = this.findCustomData(oData, sKey);
        if (oCustomData) {
            return oCustomData.getValue();
        }
        return undefined;
    },

    /**
     * Sets the data assigned to a
     *
     * @param  oData array of {sap.ui.core.CustomData} objects
     * @param  sKey Key of data to set
     * @param  oValue data to set into custom data
     */
    setCustomDataValue : function(oData, sKey, oValue) {
        var oCustomData = this.findCustomData(oData, sKey);
        if (oCustomData) {
            oCustomData.setValue(oValue);
        }
    },

    /**
     * Finds the {sap.ui.core.CustomData} object assigned to the key
     *
     * @param  oData array of {sap.ui.core.CustomData} objects
     * @param  sKey Key of data to get
     * @return {sap.ui.core.CustomData} if found, else undefined if not found
     */
    findCustomData : function(oData, sKey) {
        if (oData && oData.length > 0) {
            for (var i = 0; i < oData.length; i++) {
                if (oData[i].getKey() === sKey) {
                    return oData[i];
                }
            }
        }
        return undefined;
    }

};