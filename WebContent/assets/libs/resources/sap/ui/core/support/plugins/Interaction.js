/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/support/Plugin','sap/ui/core/support/controls/InteractionSlider','sap/ui/core/support/controls/InteractionTree','sap/ui/core/support/controls/TimelineOverview','sap/ui/Device','sap/m/MessageToast','sap/ui/thirdparty/jszip','sap/ui/core/util/File'],function(q,P,I,a,T,D,M,J,F){"use strict";var b=P.extend("sap.ui.core.support.plugins.Interaction",{constructor:function(s){P.apply(this,["sapUiSupportInteraction","Interaction",s]);this._oStub=s;if(this.isToolPlugin()){this._aEventIds=[this.getId()+"SetMeasurements",this.getId()+"SetActive",this.getId()+"Export",this.getId()+"Import",this.getId()+"SetQueryString"];q.sap.require("sap.ui.core.format.DateFormat");var p=function(i,w){return("000"+String(i)).slice(-w);};this._fnFormatTime=function(n){var N=new Date(n),m=Math.floor((n-Math.floor(n))*1000);return p(N.getHours(),2)+":"+p(N.getMinutes(),2)+":"+p(N.getSeconds(),2)+"."+p(N.getMilliseconds(),3)+p(m,3);};this._oInteractionSlider=new I();this._oInteractionTree=new a({});this._oTimelineOverview=new T();}else{this._aEventIds=[this.getId()+"Refresh",this.getId()+"Clear",this.getId()+"Start",this.getId()+"Stop",this.getId()+"Activate",this.getId()+"Export",this.getId()+"Import",this.getId()+"SetQueryString"];}}});b.prototype.init=function(s){P.prototype.init.apply(this,arguments);if(this.isToolPlugin()){c.call(this,s);}else{d.call(this,s);}};b.prototype.exit=function(s){P.prototype.exit.apply(this,arguments);};function c(s){var r=sap.ui.getCore().createRenderManager();r.write("<div class=\"sapUiSupportToolbar\">");r.write("<button id=\""+this.getId()+"-record\" class=\"sapUiSupportIntToggleRecordingBtn\"></button>");r.write("<label class='sapUiSupportIntODataLbl'><input type='checkbox' id=\""+this.getId()+"-odata\" > Enable OData Statistics</label>");r.write("<div class='sapUiSupportIntFupInputMask'>");r.write("<input id=\""+this.getId()+"-fileImport\" tabindex='-1' size='1' accept='application/zip' type='file'/>");r.write("</div>");r.write("<button id=\""+this.getId()+"-import\" class=\"sapUiSupportBtn sapUiSupportIntImportExportBtn sapUiSupportIntImportBtn \">Import</button>");r.write("<button id=\""+this.getId()+"-export\" class=\"sapUiSupportBtn sapUiSupportIntImportExportBtn sapUiSupportIntExportBtn sapUiSupportIntHidden\">Export</button>");r.write("<span id=\""+this.getId()+"-info\" class=\"sapUiSupportIntRecordingInfo\"></span>");r.write("</div><div class=\"sapUiSupportInteractionCntnt\">");r.write("</div>");r.write('<div class="sapUiPerformanceStatsDiv sapUiSupportIntHidden">');r.write('<div class="sapUiPerformanceTimeline" style="height: 50px;"></div>');r.write('<div class="sapUiPerformanceTop">');r.write('</div>');r.write('<div class="sapUiPerformanceBottom">');r.write('</div>');r.write('</div>');r.flush(this.$().get(0));r.destroy();r=sap.ui.getCore().createRenderManager();this._oTimelineOverview.render(r);r.flush(this.$().find('.sapUiPerformanceStatsDiv .sapUiPerformanceTimeline').get(0));r.destroy();r=sap.ui.getCore().createRenderManager();this._oInteractionSlider.render(r);r.flush(this.$().find('.sapUiPerformanceStatsDiv .sapUiPerformanceTop').get(0));r.destroy();this._oInteractionSlider._registerEventListeners();var t=this;q(".sapUiPerformanceTop").on("InteractionSliderChange",{},function(e,f,h){t._oInteractionTree.setRange(f,h);});this.$("refresh").click(q.proxy(function(e){this._oStub.sendEvent(this.getId()+"Refresh");},this));this.$("clear").click(q.proxy(function(e){this._oStub.sendEvent(this.getId()+"Clear");},this));this.$("export").click(q.proxy(function(e){this.onsapUiSupportInteractionExport();},this));this.$("fileImport").change(q.proxy(function(e){this.onsapUiSupportInteractionImport();},this));this.$("active").click(q.proxy(function(e){var A=false;if(this.$("active").prop("checked")){A=true;}this._oStub.sendEvent(this.getId()+"Activate",{"active":A});},this));this.$("odata").attr('checked',this._bODATA_Stats_On).click(q.proxy(function(e){q.sap.statistics(!q.sap.statistics());},this));this.$('record').attr('data-state',(!this._bFesrActive)?'Start recording':'Stop recording');this.$('record').click(q.proxy(function(e){if(this.$('record').attr('data-state')==='Stop recording'){this._oStub.sendEvent(this.getId()+"Refresh");this._oStub.sendEvent(this.getId()+"Activate",{"active":false});this.$('record').attr('data-state','Start recording');q(".sapUiPerformanceStatsDiv.sapUiSupportIntHidden").removeClass("sapUiSupportIntHidden");q(".sapUiSupportIntExportBtn.sapUiSupportIntHidden").removeClass("sapUiSupportIntHidden");}else if(this.$('record').attr('data-state')==='Start recording'){q(".sapUiPerformanceStatsDiv").addClass("sapUiSupportIntHidden");q(".sapUiSupportIntExportBtn").addClass("sapUiSupportIntHidden");this._oStub.sendEvent(this.getId()+"Clear");this._oStub.sendEvent(this.getId()+"Activate",{"active":true});this.$('record').attr('data-state','Stop recording');}},this));}function d(s){var _=/sap-ui-xx-fesr=(true|x|X)/.test(window.location.search);var e=q.sap.statistics()||/sap-statistics=(true|x|X)/.test(window.location.search);this._oStub.sendEvent(this.getId()+"SetQueryString",{"queryString":{bFesrActive:_,bODATA_Stats_On:e}});g.call(this);}function g(s,e){var A=q.sap.interaction.getActive()||this._bFesrActive;var m=[];if(A||e){m=e||q.sap.measure.getAllInteractionMeasurements(true);var f=window.performance.timing.fetchStart;for(var i=0;i<m.length;i++){var h=m[i];for(var j=0;j<h.requests.length;j++){var r=h.requests[j];h.requests[j]={connectEnd:r.connectEnd,connectStart:r.connectStart,domainLookupEnd:r.domainLookupEnd,domainLookupStart:r.domainLookupStart,duration:r.duration,entryType:r.entryType,fetchStart:r.fetchStart,initiatorType:r.initiatorType,name:r.name,redirectEnd:r.redirectEnd,redirectStart:r.redirectStart,requestStart:r.requestStart,responseEnd:r.responseEnd,responseStart:r.responseStart,secureConnectionStart:r.secureConnectionStart,startTime:r.startTime,workerStart:r.workerStart,fetchStartOffset:f};}}}this._oStub.sendEvent(this.getId()+"SetMeasurements",{"measurements":m});this._oStub.sendEvent(this.getId()+"SetActive",{"active":A});}b.prototype.onsapUiSupportInteractionSetQueryString=function(e){var p=e.getParameter("queryString");this._bFesrActive=p.bFesrActive;this._bODATA_Stats_On=p.bODATA_Stats_On;this.$("odata").attr('checked',this._bODATA_Stats_On);this.$('record').attr('data-state',(!this._bFesrActive)?'Start recording':'Stop recording');};b.prototype.onsapUiSupportInteractionSetMeasurements=function(e){this._setMeasurementsData(e.getParameter("measurements"));};b.prototype.onsapUiSupportInteractionSetActive=function(e){var A=e.getParameter("active");var C=this.$("active");if(A){C.attr("checked","checked");}else{C.removeAttr("checked");}};b.prototype.onsapUiSupportInteractionRefresh=function(e){g.call(this);};b.prototype.onsapUiSupportInteractionClear=function(e){q.sap.measure.clearInteractionMeasurements();this._oStub.sendEvent(this.getId()+"SetMeasurements",{"measurements":[]});};b.prototype.onsapUiSupportInteractionStart=function(e){q.sap.measure.start(this.getId()+"-perf","Measurement by support tool");};b.prototype.onsapUiSupportInteractionEnd=function(e){q.sap.measure.endInteraction(true);};b.prototype.onsapUiSupportInteractionActivate=function(e){var A=e.getParameter("active");if(q.sap.interaction.getActive()!=A){q.sap.interaction.setActive(A);}};b.prototype.onsapUiSupportInteractionExport=function(e){var m=this.measurements||[];if(m.length>0){if(D.browser.msie&&D.browser.version<10){M.show('Download action is not supported in Internet Explorer 9',{autoClose:true,duration:3000});return;}var z=new J();z.file("InteractionsSteps.json",JSON.stringify(m).replace(/,"isExpanded":true/g,''));var C=z.generate({type:"blob"});this._openGeneratedFile(C);}};b.prototype.onsapUiSupportInteractionImport=function(E){var h=this.$().find('#'+this.getId()+"-fileImport").get(0).files;if(h.length===0){M.show('Select a file for import first!',{autoClose:true,duration:3000});return;}if(!window.FileReader){M.show('Use a modern browser which supports FileReader!',{autoClose:true,duration:3000});return;}var r=new window.FileReader(),f=h[0],t=this;r.onload=(function(i){return function(e){var z=new J(e.target.result);var j=z.files["InteractionsSteps.json"]&&z.files["InteractionsSteps.json"].asText();if(j){t._setMeasurementsData(JSON.parse(j.replace(/,"isExpanded":true/g,'')));}else{M.show('Imported data does not contain interaction measures',{autoClose:true,duration:3000});}};})(f);r.readAsArrayBuffer(f);};b.prototype._openGeneratedFile=function(C){F.save(C,"InteractionSteps","zip","application/zip");};b.prototype._setMeasurementsData=function(m){var r=0,e=100,f=function(j){var k=function(R,p){var u=0;if(R.length===0){return u;}for(var i=R.length-1;i>=0;i--){if(R[i].startTime<p.startTime){u=i+1;break;}}return u;},l=function(O,p){return O.filter(function(u){return u.timing.startTime===p;});},n=function(p,u){var v=0;if(p.length===0){return v;}for(var i=p.length-1;i>=0;i--){if(p[i].start<(u.fetchStartOffset+u.startTime)){v=i;break;}}return v;},o=0;j.forEach(function(p,u,v){var w=p.requests;for(var i=w.length-1;i>=0;i--){var x=w[i];if(u>0&&p.start-e>(x.fetchStartOffset+x.startTime)){var y=n(v,x);var z=v[y].requests;o=k(z,x);z.splice(o,0,x);w.splice(i,1);var O=l(p.sapStatistics,x.startTime);if(O.length>0){v[y].sapStatistics=v[y].sapStatistics.concat(O);}}}});};f(m);this.measurements=m;for(var i=0;i<m.length;i++){r+=m[i].requests.length;}if(m.length>0){q(".sapUiPerformanceStatsDiv.sapUiSupportIntHidden").removeClass("sapUiSupportIntHidden");q(".sapUiSupportIntExportBtn.sapUiSupportIntHidden").removeClass("sapUiSupportIntHidden");this.$('info').text("Total "+r+" Requests in "+m.length+" Interactions");}else{q(".sapUiPerformanceStatsDiv").addClass("sapUiSupportIntHidden");q(".sapUiSupportIntExportBtn").addClass("sapUiSupportIntHidden");this.$('info').text("");}var t=this.$().find('.sapUiPerformanceStatsDiv .sapUiPerformanceTimeline').get(0);var h=sap.ui.getCore().createRenderManager();this._oTimelineOverview.setInteractions(m);this._oTimelineOverview.render(h);h.flush(t);h.destroy();this._oInteractionSlider._initSlider();this._oInteractionSlider.setDuration(m);var s=this.$().find('.sapUiPerformanceStatsDiv .sapUiPerformanceBottom').get(0);this._oInteractionTree.setInteractions(m);this._oInteractionTree.renderAt(s);};return b;});
