/**
 * @namespace app
 */

/**
 * @namespace app.assets
 * @memberof app
 */

/**
 * @namespace app.assets.global
 * @memberof app.assets
 */
var RoundsSupervisor = RoundsSupervisor || (RoundsSupervisor = {});
"use strict";

RoundsSupervisor.global || (RoundsSupervisor.global = {

  busyDialog: null,
		
	RELEASEDATE : "January 18, 2017",
	VERSION 	: "0.1.1",
	BUILD 		: "1",
	EMAIL 		: "enterprisemobility@saskpower.com",
	APPNAME 	: "Rounds Supervisor",
	
	serviceUrls : {
		"plantsMockData" : "app/mockdata/plants.json",
		"roundsMockData" : "app/mockdata/rounds.json",
		"subgroupsMockData" : "app/mockdata/subgroups.json",
		"chartHtmlTemplate" : "app/template/chart.html",
		"detailHtmlTemplate" : "app/template/detail.html",
        "plants" 	: "/sap/opu/odata/sap/ZPM_ROUNDSSUPERVISOR_SRV/PlantsSet?$format=json",
        "subgroups" : "/sap/opu/odata/sap/ZPM_ROUNDSSUPERVISOR_SRV/RoundSubGroupSet?$format=json",
        "plantOnlyInfo" : "/sap/opu/odata/sap/ZPM_ROUNDSSUPERVISOR_SRV/PlantsSet('{{PlantNum}}')?$expand=PlantsToSubGroups/RoundSubGroupToRounds/RoundsToRoundInstance/RoundInstanceToObjects/ObjectsToPoints/PointsToDocuments&$format=json",
        "plantInfo" : "/sap/opu/odata/sap/ZPM_ROUNDSSUPERVISOR_SRV/RoundSubGroupSet(SubGroupNum={{SubGroupNum}},Plant='{{PlantNum}}')?$expand=RoundSubGroupToRounds/RoundsToRoundInstance/RoundInstanceToObjects/ObjectsToPoints/PointsToDocuments&$format=json"
     },
     
    businessGroupPlants :{ "power" :["0001","0002", "0003", "0004", "0005"] },
     
	onAppInfo : function() {
		var msg = "Have questions? Email us at " + this.EMAIL + " \n \n Version: "
				+ this.VERSION + " \n \n Build: " + this.BUILD
				+ " \n \n Distribution Date: " + this.RELEASEDATE;
		sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.INFORMATION,
				this.APPNAME, [ sap.m.MessageBox.Action.OK ], function() {});
	}


});