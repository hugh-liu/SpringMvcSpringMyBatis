jQuery.sap.declare("util.StringUtil");

util.StringUtil = {

    /**
     * helper function to see if input string is blank
     *
     * @param str {String} to check
     * @return true if string is blank (undefined, null or only spaces), else true
     */
    isBlank : function(str) {
        if (str == undefined || str == null || str == "") {
            //jQuery.sap.log.debug("isBlank: input string is undefined, null or empty");
            return true;
        }
        if (this.trimString(str) == "") {
            //jQuery.sap.log.debug("isBlank: trimmed input string is empty");
            return true;
        }
        //jQuery.sap.log.debug("isBlank: str <" + str + "> not empty");
        return false;
    },

    /**
     * helper function to trim leading and trailing spaces from a string
     *
     * @param str {String} to trim spaces from
     * @return updated String
     */
    trimString : function(str) {
        var c;
        for (var i = 0; i < str.length; i++) {
            c = str.charCodeAt(i);
            if (c == 32 || c == 10 || c == 13 || c == 9 || c == 12) continue; else break;
        }
        for (var j = str.length - 1; j >= i; j--) {
            c = str.charCodeAt(j);
            if (c == 32 || c == 10 || c == 13 || c == 9 || c == 12) continue; else break;
        }

        //jQuery.sap.log.debug("trimString: i = " + i + ", j = " + j);

        return str.substring(i, j + 1);
    },

    /**
     * helper function to encode the input string (including single quotes)
     *
     * @param {String} str String to encode
     * @return encoded string
     */
    encodeString : function(str) {
        if (this.isBlank(str)) {
            return str;
        }
        return jQuery.sap.encodeURL(str);
    },

    /**
     * helper function to check if one string ends with another
     *
     * @param {String} str String to check
     * @param {String} stringCheck String to search
     * @return true if str ends with sSerach
     */
    endsWith : function(str, sSearch) {
        return (str.lastIndexOf(sSearch) === (str.length - sSearch.length)) > 0;
    },

    /**
     * This utility method substitutes in the String _orig all occurrences of string
     * _tosubstr with the string _withsubst
     *
     * @param _orig The string to search
     * @param _tosubst what to search for
     * @param _withsubst what to substitute with
     * @param _startIndex start replacing from this index
     *
     * @return String  new string with substitution executed
     */
    replaceStrings :  function(_orig, _tosubst, _withsubst, _startIndex) {

        var postString = null;
        var preString = null;
        var newString = _orig;
        var withString = _withsubst;
        if (_withsubst == null || _withsubst == undefined) withString = "";

        var foundat = -1;
        var nextStart = -1;
        if ((foundat = _orig.indexOf(_tosubst, _startIndex)) != -1) {
            // check for existing preString
            if (foundat > 0) {
                preString = _orig.substring(0, foundat);
            } else {
                preString = "";
            }

            var indexafter = foundat + _tosubst.length;
            postString = _orig.substring(indexafter);

            newString = preString + withString + postString;

            nextStart = preString.length + withString.length;
        }

        if (newString !== _orig) {
            // Maybe there are more occurrences of _tosubst; so repeat.
            return this.replaceStrings(newString, _tosubst, withString, nextStart);
        }

        return newString;

    },

    wrapWithQuote : function(str)  {
        if (this.isBlank(str)) {
            return str;
        }
        var res = undefined;
        if ( str.charAt(0) != "'") {
            res = "'".concat(str);
        }
        if ( str.charAt(str.length -1) != "'") {
           res = res.concat("'");
        }
        return res;

    },

    printTimeStamp : function(sMessage) {
        var currentDate = new Date();
        var day = currentDate.getUTCDate();
        var month = currentDate.getUTCMonth() + 1;
        var year = currentDate.getUTCFullYear();
        var hours = currentDate.getUTCHours();
        var minutes = currentDate.getUTCMinutes();
        var seconds = currentDate.getUTCSeconds();
        var milliseconds = currentDate.getUTCMilliseconds();
        jQuery.sap.log.info(sMessage + ": " + year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds + ":" + milliseconds);
    },

    /**
    * Sets focus when passed the view (this.getView();) and the control id.
    * * WARNING * - This method must be used within the onAfterShow() of the controller.
    **/
    setFocus: function (view, control) {
        var focusedControl = view.byId(control);
        focusedControl.focus();
    }
};