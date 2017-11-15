
jQuery.sap.declare("com.sap.me.control.TextAreaRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("sap.m.TextAreaRenderer");

/**
 * @class TextArea renderer.
 * @static
 */
com.sap.me.control.TextAreaRenderer = {};

/**
 * @class Input renderer.
 * @static
 *
 * TextAreaRenderer extends the TextAreaRenderer
 */
com.sap.me.control.TextAreaRenderer = sap.ui.core.Renderer.extend(sap.m.TextAreaRenderer);

// Adds control specific class
com.sap.me.control.TextAreaRenderer.addOuterStyles = function(oRm, oControl) {
    oRm.addStyle('display', 'table');
};

com.sap.me.control.TextAreaRenderer.addInnerClasses = function(oRm, oControl) {
    oRm.addClass("sapMExtendedInput");
};

// Write the closing tag name of the TextArea
com.sap.me.control.TextAreaRenderer.closeInputTag = function(oRm, oControl) {
    oRm.write("</textarea>");
    if (oControl.getShowClear() && oControl.getEnabled() && oControl.getEditable()) {
        oRm.write('<div id="' + oControl.getId() + '__clrb" class="sapMTextAreaClearBtn">');
        oRm.renderControl(oControl._getClearIcon());
        oRm.write("</div>");
        oControl.bClearVisible = true;
    } else {
        oControl.bClearVisible = false;
    }
};
