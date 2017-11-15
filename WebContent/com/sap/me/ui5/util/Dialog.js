jQuery.sap.declare("util.Dialog");
jQuery.sap.require("util.StringUtil");

util.Dialog = {

    /**
     * creates and displays a floating dialog
     *
     * @param {string} sContent HTML to render in the dialog
     * @param {string} sDialogBkgColor background color for dialog
     * @param {boolean} bShowCloseIcon true to show close icon, else false
     * @param {function} fnAfterShow Optional function to call after dialog is displayed
     * @param {object} oFnContext Optional context for function
     * @param {boolean} bAnimate Optional animation flag (default=true) to animate, else false
     */
    showDialog :  function(sContent, sDialogBkgColor, bShowCloseIcon, fnAfterShow, oFnContext, bAnimate) {

        // if dialog is already displayed, close and restart
        var oDialog = jQuery("#dialogBox");
        if (oDialog.length) {
            setTimeout(function() {
                util.Message.restartDialog(sContent, sDialogBkgColor, fnAfterShow, oFnContext, bAnimate);
            }, 100);
            return;
        }

        if (util.StringUtil.isBlank(sContent)) {
            var sMessage = "Callback function did not return content to render";
            jQuery.sap.log.error("showDialog: " + sMessage);
            util.Message.showMessageBox("showDialog: " + sMessage);
            return;
        }

        var sStyle = undefined;
        if (!util.StringUtil.isBlank(sDialogBkgColor)) {
            sStyle = 'style="background-color: ' + sDialogBkgColor + '"';
        }

        var content = '<div id="dialogBox" class="floatingDialogBox"';
        if (sStyle) {
             content = content + sStyle;
        }
        content = content + '>';
        if (bShowCloseIcon) {
            content = content + '<img id="dialogBoxCloseIcon" class="floatingDialogBoxCloseIcon" src="../themes/sap_me/icons/large/close.png" />';
        }
        content = content + sContent;
        content = content + '</div>';
        jQuery('body').append(content);

        var bIsAnimated = true;
        if (bAnimate === false) {
            bIsAnimated = false;
        }
        jQuery("#dialogBox").data("animated", bIsAnimated);

        setTimeout(function() {
            util.Dialog.animateShow(fnAfterShow, oFnContext);
        }, 100);
    },

    /**
     * closes the message box
     */
    closeDialog :  function() {
        var oDialog = jQuery("#dialogBox");
         if (oDialog.length) {
             var bIsAnimated = oDialog.data("animated");
             if (bIsAnimated) {
                 oDialog.animate({ opacity:0 }, "slow");
             }
             setTimeout(util.Dialog.removeDialog, 100);
         }
    },

    /*
     * animates the message box to display
     *
     * @private
     */
    animateShow :  function(fnAfterShow, oFnContext) {
        var oDialog = jQuery("#dialogBox");
        if (oDialog) {
            var bIsAnimated = oDialog.data("animated");
            if (bIsAnimated) {
                oDialog.animate({opacity:1},{queue: false, duration: 350});
            }
        }

        // event handler to close messagebox
        jQuery(document).on("click", "#dialogBoxCloseIcon", function(e) { util.Dialog.closeDialog(); });

        if (fnAfterShow) {
            fnAfterShow.call(oFnContext);
        }
    },

    /*
     * removes the message box from the dom
     * @private
     */
    removeDialog :  function() {
        jQuery(document).off("click", "#dialogBoxCloseIcon", false);
        jQuery("#dialogBox").remove();
    },

    /*
     * closes and recalls showDialog
     * @private
     */
    restartDialog :  function(sContent, sDialogBkgColor, fnAfterShow, oFnContext, bAnimate) {
        var oDialog = jQuery("#dialogBox");
         if (oDialog.length) {
            jQuery(document).off("click", "#dialogBoxCloseIcon", false);
            jQuery("#dialogBox").remove();
            setTimeout(function() {
                util.Message.util.showDialog(sContent, sDialogBkgColor, fnAfterShow, oFnContext, bAnimate);
            }, 100);
         }
    }
};