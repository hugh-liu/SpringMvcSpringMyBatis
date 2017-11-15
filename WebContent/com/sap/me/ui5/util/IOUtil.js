jQuery.sap.declare("util.IOUtil");
jQuery.sap.require("util.Model");
jQuery.sap.require("util.CommonKey");
jQuery.sap.require("util.StringUtil");

util.IOUtil = {

    /**
     * Will perform a synchronous request using the input servletUrl.
     *
     * @param servletUrl url of servlet
     * @param requestType  Must be either "POST" or "GET"
     * @param requestData Optional JSON object to post in request
     * @param successCallback optional function called with response JSON data:
     * <pre>
     *    callback(oData)
     * </pre>
     * @param errorCallback Optional function called when error occurs:
     * <pre>
     *    callback(errorCode, errorMessage)
     * </pre>
     * @param thisArg Optional context to call success and error functions with
     * @return
     */
    remoteRequest : function(servletUrl, requestType, requestData, successCallback, errorCallback, thisArg) {
        if (successCallback) {
            jQuery.sap.assert(typeof successCallback === "function", "successCallback must be a function");
        }
        if (errorCallback) {
            jQuery.sap.assert(typeof errorCallback === "function", "errorCallback must be a function");
        }
        var context = thisArg;
        if (context == null || context == undefined) {
            context = this;
        }
        var rtype = requestType;
        if (rtype == null || rtype == undefined) {
            rtype = "GET";
        }
        var curSite = util.Model.getData(util.CommonKey.CurrentSite);
        if ( curSite) {
            if (servletUrl.indexOf("?") > 0 ) {
                servletUrl = servletUrl + "&SITE=" + curSite;
            } else {
                servletUrl = servletUrl + "?SITE=" + curSite;
            }
        }

        // this is required to prevent caching of requests - in chrome it can cause requests to return 404 errors
        // (see "http://stackoverflow.com/questions/11463637/prevent-chrome-from-caching-ajax-requests")
        if (rtype.toUpperCase() === "GET") {
            // jQuery.sap.log.debug("remoteRequest(before): servletUrl  = " + servletUrl);
            var currentDate = new Date();
            if (servletUrl.indexOf("?") > 0) {
                servletUrl = servletUrl + "&preventCache='" + currentDate.getTime() + "'";
            } else {
                servletUrl = servletUrl + "?preventCache='" + currentDate.getTime() + "'";
            }
            // jQuery.sap.log.debug("remoteRequest(after): servletUrl  = " + servletUrl);
        }

        var returnData = undefined;

        //  util.StringUtil.printTimeStamp("jQuery.ajax - start");

        jQuery.ajax({
             url: servletUrl,            // "/layouter/restws/read",
             async: false,
             dataType: "json",
             data: requestData,    // {fileName: fileName, filePath: filePath},
             contentType: "application/json",
             type: rtype.toUpperCase(),
             success: function(oData) {
                //  util.StringUtil.printTimeStamp("jQuery.ajax - success");
                if (successCallback) {
                    returnData = oData;
                    successCallback.call(context, oData);
                }
             },
             error: function(XMLHttpRequest, textStatus, errorThrown){
                //  util.StringUtil.printTimeStamp("jQuery.ajax - error");
                if (errorCallback) {
                    var jsonValue = jQuery.parseJSON(XMLHttpRequest.responseText);
                    var errorCode;
                    var errorMessage;
                    if (jsonValue) {
                        if (jsonValue.error) {
                            errorCode = jsonValue.error.code;
                            if (jsonValue.error.message) {
                                errorMessage = jsonValue.error.message.value;
                            }
                        }
                    }
                    errorCallback.call(context, errorCode, errorMessage);
                }
             }
        });

        return returnData;
    },

    /**
     * Will perform a synchronous request to an odata service and return the results.
     *
     * @param sPath path to odata service
     * @param bGetAllData true to get all data including meta data, false to get "results" portion of response only
     * @return JSON object containing result
     * @throws Error if request returns exception
     */
     getODataRequestResults : function(sPath, bGetAllData) {

        var oData = this.remoteRequest(sPath, "GET", null, this.odataRequestSuccessCallback, this.odataRequestErrorCallback, this);

        // jQuery.sap.log.debug("getODataRequestResults(1): oData for " + sPath + " = " + oData);

        // if not defined here, check if found by callback
        if (!oData) {
            oData = util.Model.getData("TEMP_RemoteRequestResults");
            // jQuery.sap.log.debug("getODataRequestResults(2): oData for " + sPath + " = " + oData);
        }
        util.Model.removeData("TEMP_RemoteRequestResults");

        var requestResults = undefined;

        // if found, cache value
        if (oData) {

            // error occured, throw error message
            if (oData.errorMessage) {
                throw Error(oData.errorMessage);
            }

            // not error, check results
            if (oData.d) {
                if (bGetAllData) {
                    if (oData.d) {
                        requestResults = oData.d;
                    } else {
                        requestResults = oData;
                    }
                } else {
                    requestResults = oData.d.results;
                }
                // jQuery.sap.log.debug("getODataRequestResults: requestResults = " + requestResults);

            } else if (bGetAllData) {
                requestResults = oData;

            } else  {
                // jQuery.sap.log.error("getODataRequestResults: oData is undefined!");
            }
        } else {
            // jQuery.sap.log.error("getODataRequestResults: oData is undefined!");
        }

        return requestResults;
    },

    odataRequestSuccessCallback : function(oData) {
         util.Model.setData("TEMP_RemoteRequestResults", oData);
    },

    odataRequestErrorCallback : function(errorCode, errorMessage) {
         // jQuery.sap.log.debug("odataRequestErrorCallback: " + errorMessage);
         if (errorMessage) {
             var oError = {
                 errorCode: errorCode,
                 errorMessage: errorMessage
             };
             util.Model.setData("TEMP_RemoteRequestResults", oError);
             // util.Model.removeData("TEMP_RemoteRequestResults");
         }
    },

    /**
     * Will return an array of objects by an EntitySet name in a odata service and return results as a JSONModel
     *
     * @param {string} sService URL of service (i.e.; "/manufacturing-odata/Production.svc/"
     * @param {string} sName Name of EntitySet to get (i.e.; "Operations")
     * @param {string} sFilterOperator Optional string in form of " operation eq 'OPER' "
     * @param {string} sQueryParameters Optional query parameters to append to end of utl
     * @return {sap.ui.model.json.JSONModel} object containing result if found, else undefined
     */
     getEntitySetModel : function(sService, sName, sFilterOperator, sQueryParameters) {

         // examples:
         //  /manufacturing-odata/Production.svc/Operations?$inlinecount=allpages
         //  /manufacturing-odata/Production.svc/Operations?$filter=operation%20eq%20%27OPER%27&$inlinecount=allpages
         //  /manufacturing-odata/LogNc.svc/NcGroups?$inlinecount=allpages&Oper=OPER1&OperRev=
         //  /manufacturing-odata/LogNc.svc/NcGroups('PRIMARY')/ncCodeMemberList?$inlinecount=allpages

         if (util.StringUtil.isBlank(sService)) {
             jQuery.sap.log.error("getEntitySetModel: sService is undefined");
             return undefined;
         }
         if (util.StringUtil.isBlank(sName)) {
             jQuery.sap.log.error("getEntitySetModel: sName is undefined");
             return undefined;
         }

         var bindingName = sName;
         if (sName.indexOf("(") > 0) {
             bindingName = bindingName.substring(0, sName.indexOf("("));
         }

         var sUrl = sService;
         if (!util.StringUtil.endsWith(sService, "/")) {
             sUrl = sUrl + "/";
         }
         sUrl = sUrl + sName + "?$inlinecount=allpages";

         if (!util.StringUtil.isBlank(sFilterOperator)) {
             var sEncodedFilter = util.StringUtil.encodeString(sFilterOperator);
             sUrl = sUrl + "&$filter=" + sEncodedFilter;
         }

         if (!util.StringUtil.isBlank(sQueryParameters)) {
             sUrl = sUrl + sQueryParameters;
         }

         var oData = this.getODataRequestResults(sUrl, false);
         if (oData) {
             var oModel = new sap.ui.model.json.JSONModel();
             var oBinding = {};
             oBinding[bindingName] = oData;

             oModel.setData(oBinding);
             return oModel;
         }

         return undefined;
    },

    /**
     * loads a given CSS file
     *
     * @param {String} sURL Uniform resource locator of CSS file to load.
     */
    loadCSS : function(sURL) {
        var cssLink = $("<link>");
        $("head").append(cssLink);
            cssLink.attr({
            rel: "stylesheet",
            type: "text/css",
            href: sURL
       });
    },

    /**
     *  loads a given JavaScript file
     *
     * @param {String} sURL Uniform resource locator of JavaScript file to load.
     */
    loadJS : function(sURL) {
       var jsLink = $("<script>");
       $("head").append(jsLink);
       jsLink.attr({
           type: "text/javascript",
           src: sURL
       });
    },

    /**
     * Redirects to given URL
     *
     * @param {String} sURL Uniform resource locator.
     * @param {Boolean} [bNewWindow] Opens URL in a new browser window
     * @public
     * @name util.IOUtil#redirect
     * @function
     */
    redirect : function (sURL, bNewWindow) {

        jQuery.sap.log.debug("redirect: sURL = " + sURL);

        if (!bNewWindow) {
            window.location.href = sURL;
        } else if (navigator.app && typeof navigator.app.loadUrl == "function") {
            navigator.app.loadUrl(sURL, {openExternal : true}); // PhoneGap
        } else {
            window.open(sURL);
        }
    }
};