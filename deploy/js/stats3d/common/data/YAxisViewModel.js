(function(){
	
	var AxisViewModel = STATS3D.namespace("STATS3D.common.data").AxisViewModel;
	var namespace = STATS3D.namespace("STATS3D.common.data");
	
	if(namespace.YAxisViewModel === undefined) {
		
		var YAxisViewModel = function YAxisViewModel(axisLength, defaultTextSize) {
			this._init(axisLength, defaultTextSize);
		};
		
		namespace.YAxisViewModel = YAxisViewModel;
		
		var p = YAxisViewModel.prototype = new AxisViewModel();
		
		YAxisViewModel.create = function create(axisLength, defaultTextSize) 
		{
			var newInstance = new YAxisViewModel(axisLength, defaultTextSize);
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
		
		// VALUES ==========================================
		p._getAxisMarkerPos = function _getAxisMarkerPos(step)
		{
			return new THREE.Vector3(0, step, 0 );
		}
		p._getMarkerInitState = function _getMarkerInitState(text)
		{
		    var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
    
			return { position: new THREE.Vector3(rightOffset - 40, -this._defaultTextSize/2, 0), rotation: new THREE.Vector3(0, 0, 0) };
		}
		p._getMarkerInitAnimValues = function _getMarkerInitAnimValues()
		{
			var obj = { animLength: 150,
						animObj: { rX:Math.PI/2, opacity: 0, yAxisLength:0 },
						targObj: {rX: 0, opacity: 1, yAxisLength: -20} };
						
			return obj;
		}
		p._getTitleInitState = function _getTitleInitState(text)
		{
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
  
			var state = { position: new THREE.Vector3(-120, centreOffset + this._axisLength/2, 0),
						  rotation: new THREE.Vector3(0, 0, Math.PI/2) };

			return state;
		}
		
		// Used in Initial Render
		p._getTitleInitAnimValues = function _getTitleInitAnimValues(state)
		{
			var obj = { animLength: 1000,
						animObj: { pY:state.position.y-150 , opacity: 0 },
						targObj: { pY:state.position.y, opacity: 1 } };
			
			return obj;
		}

		p._getRightAxisAnimValues = function _getRightAxisAnimValues()
		{
			var obj = { animLength: 1000,
						animObj: { rY: this.container.rotation.y },
						targObj: { rY: Math.PI/2 } };
			
			return obj;
		};
		
		p._getInitAxisAnimValues = function _getInitAxisAnimValues()
		{
			var obj = { animLength: 1000,
						animObj: { rX: this.container.rotation.x, rY: this.container.rotation.y, rZ: this.container.rotation.z },
						targObj: { rX: 0, rY: 0, rZ: 0 } };
			
			return obj;
		};
		
		// ANIMATIONS ========================================

		p.axisToRightView = function axisToRightView()
		{
			//this.container.rotation.y = Math.PI/2;
			var delay = 1000;
			
			var animInitObj = this._getRightAxisAnimValues();
			this.animationValues.container = animInitObj.animObj;
			this._createGraphTween(animInitObj.animObj, animInitObj.targObj, animInitObj.animLength, delay, this._updateTimeCallback);
		}

		p.axisToBottomView = function axisToBottomView()
		{
			var scope = this;
			this._gotoAxisView( function() { return scope._getInitAxisAnimValues(); },
								//function(text) { return scope._getMarkerInitState(text); },
								function(text) { return scope._getTextInitAnimValues(text, scope._getMarkerInitState(text)); }, 
								function(text) { return scope._getTitleInitState(text); } );
		}			
	}
})();












