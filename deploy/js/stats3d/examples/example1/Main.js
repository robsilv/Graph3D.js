(function(){

	var GraphView = STATS3D.namespace("STATS3D.common.ui.views").GraphView;
	var DataModel = STATS3D.namespace("STATS3D.common.data").DataModel;

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