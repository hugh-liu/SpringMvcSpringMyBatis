jQuery.sap.declare("util.Message");

util.Message = {

    /**
     * creates and adds a floating message box to the screen
     *
     * @param {string} sMessage Message to show
     * @param {string} sTitleKey Optional key to title text
     * @param {boolean} bAnimate Optional animation flag (default=true) to animate, else false
     */
    showMessageBox :  function(sMessage, sTitleKey, bAnimate) {
        var oMessageBox = jQuery("#msgBox");
        if (oMessageBox.length) {
            jQuery("#msgBoxText").html(sMessage);
            util.Message.animateShow();
        } else {
            var content = '<div id="msgBox" class="floatingMsgBox">';
            content = content + '<div class="floatingMsgBoxHeader">';
            if (!util.StringUtil.isBlank(sTitleKey)) {
                content = content + '    <label id="floatingMsgBoxHeaderLabel" class="floatingMsgBoxHeaderText" >';
                content = content + util.I18NUtility.getLocaleSpecificText(sTitleKey);
                content = content + '</label>';
            }
            content = content + '<img id="msgBoxCloseIcon" class="floatingMsgBoxCloseIcon" src="../themes/sap_me/icons/large/close.png" />';
            content = content + '</div>';
            content = content + '<span id="msgBoxText" dir="Inherit" class="floatingMsgBoxText">';
            content = content + '</span></div>';
            jQuery('body').append(content);

            // add html text
            jQuery('#msgBoxText').html(sMessage);

            var bIsAnimated = true;
            if (bAnimate === false) {
                bIsAnimated = false;
            }
            jQuery("#msgBox").data("animated", bIsAnimated);

            setTimeout(util.Message.animateShow, 100);
        }
    },

    /**
     * creates and adds a floating message toast to the screen
     * This by default is always animated
     *
     * @param {string} sMessage Message to show
     * @param {integer} iDelay number of milleseconds to display
     * @param {string} sTitleKey Optional key to title text
     */
    showMessageToast :  function(sMessage, iDelay, sTitleKey) {
        var oMessageBox = jQuery("#msgBox");
        if (oMessageBox.length) {
            jQuery("#msgBoxText").html(sMessage);
            util.Message.animateShow();
        } else {
            var content = '<div id="msgBox" class="floatingMsgBox">';

            content = content + '<div class="floatingMsgBoxHeader">';
            if (!util.StringUtil.isBlank(sTitleKey)) {
                content = content + '    <label id="floatingMsgBoxHeaderLabel" class="floatingMsgBoxHeaderText" >';
                content = content + util.I18NUtility.getLocaleSpecificText(sTitleKey);
                content = content + '</label>';
            }
            content = content + '</div>';

            content = content + '<span id="msgBoxText" dir="Inherit" class="floatingMsgBoxText">';

            content = content + '</span></div>';
            jQuery('body').append(content);

            // add html text
            jQuery('#msgBoxText').html(sMessage);

            jQuery("#msgBox").data("animated", true);

            setTimeout(function() {
                util.Message.animateShow(iDelay);
            }, 100);
        }
    },

    /**
     * closes the message box
     */
    closeMessageBox :  function() {
        var oMessageBox = jQuery("#msgBox");
         if (oMessageBox.length) {
             var bIsAnimated = oMessageBox.data("animated");
             if (bIsAnimated) {
                 oMessageBox.animate({ opacity:0 }, "slow");
             }
             setTimeout(util.Message.removeMessageBox, 100);
         }
    },

    /*
     * animates the message box to display
     *
     * @param {integer} iDelay number of milleseconds to display
     * @private
     */
    animateShow :  function(iDelay) {

        var oMessageBox = jQuery("#msgBox");
        if (oMessageBox) {
            var bIsAnimated = oMessageBox.data("animated");
            if (bIsAnimated) {
                oMessageBox.animate({opacity:1},{queue: false, duration: 350});
            }
        }

        // event handler to close messagebox
        if (!iDelay) {
            jQuery(document).on("click", "#msgBoxCloseIcon", function(e) { util.Message.closeMessageBox(); });

        // set to close after input delay
        } else {
            setTimeout(util.Message.closeMessageBox, iDelay);
        }
    },

    /*
     * removes the message box from the dom
     * @private
     */
    removeMessageBox :  function() {
        jQuery(document).off("click", "#msgBoxCloseIcon", false);
        jQuery("#msgBox").remove();
    },
    
    /**
     * Adds a Notification Message to the Notification Message Queue.
     *
     * @param {string} sTopic topic name for message to send
     * @param {string} sComments Optional comments to send
     * @param {jQuery.sap.util.Properties} [oProperties] Map of optional name / value pairs to send.
     */
    addNotificationMessage :  function(sTopic, sComments, oProperties) {
        if (!sTopic) {
            jQuery.sap.log.error("Message.addNotificationMessage: sTopic is undefined");
            return;
        }

        // set up message bundle type to get text from
        var parameters="?topic='" + sTopic + "'";
        if (sComments && sComments.length > 0) {
            parameters = parameters + "&comments='" + sComments + "'";
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

        // add notification message
        util.IOUtil.remoteRequest("/manufacturing-odata/Message.svc/addNotificationMessage" + parameters, "GET", null, this.successCallback, this.errorCallback, this);
    },

    successCallback : function(oData) {
         //jQuery.sap.log.debug("I18NUtility.successCallback: oData = " + oData);
    },

    errorCallback : function(errorCode, errorMessage) {
         jQuery.sap.log.error("I18NUtility.errorCallback: " + errorMessage);
    }
};