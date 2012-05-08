(function(){

	var GraphView = GRAPH3D.namespace("GRAPH3D.common.ui.views").GraphView;
	var DataModel = GRAPH3D.namespace("GRAPH3D.common.data").DataModel;

	document.addEventListener("DOMContentLoaded", (function ()
	{
		console.log("DOMContentLoaded");
		TWEEN.start();
		
		var graphView = GraphView.create();
		var dataModel = DataModel.create();
		dataModel.addEventListener( "loadComplete", function() { graphView.setDataProvider(dataModel.getData()); } );
		dataModel.load();
		
	}), false);
	
})();