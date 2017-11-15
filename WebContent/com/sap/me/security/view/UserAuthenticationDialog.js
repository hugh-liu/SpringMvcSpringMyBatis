jQuery.sap.declare("com.sap.me.security.view.UserAuthenticationDialog");

jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.IOUtil");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.I18NUtility");
jQuery.sap.require("com.sap.me.security.view.SecurityUtility");
jQuery.sap.require("com.sap.me.control.Input");

/**
 * User Authentication Dialog
 */
com.sap.me.security.view.UserAuthenticationDialog = {

    /**
     * show the User Authentication Dialog
     *
     * @param {object} parameters as defined below
     *  <pre>
     *    {
     *          title: String title to display on dialog
     *          message: Optional String message to display
     *          justifyContent: Justification for message (sap.m.FlexJustifyContent.CENTER is default)
     *          userId: Optional String User ID to initialize input field to
     *          onClose:  fnListenerFunction or [fnListenerFunction, oListenerObject]
     *    }
     *  </pre>
     * @return List of sap.m.CustomListItem controls containing data fields
     */
    show : function(mParams) {
        var sTitle = util.I18NUtility.getLocaleSpecificText("title.login.LABEL");
        var sMessage = "";
        var bMessageVisible = false;
        var justifyContent = sap.m.FlexJustifyContent.Center;
        var sUserId = "";
        var sPassword = "";
        if (mParams) {

            if (!util.StringUtil.isBlank(mParams.title)) {
                sTitle = mParams.title;
            }
            if (!util.StringUtil.isBlank(mParams.message)) {
                sMessage = mParams.message;
                bMessageVisible = true;
            }
            if (mParams.justifyContent) {
                justifyContent = mParams.justifyContent;
            }
            if (!util.StringUtil.isBlank(mParams.userId)) {
                sUserId = mParams.userId;
            }
            if (mParams.onClose) {
                 this.onClose = mParams.onClose
            }
        }

        this.authenticateButton = new sap.m.Button({
            type: sap.m.ButtonType.Default,
            text: util.I18NUtility.getLocaleSpecificText("ok.default.BUTTON"),
            enabled: true,
            tap : [ this.authenticateButtonTap, this ]
        });

        this.cancelButton = new sap.m.Button({
            text: util.I18NUtility.getLocaleSpecificText("cancel.default.BUTTON"),
            enabled: true,
            tap : [ this.cancelButtonTap, this ]
        });

        this.authenticationDialog = new sap.m.Dialog({
            title: sTitle,
            leftButton: this.cancelButton,
            rightButton: this.authenticateButton,
            afterOpen: [ this.afterOpen, this ],
            afterClose: [ this.afterClose, this ]
        });

        // create vertical box layout to hold message and user / password fields
        var oVbox = new sap.m.VBox({
            width : "100%",
            alignItems: sap.m.FlexAlignItems.Start
        });

        this.authenticationDialog.addContent(oVbox);

        // attach a keypress listener to handle Enter key
        var thisController = this;
        this.authenticationDialog.attachBrowserEvent("keydown", function(e) {
            if ( e.isPseudoType("sapenter") ) {
                thisController.authenticateButtonTap();
            };
        });

        var oMessageText = new sap.m.Text({
            text: sMessage,
            wrapping: true,
            textAlign: sap.ui.core.TextAlign.Begin,
            visible : bMessageVisible
        });
        oMessageText.addStyleClass("authenticationMessageLabel");
        var oHbox = new sap.m.HBox({
            justifyContent: justifyContent,
            width : "100%",
        });
        oHbox.addStyleClass("authenticationMessageHBox");
        oHbox.setAlignItems(sap.m.FlexAlignItems.Start);
        oHbox.addItem(oMessageText);

        var aList = new sap.m.List({inset : true});

        var oListVbox = new sap.m.VBox({
            width : "100%",
            items : [
                oHbox,
                aList
            ]
        });

        oVbox.addItem(oListVbox);

        // set up user id field
        var oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.addStyleClass("authenticationHBox");

        oHbox.setAlignItems(sap.m.FlexAlignItems.Start);

        var userLabel = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText("user.default.LABEL"),
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });
        userLabel.addStyleClass("authenticationUserLabel");
        oHbox.addItem(userLabel);

        this.userInputField = new com.sap.me.control.Input({
            value : sUserId,
            change: [ this.dataInputChange, this ],
            showClear: true
        });
        this.userInputField.addStyleClass("inputUpperCase authenticationUserInput");
        oHbox.addItem(this.userInputField);

        oItem.addContent(oHbox);
        aList.addItem(oItem);

        // set up password field
        oItem = new sap.m.CustomListItem();
        oHbox = new sap.m.HBox();
        oHbox.addStyleClass("authenticationHBox");
        oHbox.setAlignItems(sap.m.FlexAlignItems.Start);

        var pwdLabel = new sap.m.Label({
            text: util.I18NUtility.getLocaleSpecificText("password.default.LABEL"),
            textAlign: sap.ui.core.TextAlign.Left,
            design: sap.m.LabelDesign.Bold
        });
        pwdLabel.addStyleClass("authenticationPwdLabel");
        oHbox.addItem(pwdLabel);

        this.pwdInputField = new com.sap.me.control.Input({
            type: sap.m.InputType.Password,
            value : sPassword,
            change: [ this.dataInputChange, this ],
            showClear: true
        });
        this.pwdInputField.addStyleClass("authenticationPwdInput");
        oHbox.addItem(this.pwdInputField);

        oItem.addContent(oHbox);
        aList.addItem(oItem);

        // show the dialog
        this.authenticationDialog.open();
    },

    dataInputChange : function(oEvent) {
        if (oEvent) {
            var oSource = oEvent.getSource(); // this is the control
            if (!oSource) {
                return;
            }

            // reset any error condition
            if (oSource.getValueState() === sap.ui.core.ValueState.Error) {
                oSource.setValueState(sap.ui.core.ValueState.None);
                oSource.setValueStateText("");
            }
        }
    },

    cancelButtonTap : function(evt) {
        this.bUserAuthenticated = false;
        this.userRef = null;
        if (!this.closeDialog()) {
            return;
        }
    },

    authenticateButtonTap : function(evt) {

        var sUserId = undefined;
        var sPassword = undefined;

        var oInputControl = this.userInputField;
        if (oInputControl) {
            sUserId = oInputControl.getValue();
            if (util.StringUtil.isBlank(sUserId)) {
                var message = util.I18NUtility.getErrorText("12909.simple");
                oInputControl.setValueState(sap.ui.core.ValueState.Error);
                oInputControl.setValueStateText(message);
                sap.m.MessageToast.show(message, {
                    duration: 5000,
                    animationDuration: 500
                });
                this.setFocus();
                return;
            }
            sUserId = sUserId.toUpperCase();
        }

        oInputControl = this.pwdInputField;
        if (oInputControl) {
            sPassword = oInputControl.getValue();
            if (util.StringUtil.isBlank(sPassword)) {
                var message = util.I18NUtility.getErrorText("12932.simple");
                oInputControl.setValueState(sap.ui.core.ValueState.Error);
                oInputControl.setValueStateText(message);
                sap.m.MessageToast.show(message, {
                    duration: 5000,
                    animationDuration: 500
                });
                this.setFocus();
                return;
            }
        }

        var userRef = undefined;
        try {
            userRef = com.sap.me.security.view.SecurityUtility.authenticateUser(sUserId, sPassword);
        } catch (err) {
            jQuery.sap.log.error(err.message);
            sap.m.MessageToast.show(err.message, {
                duration: 5000,
                animationDuration: 500
            });
            this.pwdInputField.setValue("");
            this.setFocus();
            return;
        }
        this.bUserAuthenticated = true;
        this.userRef = userRef;
        this.userId = sUserId;

        if (!this.closeDialog()) {
            return;
        }
    },

    closeDialog : function() {

        if (!this.authenticationDialog) {
            jQuery.sap.log.error("UserAuthenticationDialog: dialog not found");
            return false;
        }

        this.authenticationDialog.close();

        return true;
    },

    setFocus : function() {
        var oValue = this.userInputField.getValue();
        if (util.StringUtil.isBlank(oValue)) {
            this.userInputField.getFocusDomRef().focus();
            return;
        }

        oValue = this.pwdInputField.getValue();
        if (util.StringUtil.isBlank(oValue)) {
            this.pwdInputField.getFocusDomRef().focus();
            return;
        }

        this.authenticateButton.getFocusDomRef().focus();
    },

    afterOpen : function(oEvent) {
        this.setFocus();
    },

    afterClose : function(oEvent) {
        this.returnToCaller(this.bUserAuthenticated, this.userRef, this.userId);
    },

    navButtonTap : function(evt) {
        this.returnToCaller(false, null, null);
    },

    returnToCaller : function(bAuthenticated, sUserRef, sUserId) {

        if (this.onClose) {
            var oFn = undefined;
            var oFnContext = this;
            if (jQuery.isArray(this.onClose)) {
                if (this.onClose.length > 0) {
                    if (jQuery.isFunction(this.onClose[0])) {
                        oFn = this.onClose[0];
                        if (this.onClose.length > 1) {
                            oFnContext = this.onClose[1];
                        }
                    }
                }
            } else if (jQuery.isFunction(this.onClose)) {
                oFn = this.onClose;
            }
            if (oFn) {
                oFn.call(oFnContext, {authenticated: bAuthenticated, userRef: sUserRef, userId: sUserId});
            }
        }

    }

};