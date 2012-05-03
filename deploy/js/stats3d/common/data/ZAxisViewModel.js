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
		p.getAxisMarkerPos = function getAxisMarkerPos(step)
		{
			return new THREE.Vector3(0, 0, -step );
		}
		p.getMarkerInitState = function getMarkerInitState(text)
		{
		    var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
    
			return { position: new THREE.Vector3(rightOffset - 40, 20, this._defaultTextSize/2), rotation: new THREE.Vector3(-Math.PI/2, 0, 0) };
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
  
			var state = { position: new THREE.Vector3(-120, 0, -this._axisLength/2 - centreOffset),
						  rotation: new THREE.Vector3(-Math.PI/2, 0, Math.PI/2) };

			return state;
		}
		p.getTitleInitAnimValues = function getTitleInitAnimValues(state)
		{
			var obj = { animLength: 1000,
						animObj: { pY:state.position.y-150 , opacity: 0 },
						targObj: { pY:state.position.y, opacity: 1 } };
			
			return obj;
		}
		
		//ANIMATIONS =====================================
		p.axisToDefaultView = function axisToDefaultView()
		{
			if (!this.values) return;
			
			var numSteps = this.values.numSteps;
			this.container.rotation.z = 0;
		
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				var zpos = -( i * (this._axisLength/numSteps) );
				var text = this.markers[i].children[1];

				var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
				
				text.position.x = rightOffset - 40; //?
				text.position.y = 20;				//?
				text.position.z = this._defaultTextSize / 2;
				text.rotation.x = -Math.PI/2;
				text.rotation.z = 0;	
			}
			
			text = this.titleText;
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			text.position.x = -120;
			text.position.z = -this._axisLength/2 - centreOffset;
			text.rotation.x = -Math.PI/2;
			text.rotation.z = Math.PI/2;
		}
		
		p.axisToBottomView = function axisToBottomView()
		{
			var numSteps = this.values.numSteps;
			this.container.rotation.z = 0;
			
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				var zpos = -( i * (this._axisLength/numSteps) );
				var text = this.markers[i].children[1];

				var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
				
				text.position.x = rightOffset - 40;
				text.position.z = -this._defaultTextSize/2;
				text.rotation.x = Math.PI/2;
				text.rotation.z = 0;
			}
			
			text = this.titleText;
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			text.position.x = -140;
			text.position.z = -this._axisLength/2 - centreOffset;		
			text.rotation.x = Math.PI/2;
			text.rotation.z = Math.PI + Math.PI/2;
		}

		p.axisToRightView = function axisToRightView()
		{
			var numSteps = this.values.numSteps;
			this.container.rotation.z = Math.PI/2;
			
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				var zpos = -( i * (this._axisLength/numSteps) );
				var text = this.markers[i].children[1];

				var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
				
				text.position.x = rightOffset - 40;
				text.position.z = - this._defaultTextSize/2;
				text.rotation.x = Math.PI/2;
				text.rotation.z = 0;
			}
			
			text = this.titleText;
			var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			text.position.x = -140;
			text.position.z = -this._axisLength/2 - centreOffset;		
			text.rotation.x = Math.PI/2;
			text.rotation.z = Math.PI + Math.PI/2;
		}		
	}
})();










