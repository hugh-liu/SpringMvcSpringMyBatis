jQuery.sap.declare("com.sap.me.framework.view.Executable");

jQuery.sap.require("sap.ui.base.ManagedObject");

sap.ui.base.ManagedObject.extend("com.sap.me.framework.view.Executable", {
    metadata : {
      "abstract" : true,
        publicMethods : [ "execute", "getActivityId", "getViewId", "getNamespace", "setActivityId", "setViewId", "setNamespace"],
        properties : {
            "viewId" : {type : "string", group : "Behavior", defaultValue : null},
            "namespace" : {type : "string", group : "Behavior", defaultValue : null},
            "activityId" :  {type : "string", group : "Behavior", defaultValue : null},
            "data" : {type : "object", group : "Misc", defaultValue : null}
        }
    },
    constructor : function(sId, mSettings) {
        sap.ui.base.ManagedObject.apply(this, arguments);
    },
    renderer : null // Executable has no renderer
});

/**
 * @see sap.ui.base.Object#getInterface
 * @public
 */
com.sap.me.framework.view.Executable.prototype.getInterface = function() {
    return this;
};

/**
 * Starts execution
 * @throws Error if fatal issue occurs
 * @public
 */
com.sap.me.framework.view.Executable.prototype.execute = function () {
};

/**
 * Gets this activities activity id
 *
 * @returns this activities activity id
 * @public
 */
com.sap.me.framework.view.Executable.prototype.getActivityId = function() {
    return this.getProperty("activityId");
};

/**
 * Sets this activities activity id
 *
 * @param {string} sActivityId this activities id
 * @public
 */
com.sap.me.framework.view.Executable.prototype.setActivityId = function(sActivityId) {
    this.setProperty("activityId", sActivityId, false);
};

/**
 * Gets the callers view id
 *
 * @return {string} view id of caller
 * @public
 */
com.sap.me.framework.view.Executable.prototype.getViewId = function() {
    return this.getProperty("viewId");
};

/**
 * Sets the callers view id
 *
 * @param {string} sViewId view id of caller
 * @public
 */
com.sap.me.framework.view.Executable.prototype.setViewId = function(sViewId) {
    this.setProperty("viewId", sViewId, false);
};

/**
 * Gets the namespace of the calling view
 *
 * @return {string} namespace of calling view
 * @public
 */
com.sap.me.framework.view.Executable.prototype.getNamespace = function() {
    return this.getProperty("namespace");
};

/**
 * Sets the namespace of the calling view
 *
 * @param {string} sNamespace of calling view
 * @public
 */
com.sap.me.framework.view.Executable.prototype.setNamespace = function(sNamespace) {
    this.setProperty("namespace", sNamespace, false);
};

/**
 * Gets the data object passed via the navigation handler
 *
 * @return {object} data object
 * @public
 */
com.sap.me.framework.view.Executable.prototype.getData = function() {
    return this.getProperty("data");
};

/**
 * Sets the data object passed via the navigation handler
 *
 * @param {object} oData
 * @public
 */
com.sap.me.framework.view.Executable.prototype.setData = function(oData) {
    this.setProperty("data", oData, false);
};
