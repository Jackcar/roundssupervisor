/**
 * @namespace app
 */

/**
 * @namespace app.assets
 * @memberof app
 */

/**
 * @namespace app.assets.DataManager
 * @memberof app.assets
 */
var RoundsSupervisor = RoundsSupervisor || (RoundsSupervisor = {});
"use strict";

RoundsSupervisor.ChartManager || (RoundsSupervisor.ChartManager = {
		chart1 : null,
		chart2 : null,
		pointsChartData : [],
		barchartSearchVals : {},
		roundsBarchartData : [],
		graphData : {
			"notifications" : [],
			"roundInstances" : [],
			"watchflags" : [],
			"pointReading" : []
		},
		notifCardId : "notificationsCard",
		watchCardId : "watchflagsCard",
		roundCardId : "roundsCard",
		
		/* returns a collection of all data required for charts and cards
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @function getStats
		 * @return {object} , { "cardData" : [], "pointsData" :  [], "roundsBarchartData" : [] }
		 * 
		 * */
		renderGraphs : function(){
		    var stats = this.getStats()
			this.setCardValues(stats.cardData);
			this.pointsChartData = stats.pointsData;
			this.roundsBarchartData = stats.roundsBarchartData
			this.drawChart();
			this.drawTable(stats.roundsTableData);
		},
		
		drawTable : function(dataArr){
			
			var head='<table class="table table-hover table-striped table-bordered">'+
			  	 '	<tr>'+
			     ' 		<th>Round Name</th>'+
			     ' 		<th>Times Executed</th>'+
			     ' 	</tr>';
			var end = '</tr></table>';
			if(dataArr.length > 0){
				dataArr.forEach(function(row){
					head = head + "<tr><td>" + row.roundName + "</td><td>" + row.count + "</td></tr>";
				});
			}else{
				head = head + "<tr><td colspan='2'>NO DATA</td></tr>";
			}
			
			var ht = $("#chart2").parent().prop("offsetHeight");
			$("#table-wrap").css("max-height", ht-10);
			$("#roundTable1").parent().css("height", ht-25);
			$("#roundTable1").html(head + end);
		
		},
		
		/* Main method to create the chart objects, them and update their data if charts already exist
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @function drawChart
		 * */
		drawChart : function(){
		
			var self = RoundsSupervisor.ChartManager;
			try{
				/*
			}
			if(this.chart1 == null){
				this.chart1 = new Morris.Bar({
					  element: 'chart1',
					  resize: true,
					  data: self.roundsBarchartData,
					  xkey: 'label', 
					  gridTextSize : 10,
					  xLabelAngle: 60,
					  ykeys: ['value'],
					  labels: ['Value']
					});
			}else{
				this.chart1.setData(self.roundsBarchartData);
			}
			*/
			
			if(this.chart2 == null ){
			this.chart2 = Morris.Donut({
				  element: 'chart2',
				  resize: true,
				  data: self.pointsChartData
				});
			}else{
				this.chart2.setData(self.pointsChartData);
			}
			
			}catch(ex){
				console.log("error rendering graph")
			}
			
		},
		
		unsetGraphs : function(){
			this.chart2 = null;
			this.chart1 = null;
		},
		
		setReadUnreadChartHeader: function(read, unread){
			var text = $(".ptClass").html("Points Read - "+read+", Points Unread - "+unread)
		},
		
		/* returns a collection of all data required for charts and cards
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @function getStats
		 * @return {object} , { "cardData" : [], "pointsData" :  [], "roundsBarchartData" : [], "roundsTableData" : [] }
		 * 
		 * */
		getStats : function(){
			var pointsReadingTotal = [], cardData = [];
			var read=0, unread = 0;

			//cards stats
			cardData.push ({ "div" : this.roundCardId, "value" : this.graphData.roundInstances.length });
			cardData.push ({ "div" : this.watchCardId, "value" : this.graphData.watchflags.length });
			cardData.push ({ "div" : this.notifCardId, "value" : this.graphData.notifications.length });
			
			//points read/unread
			this.graphData.pointReading
				.forEach(function(reading){
					(reading.PointRead === true) ? read++ : unread++
				});
			
			pointsReadingTotal.push( {"label" : "Points Read", "value" : read});
			pointsReadingTotal.push( {"label" : "Points Not Read", "value" : unread});
			this.setReadUnreadChartHeader(read, unread);
			//add barchart data
			
			//get rounds data
			var roundCount = {}; var counts = [];
			this.graphData.roundInstances
				.forEach(function(round){
					var ct = roundCount[round.RoundName];
					if(Boolean(ct)){
						roundCount[round.RoundName] = ct + 1;
					}else{
						roundCount[round.RoundName] = 1;
					}
				});
			
			$.each(roundCount, function(key, val){
				counts.push( { "roundName": key, "count" : val } );
			});
			
			return { "cardData" : cardData, "pointsData" :  pointsReadingTotal, "roundsBarchartData" : this.getBarchartData(), "roundsTableData" : counts };
		},
		
		
		/* this function sets the corresponding barchartSearchVals to be used in generating the barchart labels by momentjs
		 * @function setBarchartSearchVals
		 * @param {string} periodStr, yesterday, lastweek etc
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @return {object} e.g. for yesteday {"howFarBack" : 24, "unit" : "hours", "barCount" : 7, "labelFormat" : "ha"} , ha is date format for pm/am
		 * */
		setBarchartSearchVals : function(periodStr){
			var srchVals = {
					"howFarBack" : 0,
					"unit" : "",
					"barCount" : 0,
					"labelFormat" : ""
			};
			
			switch(periodStr){
				case "yesterday":
					srchVals.howFarBack = 24;
					srchVals.unit = "hours";
					srchVals.barCount = 8;
					srchVals.labelFormat = "ha";
					break
					
				case "lastweek":
					srchVals.howFarBack = 7;
					srchVals.unit = "days";
					srchVals.barCount = 7;
					srchVals.labelFormat = "MMM DD YYYY";
					break;
					
				case "last2weeks":
					srchVals.howFarBack = 14;
					srchVals.unit = "days";
					srchVals.barCount = 7;
					srchVals.labelFormat = "MMM DD YYYY";
					break;
					
				case "last4weeks":
					srchVals.howFarBack = 4;
					srchVals.unit = "weeks";
					srchVals.barCount = 4;
					srchVals.labelFormat = "weeks";
					break;
			}
			
			this.barchartSearchVals = srchVals;
		},
		
		/* Methods sets the display values for cards
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @function setCardValues
		 * @param {object} divValuesArr, {div : "", value : ""}
		 * 
		 * */
		setCardValues : function(divValuesArr){
			
			divValuesArr.forEach(function(cardItem){
				$("#"+cardItem.div).html( cardItem.value );
			})
			
		},
		
		/* returns flower html for blank page
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @function getBlankImageHtml
		 * @return {string} 
		 * 
		 * */
		getBlankErrImageHtml : function(msg){
			
			msg = Boolean(msg) ? msg : "Unable to fetch data for plant. Please re-try or select a different plant"; 
			
			var html = "<div class='container-fluid'>"+ 
						"	<div class='row'>"+ 
						"		<div class='col-sm-1 col-md-1 col-lg-1 col-xs-1'></div>"+
						"		<div class='col-sm-10 col-md-10 col-lg-10 col-xs-10' style='padding:0.5em;'>"+
						"			<div class='alert alert-danger alert-dismissible' role='alert' style='text-align:center;'>"+
						"		  		<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"+
										msg +
						"			</div>"+
						"		</div>"+
						"		<div class='col-sm-1 col-md-1 col-lg-1 col-xs-1'></div>"+
						"	</div>"+ 
						"	<div class='row'>"+ 
						"		<div><img src='assets/img/Flower.png' class='flower'></div>"+ 
						"	</div>"+ 
						"</div>"
			return html;
		},
		
		/* returns flower html for blank page
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @function getBlankImageHtml
		 * @return {string} 
		 * 
		 * */
	  getBlankImageHtml : function(){
			return "<div><img src='assets/img/Flower.png' class='flower'></div>" 
			
		},
		
		/*This function generates the custom barchart ranges for yesterday (7hours out of the last 24 hrs), last week etc as per requirements and their data
		 * the function passes barchartSearchVals to local function getDateRangeCollection() to generate the barchart x values e.g for "yesterday", the 
		 * barcharSearchVals is { howFarBack : 24, unit : "hours", barCount : 8, labelFormat : "ha" }, so we generate x values over 24hr range with intervals of (24/8) so we get 8 bars in all
		 * 
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @function getBarchartData
		 * @return {Array} , [{"label" : "", "value" : ct},..]
		 * */
		
		getBarchartData : function(){
			var self = this;
			var getDateRangeCollection = function(subVal, opt, sep, forStr){
				  var dateValRange = [];
				  
				  for(var i = subVal; i >= 0; i--){
				    
				    if( (i % sep) < 1) {
				    	if(opt === "weeks"){
				    		//skip week 0
				    		if(i > 0){ 
				    			dateValRange.push( { "label" : "Week "+i, 
			                           				 "datestr" : RoundsSupervisor.DataManager.getCurrentMoment().subtract(i, opt).valueOf() 
			                         				} )
				    		}
				    		
				    	}else{
				    		dateValRange.push( { "label" : RoundsSupervisor.DataManager.getCurrentMoment().subtract(i, opt).format(forStr), 
				    							 "datestr" : RoundsSupervisor.DataManager.getCurrentMoment().subtract(i, opt).valueOf()  
		                         				} )
				    	}
				      
				    }
				    
				  }
				  
				  return dateValRange;
			};
				
			//get the barchart x axis date range values
			var xVals = getDateRangeCollection( parseInt(this.barchartSearchVals.howFarBack),
										   		this.barchartSearchVals.unit,
										   		parseInt(this.barchartSearchVals.howFarBack / this.barchartSearchVals.barCount),
										   		this.barchartSearchVals.labelFormat
										 	  );
			
			
			//for each date range value get the total number of rounds performed
			//returns an array  [{"label" : ", "value" : ""},.. ]
			return xVals.map(function(item){
					
					var ct = self.graphData.roundInstances
								.filter(function(roundInstance){
									//console.log("roundInstance.RoundDate : "+roundInstance.RoundDate +" , datestr : "+item.datestr +" - label : "+item.label )
									//console.log( self.barchartSearchVals.labelFormat+" - "+ moment( parseInt(roundInstance.RoundDate) ).format("YYYY-MM-DD") +" -> " + moment( item.datestr ).format("YYYY-MM-DD") +" = " + moment( parseInt(roundInstance.RoundDate), self.barchartSearchVals.labelFormat ).isSame(item.datestr, self.barchartSearchVals.labelFormat))
									if(self.barchartSearchVals.labelFormat === "weeks"){
										return moment( parseInt(roundInstance.RoundDate) ).isSame(item.datestr, self.barchartSearchVals.labelFormat) 
									}else{
										return moment( moment(parseInt(roundInstance.RoundDate)).format(self.barchartSearchVals.labelFormat) ).isSame( moment(item.datestr).format(self.barchartSearchVals.labelFormat) )
									}
									
								}).length;
					
					return {"label" : item.label, "value" : ct} 
					
				 });
			
			
		},
		
		sortByDate : function(roundInstanceCollection, field){
			return roundInstanceCollection.sort(function (a, b) {
				var aval = a[field].split("/Date(").join("").split(")/").join("");
				var bval = b[field].split("/Date(").join("").split(")/").join("");
                var timeDiff = moment(parseInt(aval)).diff( moment(parseInt(bval)) , 'day');
                var res = ( timeDiff < 0) ? 1 : ( ( timeDiff > 0 ) ? -1 : 0 );
                return res;
			});
		},
		
		/* returns the data for details pop-up dailog, the data is used by handlebars to generate html to be rendered into dialog html container
		 * @memberof app.services.RoundsSupervisor.ChartManager
		 * @function getDetailsData
		 * @param {string} option, matches the tbname attribute in chart.html
		 * @return {object} e.g. {"isPhone" :false, "listData": [[{"label":"", "value": ""}],..], "tableHeads": ["", ""], "tableData": ["",""]}
		 * 
		 * */
		
		getDetailsData : function(option){
			/* sample template data
			 * listData is used for generating he mobile list
			 * tabledata for the desktop table
			 var data = {
				  "isPhone": false,
				  "listData": [
				    [{"label": "Notification #", "value": "1224923" }, {"label": "Order #","value": "1234" } ],
				    [{"label": "Notification #","value": "0934456"}, {"label": "Order #","value": "4567"} ]
				  ],
				  "tableHeading": ["Notification #", "Order #", "Date"],
				  "tableData": [ [{"val": "N12312324", "expand":true }, {"val": "007", "expand":true, "details" : []}], [{"val": "N12312324", "expand":true}, {"val": "007", "expand":true}] ]
				};
			 */
			var self = this;
			
			var detailData = {
					"isPhone" : (( parseInt($(document).width()) < 600) ? true : false ),
					"listData" : [],
					"tableHeads" : [],
					"tableData" : [],
					"detailsArr" : []
			};
			
			var labelDictionary = {
					"RoundNumber" : "Round #",
					"RoundName" : "Round Name",
					"RoundDate" : "Date Completed",
					"UserName" : "User",
					"totalPointsRead" : "Points Read",
					"totalPointsUnread" : "Points Not Read",
					"Notificationdate" : "Date",
					"Notificationprioritydesc" : "Priority",
					"Notificationshorttext" : "Short Description",
					"Notification" : "Notification #",
					"Notificationequipmentdesc" : "Equipment",
					"Notificationfl" : "Functional Location",
					"Notificationequipment" : "Equipment ID",
					"Equipment" : "Equipment",
					"EquipmentKey" : "Functional Location",
					"PointDescription" : "Point Description",
					"PointNumber" : "Measuring Point",
					
			};
			
			var itemsIncluded = ["RoundDate","RoundName","RoundNumber","totalPointsRead","totalPointsUnread","UserName",
								"Notification", "Notificationshorttext", "Notificationfl", "Notificationprioritydesc","Notificationdate",
								"Equipment","EquipmentKey", "Notificationequipment","PointDescription", "PointNumber" ];
			
			switch(option){
			
				case "rounds":
					    
					this.sortByDate(this.graphData.roundInstances,"RoundDate")
							.forEach(function(instance){
								var tbheads = [""], tbdata = [], ltdata = [];  //[""] table header empty first column
								$.each(instance, function(key, val){
									if(itemsIncluded.indexOf(key) > -1){
										if(key === "RoundDate"){
											val = moment.utc(parseInt(val)).format("MMM DD, YYYY")
										}
										ltdata.push({"label" : $.isEmptyObject(labelDictionary[key]) ? "no label" : labelDictionary[key],
													 "value" : val});
										if(ltdata.length === 1){
											ltdata[0]["showNav"] = true;
										}
										
										tbheads.push(labelDictionary[key]);
										tbdata.push({ "val":val, "expand" : true });
									}
								})
								
								detailData.detailsArr.push( self.getPointsDetailsData(instance.RoundInstanceNumber) );
								detailData.listData.push(ltdata);
								detailData.tableHeads = tbheads;
								detailData.tableData.push(tbdata);
							});
					
					
					
					break;
				
				case "notification":
					this.sortByDate(this.graphData.notifications,"Notificationdate")
						.forEach(function(notification){
							var tbheads = [], tbdata = [], ltdata = [];
							
							$.each(notification, function(key, val){
								
								if(itemsIncluded.indexOf(key) > -1){
									if(key === "Notificationdate"){
										val = moment.utc(val).format("MMM DD, YYYY")
									}
									ltdata.push({"label" : labelDictionary[key], "value" : val});
									tbheads.push(labelDictionary[key]);
									tbdata.push({ "val":val });
								}
							});
							
							
							detailData.listData.push(ltdata.reverse());
							detailData.tableHeads = tbheads.reverse();
							detailData.tableData.push(tbdata.reverse());
						});
					
					
					break;
					
					
				case "watchflag":
				
					this.graphData.watchflags
						.forEach(function(flagData){
							var tbheads = [], tbdata = [], ltdata = [];
					
								$.each(flagData, function(key, val){
									if(itemsIncluded.indexOf(key) > -1 ){
										ltdata.push({"label" : labelDictionary[key], "value" : val});
										tbheads.push(labelDictionary[key]);
										tbdata.push({ "val":val });
									}
								});
							
							detailData.listData.push(ltdata);
							detailData.tableHeads = tbheads;
							detailData.tableData.push(tbdata);
							
						});
					break;	
					
			}
			
			return detailData;
			
		},
		
		getPointsDetailsData : function(roundsInstanceNum){
			var detailData = {
					"listData" : [],
					"tableHeads" : [],
					"tableData" : []
			};
			
			var labelDictionary = {
					"EquipmentKey" : "Functional Location",
					"Equipment" : "Equipment Description",
					"PointDescription" : "Measurement Description",
					"MeasurementReading" : "Measurement Reading",
					"MeasurementCodeText" : "Measurement Condition",
					"MeasurementUom" : "Unit Of Measure",
					"Comments" : "Comments"
			};
			
			var itemsIncluded = ["EquipmentKey","Equipment","PointDescription","MeasurementReading","MeasurementCodeText","MeasurementUom","Comments"];
			
			this.graphData.pointReading
				.filter(function(point){
					return (point.RoundInstance == roundsInstanceNum)
				})
				.forEach(function(point){
					var tbheads = [], tbdata = [], ltdata = [];
					
					$.each(point, function(key, val){
						if(itemsIncluded.indexOf(key) > -1 ){
							ltdata.push({"label" : labelDictionary[key], "value" : val});
							tbheads.push(labelDictionary[key]);
							if(key === "MeasurementReading"){
								val = (point.PointRead) ? val : "Not Read";
							}
							tbdata.push(val);
						}
					});
					
					detailData.listData.push(ltdata);
					detailData.tableHeads = tbheads;
					detailData.tableData.push(tbdata);
				});
			
			return detailData;
		}
		
		
});
