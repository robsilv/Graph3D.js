(function(){
	
	var namespace = STATS3D.namespace("STATS3D.common.data");
	
	if(namespace.AxisViewModel === undefined) {
		
		var AxisViewModel = function AxisViewModel(axisLength, defaultTextSize) {
			this._init(axisLength, defaultTextSize);
		};
		
		namespace.AxisViewModel = AxisViewModel;
		
		var p = AxisViewModel.prototype = {};
		
		AxisViewModel.create = function create(axisLength, defaultTextSize) 
		{
			var newInstance = new AxisViewModel(axisLength, defaultTextSize);
			return newInstance;
		};
		
		p._init = function _init(axisLength, defaultTextSize) 
		{
			this._axisLength = axisLength;
			this._defaultTextSize = defaultTextSize;
			
			this.lines = [];
			this.text = [];
			this.markers = [];
			this.titleText = null;
			this.animationValues = { lines: [], text: [], markers: [], titleText: {}, container: {} };
			this.container = new THREE.Object3D();
		};
		
		p.destroy = function destroy() 
		{
			
		};
		
		p.getAxisMarkerPos = function getAxisMarkerPos(step)
		{
			return null;
		};
		p.getMarkerInitState = function getMarkerInitState(text)
		{
			return null;
		};
		p.getMarkerInitAnimValues = function getMarkerInitAnimValues()
		{	
			return null;
		};
		p.getTitleInitState = function getTitleInitState(text)
		{
			return null;
		};
		p.getTitleInitAnimValues = function getTitleInitAnimValues(state)
		{
			return null;
		};	
	}
})();