jQuery.sap.declare("com.sap.me.framework.view.WorkstationLoader");

jQuery.sap.require("util.ModelKey");
jQuery.sap.require("util.I18NUtility");
jQuery.sap.require("util.StringUtil");

com.sap.me.framework.view.WorkstationLoader = {

    changeSite : function(sSite) {
        if (util.StringUtil.isBlank(sSite)) {
            return;
        }

        // jQuery.sap.log.debug("ME Main  Initialization: changing site to " + sSite);

        var parameters="?SITE='" + sSite.toUpperCase() + "'";
        try {
            util.IOUtil.getODataRequestResults("/manufacturing-odata/Production.svc/ChangeSite" + parameters, true);
        } catch (err) {
            jQuery.sap.log.error(err.message);
        }

    },


    loadWorkstation : function(sWorkstation) {

        if (util.StringUtil.isBlank(sWorkstation)) {
            return;
        }

        jQuery.sap.log.debug("MEMain.init: sWorkstation = " + sWorkstation);

        util.Model.setData(util.ModelKey.Workstation,sWorkstation.toUpperCase());

        var wsconfig = undefined;
        try {
            wsconfig = util.IOUtil.getODataRequestResults("/manufacturing-odata/Workstation.svc/Workstations('" + sWorkstation.toUpperCase() + "')", true);
        } catch (err) {
            jQuery.sap.log.error(err.message);
            throw err;
        }

        if (wsconfig) {
            var applicationsUrl = "/manufacturing-odata/Workstation.svc/GetWorkstationApplications?Workstation='" + sWorkstation.toUpperCase() +"'";
            var aApplications = undefined;
            try {
                aApplications = util.IOUtil.getODataRequestResults(applicationsUrl, false);
            } catch (err) {
                jQuery.sap.log.error(err.message);
                throw err;
            }
            if (aApplications && aApplications.length > 0 && jQuery.isArray(aApplications)) {

                aApplications = this.sortBySequence(aApplications);

                for (var i = 0; i < aApplications.length; i++) {

                    var activitiesUrl = "/manufacturing-odata/Workstation.svc/GetApplicationActivities?Workstation='" + sWorkstation.toUpperCase() + "'&ApplicationId='" + aApplications[i].applicationId +"'";
                    var aActivities = undefined;
                    try {
                        aActivities = util.IOUtil.getODataRequestResults(activitiesUrl, false);
                    } catch (err) {
                        jQuery.sap.log.error(err.message);
                    }
                    if (aActivities && aActivities.length > 0 &&  jQuery.isArray(aActivities)) {
                        aApplications[i].activities = aActivities;
                    }

                    var optionsUrl =  "/manufacturing-odata/Workstation.svc/GetApplicationOptions?ActivityId='" + util.StringUtil.encodeString(aApplications[i].activityId) + "'";
                    var aOptions = undefined;
                    try {
                        aOptions = util.IOUtil.getODataRequestResults(optionsUrl, false);
                    } catch (err) {
                        jQuery.sap.log.error(err.message);
                    }
                    if (aOptions && aOptions.length > 0 &&  jQuery.isArray(aOptions)) {
                        aApplications[i].options = aOptions;
                    }

                }

                wsconfig.applications = aApplications;
            }
        }

        util.Model.setData(util.ModelKey.WorkstationConfiguration, wsconfig);

        // remove any existing model
        var oModel = sap.ui.getCore().getModel("applicationModel");
        if (oModel) {
            sap.ui.getCore().setModel(undefined, "applicationModel");
        }
        oModel = new sap.ui.model.json.JSONModel();

        var oApplications = {
            Applications : wsconfig.applications
        };
        oModel.setData(oApplications);
        sap.ui.getCore().setModel(oModel, "applicationModel");
    },

    /**
     * sorts a list by the "sequence" number in the list object
     *
     * @param {array} oList to sort
     * @return sorted list
     */
    sortBySequence : function(oList) {

        var oSortedList = oList.sort(function(a, b) {
              var iNumberA = Number(a["sequence"]);
              var iNumberB = Number(b["sequence"]);
              if (isNaN(iNumberA)) {
                  return -1;
              }
              if (isNaN(iNumberB)) {
                  return 1;
              }
              return (iNumberA > iNumberB) ? 1 : ((iNumberA < iNumberB) ? -1 : 0);
        });

        return oSortedList;
    }

};