sap.ui.define([ 'jquery.sap.global', 
        'sap/ui/core/mvc/Controller',
        'sap/ui/core/Fragment', 
        'sap/ui/model/json/JSONModel',
        'sap/m/MessageBox', 
        'sap/ui/model/Filter',
        'sap/m/MessageToast'], function(jQuery, Controller, Fragment,JSONModel, MessageBox, Filter, MessageToast) {

  "use strict";
  return Controller.extend("app.components.main.main", {
    userSelection : {"PlantNum":"", "PlantName":"", "SubGroupNum":"", "Days": 1},
    busyDialog : null,
    rawPlantData : {},
    sortAsc : false,
    detailDialog : null,
    dateDialog : null,
    customDateStr : "",
    detailSortAsc : false,
    isCustomSearch : false,
    detailTbSortEl :null,
    detailTbData : {"tbname": "", "tbLabel":""},
    detailDialogTitleLabels :{
      "rounds" : "Rounds Executed ",
      "watchflag" : "Active Watch Flags",
      "notification" : "Notifications Created "
    },
    selectedListItemId : null,
    maximumDataPeriod : 30, //days, the maximum number of days data to be fetched from SAP for each plant
    defaultDataPeriod : {"days":7, "text": "lastweek"}, //days, the default number of days data that is displayed
    chartHtmlloaded : false,  //flag for whether the detail html has been loaded into ui5 html container

    /**
     * SAPUI5 Lifetime event
     * Registers onBeforeShow and onAfterShow lifetime events
     * @function onInit
     * @memberof app.components.main.main
     */
    onInit: function (evt) {
      var self = this;
      RoundsSupervisor.ChartManager.setBarchartSearchVals("lastweek");  //by default we display 1 week data

      //create and add detail dialog
      this.detailDialog = sap.ui.xmlfragment("app.components.dialogs.detail", this);
            this.getView().addDependent(this.detailDialog);

          //create and add date dialog
      this.dateDialog = sap.ui.xmlfragment("app.components.dialogs.date", this);
            this.getView().addDependent(this.dateDialog);
            
            this.busyDialog = sap.ui.xmlfragment('app.shared.busydialog.busydialog');
            
       //setup delegate methods
      this.getView().addEventDelegate({

        onBeforeShow: function (evt) {

        },

        onAfterShow: function (evt) {
          self.UIMobileChanges();
        },
      });

      Handlebars.registerHelper("isFirstColumn", function (index) {
        return ( index < 1 ) ? "" : "msortIcon glyphicon glyphicon-triangle-bottom";
            });

      Handlebars.registerHelper("isExpandable", function (index, expand) {
        if(Boolean(expand) && index < 1){
          return '<td><span class="glyphicon glyphicon-plus-sign" aria-hidden="true" ></span> </td>'
        }else{
          return "";
        }

            });

      Handlebars.registerHelper("getDetailList", function (index, detailArr) {

        var ret = "";
        if(Array.isArray(detailArr)){
          if(Boolean(detailArr[index])){
            var longTextLabels = ["Description", "Measurement Description", "Comments"]
            var detailData = detailArr[index];
            var lhtml = "";
            detailData.listData.forEach(function(tableData){
              lhtml = "";
              tableData.forEach(function(rowItem){
                if(longTextLabels.indexOf(rowItem.label) > -1){
                  lhtml = lhtml + "<tr><td colspan='3'><b>" + rowItem.label + ":</b></td></tr> <tr><td colspan='3'>" + rowItem.value + "</td></tr>";
                }else{
                  lhtml = lhtml + "<tr><td width='60%'><b>" + rowItem.label + "</b></td><td width='2%'>:</td><td colspan='2'>" + rowItem.value + "</td></tr>";
                }

              });

              ret = ret + '<li><a href="#"><table width="100%">' + lhtml + "</table></a></li>";
            });

          }
        }

        return ret;
            });

      Handlebars.registerHelper("getDetailTable", function (index, detailArr) {

        var ret = "";
        if(Array.isArray(detailArr)){
          if(Boolean(detailArr[index])){

            var detailData = detailArr[index];
            var thtml = "<tr>"; var trhtml = "";
            detailData.tableHeads.forEach(function(label){
              thtml = thtml + "<th>" + label + "</th>";
            });

            thtml = thtml + "</tr>";

            detailData.tableData.forEach(function(rowData){
              trhtml = trhtml + "<tr >";
              rowData.forEach(function(val){
                trhtml = trhtml + "<td>" + val + "</td>";
              })
              trhtml = trhtml + "</tr>";
            });

            ret = thtml + trhtml;
          }
        }

        return ret;
            });

      //redraw graphs in re-size 

      sap.ui.Device.resize.attachHandler(function(oEvt){

          var isPhone = (  parseInt($(document).width()) < 600 ) ? true : false;
          self.getView().getModel().setProperty("/isPhone",isPhone);
            
          if(parseInt($(document).width()) < 600){
            self.UIMobileChanges()
          }

          if(self.detailDialog !== null){
            if(self.detailDialog.isOpen() ){
              self.displayDetailData()
            }
          }

          var ht = $("#chart2").parent().prop("offsetHeight");
          $("#table-wrap").css("max-height", ht-10);
          $("#roundTable1").parent().css("height", ht-25);

      });

        //initialise view model detailsData/titleText 
            var viewDataModel = { "roundsData" : {"plants":[], "subgroups":{}, "roundsList" : [] }, 
                        "selectedSubGroup" : [], 
                        "isPhone" : sap.ui.Device.system.phone, 
                        "isNotPhone" : !(sap.ui.Device.system.phone), 
                        "detailsTbData" : {},
                        "roundsText": "",
                        "dateRange" : "",
                        "detailMobileSortItems" : [],
                        "plantName" : "",
                        "selectedRange" : "",
                        "showDateDialogButton" : false,
                        "showRange" : false,
                        "searchFromDate" : "",
                        "searchToDate" : "",
                        "fromMaxDate" : null,
                        "toMaxDate" : null,
                        "toMinDate" :  null,
                        "isDateError" : false
                        };
            
            this.getView().setModel( new sap.ui.model.json.JSONModel(viewDataModel) );
    },

     onAfterRendering: function() {
        //fetch data

              this.noChartData();
        this.fetchPlantData();
     },

    /**
     * UI changes for mobile view
     * @function UIMobileChanges
     */

    UIMobileChanges: function(){
      $(".sapMTextLineClamp").css("padding-top","10px");
    },

    setDetailContent :function(theHtml){

      if ($("#chartContentDiv").length < 1)
            { this.getView().byId("chartContent").setContent("<div id='chartContentDiv'>" + theHtml + "</div>"); }
            else
            { $("#chartContentDiv").html(theHtml); }
    },

    noChartData :  function(msg){
      this.chartHtmlloaded = false;
      console.log("msg : "+msg)
      //wierd MZ bug
      try{ RoundsSupervisor.ChartManager.unsetGraphs(); } catch(ex){ console.log(ex)}

      var html = RoundsSupervisor.ChartManager.getBlankImageHtml();
      if(msg !== null && msg !== undefined){
        html = RoundsSupervisor.ChartManager.getBlankErrImageHtml(msg);
      }
      this.setDetailContent( html );
    },

    /**
     * setup detail html content
     * @function loadDetailHtml
     * @memberof app.components.main.main
     */
    loadChartHtml : function(){
       this.chartHtmlloaded = true;
       return RoundsSupervisor.DataManager.getFileContents(RoundsSupervisor.global.serviceUrls.chartHtmlTemplate);
    },

    /**
     * fetch Plants and subgroup data
     * @function fetchPlantData
     * @memberof app.components.main.main
     */
    fetchPlantData : function(){
      var self = this;
      self.busyDialog.open();
       RoundsSupervisor.DataManager.fetchPlantData()
            .then(function(plantData){
              self.getView().getModel().setProperty("/roundsData/plants",plantData[0].plantList);
              self.getView().getModel().setProperty("/roundsData/subgroups",plantData[1]);
            })
            .then(function(){
              self.busyDialog.close();
            });
    },



    /**
     * Run query to fetch Rounds data based on plant with/without subgroup
     * @function fetchRoundsData
     * @memberof app.components.main.main
     */
    fetchRoundsData : function(){
      var self = this;
      var qry = RoundsSupervisor.global.serviceUrls.plantOnlyInfo.split("{{PlantNum}}").join( this.userSelection.PlantNum );
      self.busyDialog.open();

      var self = this;
      //we run this request only once per plant to fetch all the data for the maximum amount of time set
      //the selected days is used for client side filtering

       //var header = [{"Days" : this.getMaxDateSearchPeriod() }];  
       var dateRangeHeader = this.getMaxDateSearchPeriodHeader(); 
       RoundsSupervisor.DataManager.fetchRoundsData(qry, dateRangeHeader, self.userSelection.Days)
            .then(function(results){

              self.getView().getModel().setProperty("/roundsData/roundsList", results.roundsList); 
              self.getView().getModel().setProperty("/roundsText", "ROUNDS (" + results.roundsList.length + ")");
              self.rawPlantData = results.rawDataObj;

              RoundsSupervisor.ChartManager.graphData = results.graphData;

            })
            .then(function(){
              self.prepForGraphRender();
            })
            .catch(function(errMsg){
              self.busyDialog.close();
              self.noChartData(errMsg);
            });

    },

    sortPlantNames : function(){

      var plants = this.getView().getModel().getProperty("/roundsData/plants");
      var self = this;
      self.sortAsc = !self.sortAsc;

      var sorted = plants.sort(function(a, b){
        var p1 = a.PlantDesc.toLowerCase().split("saskpower - ").join("");
        var p2 = b.PlantDesc.toLowerCase().split("saskpower - ").join("");

        if(self.sortAsc){
          return ( p1 > p2) ? 1 : ( ( p1 < p2 ) ? -1 : 0 );
        }else{
          return ( p2 > p1) ? 1 : ( ( p2 < p1 ) ? -1 : 0 );
        }
      });

      this.getView().getModel().setProperty("/roundsData/plants", sorted);
    },


    /**
     * Press event handler for Plant Item selected
     * @function plantSelected
     * @memberof app.components.main.main
     */
    plantSelected: function(evt){

      this.showDetailPage();
      this.hideMasterPage();

      this.getView().getModel().setProperty("/showDateDialogButton",true);
      var plantNumber = evt.getSource().getDescription()

      var curSelectedItemId = evt.getSource().getId();
            

            if(this.selectedListItemId !== curSelectedItemId){
           
                            jQuery.sap.delayedCall(500, this, function(){
                                            var cId = "#" + curSelectedItemId;  var sId = "#" + this.selectedListItemId;
                                            $(sId).removeClass("selected");
                                            $(cId).addClass("selected");
                                            this.selectedListItemId = curSelectedItemId;
                            });
                            
            }

            
          //we only query when a different plant is selected
            if(plantNumber !== this.userSelection.PlantNum){

              this.setChartSearchVals( this.defaultDataPeriod.days, this.defaultDataPeriod.text );
              this.userSelection.Days = this.defaultDataPeriod.days;
              this.userSelection.PlantNum = plantNumber
          this.userSelection.PlantName = evt.getSource().getTitle().toUpperCase().replace("SASKPOWER -","");
          var plantSubgroups = this.getView().getModel().oData.roundsData.subgroups[plantNumber]

          this.getView().getModel().setProperty("/plantName", this.userSelection.PlantName);
          this.getView().getModel().setProperty("/selectedSubGroup",plantSubgroups);
          this.updateDaysSelected(this.userSelection.Days);
          this.fetchRoundsData();
            }else{

              //this.updateDaysSelected(this.userSelection.Days);
              this.prepForGraphRender();
            }

    },

    prepForGraphRender : function(){
      var self = this;
      if(!this.chartHtmlloaded){
        this.loadChartHtml()
          .then(function(html){
            self.setDetailContent(html)
            //self.getView().byId("chartContent").setContent( html );

            //setup card click event handlers
            jQuery.sap.delayedCall(500, self, function(){
              $(".cardHover").on("click",function(){
                var tbname = $(this).attr("tbname");
                self.showDetailDialog(tbname);
              } );
            });
          })
          .then(function(){
            self.showGraphs();
          });

      }else{
        this.showGraphs();
      }
    },

    showGraphs : function(){
      this.busyDialog.close();
      if(!$.isEmptyObject( this.rawPlantData)){
        var filteredData = RoundsSupervisor.DataManager.processRoundsData(this.rawPlantData, this.userSelection.Days);
        RoundsSupervisor.ChartManager.graphData = filteredData.graphData;
        RoundsSupervisor.ChartManager.renderGraphs();
      }
    },

    /**
     * Press event handler for Business group menu item selected, calls businessGroupSelected function
     * @function menuBusinessGroupSelected
     * @memberof app.components.main.main
     */
    menuBusinessGroupSelected: function(evt){
      var menuText = evt.getParameter("item").getText();
      var busGroup = (menuText.indexOf("Power") > -1) ? "power" : "dist";
      this.filterBusinessGroup(busGroup)
    },


    /**
     * Press event handler for Business group selected, calls businessGroupSelected function
     * @function businessGroupSelected
     * @memberof app.components.main.main
     */
    businessGroupSelected: function(evt){
      var busGroup = evt.getSource().getSelectedKey();
      this.filterBusinessGroup(busGroup)
    },

    /**
     * Filter Plant list
     * @function filterBusinessGroup
     * @memberof app.components.main.main
     * @param {String} busGroup
     */

    filterBusinessGroup : function(busGroup){
      try{

        var aFilters = []; var ids = [];
        var powerBusPlants = RoundsSupervisor.global.businessGroupPlants.power;
        var allPlants = this.getView().getModel().getProperty("/roundsData/plants");

        allPlants.forEach(function(item){

            if(busGroup == "power")
            { 
              if(powerBusPlants.indexOf(item.PlantNumber) > -1){
                aFilters.push( new Filter("PlantNumber", sap.ui.model.FilterOperator.EQ, item.PlantNumber ) ); 
              }
            }else{
              if(powerBusPlants.indexOf(item.PlantNumber) < 0){
                aFilters.push( new Filter("PlantNumber", sap.ui.model.FilterOperator.EQ, item.PlantNumber ) ); 
              }
            }
        });
     
             // update list items
             var list = this.getView().byId("selectPlantList");
             var binding = list.getBinding("items");
             binding.filter(aFilters, "Application");
                 
        }catch(ex){
          console.log(ex)
        }
    },

    getMaxDateSearchPeriod : function(){

      if(RoundsSupervisor.DataManager.usingTestDate){
        //moment(RoundsSupervisor.DataManager.referenceDate
        var now = moment(); //todays date
        var end = moment(RoundsSupervisor.DataManager.referenceDate); // back date
        var timeBack = moment.duration(now.diff(end));
        return Math.round(timeBack.asDays()) + this.maximumDataPeriod;
      }else{
        return this.maximumDataPeriod;
      }
    },

    getMaxDateSearchPeriodHeader : function(){
      if(RoundsSupervisor.DataManager.usingTestDate){

        var backDate = moment(RoundsSupervisor.DataManager.referenceDate); // back date

        return { "fromdate" : backDate.format("YYYYMMDD"),
               "todate" : backDate.add(parseInt(this.maximumDataPeriod), "Days").format("YYYYMMDD") };

      }else{


        if(this.isCustomSearch){
          var fromDate = this.getView().getModel().getProperty("/searchFromDate");
          var toDate = this.getView().getModel().getProperty("/searchToDate")
           
          return { "fromdate" : moment(fromDate).format("YYYYMMDD"),
               "todate"   : moment(toDate).format("YYYYMMDD")  };
        }
        else{

        return { "fromdate" : moment().subtract(parseInt(this.maximumDataPeriod), "Days").format("YYYYMMDD"),
             "todate"   : moment().format("YYYYMMDD")  };

        }
      }
    },

    /**
     * gets the date range in format e.g. Feb 10 - 12
     * @function getDateRange
     * @param {Integer} days
     * @return {String} range
     * @memberof app.components.main.main
     */

    getDateRange : function(days){

      var from = RoundsSupervisor.DataManager.getCurrentMoment().subtract(days, "days");
      var fromMonth = from.format("MMM")

      var toMonth = RoundsSupervisor.DataManager.getCurrentMoment().format("MMM");
      var to = (fromMonth === toMonth) ? RoundsSupervisor.DataManager.getCurrentMoment().format("DD") : RoundsSupervisor.DataManager.getCurrentMoment().format("MMM DD")

      return from.format("MMM DD") + " - " + to;
    },

    /**
     * Press event handler for Days selected
     * @function daysSelected
     * @memberof app.components.main.main
     */
    daysSelected : function(){
      //var menutext = evt.getParameter("item").getText().toLowerCase().split(" ").join("");
      var selectedRange = this.getView().getModel().getProperty("/selectedRange");
      var days = 1;

      switch(selectedRange){

        case "lastweek":
          days = 7;
          break;

        case "last2weeks":
          days = 14;
          break;

        case "last4weeks":
          days = 30;
          break;
      }

      this.setChartSearchVals(days, selectedRange);
    },

    /* Sets the ChartManger searchvals parameter
     * @function setChartSearchVals
     * @param {Integer} days e.g. 1
     * @param {String} menutext e.g. yesterday
     * @memberof app.components.main.main
     * */
    setChartSearchVals : function(days, menutext){

      if(this.userSelection.PlantNum !== ""){
        this.userSelection.Days = days;
        this.updateDaysSelected(days);
        RoundsSupervisor.ChartManager.setBarchartSearchVals(menutext);

        if(this.isCustomSearch){
          this.isCustomSearch = false;
          this.fetchRoundsData();
        }else{
          this.showGraphs();
        }

      }
    },

    /**
     * Press set days selected, updates the dateRange model parameter
     * @function updateDaysSelected
     * @param {integer} days
     * @memberof app.components.main.main
     */
    updateDaysSelected : function(days){
      var plantName = this.getView().getModel().getProperty("/plantName");
       if(plantName.length > 0){
         this.customDateStr = "("+ this.getDateRange(days) + ")";
         this.getView().getModel().setProperty("/dateRange", this.customDateStr);
       }
    },

    setDetailDialogContent : function(html){

      if ($("#detailDataDiv").length < 1)
            { sap.ui.getCore().byId("detailTableContainer").setContent("<div id='detailDataDiv'>" + html + "</div>"); }
            else
            { $("#detailDataDiv").html(html); }
    },

     sortMobileList : function(evt){
            var index = evt.getParameter("item").getKey(); 
            var val = evt.getParameter("item").getText();
            var isPoints = ( val.toLowerCase().indexOf("point") ) > -1 ? true : false;

            var self = this;
            var rowInfo = [];
            this.detailSortAsc = !this.detailSortAsc;

        $("#detailList1 > li > a > table > tbody")
          .each(function(){
            var atrow = $($(this).children()[index]);
            rowInfo.push( { "id"   : $(this).parent().parent().parent().prop("id"), 
                    "text" : atrow.text().split(":")[1].trim(" ") } );
            });
         
         var sortedArr = rowInfo.sort(function(a, b){
           if(self.detailSortAsc){
             
               if(moment(a.text, "MMM DD, YYYY", true).isValid()){
                 var timeDiff = moment(a.text).diff( moment(b.text) , 'day');
                       return ( timeDiff < 0) ? 1 : ( ( timeDiff > 0 ) ? -1 : 0 );
               }else{
                 if(isPoints){
                   return ( parseInt(a.text) > parseInt(b.text) ) ? 1 : ( ( parseInt(a.text) < parseInt(b.text) ) ? -1 : 0 ); 
                 }else{
                   return ( a.text > b.text) ? 1 : ( ( a.text < b.text ) ? -1 : 0 ); 
                 }
                 
               }

            }else{

              if(moment(a.text, "MMM DD, YYYY", true).isValid()){
                 var timeDiff = moment(a.text).diff( moment(b.text) , 'day');
                       return ( timeDiff > 0) ? 1 : ( ( timeDiff < 0 ) ? -1 : 0 );
               }else{
                 if(isPoints){
                   return ( parseInt(b.text) > parseInt(a.text)) ? 1 : ( ( parseInt(b.text) < parseInt(a.text) ) ? -1 : 0 );
                 }else{
                   return ( b.text > a.text) ? 1 : ( ( b.text < a.text ) ? -1 : 0 );
                 }

               }

            }
          });
         
         
         
         sortedArr.forEach(function(item){
           $( "#"+item.id ).insertAfter( $( "#"+item.id ).siblings().last() );
           $("#detail-"+item.id).insertAfter( $("#"+item.id) );
         });
         
         },

    sortTable : function(index, order){

      var rowInfo = [];

       $("#detailTb1 > tbody > tr").not(".detailClass")
        .each(function(){
          var atrow = $($(this).children()[index]);
          rowInfo.push( { "id" : $(this).prop("id"), "text" : atrow.text().trim(" ") } );
          });
       
       var isPoints = ( rowInfo[0].text.toLowerCase().indexOf("point") ) > -1 ? true : false;
       rowInfo.splice(0,1);
       
       var sortedArr = rowInfo.sort(function(a, b){
         if(order){
           
             if(moment(a.text, "MMM DD, YYYY", true).isValid()){
               var timeDiff = moment(a.text).diff( moment(b.text) , 'day');
                     return ( timeDiff < 0) ? 1 : ( ( timeDiff > 0 ) ? -1 : 0 );
             }else{
               if(isPoints){
                 return ( parseInt(a.text) > parseInt(b.text)) ? 1 : ( ( parseInt(a.text) < parseInt(b.text) ) ? -1 : 0 );
               }else{
                 return ( a.text > b.text) ? 1 : ( ( a.text < b.text ) ? -1 : 0 ); 
               }
             }

          }else{

            if(moment(a.text, "MMM DD, YYYY", true).isValid()){
               var timeDiff = moment(a.text).diff( moment(b.text) , 'day');
                     return ( timeDiff > 0) ? 1 : ( ( timeDiff < 0 ) ? -1 : 0 );
             }else{
               if(isPoints){
                 return ( parseInt(b.text) > parseInt(a.text)) ? 1 : ( ( parseInt(b.text) < parseInt(a.text) ) ? -1 : 0 );
               }else{
               return ( b.text > a.text) ? 1 : ( ( b.text < a.text ) ? -1 : 0 );
               }
             }

          }
        });
       
       sortedArr.forEach(function(item){
        $("#"+item.id).insertAfter( $("#"+item.id).siblings().last() );
        $("#detail-"+item.id).insertAfter( $("#"+item.id) );
       });
       
    },



    setupDetailTableEvents : function(){
      var self = this;
      jQuery.sap.delayedCall(500, this, function(){

          $(".msortIcon").parent().on("click",function(){
            if(Boolean(self.detailTbSortEl)){
              //self.detailTbSortEl.addClass("hideIcon");
            }

            self.detailTbSortEl = $(this).children(".msortIcon");
            self.detailTbSortEl.removeClass("hideIcon");
            if(self.detailTbSortEl.hasClass("glyphicon-triangle-bottom")){
              self.detailTbSortEl.removeClass("glyphicon-triangle-bottom");
              self.detailTbSortEl.addClass("glyphicon-triangle-top");
            }else{
              self.detailTbSortEl.addClass("glyphicon-triangle-bottom");
              self.detailTbSortEl.removeClass("glyphicon-triangle-top");
            }

            var index = self.detailTbSortEl.parent().prop("id").split("-")[2];
            self.detailSortAsc = !self.detailSortAsc;
            self.sortTable( parseInt(index), self.detailSortAsc );
          
          });
          
          //table row clicks
         $("#detailTb1 > tbody > tr").each(function(index){
           
           var isExpandable = $(this).first().find(".glyphicon-plus-sign").length;
           
           if(isExpandable > 0){
             $(this).on("click", function(){
             
                var match = $(this).next().find("td");
                var closed = $(this).first().find(".glyphicon-plus-sign").length;

                if( closed > 0 ){
                  $(this).first().find(".glyphicon-plus-sign").removeClass("glyphicon-plus-sign").addClass("glyphicon-minus-sign")
                }else{
                  $(this).first().find(".glyphicon-minus-sign").addClass("glyphicon-plus-sign").removeClass("glyphicon-minus-sign")
                }

                  if(match.hasClass("detailActive")){
                    match.css("display","none").removeClass("detailActive")
                  }else{
                    $(this).first().find(".glyphicon-minus-sign").removeClass("glyphicon-plus-sign").addClass("glyphicon-minus-sign")
                    match.css("display","").addClass("detailActive")
                  }
             });
           }
           
           
          });
          
         
         //list item clicks
         $("#detailList1 > li").each(function() {
           var isExpandable = $(this).first().find(".glyphicon-chevron-right").length;
          
           if(isExpandable > 0){
             $(this).on("click", function(){
                var match = $(this).next();
                var closed = $(this).first().find(".glyphicon-chevron-right").length;

                if( closed > 0 ){
                  $(this).first().find(".glyphicon-chevron-right").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down")
                }else{
                  $(this).first().find(".glyphicon-chevron-down").addClass("glyphicon-chevron-right").removeClass("glyphicon-chevron-down")
                }

                if(match.hasClass("detailActive")){
                    match.css("display","none").removeClass("detailActive");
                    match.find("td").css("display","none")
                  }else{
                    $(this).first().find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down")
                    match.css("display","").addClass("detailActive");
                    match.find("td").css("display","")

                    $(".detailClass").children().on("click",function(){
                      $(this).parent().parent().css("display","none").removeClass("detailActive")
                      $(this).parent().parent().prev().find(".glyphicon-chevron-down")
                                      .addClass("glyphicon-chevron-right").removeClass("glyphicon-chevron-down");
                    });
                  }


             });
           }
              });
          
      });
    },

    /**/
    displayDetailData : function(){
      if(this.detailTbData.tbname !== ""){
        var detailTemplateData = RoundsSupervisor.ChartManager.getDetailsData(this.detailTbData.tbname);

        var tableHeadItems = detailTemplateData.tableHeads
                    .filter(function(item, index){
                      //skip first empty header item
                      return (index > 0)
                    })
                    .map(function(item, index){
                        return {"label" : item, "position" :  index}
                    });


        try{
          var isPhone = (  parseInt($(document).width()) < 600 ) ? true : false;
          if(tableHeadItems.length > 0 && isPhone){
            sap.ui.getCore().byId("menuSortButton").setVisible(true);
            this.getView().getModel().setProperty("/detailMobileSortItems",tableHeadItems);
          }else{
              sap.ui.getCore().byId("menuSortButton").setVisible(false);
          }
        }catch(ex){
          console.log(ex)
        }


        var self = this;
        RoundsSupervisor.DataManager.getFileContents(RoundsSupervisor.global.serviceUrls.detailHtmlTemplate)
          .then(function(html){
            var template = Handlebars.compile(html);
            var templateHtml = template(detailTemplateData);
            self.setDetailDialogContent(templateHtml)
          })
          .then(function(){
            $(".sapMDialogScrollCont.sapMDialogStretchContent").css("padding","0px");
            self.setupDetailTableEvents();
          })
          .catch(function(err){
            self.setDetailDialogContent("")
          })
      }

    },

    /*
     * @function showDetailDialog
     * */
    showDetailDialog : function(detailTb){
      this.detailTbData.tbname = detailTb;
      this.detailTbData.tbLabel = this.detailDialogTitleLabels[detailTb];

      if(this.detailTbData.tbname == "watchflag")
      { this.getView().getModel().setProperty("/dateRange", ""); }

      this.getView().getModel().setProperty("/detailsTbData",this.detailTbData);
      if(this.detailDialog !== null){
        this.detailDialog.open();
        jQuery.sap.delayedCall(500, this, function(){
          $($("footer")[0]).css("bottom","-2em")
        });
        this.displayDetailData();

      }
    },

    closeDetailDialog : function(){
      if(this.detailDialog !== null){
        this.detailDialog.close()
      }

      this.getView().getModel().setProperty("/dateRange", this.customDateStr);

      //this.updateDaysSelected(this.userSelection.Days);
    },

    showDateDialog : function(){
      if(this.dateDialog !== null){
        this.getView().getModel().setProperty("/selectedRange","");
        this.getView().getModel().setProperty("/dateErrMsg", "");
        this.getView().getModel().setProperty("/isDateError", false);

        var selectedPlant = this.getView().getModel().getProperty("/plantName");

        if(selectedPlant.length < 1){
          this.noChartData("Please select a plant.")
        }else{
          //sap.ui.getCore().byId("startDateLabel")
          this.dateDialog.open();

          jQuery.sap.delayedCall(500, this, function(){
            sap.ui.getCore().byId("startDateLabel").$().parent().css("height","1em");
            sap.ui.getCore().byId("endDateLabel").$().parent().css("height","1em");
          });
        }

      }
    },

    closeDateDialog : function(){
      if(this.dateDialog !== null){
        this.dateDialog.close()
      }
    },


    customDateSearch : function(){
      var fromDate = this.getView().getModel().getProperty("/searchFromDate");
      var toDate = this.getView().getModel().getProperty("/searchToDate");

      var chkDate = function(){

        var errMsg = "";

        if(errMsg === ""){
          errMsg = ( moment(fromDate, "MMM DD, YYYY", true).isValid() || moment(fromDate, "YYYYMMDD", true).isValid()) ? "" : "Invalid Start Date";
        }

        if(errMsg === ""){
          errMsg = ( moment(toDate, "MMM DD, YYYY", true).isValid() || moment(toDate, "YYYYMMDD", true).isValid()) ? "" : "Invalid End Date";
        }

        if(errMsg === ""){
          //errMsg = moment(fromDate).isSame(toDate) ? "Start Date same as End Date" : "";
          errMsg = moment(fromDate).isAfter(toDate) ? "Start Date later than End Date" : "";

          var mfromDate = moment(fromDate); 
          var sToDate = moment(toDate);
          var daysDiff = sToDate.diff(mfromDate, 'Days');

          errMsg = daysDiff > 31 ? "Search Period is more than 31 days" : "";
        }

        return errMsg;
      };

      var errmsg = chkDate(); console.log("errmsg "+errmsg)
      if( errmsg.length > 0){
        this.getView().getModel().setProperty("/dateErrMsg", errmsg);
        this.getView().getModel().setProperty("/isDateError", true);
      }else{

        this.customDateStr = "(" + moment(fromDate).format("MMM DD, YY") + " - " + moment(toDate).format("MMM DD, YY") + ")";
        this.getView().getModel().setProperty("/dateRange", this.customDateStr);

        this.isCustomSearch = true;
        this.closeDateDialog();
        this.userSelection.Days = moment().diff(fromDate, 'Days'); //31;

        RoundsSupervisor.ChartManager.setBarchartSearchVals("last4weeks");
          this.fetchRoundsData();
      }

    },

    onRangeChange : function(){
      var selRange = this.getView().getModel().getProperty("/selectedRange");

      if(selRange !== ""){
        if(this.getView().getModel().getProperty("/selectedRange") === "custom"){
          this.getView().getModel().setProperty("/showRange", true);
          this.getView().getModel().setProperty("/searchFromDate", moment().subtract(31, "Days").format("MMM DD, YYYY") );
          this.getView().getModel().setProperty("/searchToDate", moment().format("MMM DD, YYYY"));
          this.getView().getModel().setProperty("/toMaxDate", moment().toDate());
          this.getView().getModel().setProperty("/fromMaxDate", moment().subtract(0, "Days").toDate());
          this.getView().getModel().setProperty("/toMinDate", moment().subtract(30, "Days").toDate());

        }else{
          this.getView().getModel().setProperty("/showRange", false);
          this.closeDateDialog();
          this.daysSelected();
        }
      }

    },

    onFromDateChange : function(){
      var fromDate = this.getView().getModel().getProperty("/searchFromDate");
      if ( moment(fromDate, "MMM DD, YYYY", true).isValid() || moment(fromDate, "YYYYMMDD", true).isValid()){

        if( moment(fromDate).add(31, "Days").isBefore(moment()) ){
          this.getView().getModel().setProperty("/toMaxDate", moment(fromDate).add(31, "Days").toDate());
          this.getView().getModel().setProperty("/toMinDate", moment(fromDate).add(0, "Days").toDate());
          this.getView().getModel().setProperty("/searchToDate", moment(fromDate).add(31, "Days").format("MMM DD, YYYY"));
        }else{
          this.getView().getModel().setProperty("/toMaxDate", moment().toDate());
          this.getView().getModel().setProperty("/toMinDate", moment().subtract(30, "Days").toDate());
          this.getView().getModel().setProperty("/searchToDate", moment().toDate().format("MMM DD, YYYY"));
        }

      }

    },


    /**
     * Back to fiori launchpad homepage
     * 
     * @function backToFiori
     * @memberof app.components.main.main
     */
    backToFiori : function() {
      window.parent.history.back();
    },

    /**
     * @memberof app.components.main.main
     * @function hideMasterPage
     */
    hideMasterPage : function(){
      this.getSplitAppObj().hideMaster();
    },

    /**used by split app containter when in phone/portrait mode to show the detail page and hide master page
     * @memberof app.components.main.main
     * @function 
     */
    showDetailPage : function(){
      this.getSplitAppObj().to(this.createId("detail"));
    },

    onPressDetailBack : function() {
      this.getSplitAppObj().backDetail();
    },

    getSplitAppObj : function() {
      var result = this.byId("SplitAppMain");
      if (!result) {
        console.log("SplitApp object can't be found");
      }
      return result;
    },

    onFilter: function (oEvt) {

            try {
                // add filter for search
                var aFilters = [];
                var sQuery = oEvt.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("plantNameNumber", sap.ui.model.FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }

                // update list binding
                var list = this.getView().byId("selectPlantList");
                var binding = list.getBinding("items");
                binding.filter(aFilters, "Application");

            } catch (ex) { console.log(ex); }
        },
        
        onDetailFilter : function(oEvt){

          try{
            var sQuery = oEvt.getSource().getValue().trim(" ").toLowerCase();
              if(sQuery.length > 0){
                var srch = new RegExp(sQuery);

                if( $("#detailTb1").length > 0 ){

                  $("#detailTb1 > tbody > tr").not(".detailClass").each(function() {
                      var rowData = $(this).text().toLowerCase();
                      if(rowData.indexOf("date completed") < 0){
                        srch.test(rowData) ? $(this).show() : $(this).hide();
                      }
                      });

                }else{
                  //mobile filter
                  $("#detailList1 > li").each(function() {
                      var rowData = $(this).text().toLowerCase();
                      srch.test(rowData) ? $(this).show() : $(this).hide();
                      });

                }


              }else{
                  if( $("#detailTb1").length > 0 ){

                    $("#detailTb1 > tbody > tr").each(function() {
                        $(this).show();
                        });
                  }else{

                    $("#detailList1 > li").each(function() {
                        $(this).show();
                        });
                  }
              }
          }catch(ex){
            console.log(ex)
          }
      
        }
  });
});