jQuery.sap.declare("util.ModelKey");

util.ModelKey = {

        /**
         * ModelKey Workstation holds name of workstation loaded
         * @public
         */
        Workstation: "Workstation",

        /**
         * ModelKey WorkstationConfiguration holds JSON object holding workstation configuration information
         * @public
         */
        WorkstationConfiguration: "WorkstationConfiguration",

        /**
         * ModelKey CurrentApplicationView holds name of current active application view (Not sub-views)
         * @public
         */
        CurrentApplicationView: "CurrentApplicationView",

        /**
         * ModelKey CurrentApplicationNamespace holds name of current active application namespace (Not sub-views)
         * @public
         */
        CurrentApplicationNamespace: "CurrentApplicationNamespace",

        /**
         * ModelKey CurrentApplicationRules holds current application "activity rules"
         * @public
         */
        CurrentApplicationRules: "CurrentApplicationRules",

        /**
         * ModelKey SelectedOperation holds currently selected Operation
         * @public
         */
        SelectedOperation: "SelectedOperation",

        /**
         * ModelKey SelectedOperationRevision holds currently selected Operation revision
         * @public
         */
        SelectedOperationRevision: "SelectedOperationRevision",

        /**
         * ModelKey SelectedResource holds currently selected Resource
         * @public
         */
        SelectedResource: "SelectedResource",

        /**
        * ModelKey SelectedComponent holds currently selected Component
        * @public
        */
        SelectedComponent: "SelectedComponent",

        /**
        * ModelKey SelectedAssemblyOperation holds the Operation assignment for the current Component
        **/
        SelectedAssemblyOperation: "SelectedAssemblyOperation",

        /**
        * ModelKey SelectedComponentRevision holds currently selected Component revision
        * @public
        */
        SelectedComponentRevision: "SelectedComponentRevision",

        /**
        * ModelKey SelectedComponentDescription holds currently selected Component description
        * @public
        */
        SelectedComponentDescription: "SelectedComponentDescription",
        
        /**
         * Model Key SelectedSfcQuantity contains the SFC Quantity
         */
        SelectedSfcQuantity: "SelectedSfcQuantity",

        /**
        * ModelKey SelectedLotSize holds currently selected Lot Size
        * @public
        */
        SelectedLotSize: "SelectedLotSize",

        /**
        * ModelKey SelectedComponentQuantity holds currently selected Component quantity
        * @public
        */
        SelectedComponentQuantity: "SelectedComponentQuantity",

        /**
         * ModelKey SelectedComponentSequence holds currently selected Component sequence
         * @public
         */
        SelectedComponentSequence: "SelectedComponentSequence",
        
        /**
        * ModelKey SelectedHasAssyData holds a boolean indicating if the selected component contains assembly data fields
        * @public
        */
        SelectedHasAssyData: "SelectedHasAssyData",

        /**
        * ModelKey SelectedAssemblyData holds a JSON string of Selected assembly Data
        * @public
        */
        SelectedAssemblyData: "SelectedAssemblyData",

        /**
        * ModelKey SelectedDefaultComponentQuantity holds the Quantity value that will appear in the text box.
        * @public
        */
        SelectedDefaultComponentQuantity: "SelectedDefaultComponentQuantity",

        /**
         * ModelKey SelectedSFC holds currently selected SFC
         * @public
         */
        SelectedSFC: "SelectedSFC",

         /**
         * ModelKey SelectedTypeCount holds current count of SFC's.
         * @public
         */
        SelectedTypeCount: "SelectedTypeCount",
        /**
         * ModelKey SelectedNCGroup holds currently selected NC Group
         * @public
         */
        SelectedNCGroup: "SelectedNCGroup",

        /**
         * ModelKey SelectedNCCode holds currently selected NC Code
         * @public
         */
        SelectedNCCode: "SelectedNCCode",

        /**
         * ModelKey SelectedCollectionType holds the type  data is being collected for (SFC, SHOP_ORDER or PROCESS_LOT)
         * @public
         */
        SelectedCollectionType: "SelectedCollectionType",

        /**
         * ModelKey SelectedCollectionTypeValue holds the value for the type of data being collected
         * @public
         */
        SelectedCollectionTypeValue: "SelectedCollectionTypeValue",

        /**
         * ModelKey SelectedDCGroupList holds currently selected DC Group(s)
         * @public
         */
        SelectedDCGroupList: "SelectedDCGroupList",

        /**
         * ModelKey SelectedDCGroupList holds currently selected DC Group(s)
         * @public
         */
        BypassNcGroup: "BypassNcGroup",

        /**
         * ModelKey SelectedEquipmentChangeType holds currently selected Type of Equipment Change
         * @public
         */
        SelectedEquipmentChangeType: "SelectedEquipmentChangeType",

        /**
         * ModelKey SelectedToolGroup holds currently selected Tool Group
         * @public
         */
        SelectedToolGroup: "SelectedToolGroup",

        /**
         * ModelKey SelectedToolNumber holds currently selected Tool Number
         * @public
         */
        SelectedToolNumber: "SelectedToolNumber",

        /**
         * ModelKey SelectedWorkCenter holds currently selected Tool Work Center
         * @public
         */
        SelectedWorkCenter: "SelectedWorkCenter",

        /**
         * ModelKey SelectedStatusCode holds currently selected Status Code
         * @public
         */
        SelectedStatusCode: "SelectedStatusCode",

        /**
         * ModelKey SelectedStatusCode holds currently selected Status Code
         * @public
         */
        SelectedStatusCodeDescription: "SelectedStatusCodeDescription",

        /**
         * ModelKey SelectedReasonCode holds currently selected Reason Code
         * @public
         */
        SelectedReasonCode: "SelectedReasonCode",

        /**
         * ModelKey SelectedReasonCodeCategory holds currently selected Category of Reason Code
         * @public
         */
        SelectedReasonCodeCategory: "SelectedReasonCodeCategory",
        
        /**
         * ModelKey that hold the current site the user is operating on.
         */
        CurrentSite: "CurrentSite"

};
