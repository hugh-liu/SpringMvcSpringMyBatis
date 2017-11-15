jQuery.sap.declare("com.sap.me.security.view.SecurityUtility");

jQuery.sap.require("util.StringUtil");
jQuery.sap.require("util.IOUtil");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.I18NUtility");

com.sap.me.security.view.SecurityUtility = {

    /**
     * Authenticates the user / password
     *
     * @param {string} sUserId ID of user to authenticate
     * @param {string} sPassword of user to authenticate
     * @returns {string} User Ref if authentication is successful
     * @throws Error if user not validated
     */
    authenticateUser : function (sUserId, sPassword) {

        if (util.StringUtil.isBlank(sUserId)) {
            //12909.simple=User ID is missing
            var message = util.I18NUtility.getErrorText("12909.simple");
            jQuery.sap.log.error("SecurityUtility.authenticateUser: " + message);
            throw new Error(message);
        }

        if (util.StringUtil.isBlank(sPassword)) {
            // 12932.simple=Password is invalid
            var message = util.I18NUtility.getErrorText("12932.simple");
            jQuery.sap.log.error("SecurityUtility.authenticateUser: " + message);
            throw new Error(message);
        }

        // set up message bundle type to get text from
        var oJson = {
            key : sUserId,
            value : sPassword
        };
        var parameters = "?data='" + util.StringUtil.encodeString(JSON.stringify(oJson)) + "'";

        // perform authentication
        var oResult = util.IOUtil.remoteRequest("/manufacturing-odata/Security.svc/Authenticate" + parameters, "GET", null, this.authenticationSuccessCallback, this.authenticationErrorCallback, this);
        if (!oResult ) {
            oResult  = util.Model.getData("TEMP_AuthorizationResult");
        }
        util.Model.removeData("TEMP_AuthorizationResult");

        var sUserRef = undefined;
        if (oResult && oResult.d && oResult.d.Authenticate) {
            sUserRef = oResult.d.Authenticate;
        }

        // if not defined here, check if found by callback
        var sErrorMessage = util.Model.getData("TEMP_AuthenticationErrrorMessage");

        // if exception occured throw it
        if (!util.StringUtil.isBlank(sErrorMessage)) {
            util.Model.removeData("TEMP_AuthenticationErrrorMessage");
            throw new Error(sErrorMessage);
        }

        return sUserRef;
    },

    authenticationSuccessCallback : function (oData) {
         util.Model.setData("TEMP_AuthorizationResult", oData);
    },

    authenticationErrorCallback : function (errorCode, errorMessage) {
         jQuery.sap.log.error("SecurityUtility.authenticationErrorCallback: " + errorMessage);
         if (errorMessage) {
             util.Model.setData("TEMP_AuthenticationErrrorMessage", errorMessage);
         }
    },

    /**
     * Validates if the input user has the input certification assigned
     *
     * @param {string} sUserRef Ref of user to check certification for
     * @param {string} sCertificationRef Ref of certification to check
     * @returns true if user has certification assigned, else false
     * @throws Error if exception occured
     */
    validateUserCertification : function (sUserRef, sCertificationRef) {

        if (util.StringUtil.isBlank(sUserRef)) {
            // 12909.simple=User ID is missing
            var message = util.I18NUtility.getErrorText("12909.simple");
            jQuery.sap.log.error("SecurityUtility.validateUserCertification: " + message);
            throw new Error(message);
        }

        if (util.StringUtil.isBlank(sCertificationRef)) {
            // 12968.simple=Certification is missing
            var message = util.I18NUtility.getErrorText("12968.simple");
            jQuery.sap.log.error("SecurityUtility.validateUserCertification: " + message);
            throw new Error(message);
        }

        // perform authentication
        var parameters = "?userRef='" + sUserRef + "'&certificationRef='" + sCertificationRef + "'";
        var oResult = util.IOUtil.remoteRequest("/manufacturing-odata/Security.svc/ValidateCertification" + parameters, "GET", null, this.certificationSuccessCallback, this.certificationErrorCallback, this);
        if (!oResult) {
            oResult = util.Model.getData("TEMP_CertificationValidationResult");
        }
        util.Model.removeData("TEMP_CertificationValidationResult");

        // if error occured throw it
        var sErrorMessage = util.Model.getData("TEMP_CertificationErrrorMessage");
        if (!util.StringUtil.isBlank(sErrorMessage)) {
            util.Model.removeData("TEMP_CertificationErrrorMessage");
            throw new Error(sErrorMessage);
        }

        var bPassed = false;
        if (oResult && oResult.d && oResult.d.ValidateCertification) {
            bPassed = oResult.d.ValidateCertification;
        }

        return bPassed;
    },

    certificationSuccessCallback : function (oData) {
         util.Model.setData("TEMP_CertificationValidationResult", oData);
    },

    certificationErrorCallback : function (errorCode, errorMessage) {
         jQuery.sap.log.error("SecurityUtility.certificationErrorCallback: " + errorMessage);
         if (errorMessage) {
             util.Model.setData("TEMP_CertificationErrrorMessage", errorMessage);
         }
    },

    /**
     * Returns the current user information logged onto the server
     *
     * @returns {userRef, user, site}
     * @throws Error if exception occured
     */
    getCurrentUser : function () {
        return this.getUserInfo(null);
    },

    /**
     * Returns the information for the input user from the server
     *
     * @param {string} sUserId User ID of user to get information for
     * @returns {userRef, user, site}
     * @throws Error if exception occured
     */
    getUserInfo : function (sUserId) {

        var parameters = null;
         if (!util.StringUtil.isBlank(sUserId)) {
             parameters = "?userId='" + sUserId.toUpperCase() + "'";
         }

        // get current user information
        var oResult = util.IOUtil.remoteRequest("/manufacturing-odata/Security.svc/GetUserInfo", "GET", parameters, this.userInfoSuccessCallback, this.userInfoErrorCallback, this);
        if (!oResult) {
            oResult = util.Model.getData("TEMP_UserInfoResult");
        }
        util.Model.removeData("TEMP_UserInfoResult");

        // if error occured throw it
        var sErrorMessage = util.Model.getData("TEMP_UserInfoErrrorMessage");
        if (!util.StringUtil.isBlank(sErrorMessage)) {
            util.Model.removeData("TEMP_UserInfoErrrorMessage");
            throw new Error(sErrorMessage);
        }

        var oUserInfo = null;
        if (oResult && oResult.d && oResult.d.GetUserInfo) {
            oUserInfo = oResult.d.GetUserInfo;
        }

        return oUserInfo;
    },

    userInfoSuccessCallback : function (oData) {
         util.Model.setData("TEMP_UserInfoResult", oData);
    },

    userInfoErrorCallback : function (errorCode, errorMessage) {
         jQuery.sap.log.error("SecurityUtility.userInfoErrorCallback: " + errorMessage);
         if (errorMessage) {
             util.Model.setData("TEMP_UserInfoErrrorMessage", errorMessage);
         }
    }

};
