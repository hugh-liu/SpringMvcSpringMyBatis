jQuery.sap.declare("com.sap.me.control.TextArea");
jQuery.sap.require("com.sap.me.control.TextAreaRenderer");
jQuery.sap.require("sap.m.TextArea");

sap.m.TextArea.extend("com.sap.me.control.TextArea", {
    metadata : {
        properties : {
            "showClear" : {type : "boolean", group : "Behavior", defaultValue : false},
            "valueStateText" : {type : "string", group : "Misc", defaultValue : null},
            "showValueStateMessage" : {type : "boolean", group : "Misc", defaultValue : true}
        },
        events : {
            "clearTap" : {}
        }
    },

    init: function() {
        if (sap.m.TextArea.prototype.init) {   // check whether superclass has an init() method
            sap.m.TextArea.prototype.init.apply(this, arguments);  // call super.init()
        }
    },

    renderer: "com.sap.me.control.TextAreaRenderer",

    onBeforeRendering: function() {

        if (sap.m.TextArea.prototype.onBeforeRendering) {
            sap.m.TextArea.prototype.onBeforeRendering.apply(this, arguments);
        }

        jQuery.sap.byId(this.getId() + "-inner").unbind("keydown", this._inputKeyDown);
        jQuery.sap.byId(this.getId() + "__clri").unbind("click", this._inputFieldClick);
    },

    onAfterRendering: function() {

        if (sap.m.TextArea.prototype.onAfterRendering) {
            sap.m.TextArea.prototype.onAfterRendering.call(this);
        }

        var that = this;
        jQuery.sap.byId(this.getId() + "-inner").bind("keydown", jQuery.proxy(this._inputKeyDown, this));
        jQuery.sap.byId(this.getId() + "__clri").bind("click", jQuery.proxy(this._inputFieldClick, this));
        jQuery.sap.byId(this.getId() + "__clri").hide();

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

        if (sap.m.TextArea.prototype.exit) {
            sap.m.TextArea.prototype.exit.apply(this, arguments);
        }
    },

    setValue: function(sValue) {
        if (sap.m.TextArea.prototype.setValue) {
            sap.m.TextArea.prototype.setValue.apply(this, [sValue]);
        }
        if (this.getEditable()) {
            if (util.StringUtil.isBlank(sValue)) {
                this._setClearVisibility(false);
            } else {
               this._setClearVisibility(true);
            }
        } else {
            this._setClearVisibility(false);
        }
    },

    setEnabled: function(bEnabled) {
        if (sap.m.TextArea.prototype.setEnabled) {
            sap.m.TextArea.prototype.setEnabled.apply(this, [bEnabled]);
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
    },

    setEditable: function(bEditable) {
        if (sap.m.TextArea.prototype.setEditable) {
            sap.m.TextArea.prototype.setEditable.apply(this, [bEditable]);
        }
        if (this._oClearIcon) {
            this._setClearVisibility(bEditable);
        }
    },

    setVisible: function(bVisible) {
        if (sap.m.TextArea.prototype.setVisible) {
            sap.m.TextArea.prototype.setVisible.apply(this, [bVisible]);
        }
        this._setClearVisibility(bVisible);
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
            var oDomTextArea = jQuery.sap.domById(this.getId() + "-inner");
            if (oDomTextArea) {
                sValue = oDomTextArea.value
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
            var oTextAreaControl = jQuery("#" + this.getId() + "-inner");
            var sValue = oTextAreaControl.val();
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

    _getClearIcon: function () {
        var that = this;

        if (!this._oClearIcon) {

           this._oClearIcon = sap.ui.core.IconPool.createControlByURI({
                id: this.getId() + "__clri",
                src: sap.ui.core.IconPool.getIconURI("decline"),
                tap: [that._clearTap, that]
            }, sap.m.Image);

            this._oClearIcon.addStyleClass("sapMTextAreaClearIcon");
        }
        return this._oClearIcon;
    },

    _clearTap: function(oEvent) {
        this.setValue("");
        var elem =  sap.ui.getCore().byId(this.getId());
        if (elem) {
            elem.focus();
        }
        this.fireClearTap();
    }

});
(function(){

    function closeMessage(oInput){
        if(oInput._popup){
            oInput._popup.close();
        }
    };

    function openMessage(oInput){
        var oState = oInput.getValueState();

        if (oInput.getShowValueStateMessage() && oState && ((oState === sap.ui.core.ValueState.Warning)
                || (oState === sap.ui.core.ValueState.Error)) && oInput.getEnabled() && oInput.getEditable()) {
            var sText = oInput.getValueStateText();
            if(!sText){
                sText = sap.ui.core.ValueStateSupport.getAdditionalText(oInput);
            }
            if(!sText){
                return;
            }

            var messageId = oInput.getId()+"-message";
            if(!oInput._popup){
                jQuery.sap.require("sap.ui.core.Popup");
                jQuery.sap.require("jquery.sap.encoder");
                oInput._popup = new sap.ui.core.Popup("<span></span>" /*Just some dummy*/, false, false, false);
                oInput._popup.attachClosed(function(){
                    jQuery.sap.byId(messageId).remove();
                });
            }

            var $Input = jQuery(oInput.getFocusDomRef());
            var dock = sap.ui.core.Popup.Dock;
            var bIsRightAligned = $Input.css("text-align") === "right";

            var sClass = "sapMInputMessage " + ((oState === sap.ui.core.ValueState.Warning) ? "sapMInputMessageWarning" : "sapMInputMessageError");

            oInput._popup.setContent(jQuery("<div style=\"max-width:"+$Input.outerWidth()+"px;\" class=\""+sClass+"\" id=\""+messageId+"\"><span id=\""+messageId+"-text\">"+jQuery.sap.encodeHTML(sText)+"</span></div>"));

            oInput._popup.close(0);
            oInput._popup.open(
                    200,
                    bIsRightAligned ? dock.EndTop : dock.BeginTop,
                    bIsRightAligned ? dock.EndBottom : dock.BeginBottom,
                    oInput.getFocusDomRef(),
                    null,
                    null,
                    function(){
                        oInput._popup.close();
                    }
            );
        }
    };

    com.sap.me.control.TextArea.prototype.setValueState = function(sValueState) {
        var sOldValueState = this.getValueState();

        sap.m.InputBase.prototype.setValueState.apply(this, arguments);

        var sNewValueState = this.getValueState();

        if(this.getDomRef() && sNewValueState != sOldValueState && this.getFocusDomRef() === document.activeElement){
            switch(sNewValueState){
                case sap.ui.core.ValueState.Error:
                case sap.ui.core.ValueState.Warning:
                    openMessage(this);
                    break;
                default:
                    closeMessage(this);
            }

        }

        return this;
    };

    com.sap.me.control.TextArea.prototype.setValueStateText = function(sText) {
        jQuery.sap.byId(this.getId()+"-message-text").text(sText);
        return this.setProperty("valueStateText", sText, true);
    };

    com.sap.me.control.TextArea.prototype.onfocusin = function(oEvent) {
        openMessage(this);
    };

    com.sap.me.control.TextArea.prototype.onkeydown = function(oEvent) {
        closeMessage(this);
    };

    com.sap.me.control.TextArea.prototype.onfocusout = function(oEvent) {
        closeMessage(this);
    };

})();
