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

RoundsSupervisor.DataManager || (RoundsSupervisor.DataManager = {
		
	useMockData : false,
	usingTestDate : false,
	referenceDate : "2016-08-30",
	subgroupData : {},

	/**
	 * returns local file content
	 * @function getFileContents
	 * @param {String} file, relative file path
	 * @return {Promise}, resolves with file content
	 */
	getFileContents : function(file){
		
		return new Promise(function(resolve, reject){
			if(file.length > 0){
				$.get( file, function( data ) {
		               resolve(data);
		            })
		            .fail(function(){
		            	reject(this)
		            });
			}else{
				reject("invalid path");
			}
			
		});
		
	},
	
	/**
	 * Runs HTTP request and returns
	 * 
	 * @function runRequest
	 * @memberof app.components.main.main
	 * @param {String} url - The request endpoint
	 * @param {Array} headers - Array of extra HTTP header pairs to include [{"":""}]
	 * @return {Promise} xmlhttpRequest Object- Resolves/rejects with the XMLhttpRequest object
	 */
	runRequest : function(url, method, headers) {
		
		return new Promise(function(resolve, reject) {
		
			var xmlhttp = new XMLHttpRequest();
	
			xmlhttp.open(method, url, true);
			xmlhttp.setRequestHeader("Content-Type", "application/atom+xml");
			
			if(!$.isEmptyObject(headers)){
				if(Array.isArray(headers)){
					$.each(headers, function(index, item){
						$.each(item, function(key, val){
							xmlhttp.setRequestHeader(key, val)
						  })
					})
				}
			}
	
			// ****************** envelope *******************
			var body = '<?xml version="1.0" encoding="UTF-8"?>'
					+ '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices">'
					+ '<content type="application/xml">'
					+ '<m:properties><d:DeviceType>iPad</d:DeviceType></m:properties></content></entry>';
			// ****************** envelope *******************
			
			var onSuccess = function() {
				
				switch(parseInt(this.status)){
					case 200:
							resolve(JSON.parse(this.responseText))
						break;
						
					case 400:
						reject(JSON.parse(this.responseText).error.message.value)
						break;
						
					default:
						reject(null);
						break;
					
				}
				
				
			};
	
			var onFail = function() {
				reject(null)
			};

			xmlhttp.addEventListener("load", onSuccess, false);
			xmlhttp.addEventListener("error", onFail, false);
			xmlhttp.send(body);
		
		 });
	},
	

	/**
	 * Runs request to return Plants
	 * 
	 * @function getPlants
	 * @memberof app.components.main.main
	 * @return {Promise} xmlhttpRequest Object- Resolves/rejects with the
	 *         XMLhttpRequest object
	 */
	getPlants : function(){
		
		var self = this;
		
		return new Promise(function(resolve, reject){
			
			if(self.useMockData){
				 self.getFileContents(RoundsSupervisor.global.serviceUrls.plantsMockData)
				 	.then(function(mockPlantData){
				 		resolve(mockPlantData)
				 	},function(err){
				 		reject(err)
				 	})
				 	.catch(function(ex){
				 		console.log(ex);
				 	});
			}else{
				 self.runRequest( RoundsSupervisor.global.serviceUrls.plants , "GET")
				 	 .then(function(data){
				 		 resolve(data)
				 	 })
				 	 .catch(function(ex){
				 		console.log(ex);
				 		// fall back to mockdata
				 		self.getFileContents(RoundsSupervisor.global.serviceUrls.plantsMockData)
					 	.then(function(mockPlantData){
					 		resolve(mockPlantData)
					 	},function(err){
					 		reject(err)
					 	})
					 	.catch(function(ex){
					 		console.log(ex);
					 	});
				 	 })
			}
			
		});
		
		
	},
	
	
	/**
	 * Runs request to return Sub Groups
	 * 
	 * @function getSubGroups
	 * @memberof app.components.main.main
	 * @return {Promise} xmlhttpRequest Object- Resolves/rejects with the
	 *         XMLhttpRequest object
	 */
	getSubGroups : function(){
		
		var self = this;
		
		return new Promise(function(resolve, reject){
			
			if(self.useMockData){
				 self.getFileContents(RoundsSupervisor.global.serviceUrls.subgroupsMockData)
				 	.then(function(mockSubgroupData){
				 		resolve(mockSubgroupData)
				 	},function(err){
				 		reject(err)
				 	})
				 	.catch(function(ex){
				 		console.log(ex);
				 	});
			}else{
				 self.runRequest( RoundsSupervisor.global.serviceUrls.subgroups , "GET")
				 	 .then(function(data){
				 		 resolve(data)
				 	 })
				 	 .catch(function(ex){
				 		console.log(ex);
				 		// return mockdata
				 		self.getFileContents(RoundsSupervisor.global.serviceUrls.subgroupsMockData)
					 	.then(function(mockSubgroupData){
					 		resolve(mockSubgroupData)
					 	},function(err){
					 		reject(err)
					 	})
					 	.catch(function(ex){
					 		console.log(ex);
					 	});
				 	 })
			}
			
		});
	},
	
	/**
	 * Runs request get all plant and subgroup data
	 * 
	 * @function fetchPlantData
	 * @memberof app.components.main.main
	 * @return {Array} Object- Resolves/rejects with [plantListData,
	 *         plantAndItsSubgroups]
	 */
	fetchPlantData : function(){
		var self = this;
		var dataPromises = [];
		dataPromises.push(this.getPlants());
		dataPromises.push(this.getSubGroups());
		
		return new Promise(function(resolve, reject){

			Promise.all(dataPromises)
				.then(function(results){
					resolve ( self.processPlantData(results[0], results[1]) )
				});
		});
		
	},
	
	/**
	 * Runs request get all Rounds data based on the selected Plant and subgroup
	 * 
	 * @function fetchRoundsData
	 * @memberof app.components.main.main
	 * @param {string} qry
	 * @param {object} headers 
	 * @param {integer} filterDays, the number of days since today used by processRoundsData() to filter down data
	 * @return {Array} Object- Resolves/rejects with 
	 */
	fetchRoundsData : function(qry, headers, filterDays){
		
		var self = this;
		
		return new Promise(function(resolve, reject){

			if(self.useMockData){
				
				self.getFileContents(RoundsSupervisor.global.serviceUrls.roundsMockData)
			 		.then(function(roundsData){
			 			resolve( self.processRoundsData(roundsData, filterDays) );
			 		},function(err){
			 			if(err !== null){
			 				reject(err)
			 			}else{
			 				reject("")
			 			}
				 		
				 	})
			 		.catch(function(ex){
			 			console.log(ex);
			 			reject(ex);
			 		});
				
			}else{
				
				 self.runRequest(qry, "GET", [headers])
				 	.then(function(roundsData){
				 		resolve( self.processRoundsData(roundsData, filterDays) );
				 	}, function(err){
				 		if(err !== null){
			 				reject(err)
			 			}else{
			 				reject("")
			 			}
				 	})
				 	.catch(function(ex){
				 		console.log(ex);
				 		reject(ex)
				 	});
			}
			
		});
		
	},
	
	/**
	 * function to initCap words, 
	 * @function initCaps
	 * @param {String} instr
	 * @return {String} word
	 */
	
	initCap : function(instr){
		
		return instr
        .toLowerCase()
        .replace("saskpower", "SaskPower")
        .split(' ')
        .map(function(word) {
            var ret = word
            if(word.length > 0){
              ret = word[0].toUpperCase() + word.substr(1);
            }
      
            if(word.length > 2 && word.indexOf("&") > 1){
              ret = word.toUpperCase();
            }
            return ret;
        })
        .join(' ');
	},
	
	
	
	/**
	 * Processes plant and subgroup data into data collections
	 * 
	 * @function processPlantData
	 * @memberof app.components.main.main
	 * @param {Object} rawPlantData 
	 * @param {Object} rawSubgroupData 
	 */
	processPlantData : function(rawPlantData, rawSubgroupData){
		var self = this;
        var plantListData = { "plantList":[] };
        var plantAndItsSubgroups = {}; /* {"0001":[{"SubGroupNum":"0123","SubGroupDesc":"Test"}], ...} */
        
        rawPlantData.d.results
        	.forEach(function(item){
        		plantListData.plantList.push( {"PlantNumber": item.Plant, "PlantDesc": self.initCap(item.PlantName), "plantNameNumber" : item.Plant+"-"+self.initCap(item.PlantName) } );
        	});
        
        rawSubgroupData.d.results
        	.forEach(function(item){
        		if( $.isEmptyObject(plantAndItsSubgroups[item.Plant]) ) {
                    plantAndItsSubgroups[item.Plant] = [ ];
                }
                plantAndItsSubgroups[item.Plant].push({"SubGroupNum": item.SubGroupNum, "SubGroupDesc": self.initCap(item.SubGroupDesc)})
        	});
        	
       return [plantListData, plantAndItsSubgroups];

    },
    
    getCurrentMoment : function(){
		
		if(this.usingTestDate){
			return moment(this.referenceDate);
		}else{
			return moment();
		}
		
	},
    
    /**
	 * function to check if a given date >= currentDate - subDays, 
	 * @function inRange
	 * @param {integer} subDays
	 * @return {double} testDate, numeric datestring
	 */
	inRange : function(subDays, testDate){
		//utc is applied only to dates from SAP 
		testDate = parseInt( testDate.split("\/Date(").join("").split(")\/").join("") );
		//console.log( this.getCurrentMoment().subtract(subDays, "Days").format("YYYY-MM-DD") + " - testDate : " +testDate + " - - " + moment(testDate).format("YYYY-MM-DD") +" - " + moment(testDate).isBetween(this.getCurrentMoment().subtract(subDays, "Days"), this.getCurrentMoment(), null, []) )
		//return this.getCurrentMoment().subtract(subDays, "Days").isSameOrBefore(testDate);
		if(app.getCurrentPage().getController().isCustomSearch){
			return true;
		}else{
			return moment.utc(testDate).isBetween(this.getCurrentMoment().subtract(subDays, "Days"), this.getCurrentMoment(), null, "[]");
		}
		
	},
    
    /**
	 * Processes rounds data into data collections
	 * 
	 * @function processRoundsData
	 * @memberof app.components.main.main
	 * @param {Object} rawDataObj 
	 * @param {integer} filterDays, the number of days since today used to filter down data
	 * @return [ rawDataObj, roundsListArray ]
	 */
    processRoundsData : function(rawDataObj, filterDays){
    	
    	var self = this;
    	var graphData = {
			"notifications" : [],
			"roundInstances" : [],
			"watchflags" : [],
			"pointReading" : []
		};
    	
    	var roundsList = [];  var uniqueWatchFlagPoints = [];
    
    	
    	rawDataObj.d.PlantsToSubGroups.results
    		.forEach(function(subgroupData){
    			//traverse plant subgroups
    			
    			subgroupData.RoundSubGroupToRounds.results
    				.forEach(function(rounds){
    					
    					//rounds
    					roundsList.push( { "RoundName" : rounds.RoundName, "RoundNumber" : rounds.RoundNumber } );
    					
    					//traverse round instances
    					rounds.RoundsToRoundInstance.results
    						.filter(function(theRoundInstance){
    							return self.inRange(filterDays, theRoundInstance.RoundDate)
    						})
    						.forEach(function(roundInstance){
    							var pointsRead = 0, pointsUnread = 0;
    								
    							//traverse roundInstance objects/equipments
    							roundInstance.RoundInstanceToObjects.results
    								.forEach(function(object){
    										
    									//traverse equipment points
    									object.ObjectsToPoints.results
    										.filter(function(point){
    											if(Boolean(point.PointsToDocuments.DocumentNumber) ){
    												return (point.PointsToDocuments.DocumentNumber !== "") ? true : false;
    											}else{
    												return false;
    											}
    											
    										})
    										.forEach(function(point){
    											
    											  //track notifications created
    											  if(point.PointsToDocuments !== null && point.PointsToDocuments !== undefined){
    					    						   if(point.PointsToDocuments.Notification.length > 0){
    					    							   graphData.notifications.push(point.PointsToDocuments); 
    					    						   }
    					    					   }
    											  
    											  //track point readings
    											  graphData.pointReading.push({
    					    						   "Equipment" : object.ObjectDesc,
    					    						   "RoundNumber" : rounds.RoundNumber,
    					    						   "EquipmentKey" : object.Objectkey,
    					    						   "PointNumber" : point.PointNumber,
    					    						   "Notificationfl" : point.PointsToDocuments.Notificationfl,
    					    						   "MeasurementReading": (point.PointsToDocuments.MeasNumValueUnit !== "") ? point.PointsToDocuments.MeasNumValue : "",
    					    						   "MeasurementCodeText" : point.PointsToDocuments.MeasCodeText,
    					    						   "MeasurementUom": point.PointsToDocuments.MeasNumValueUnit,
    					    						   "PointDescription" : point.PointDescription,
    					    						   "Comments" : point.PointsToDocuments.MeasDocText,
    					    						   "MeasurementText": point.PointsToDocuments.MeasCodeText,
    					    						   "Date" : roundInstance.RoundDate,
    					    						   "RoundInstance": point.RoundInstanceNumber,
    					    						   "PointRead" : (point.PointsToDocuments.Code !== "9999") ? true : false
    					    					   });
    											  
    											  //track points read/unread
    											  if(point.PointsToDocuments.Code !== "9999"){ 
    					    						   pointsRead++;
    					    					   	}else{
    					    					   		pointsUnread++;
    					    					   	}
    											  
    											  //track watchflags
    											  if(point.WatchFlag === "X"){
    												  
    												  if(uniqueWatchFlagPoints.indexOf(point.PointNumber) < 0){
    													  
    													  uniqueWatchFlagPoints.push(point.PointNumber);
	    					    						  graphData.watchflags.push({
	    					    							   "Equipment" : object.ObjectDesc,
	    					        						   "EquipmentKey" : object.Objectkey,
	    					        						   "PointNumber" : point.PointNumber,
	    					        						   "PointDescription" : point.PointDescription,
	    					        						   "RoundInstance": point.RoundInstanceNumber,
	    					        					   });
	    					    						   
	    											  }
    												  
    					    					   }
    										});
    									
    								});
    							
    							
    							roundInstance.RoundDate = roundInstance.RoundDate.split("/Date(").join("").split(")").join("").split("/").join("");
    							   
    			    			graphData.roundInstances.push( { 
    			    						   "RoundName" : rounds.RoundName, 
    			    						   "RoundNumber" : rounds.RoundNumber,
    			    						   "RoundInstanceNumber" : roundInstance.RoundInstanceNumber,
    			    						   "UserName" : roundInstance.UserName,
    			    						   "RoundDate" : roundInstance.RoundDate,
    			    						   "RoundDateText" : roundInstance.RoundDateText,
    			    						   "RoundTime" : roundInstance.RoundTime,
    			    						   "totalPointsRead" : pointsRead,
    			    						   "totalPointsUnread" : pointsUnread
    			    			 });
    							
    						})
    				});
    			
    		});
    	
    	var res = {
        		"roundsList" : roundsList,
        		"graphData" : graphData,
        		"rawDataObj" : rawDataObj
        	};
    	return res;
    }
	
})