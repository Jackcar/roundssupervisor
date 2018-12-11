var app = null;

sap.ui.getCore().attachInit(function(){
	
	sap.ui.localResources("app");
	RoundsSupervisor.global.busyDialog = sap.ui.xmlfragment('app.shared.busydialog.busydialog');

	app = new sap.m.App();
	var mainPage = sap.ui.view({id : "mainPage", viewName : "app.components.main.main",type : sap.ui.core.mvc.ViewType.XML });
	app.addPage(mainPage);
	app.placeAt("content");
	
});

	

