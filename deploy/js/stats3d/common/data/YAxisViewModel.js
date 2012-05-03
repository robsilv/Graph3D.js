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
		p.getAxisMarkerPos = function getAxisMarkerPos(step)
		{
			return new THREE.Vector3(0, step, 0 );
		}
		p.getMarkerInitState = function getMarkerInitState(text)
		{
		    var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
    
			return { position: new THREE.Vector3(rightOffset - 40, -this._defaultTextSize/2, 0), rotation: new THREE.Vector3(0, 0, 0) };
		}
		p.getMarkerInitAnimValues = function getMarkerInitAnimValues()
		{
			var obj = { animLength: 150,
						animObj: { rX:Math.PI/2, opacity: 0, yAxisLength:0 },
						targObj: {rX: 0, opacity: 1, yAxisLength: -20} };
						
			return obj;
		}
		p.getTitleInitState = function getTitleInitState(text)
		{
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
  
			var state = { position: new THREE.Vector3(-120, centreOffset + this._axisLength/2, 0),
						  rotation: new THREE.Vector3(0, 0, Math.PI/2) };

			return state;
		}
		p.getTitleInitAnimValues = function getTitleInitAnimValues(state)
		{
			var obj = { animLength: 1000,
						animObj: { pY:state.position.y-150 , opacity: 0 },
						targObj: { pY:state.position.y, opacity: 1 } };
			
			return obj;
		}
		
		// ANIMATIONS ========================================
		p.axisToDefaultView = function axisToDefaultView()
		{
			if (!this.values) return;
			
			var numSteps = this.values.numSteps;
			this.container.rotation.y = 0;
			this.container.rotation.y = 0;
			
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				var markerObj = this.markers[i];
				//var xpos = ( i * (this._axisLength/numSteps) );
				var text = markerObj.children[1];

				var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
				
				var state = {};
				state.position = new THREE.Vector3(rightOffset - 40, -this._defaultTextSize/2, 0);
				state.rotation = new THREE.Vector3(0, 0, Math.PI + Math.PI/2);

				//var text = this.children[i];		
				
				text.position = state.position;
				text.rotation = state.rotation;
				
				//text.position.x = rightOffset - 40;
				//text.position.y = ypos - 10;
			}
			
			text = this.titleText;
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			//text.position.x = -120;
			//text.position.y = centreOffset + this._axisLength/2;
			//text.rotation.z = Math.PI/2;
			
			state = { position: new THREE.Vector3(-120, centreOffset + this._axisLength/2, 0),
					  rotation: new THREE.Vector3(0, 0, Math.PI/2) };
					  
			text.position = state.position;
			text.rotation = state.rotation;
		}
		
		p.axisToRightView = function axisToRightView()
		{
			this.container.rotation.y = Math.PI/2;
			this.container.rotation.y = Math.PI/2;
		}		
	}
})();












