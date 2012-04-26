(function(){

	var GraphView = STATS3D.namespace("STATS3D.common.ui.views").GraphView;
	var DataModel = STATS3D.namespace("STATS3D.common.data").DataModel;

	document.addEventListener("DOMContentLoaded", (function ()
	{
		console.log("DOMContentLoaded");
		
		var graphView = GraphView.create();
		var dataModel = DataModel.create();
		
	}), false);
	
})();