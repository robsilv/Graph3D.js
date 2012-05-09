(function(){
	
	var AxisViewModel = GRAPH3D.namespace("GRAPH3D.common.data").AxisViewModel;
	var namespace = GRAPH3D.namespace("GRAPH3D.common.data");
	
	if(namespace.XAxisViewModel === undefined) {
		
		var XAxisViewModel = function XAxisViewModel(axisLength, defaultTextSize) {
			this._init(axisLength, defaultTextSize);
		};
		
		namespace.XAxisViewModel = XAxisViewModel;
		
		var p = XAxisViewModel.prototype = new AxisViewModel();
		
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
		
		// VALUES ======================================================
		
		// Used in Initial Render
		p._getAxisMarkerPos = function _getAxisMarkerPos(step)
		{
			return new THREE.Vector3(step, 0, 0);
		}
		p._getAxisMarkerPosLog = function _getAxisMarkerPosLog(step)
		{
			return new THREE.Vector3(step, 0, 0);
		}
		
		p._getMarkerInitState = function _getMarkerInitState(text)
		{
			return { position: new THREE.Vector3(-this._defaultTextSize/2, -50, 0), rotation: new THREE.Vector3(0, 0, Math.PI + Math.PI/2) };
		}
		p._getMarkerBottomState = function _getMarkerBottomState(text)
		{
			var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			return { position: new THREE.Vector3(-this._defaultTextSize/2, rightOffset - 40, 0), rotation: new THREE.Vector3(Math.PI, 0, Math.PI + Math.PI/2) };
		}
		p._getTitleInitState = function _getTitleInitState(text)
		{
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			var state = { position: new THREE.Vector3(centreOffset + this._axisLength/2, -160, 0),
						  rotation: new THREE.Vector3(0, 0, 0) };

			return state;
		}
		p._getTitleBottomState = function _getTitleBottomState(text)
		{
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			var state = { position: new THREE.Vector3(centreOffset + this._axisLength/2, -140, 0),
						  rotation: new THREE.Vector3(Math.PI, 0, 0) };
						  
			return state;
		}	
		
		
		// Used in Initial Render
		p._getMarkerInitAnimValues = function _getMarkerInitAnimValues()
		{
			var obj = { animLength: 150,
						animObj: { rX:Math.PI/2, opacity: 0, xAxisLength:0 },
						targObj: {rX: 0, opacity: 1, xAxisLength: -20} };
						
			return obj;
		}
		// Used in Initial Render
		p._getTitleInitAnimValues = function _getTitleInitAnimValues(state)
		{
			var obj = { animLength: 1000,
						animObj: { pX:state.position.x-150 , opacity: 0 },
						targObj: { pX:state.position.x, opacity: 1 } };
			
			return obj;
		}
		
		p._getBottomAxisAnimValues = function _getDefaultAxisAnimValues()
		{
			var obj = { animLength: 1000,
						animObj: { rX: this.container.rotation.x },
						targObj: { rX: -Math.PI/2 } };
			
			return obj;
		};
		
		p._getInitAxisAnimValues = function _getInitAxisAnimValues()
		{
			var obj = { animLength: 1000,
						animObj: { rX: this.container.rotation.x, rY: this.container.rotation.y, rZ: this.container.rotation.z },
						targObj: { rX: 0, rY: 0, rZ: 0 } };
			
			return obj;
		};
		
		// ANIMATIONS ========================================================

		p.axisToBottomView = function axisToBottomView()
		{
			var scope = this;
			this._gotoAxisView( function() { return scope._getBottomAxisAnimValues(); }, 
								//function(text) { return scope._getMarkerBottomState(text); },
								function(text) { return scope._getTextAnimValues(text, scope._getMarkerBottomState(text)); }, 
								function(text) { return scope._getTitleAnimValues(text, scope._getTitleBottomState(text)); } );
		}		
	}
})();











