(function(){
	
	var namespace = STATS3D.namespace("STATS3D.common.data");
	
	if(namespace.XAxisViewModel === undefined) {
		
		var XAxisViewModel = function XAxisViewModel(axisLength, defaultTextSize) {
			this._init(axisLength, defaultTextSize);
		};
		
		namespace.XAxisViewModel = XAxisViewModel;
		
		var p = XAxisViewModel.prototype = {};
		
		XAxisViewModel.create = function create(axisLength, defaultTextSize) 
		{
			var newInstance = new XAxisViewModel(axisLength, defaultTextSize);
			return newInstance;
		};
		
		p._init = function _init(axisLength, defaultTextSize) 
		{
			this._axisLength = axisLength;
			this._defaultTextSize = defaultTextSize;
		};
		
		p.destroy = function destroy() 
		{
			
		};
		
		p.getAxisMarkerPos = function getAxisMarkerPos(step)
		{
			return new THREE.Vector3( step, 0, 0);
		}
		p.getMarkerInitState = function getMarkerInitState()
		{
			return { position: new THREE.Vector3(-this._defaultTextSize/2, -50, 0), rotation: new THREE.Vector3(0, 0, Math.PI + Math.PI/2) };
		}
		p.getMarkerInitAnimValues = function getMarkerInitAnimValues()
		{
			var obj = { animLength: 150,
						animObj: { rX:Math.PI/2, opacity: 0, xAxisLength:0 },
						targObj: {rX: 0, opacity: 1, xAxisLength: -20} };
						
			return obj;
		}
		p.getTitleInitState = function getTitleInitState(text)
		{
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			var state = { position: new THREE.Vector3(centreOffset + this._axisLength/2, -160, 0),
						  rotation: new THREE.Vector3(0, 0, 0) };

			return state;
		}
		p.getTitleInitAnimValues = function getTitleInitAnimValues(state)
		{
			var obj = { animLength: 1000,
						animObj: { pX:state.position.x-150 , opacity: 0 },
						targObj: { pX:state.position.x, opacity: 1 } };
			
			return obj;
		}		
	}
})();