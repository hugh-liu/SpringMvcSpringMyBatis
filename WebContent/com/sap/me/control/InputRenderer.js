
jQuery.sap.declare("com.sap.me.control.InputRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("sap.m.InputRenderer");

/**
 * @class Input renderer.
 * @static
 */
com.sap.me.control.InputRenderer = {};

/**
 * @class Input renderer.
 * @static
 *
 * InputRenderer extends the InputRenderer
 */
com.sap.me.control.InputRenderer = sap.ui.core.Renderer.extend(sap.m.InputRenderer);

// Adds control specific class
com.sap.me.control.InputRenderer.addOuterStyles = function(oRm, oControl) {
    if (!oControl.getWidth()) {
        oRm.addStyle("width", "100%");
    }
    oRm.addStyle('display', 'table');
};

com.sap.me.control.InputRenderer.addInnerClasses = function(oRm, oControl) {
    oRm.addClass("sapMExtendedInput");
    if(oControl.getUpperCase()) {
        oRm.addClass("sapMInputUpperCase");
    }
};

// Write the closing tag name of the TextArea
com.sap.me.control.InputRenderer.closeInputTag = function(oRm, oControl) {
    oRm.write("</input>");
    if (oControl.getShowBrowse() && oControl.getEnabled()) {
        oRm.write('<div id="' + oControl.getId() + '__brwseb" class="sapMInputBrowseBtn">');
        oRm.renderControl(oControl._getBrowseIcon());
        oRm.write("</div>");
        oControl.bBrowseVisible = true;
    } else {
        oControl.bBrowseVisible = false;
    }
    if (oControl.getShowClear() && oControl.getEnabled() && oControl.getEditable()) {
        oRm.write('<div id="' + oControl.getId() + '__clrb" class="sapMInputClearBtn">');
        oRm.renderControl(oControl._getClearIcon());
        oRm.write("</div>");
        oControl.bClearVisible = true;
    } else {
        oControl.bClearVisible = false;
    }
};
