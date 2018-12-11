/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var T={};T.render=function(r,c){var i,R,n=c._getContentRepeat(),I=c.getItems(),C=c.getLabel();r.write("<div");r.writeControlData(c);r.writeAttribute("tabindex","0");r.addClass("sapMTPColumn");if(c.getIsExpanded()){r.addClass("sapMTPSliderExpanded");}if(!c.getIsCyclic()){r.addClass("sapMTimePickerSliderShort");}r.writeClasses();r.writeAccessibilityState(c,{role:"listbox",multiSelectable:false,live:"assertive",owns:c.getId()+"-content",labelledby:{value:c.getId()+"-label",append:true},describedby:{value:c.getId()+"-valDescription",append:true}});r.write(">");r.write("<div");r.writeAttribute("id",c.getId()+"-label");r.addClass("sapMTimePickerLabel");r.writeClasses();r.write(">");r.writeEscaped(C);r.write("</div>");r.write("<div");r.writeAttribute("id",c.getId()+"-valDescription");r.addClass("sapUiInvisibleText");r.writeClasses();r.write("></div>");r.write("<div class='sapMTimePickerItemArrows'>");r.renderControl(c.getAggregation("_arrowUp"));r.write("</div>");r.write("<div");r.addClass("sapMTimePickerSlider");T.addItemValuesCssClass(r,c);r.writeClasses();r.writeAttribute("unselectable","on");r.writeStyles();r.write(">");r.write("<div class=\"sapMTPPickerSelectionFrame\"></div>");r.write("<ul");r.writeAttribute("id",c.getId()+"-content");r.writeAttribute("unselectable","on");r.write(">");for(R=1;R<=n;R++){for(i=0;i<I.length;i++){r.write("<li");r.addClass("sapMTimePickerItem");if(!I[i].getVisible()){r.addClass("TPSliderItemHidden");}r.writeClasses();r.writeAccessibilityState(c,{role:"option",selected:false});r.writeAttribute("unselectable","on");r.write(">");r.writeEscaped(I[i].getText());r.write("</li>");}}r.write("</ul>");r.write("</div>");r.write("<div class='sapMTimePickerItemArrows'>");r.renderControl(c.getAggregation("_arrowDown"));r.write("</div>");r.write("</div>");};T.addItemValuesCssClass=function(r,c){var v=c.getItems().filter(function(i){return i.getVisible();}).length;if(v>2&&v<13){r.addClass("SliderValues"+v.toString());}};return T;},false);
