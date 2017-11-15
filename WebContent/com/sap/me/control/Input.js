jQuery.sap.declare("com.sap.me.control.Input");
jQuery.sap.require("com.sap.me.control.InputRenderer");
jQuery.sap.require("sap.m.Input");

sap.m.Input.extend("com.sap.me.control.Input", {
    metadata : {
        properties : {
            "showBrowse" : {type : "boolean", group : "Behavior", defaultValue : false},
            "showClear" : {type : "boolean", group : "Behavior", defaultValue : false},
            "upperCase" : {type : "boolean", group : "Behavior", defaultValue : false}
        },
        events : {
            "browseTap" : {},
            "clearTap" : {}
        }
    },

    init: function() {
        if (sap.m.Input.prototype.init) {   // check whether superclass has an init() method
            sap.m.Input.prototype.init.apply(this, arguments);  // call super.init()
        }
    },

    renderer: "com.sap.me.control.InputRenderer",

    onBeforeRendering: function() {

        if (sap.m.Input.prototype.onBeforeRendering) {
            sap.m.Input.prototype.onBeforeRendering.apply(this, arguments);
        }

        jQuery.sap.byId(this.getId() + "-inner").unbind("keydown", this._inputKeyDown);
        jQuery.sap.byId(this.getId() + "__clri").unbind("click", this._inputFieldClick);
    },

    onAfterRendering: function() {

        if (sap.m.Input.prototype.onAfterRendering) {
            sap.m.Input.prototype.onAfterRendering.apply(this, arguments);
        }

        // set up for managing clear button
        var that = this;
        jQuery.sap.byId(this.getId() + "-inner").bind("keydown", jQuery.proxy(this._inputKeyDown, this));
        jQuery.sap.byId(this.getId() + "__clri").bind("click", jQuery.proxy(this._inputFieldClick, this));

        // show clear button if text exists
        var bShowClear = true;
        if (util.StringUtil.isBlank(this.getValue())) {
             bShowClear = false;
        }
        this._setClearVisibility(bShowClear);
    },

    exit: function() {

        jQuery.sap.byId(this.getId() + "-inner").unbind("keydown", this._inputKeyDown);
        jQuery.sap.byId(this.getId() + "__clri").unbind("click", this._inputFieldClick);

        if (this._oClearIcon) {
            this._oClearIcon.destroy();
            this._oClearIcon = null;
        }

        if (this._oBrowseIcon) {
            this._oBrowseIcon.destroy();
            this._oBrowseIcon = null;
        }

        if (sap.m.Input.prototype.exit) {
            sap.m.Input.prototype.exit.apply(this, arguments);
        }
    },

    setValue: function(sValue) {

        var sUpdateValue = sValue;
        if (this.getUpperCase() && !util.StringUtil.isBlank(sValue)) {
            sUpdateValue = sValue.toUpperCase();
        }
        if (sap.m.Input.prototype.setValue) {
            sap.m.Input.prototype.setValue.apply(this, [sUpdateValue]);
        }
        if (this.getEditable()) {
            if (util.StringUtil.isBlank(sUpdateValue)) {
                this._setClearVisibility(false);
            } else {
                this._setClearVisibility(true);
            }
        } else {
            this._setClearVisibility(false);
            this._setBrowseVisibility(false);
        }
    },

    getValue: function() {
        var sValue = undefined;
        if (sap.m.Input.prototype.getValue) {
            sValue = sap.m.Input.prototype.getValue.apply(this);
        }
        if (this.getUpperCase() && !util.StringUtil.isBlank(sValue)) {
            sValue = sValue.toUpperCase();
        }
        return sValue;
    },

    setEnabled: function(bEnabled) {
        if (sap.m.Input.prototype.setEnabled) {
            sap.m.Input.prototype.setEnabled.apply(this, [bEnabled]);
        }

        var bShowClear = bEnabled;
        if (bShowClear) {
            if (util.StringUtil.isBlank(this.getValue())) {
                 bShowClear = false;
            }
        }

        if (this._oClearIcon) {
            this._setClearVisibility(bShowClear);
        }
        if (this._oBrowseIcon) {
            this._setBrowseVisibility(bEnabled);
        }
    },

    setEditable: function(bEditable) {
        if (sap.m.Input.prototype.setEditable) {
            sap.m.Input.prototype.setEditable.apply(this, [bEditable]);
        }
        if (this._oClearIcon) {
            this._setClearVisibility(bEditable);
        }
        if (this._oBrowseIcon) {
            this._setBrowseVisibility(bEditable);
        }
    },

    setVisible: function(bVisible) {
        if (sap.m.Input.prototype.setVisible) {
            sap.m.Input.prototype.setVisible.apply(this, [bVisible]);
        }
        this._setClearVisibility(bVisible);
        this._setBrowseVisibility(bVisible);
    },

    _inputKeyDown: function (oEvent) {
        if (this._oClearIcon) {
            var ival = jQuery.sap.delayedCall(32, this, this._setFieldVisibility, [oEvent]);
        }
    },

    _setFieldVisibility: function (oEvent) {

        if (this._oClearIcon) {

            // get value from dom
            var sValue = undefined;
            var oDomInput = jQuery.sap.domById(this.getId() + "-inner");
            if (oDomInput) {
                sValue = oDomInput.value
            }
            if (util.StringUtil.isBlank(sValue)) {
                this._setClearVisibility(false);
            } else {
                this._setClearVisibility(true);
            }
        }
    },

    _inputFieldClick: function (oEvent) {
        if (this._oClearIcon) {
            var oInputControl = jQuery("#" + this.getId() + "-inner");
            var sValue = oInputControl.val();
            if (util.StringUtil.isBlank(sValue)) {
                this._setClearVisibility(false);
            }
        }
    },

    _setClearVisibility: function (bShow) {
        if (!bShow) {
            jQuery.sap.byId(this.getId() + "__clrb").hide();
            jQuery.sap.byId(this.getId() + "__clri").hide();
            this.bClearVisible = false;
        } else {
            jQuery.sap.byId(this.getId() + "__clri").show();
            jQuery.sap.byId(this.getId() + "__clrb").show();
            this.bClearVisible = true;
        }
    },

    _setBrowseVisibility: function (bShow) {
        if (!bShow) {
            jQuery.sap.byId(this.getId() + "__brwseb").hide();
            jQuery.sap.byId(this.getId() + "__brwse").hide();
            this.bBrowseVisible = false;
        } else {
            jQuery.sap.byId(this.getId() + "__brwse").show();
            jQuery.sap.byId(this.getId() + "__brwseb").show();
            this.bBrowseVisible = true;
        }
    },

    _getClearIcon: function () {
        var that = this;

        if (!this._oClearIcon) {

           this._oClearIcon = sap.ui.core.IconPool.createControlByURI({
                id: this.getId() + "__clri",
                src: sap.ui.core.IconPool.getIconURI("decline"),
                tap: [that._clearTap, that]
            }, sap.m.Image);

            this._oClearIcon.addStyleClass("sapMInputClearIcon");
        }
        return this._oClearIcon;
    },

    _getBrowseIcon: function () {
        var that = this;

        if (!this._oBrowseIcon) {

           this._oBrowseIcon = sap.ui.core.IconPool.createControlByURI({
                id: this.getId() + "__brwse",
                src: sap.ui.core.IconPool.getIconURI("search"),
                tap: [that._browseTap, that]
           }, sap.m.Image);

           this._oBrowseIcon.addStyleClass("sapMInputBrowseIcon");
        }
        return this._oBrowseIcon;
    },

    _clearTap: function(oEvent) {
        this.setValue("");
        var elem =  sap.ui.getCore().byId(this.getId());
        if (elem) {
            elem.focus();
        }
        this.fireClearTap();
    },

    _browseTap: function (oEvent) {
        if (this._oBrowseIcon) {
            this.fireBrowseTap();
        }
    }

});