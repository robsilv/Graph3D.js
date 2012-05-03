(function(){
	
	var AxisViewModel = STATS3D.namespace("STATS3D.common.data").AxisViewModel;
	var namespace = STATS3D.namespace("STATS3D.common.data");
	
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
		p.getAxisMarkerPos = function getAxisMarkerPos(step)
		{
			return new THREE.Vector3(step, 0, 0);
		}
		p.getMarkerInitState = function getMarkerInitState(text)
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
		
		// ANIMATIONS ========================================================
		p.axisToDefaultView = function axisToDefaultView(delay)
		{
			if (!this.values) return;
			
			if (!delay) delay = 0;
			
			var numSteps = this.values.numSteps;
			//this.container.rotation.x = 0;
			
			var animLength = 1000;
			var animObj = this.animationValues.container = { rX: this.container.rotation.x };
			this._createGraphTween(animObj, { rX: 0 }, animLength, delay, this._updateTimeCallback);
			
			delay += 1200;
			
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				var markerObj = this.markers[i];
				//var xpos = ( i * (this._axisLength/numSteps) );
				var text = markerObj.children[1];

				var state = {};
				state.position = new THREE.Vector3(-10, -50, 0);
				state.rotation = new THREE.Vector3(0, 0, Math.PI + Math.PI/2);
				
				//text.position = state.position;
				//text.rotation = state.rotation;
				
				var animLength = 150;
				var animObj = this.animationValues.text[i] = {};
				
				this._animateAxisText( text, animObj, state, animLength, delay );
				
				delay += 50;
			}
			
			text = this.titleText;
			
			delay += 100;
			
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			state = { position: new THREE.Vector3(centreOffset + this._axisLength/2, -160, 0),
					  rotation: new THREE.Vector3(0, 0, 0) };		
			
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
			
			//this.container.rotation.x = Math.PI + Math.PI/2;

			var delay = 0;

			var animLength = 1000;
			var animObj = this.animationValues.container = { rX: this.container.rotation.x };
			this._createGraphTween(animObj, { rX: Math.PI + Math.PI/2 }, animLength, delay, this._updateTimeCallback);		
			
			this._xMarkerTextBottom = [];
			
			delay += 1200;
			
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				//var xpos = ( i * (this._axisLength/numSteps) );
				var text = this.markers[i].children[1];
				var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
				
				var state = {};
				state.position = new THREE.Vector3(-10, rightOffset - 40, 0);
				state.rotation = new THREE.Vector3(Math.PI, 0, Math.PI + Math.PI/2);
				
				if (!this._xMarkerTextBottom[i]) {
					this._xMarkerTextBottom.push(state);
				}
				
				//text.position = state.position;
				//text.rotation = state.rotation;
				
				var animLength = 150;
				var animObj = this.animationValues.text[i] = {};
				
				this._animateAxisText( text, animObj, state, animLength, delay );
				
				delay += 50;			
			}
			
			delay += 100;
			
			text = this.titleText;
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			state = { position: new THREE.Vector3(centreOffset + this._axisLength/2, -140, 0),
					  rotation: new THREE.Vector3(Math.PI, 0, 0) };
			
			this._xMarkerTitleBottom = state;
			
			//text.position = this._xMarkerTitleBottom.position;
			//text.rotation = this._xMarkerTitleBottom.rotation;	
			
			var animLength = 500;
			if (!this.animationValues.titleText) {
				this.animationValues.titleText = {};
			}
			var animObj = this.animationValues.titleText = {};
			this._animateAxisText( text, animObj, state, animLength, delay );		
		}		
	}
})();











