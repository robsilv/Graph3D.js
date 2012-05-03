(function(){
	
	var AxisViewModel = STATS3D.namespace("STATS3D.common.data").AxisViewModel;
	var namespace = STATS3D.namespace("STATS3D.common.data");
	
	if(namespace.ZAxisViewModel === undefined) {
		
		var ZAxisViewModel = function ZAxisViewModel(axisLength, defaultTextSize) {
			this._init(axisLength, defaultTextSize);
		};
		
		namespace.ZAxisViewModel = ZAxisViewModel;
		
		var p = ZAxisViewModel.prototype = new AxisViewModel();
		
		ZAxisViewModel.create = function create(axisLength, defaultTextSize) 
		{
			var newInstance = new ZAxisViewModel(axisLength, defaultTextSize);
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
		
		// VALUES ============================================
		p._getAxisMarkerPos = function _getAxisMarkerPos(step)
		{
			return new THREE.Vector3(0, 0, -step );
		}
		p._getMarkerInitState = function _getMarkerInitState(text)
		{
		    var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
    
			return { position: new THREE.Vector3(rightOffset - 40, 0, this._defaultTextSize/2), rotation: new THREE.Vector3(-Math.PI/2, 0, 0) };
		}
		p._getMarkerRightState = function _getMarkerRightState(text)
		{
			var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			return { position: new THREE.Vector3(rightOffset - 40, 0, -this._defaultTextSize/2), rotation: new THREE.Vector3(Math.PI/2, 0, 0) };
		}
		p._getMarkerBottomState = function _getMarkerBottomState(text)
		{
			var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			return { position: new THREE.Vector3(rightOffset - 40, 0, -this._defaultTextSize/2), rotation: new THREE.Vector3(Math.PI/2, 0, 0) };
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
  
			var state = { position: new THREE.Vector3(-120, 0, -this._axisLength/2 + centreOffset),
						  rotation: new THREE.Vector3(-Math.PI/2, 0, Math.PI + Math.PI/2) };

			return state;
		}
		p._getTitleRightState = function _getTitleRightState(text)
		{
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			var state = { position: new THREE.Vector3(-120, 0, -this._axisLength/2 - centreOffset),
						  rotation: new THREE.Vector3(Math.PI/2, 0, Math.PI + Math.PI/2) };

			return state;	
		}
		p._getTitleBottomState = function _getTitleBottomState(text)
		{
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			var state = { position: new THREE.Vector3(-120, 0, -this._axisLength/2 - centreOffset),
						  rotation: new THREE.Vector3(Math.PI/2, 0, Math.PI + Math.PI/2) };

			return state;	
		}
		
		p._getTitleInitAnimValues = function getTitleInitAnimValues(state)
		{
			var obj = { animLength: 1000,
						animObj: { pY:state.position.y-150 , opacity: 0 },
						targObj: { pY:state.position.y, opacity: 1 } };
			
			return obj;
		}
		/*
		p._getDefaultAxisAnimValues = function _getDefaultAxisAnimValue()
		{
			var obj = { animLength: 1000,
						animObj: { rZ: this.container.rotation.y },
						targObj: { rZ: 0 } };
			
			return obj;
		}
		*/
		//ANIMATIONS =====================================

		p.axisToRightView = function axisToRightView()
		{
			var numSteps = this.values.numSteps;
			
			//this.container.rotation.z = Math.PI/2;
			
			var delay = 0;
			var animLength = 1000;
			var animObj = this.animationValues.container = { rZ: this.container.rotation.z };
			this._createGraphTween(animObj, { rZ: Math.PI/2 }, animLength, delay, this._updateTimeCallback);
			
			delay += 1200;
			
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				var text = this.markers[i].children[1];

				var state = this._getMarkerRightState(text)
				
				//text.position = state.position;
				//text.rotation = state.rotation;
				
				var animLength = 150;
				var animObj = this.animationValues.text[i] = {};
				
				this._animateAxisText( text, animObj, state, animLength, delay );
				
				delay += 50;
			}
			
			text = this.titleText;
			
			delay += 100;
			
			var state = this._getTitleRightState(text);
			
			//text.position = state.position;
			//text.rotation = state.rotation;
			
			var animLength = 500;
			if (!this.animationValues.titleText) {
				this.animationValues.titleText = {};
			}
			var animObj = this.animationValues.titleText;
			
			this._animateAxisText( text, animObj, state, animLength, delay );
		}
		
		p.axisToBottomView = function axisToBottomView()
		{
			var numSteps = this.values.numSteps;
			var delay = 0;
			
			//this.container.rotation.z = 0;
			
			var animLength = 1000;
			var animObj = this.animationValues.container = { rZ: this.container.rotation.z };
			this._createGraphTween(animObj, { rZ: 0 }, animLength, delay, this._updateTimeCallback);			
			
			delay += 1200;
			
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				var text = this.markers[i].children[1];

				var state = this._getMarkerBottomState(text);
				
				//text.position = state.position;
				//text.rotation = state.rotation;
				
				var animLength = 150;
				var animObj = this.animationValues.text[i] = {};
				
				this._animateAxisText( text, animObj, state, animLength, delay );
				
				delay += 50;
			}
			
			text = this.titleText;
			
			delay += 100;

			state = this._getTitleBottomState(text);
			
			//text.position = state.position;
			//text.rotation = state.rotation;
			
			var animLength = 500;
			if (!this.animationValues.titleText) {
				this.animationValues.titleText = {};
			}
			var animObj = this.animationValues.titleText;
			
			this._animateAxisText( text, animObj, state, animLength, delay );
		}	
	}
})();










