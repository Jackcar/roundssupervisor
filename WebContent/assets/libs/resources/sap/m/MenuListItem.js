/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./ListItemBase','./library','sap/ui/core/EnabledPropagator','sap/ui/core/IconPool'],function(q,L,l,E,I){"use strict";var M=L.extend("sap.m.MenuListItem",{metadata:{library:"sap.m",properties:{title:{type:"string",group:"Misc",defaultValue:null},icon:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},iconDensityAware:{type:"boolean",group:"Misc",defaultValue:true},titleTextDirection:{type:"sap.ui.core.TextDirection",group:"Appearance",defaultValue:sap.ui.core.TextDirection.Inherit},startsSection:{type:"boolean",group:"Behavior",defaultValue:false}},associations:{menuItem:{type:"sap.m.MenuItem",multiple:false}}}});M.prototype.exit=function(){if(this._image){this._image.destroy();}if(this._imageRightArrow){this._imageRightArrow.destroy();}L.prototype.exit.apply(this,arguments);};M.prototype._getImage=function(i,s,S,b){var o=this._image;if(o){o.setSrc(S);if(o instanceof sap.m.Image){o.setDensityAware(b);}}else{o=I.createControlByURI({id:i,src:S,densityAware:b,useIconTooltip:false},sap.m.Image).setParent(this,null,true);}if(o instanceof sap.m.Image){o.addStyleClass(s,true);}else{o.addStyleClass(s+"Icon",true);}this._image=o;return this._image;};M.prototype._getIconArrowRight=function(){if(!this._imageRightArrow){this._imageRightArrow=I.createControlByURI({id:this.getId()+"-arrowRight",src:"sap-icon://slim-arrow-right",useIconTooltip:false},sap.m.Image).setParent(this,null,true);this._imageRightArrow.addStyleClass("sapMMenuLIArrowRightIcon",true);}return this._imageRightArrow;};M.prototype._hasSubItems=function(){return!!(this.getMenuItem()&&sap.ui.getCore().byId(this.getMenuItem()).getItems().length);};return M;},false);
