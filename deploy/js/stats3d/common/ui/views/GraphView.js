(function(){

var namespace = STATS3D.namespace("STATS3D.common.ui.views");
var GraphUtils = STATS3D.namespace("STATS3D.common.data").GraphUtils;
var XAxisViewModel = STATS3D.namespace("STATS3D.common.data").XAxisViewModel;
var YAxisViewModel = STATS3D.namespace("STATS3D.common.data").YAxisViewModel;
var ZAxisViewModel = STATS3D.namespace("STATS3D.common.data").ZAxisViewModel;
var ListenerFunctions = STATS3D.namespace("STATS3D.utils.events").ListenerFunctions;

//var EventDispatcher = STATS3D.namespace("STATS3D.utils.events").EventDispatcher;

if(namespace.GraphView === undefined) 
{	
	var GraphView = function GraphView() {
		this._init();
		this._animate();
	};
	
	// constants
	GraphView.BOTTOM = "bottom";
	GraphView.RIGHT = "right";
	GraphView.FRONT = "front";
	GraphView.OVER = "over";
	
	namespace.GraphView = GraphView;
		
	var p = GraphView.prototype = {};//new EventDispatcher();
	
	GraphView.create = function create() 
	{
		var newGraphView = new GraphView();
		return newGraphView;
	};	
	
	p._init = function _init()
	{
		this._defaultTextSize = 16;
		this._axisLength = 1000;
		
		this.dataProvider = null;
		this._graphUtils = GraphUtils.create();
		
		this._xAxisViewModel = XAxisViewModel.create(this._axisLength, this._defaultTextSize);
		this._yAxisViewModel = YAxisViewModel.create(this._axisLength, this._defaultTextSize);
		this._zAxisViewModel = ZAxisViewModel.create(this._axisLength, this._defaultTextSize);
		
		this._offsetTop = 0;//window.innerHeight/4*3;
		this._offsetLeft = 0;//window.innerWidth;
		this._animLength = 1800;
		
		this._container = document.createElement( 'div' );
		document.body.appendChild( this._container );
		
		var info = document.createElement( 'div' );
		info.style.position = 'absolute';
		info.style.top = '40px';
		info.style.width = '100%';
		info.style.textAlign = 'center';
		info.innerHTML = 'Drag to spin the graph';
		this._container.appendChild( info );
		
		
		//this._cameraLookAt = new THREE.Vector3(500, 300, -500);
		//this._cameraLookAt = new THREE.Vector3(0, 0, 0);
		//this._fixedCameraPos = new THREE.Vector3(0, 0, 0);
		//this._dynamicCameraPos = new THREE.Vector3(200, 100, 200);
		
		var distance = 2500;
		this._camera = new THREE.CombinedCamera( window.innerWidth /2, window.innerHeight/2, 70, 1, distance, -distance, distance, distance );

		this._scene = new THREE.Scene();

		this._scene.add( this._camera );
		
		this._graphObjContainer = new THREE.Object3D();
		this._scene.add(this._graphObjContainer);
		this._graphObj = new THREE.Object3D();
		this._graphObjContainer.add(this._graphObj);
		this._graphObj.position.x = -this._axisLength /2;
		this._graphObj.position.y = -this._axisLength /2;
		this._graphObj.position.z = this._axisLength /2;
		

		// Lights

		var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
		this._scene.add( ambientLight );

		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		directionalLight.position.x = Math.random() - 0.5;
		directionalLight.position.y = Math.random() - 0.5;
		directionalLight.position.z = Math.random() - 0.5;
		directionalLight.position.normalize();
		this._scene.add( directionalLight );

		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		directionalLight.position.x = Math.random() - 0.5;
		directionalLight.position.y = Math.random() - 0.5;
		directionalLight.position.z = Math.random() - 0.5;
		directionalLight.position.normalize();
		this._scene.add( directionalLight );		

		//this._renderer = new THREE.CanvasRenderer();
		this._renderer = new THREE.WebGLRenderer({ antialias: true } );
		this._renderer.setSize( window.innerWidth, window.innerHeight );
		
		this._container.appendChild( this._renderer.domElement );

		this._stats = new Stats();
		this._stats.domElement.style.position = 'absolute';
		this._stats.domElement.style.top = '0px';
		this._container.appendChild( this._stats.domElement );

		
		var scope = this;
		window.addEventListener( 'resize', function() { scope._onWindowResize() }, false );
		
		this.enable();
	}
	
	p._onWindowResize = function _onWindowResize() 
	{
		this._camera.setSize( window.innerWidth, window.innerHeight );
		this._camera.updateProjectionMatrix();

		this._renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	p.destroy = function destroy() 
	{
	
	};
	
	p.enable = function enable()
	{
		this.setOrthographic();
		this.setLens(12);
		this._camera.setZoom(2.5);
		
		this._bottomViewButton = document.getElementById("bottomView");
		this._rightViewButton = document.getElementById("rightView");
		this._frontViewButton = document.getElementById("frontView");
		this._overViewButton = document.getElementById("overView");
		
		var scope = this;
		
		this._bottomViewButton.addEventListener( "click", function() { scope.toBottomView(); } );
		this._rightViewButton.addEventListener( "click", function() { scope.toRightView(); } );
		this._frontViewButton.addEventListener( "click", function() { scope.toFrontView(); } );
		this._overViewButton.addEventListener( "click", function() { scope.toOverView(); } );
		
		this._targetRotationY = 0;
		this._targetRotationYOnMouseDown = 0;

		this._mouseX = 0;
		this._mouseXOnMouseDown = 0;
		
		this._targetRotationX = 0;
		this._targetRotationXOnMouseDown = 0;

		this._mouseY = 0;
		this._mouseYOnMouseDown = 0;
		
		//this._cameraValues = {"lineEnvelope": 0, "contentEnvelope": 0};
		this._cameraValues = {camRX: this._camera.rotation.x, 
							  camRY: this._camera.rotation.y, 
							  camRZ: this._camera.rotation.z, 
							  camPX: this._camera.position.x, 
							  camPY:this._camera.position.y, 
							  camPZ:this._camera.position.z};
		this._graphValues = {rX: 0, rY: 0, rZ: 0};
		
		this._updateTimeCallback = ListenerFunctions.createListenerFunction(this, this._updateTime);
		this._updateAxesTextCallback = ListenerFunctions.createListenerFunction(this, this._updateAxesText);
		this._completeTimeCallback = ListenerFunctions.createListenerFunction(this, this._completeTime);
		
		document.addEventListener( 'mousedown', function(event) { scope._onDocumentMouseDown(event); }, false );
		document.addEventListener( 'touchstart', function(event) { scope._onDocumentTouchStart(event); }, false );
		document.addEventListener( 'touchmove', function(event) { scope._onDocumentTouchMove(event); }, false );
		
		this.toOverView();
		
	};
	
	p._onDocumentMouseDown = function _onDocumentMouseDown( event )
	{
		event.preventDefault();
		
		var scope = this;
		
		this._mouseMoveListener = function(event) { scope._onDocumentMouseMove(event) };
		this._mouseUpListener = function(event) { scope._onDocumentMouseUp(event) };
		this._mouseOutListener = function(event) { scope._onDocumentMouseOut(event) };

		document.addEventListener( 'mousemove', this._mouseMoveListener, false );
		document.addEventListener( 'mouseup', this._mouseUpListener, false );
		document.addEventListener( 'mouseout', this._mouseDownListener, false );

		this._mouseXOnMouseDown = event.clientX - window.innerWidth / 2;
		this._targetRotationYOnMouseDown = this._targetRotationY;
		
		this._mouseYOnMouseDown = event.clientY - window.innerHeight / 2;
		this._targetRotationXOnMouseDown = this._targetRotationX;
	}

	p._onDocumentMouseMove = function _onDocumentMouseMove( event )
	{
		this._mouseX = event.clientX - window.innerWidth / 2;
		this._mouseY = event.clientY - window.innerHeight / 2;
		
		this._targetRotationX = this._targetRotationXOnMouseDown + ( this._mouseY - this._mouseYOnMouseDown ) * 0.005;
		this._targetRotationY = this._targetRotationYOnMouseDown + ( this._mouseX - this._mouseXOnMouseDown ) * 0.005;
	}

	p._onDocumentMouseUp = function _onDocumentMouseUp( event ) {

		document.removeEventListener( 'mousemove', this._mouseMoveListener, false );
		document.removeEventListener( 'mouseup', this._mouseUpListener, false );
		document.removeEventListener( 'mouseout', this._mouseOutListener, false );
	}

	p._onDocumentMouseOut = function _onDocumentMouseOut( event ) 
	{
		document.removeEventListener( 'mousemove', this._mouseMoveListener, false );
		document.removeEventListener( 'mouseup', this._mouseUpListener, false );
		document.removeEventListener( 'mouseout', this._mouseOutListener, false );
	}

	p._onDocumentTouchStart = function _onDocumentTouchStart( event ) 
	{
		if ( event.touches.length == 1 )
		{
			event.preventDefault();

			this._mouseXOnMouseDown = event.touches[ 0 ].pageX - window.innerWidth / 2;
			this._targetRotationYOnMouseDown = this._targetRotationY;
			
			this._mouseYOnMouseDown = event.touches[ 0 ].pageY - window.innerHeight / 2;
			this._targetRotationXOnMouseDown = this._targetRotationX;
		}
	}

	p._onDocumentTouchMove = function _onDocumentTouchMove( event ) 
	{
		if ( event.touches.length == 1 )
		{
			event.preventDefault();

			this._mouseX = event.touches[ 0 ].pageX - window.innerWidth / 2;
			this._targetRotationY = this._targetRotationYOnMouseDown + ( this._mouseX - this._mouseXOnMouseDown ) * 0.05;
			
			this._mouseY = event.touches[ 0 ].pageY - window.innerHeight / 2;
			this._targetRotationX = this._targetRotationXOnMouseDown + ( this._mouseY - this._mouseYOnMouseDown ) * 0.05;
		}
	};	
	
	p.disable = function disable()
	{

	};
	
	p.toBottomView = function toBottomView()
	{
		var oldView = this._currentView;
		this._currentView = GraphView.BOTTOM;
		
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var graphTween = new TWEEN.Tween(this._graphValues);
		graphTween.to({rX: 0, rY: -Math.PI / 2, rZ: Math.PI / 2}, this._animLength);
		graphTween.easing(TWEEN.Easing.Quadratic.EaseInOut);
		graphTween.onUpdate(this._updateTimeCallback);
		graphTween.onComplete(this._completeTimeCallback);
		graphTween.start();		

		this._xAxisToBottomView();
		this._yAxisToDefaultView();
		this._zAxisToBottomView();
		
		//if (this._xAxisObjects) 	this._graphObj.add(this._xAxisObjects.container);
		//if (this._yAxisObjects) 	this._graphObj.remove(this._yAxisObjects);
		//if (this._zAxisObjects) 	this._graphObj.add(this._zAxisObjects);
	}
	
	p.toRightView = function toRightView()
	{
		this._currentView = GraphView.RIGHT;
		
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var graphTween = new TWEEN.Tween(this._graphValues);
		graphTween.to({rX: 0, rY:-Math.PI / 2, rZ: 0}, this._animLength);
		graphTween.easing(TWEEN.Easing.Quadratic.EaseInOut);
		graphTween.onUpdate(this._updateTimeCallback);
		graphTween.onComplete(this._completeTimeCallback);
		graphTween.start();
		
		this._xAxisToDefaultView();
		this._yAxisToRightView();
		this._zAxisToRightView();
		
		//if (this._xAxisObjects) 	this._graphObj.remove(this._xAxisObjects.container);
		//if (this._yAxisObjects) 	this._graphObj.add(this._yAxisObjects);
		//if (this._zAxisObjects) 	this._graphObj.add(this._zAxisObjects);
	}
	
	p.toFrontView = function toFrontView()
	{
		var oldView = this._currentView;
		this._currentView = GraphView.FRONT;
		
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var graphTween = new TWEEN.Tween(this._graphValues);
		graphTween.to({rX: 0, rY:0, rZ: 0}, this._animLength);
		graphTween.easing(TWEEN.Easing.Quadratic.EaseInOut);
		graphTween.onUpdate(this._updateTimeCallback);
		graphTween.onComplete(this._completeTimeCallback);
		graphTween.start();
		
		this._xAxisToDefaultView();
		this._yAxisToDefaultView();
		this._zAxisToDefaultView();
		
		//if (this._xAxisObjects) 	this._graphObj.add(this._xAxisObjects.container);
		//if (this._yAxisObjects) 	this._graphObj.add(this._yAxisObjects);
		//if (this._zAxisObjects) 	this._graphObj.remove(this._zAxisObjects);
	}
	
	p.toOverView = function toOverView()
	{
		this._currentView = GraphView.OVER;
	
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var graphTween = new TWEEN.Tween(this._graphValues);
		graphTween.to({rX: Math.PI/12, rY:-Math.PI/4, rZ: 0}, this._animLength);
		graphTween.easing(TWEEN.Easing.Quadratic.EaseInOut);
		graphTween.onUpdate(this._updateTimeCallback);
		graphTween.onComplete(this._completeTimeCallback);
		graphTween.start();
		
		this._xAxisToDefaultView();
		this._yAxisToDefaultView();
		this._zAxisToDefaultView();
		
		//if (this._xAxisObjects) 	this._graphObj.add(this._xAxisObjects.container);
		//if (this._yAxisObjects) 	this._graphObj.add(this._yAxisObjects);
		//if (this._zAxisObjects) 	this._graphObj.add(this._zAxisObjects);
	}
	
	p._updateTime = function _updateTime() 
	{
		this._camera.rotation.x = this._cameraValues.camRX;
		this._camera.rotation.y = this._cameraValues.camRY;
		this._camera.rotation.z = this._cameraValues.camRZ;
		
		this._camera.position.x = this._cameraValues.camPX;
		this._camera.position.y = this._cameraValues.camPY;
		this._camera.position.z = this._cameraValues.camPZ;
		
		this._graphObjContainer.rotation.x = this._graphValues.rX;
		this._graphObjContainer.rotation.y = this._graphValues.rY;
		this._graphObjContainer.rotation.z = this._graphValues.rZ;
		
		this._targetRotationY = this._graphObjContainer.rotation.y;

		// Animate X, Y, Z Axes
		if ( this._axesObjects.animationValues )
		{
			var axes = ["x", "y", "z"];
			var lines = this._axesObjects.animationValues.lines;
			if ( lines )
			{
				for ( var i = 0; i < lines.length; i ++ )
				{
					var axis = axes[i];
					var len = lines[i].axisLength;
					var line = this._axesObjects.lines[i];
					var vector3 = line.geometry.vertices[1];
					vector3[axis] = len;
					line.geometry.verticesNeedUpdate = true;
				}
			}			
		}
		
		this._updateAxis(this._xAxisObjects);
		this._updateAxis(this._yAxisObjects);
		this._updateAxis(this._zAxisObjects);
	};
	
	p._updateAxis = function _updateAxis(axisObj)
	{
		if ( axisObj.animationValues )
		{
			var markers = axisObj.animationValues.markers;
			if ( markers )
			{
				for ( var i = 0; i < markers.length; i ++ )
				{
					var markerObj = axisObj.markers[i];
					
					if (!isNaN(markers[i].rX))	markerObj.rotation.x = markers[i].rX;
					if (!isNaN(markers[i].rY))	markerObj.rotation.x = markers[i].rY;
					if (!isNaN(markers[i].rZ))	markerObj.rotation.x = markers[i].rZ;
					
					// Markers on the X-Axis are lines along the Y
					if (!isNaN(markers[i].xAxisLength)) 
					{
						var line = markerObj.children[0];
						var vector3 = line.geometry.vertices[0];					
						vector3.y = markers[i].xAxisLength;
						line.geometry.verticesNeedUpdate = true;
					}
					// Markers on the Y-Axis are lines along the X
					if (!isNaN(markers[i].yAxisLength)) 
					{
						var line = markerObj.children[0];
						var vector3 = line.geometry.vertices[0];					
						vector3.x = markers[i].yAxisLength;
						line.geometry.verticesNeedUpdate = true;
					}
					/*
					// Markers on the Z-Axis are lines along the X
					if (!isNaN(markers[i].yAxisLength)) 
					{
						var line = markerObj.children[0];
						var vector3 = line.geometry.vertices[0];					
						vector3.x = markers[i].yAxisLength;
						line.geometry.verticesNeedUpdate = true;
					}
					*/
					
					var text = markerObj.children[1];
					if (!isNaN(markers[i].opacity))		text.children[0].material.opacity = markers[i].opacity;
				}
			}
			
			var container = axisObj.animationValues.container;
			if ( container )
			{
				if (!isNaN(container.rX))		axisObj.container.rotation.x = container.rX;
				if (!isNaN(container.rY))		axisObj.container.rotation.x = container.rY;
				if (!isNaN(container.rZ))		axisObj.container.rotation.x = container.rZ;
			}
		}
	}
	
	p._updateAxesText = function _updateAxesText()
	{
		this._updateAxisText(this._xAxisObjects);
		this._updateAxisText(this._yAxisObjects);
		this._updateAxisText(this._zAxisObjects);
	}
	p._updateAxisText = function _updateAxisText(axisObj)
	{
		if ( axisObj.animationValues )
		{			
			// Rotating text when viewing from different angles
			var texts = axisObj.animationValues.text;
			if ( texts )
			{
				for ( var i = 0; i < texts.length; i ++ )
				{
					var text = axisObj.text[i];
					if (!isNaN(texts[i].pX))	text.position.x = texts[i].pX;
					if (!isNaN(texts[i].pY))	text.position.y = texts[i].pY;
					if (!isNaN(texts[i].pZ))	text.position.z = texts[i].pZ;
					if (!isNaN(texts[i].rX))	text.rotation.x = texts[i].rX;
					if (!isNaN(texts[i].rY))	text.rotation.y = texts[i].rY;
					if (!isNaN(texts[i].rZ))	text.rotation.z = texts[i].rZ;
					//console.log("text pX "+texts[i].pX+" pY "+texts[i].pY+" pZ "+texts[i].pZ+" rX "+texts[i].rX+" rY "+texts[i].rY+" rZ "+texts[i].rZ);
				}
			}
			
			var titleText = axisObj.animationValues.titleText;
			if ( titleText )
			{
				var text = axisObj.titleText;
				if (!isNaN(titleText.pX))	text.position.x = titleText.pX;
				if (!isNaN(titleText.pY))	text.position.y = titleText.pY;
				if (!isNaN(titleText.pZ))	text.position.z = titleText.pZ;
				if (!isNaN(titleText.rX))	text.rotation.x = titleText.rX;
				if (!isNaN(titleText.rY))	text.rotation.y = titleText.rY;
				if (!isNaN(titleText.rZ))	text.rotation.z = titleText.rZ;
				if (!isNaN(titleText.opacity))		text.children[0].material.opacity = titleText.opacity;
			}			
		}
	}
	
	p._completeTime = function _completeTime()
	{
		this._freeRotate = true;
	}
	
	p.setFov = function setFov( fov )
	{
		this._camera.setFov( fov );
	}

	p.setLens = function setLens( lens ) 
	{
		// try adding a tween effect while changing focal length, and it'd be even cooler!
		var fov = this._camera.setLens( lens );
	}

	p.setOrthographic = function setOrthographic() 
	{
		this._camera.toOrthographic();
	}

	p.setPerspective = function setPerspective() 
	{
		this._camera.toPerspective();
	}	
	
	p._animate = function _animate()
	{
		var scope = this;
		requestAnimationFrame( function() { scope._animate() } );

		this._render();
		this._stats.update();
	}

	p._render = function _render() 
	{
		if ( this._freeRotate )
		{
			//this._graphObjContainer.rotation.x += ( this._targetRotationX - this._graphObjContainer.rotation.x ) * 0.05;
			this._graphObjContainer.rotation.y += ( this._targetRotationY - this._graphObjContainer.rotation.y ) * 0.05;

			//this._camera.lookAt( this._cameraLookAt );
		}
	
		this._renderer.render( this._scene, this._camera );
	}
	
	p.setDataProvider = function setDataProvider(data)
	{
		var numSteps = 20;
		
		this._dataProvider = data;
		
		var zMin = 1990;//data.time.minYear;
		var zMax = 2010;//data.time.maxYear;
		
		// Compute X-Axis (GDP)
		this._xAxisValues = this._graphUtils.mapToAxis(data.gdpPerCapita.minValue, data.gdpPerCapita.maxValue, numSteps);
		// Compute Y-Axis (HIV)
		this._yAxisValues = this._graphUtils.mapToAxis(data.hivPrevalence.minValue, data.hivPrevalence.maxValue, numSteps, true);
		// Compute Z-Axis (Time)
		this._zAxisValues = this._graphUtils.mapToAxis(zMin, zMax, numSteps, true);
		
		// RENDER
		
		this._renderAxes();
		//this._renderGridXY();
		//this._renderGridXZ();
		//this._renderGridYZ();
		
		
		// draw line for country
		//this._plotData(data.countries["Lesotho"]);
		var regionColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF, 0xFF00FF];
		for ( var i = 0; i < data.regions.length; i ++ )
		{
			var region = data.regions[i];
			var color = new THREE.Color();
			//color.setHSV(Math.random(), 1.0, 1.0);
			color.setHex(regionColors[i]);
			region.color = color;
		}
		
		for ( var countryName in data.countries ) 
		{
			var country = data.countries[countryName];
			color = country.region.color;
			//var color = new THREE.Color();
			//color.setHSV(Math.random(), 1.0, 1.0);
			//this._plotLine(country, color);
		}
		
		//console.log("Z (Time) axis minVal "+this._zAxisValues.minVal+" maxVal "+this._zAxisValues.maxVal);
	}
	
	p._plotLine = function _plotLine(country, color)
	{
		var minYear = this._zAxisValues.minVal;
		
		// massage data
		var yearsObj = {};
		for ( var year in country.gdpPerCapita )
		{
			if ( year < minYear ) continue;
			
			var value = country.gdpPerCapita[year];
			
			if (!yearsObj[year]) {
				yearsObj[year] = {};
			}
			
			yearsObj[year].gdpPerCapita = value;
		}
		
		for ( var year in country.hivPrevalence )
		{
			if ( year < minYear ) continue;
			
			var value = country.hivPrevalence[year];
			if (!yearsObj[year]) {
				yearsObj[year] = {};
			}
			
			yearsObj[year].hivPrevalence = value;
		}
		
		
		
		var colors = [];
		
		//init Particles
		var lineGeom = new THREE.Geometry();
		var geometry = new THREE.Geometry();
		//create one shared material
		
		var sprite = THREE.ImageUtils.loadTexture("../files/img/particle2.png");
		material = new THREE.ParticleBasicMaterial({
			size: 5,
			sizeAttenuation: false,
			map: sprite,
			//blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true,
			vertexColors: true //allows 1 color per particle
		});		
		
		var prevHIVValue = 0;
		var prevGDPValue = 0;
		
		for ( var year in yearsObj )
		{
			var gdp = yearsObj[year].gdpPerCapita;
			var hiv = yearsObj[year].hivPrevalence;
			//console.log(year+" = "+value);
					
			if (!gdp) 	gdp = prevGDPValue;
			else		prevGDPValue = gdp;
			if (!hiv) 	hiv = prevHIVValue;
			else		prevHIVValue = hiv;
			
			// XPOS
			var diffFromZero = gdp - this._xAxisValues.minVal;
			var valueLengthOfAxis = this._xAxisValues.maxVal - this._xAxisValues.minVal;
			var ratio = diffFromZero / valueLengthOfAxis;
			
			xpos = ratio * this._axisLength;
			
			// YPOS
			var diffFromZero = hiv - this._yAxisValues.minVal;
			var valueLengthOfAxis = this._yAxisValues.maxVal - this._yAxisValues.minVal;
			var ratio = diffFromZero / valueLengthOfAxis;
			
			ypos = ratio * this._axisLength;			

			// ZPOS
			var diffFromZero = year - this._zAxisValues.minVal;
			var valueLengthOfAxis = this._zAxisValues.maxVal - this._zAxisValues.minVal;
			var ratio = diffFromZero / valueLengthOfAxis;
			
			zpos = -ratio * this._axisLength;

			var pos = new THREE.Vector3( xpos, ypos, zpos );
			geometry.vertices.push(pos);
			lineGeom.vertices.push(pos);
			
			colors.push(color);		
		}
		
		geometry.colors = colors;
		
		//init particle system
		var particles = new THREE.ParticleSystem(geometry, material);
		particles.sortParticles = false;
		this._graphObj.add(particles);		
		
		// lines
		var line = new THREE.Line( lineGeom, new THREE.LineBasicMaterial( { color: color.getHex(), opacity: 0.5 } ) );
		this._graphObj.add( line );
	}
	
	// RENDER AXES =================================
	
	p._animateAxisText = function _animateAxisText(text, animObj, state, length, delay)
	{
		animObj.pX = text.position.x;
		animObj.pY = text.position.y;
		animObj.pZ = text.position.z;
		animObj.rX = text.rotation.x; 
		animObj.rY = text.rotation.y; 
		animObj.rZ = text.rotation.z;
		
		var animTargObj = { pX: state.position.x,
							pY: state.position.y, 
							pZ: state.position.z, 
							rX: state.rotation.x, 
							rY: state.rotation.y, 
							rZ: state.rotation.z }
		
		return this._createGraphTween(animObj, animTargObj, length, delay, this._updateAxesTextCallback);
	}
	p._createGraphTween = function _createGraphTween(animObj, animTargObj, length, delay, updateCallBack)
	{
		var graphTween = new TWEEN.Tween(animObj);
		graphTween.to(animTargObj, length);
		graphTween.delay(delay);
		graphTween.easing(TWEEN.Easing.Quadratic.EaseInOut);
		graphTween.onUpdate(updateCallBack);
		graphTween.start();
		
		return graphTween;
	}	
	
	p._renderAxes = function _renderAxes()
	{
		var axisObjs = [{ lineColor:0xff0000, endValue:this._axisLength},
						{ lineColor:0x00ff00, endValue:this._axisLength},
						{ lineColor:0x0000ff, endValue:-this._axisLength}];
		
		var delay = 1000;
		
		this._axesObjects = { lines: [], animationValues: { lines: [] } };
		
		for ( var i = 0; i < 3; i ++ )
		{
			var axisObj = axisObjs[i];
			var geometry = new THREE.Geometry();
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: axisObj.lineColor, opacity: 1 } ) );
			
			this._graphObj.add( line );
			this._axesObjects.lines.push(line);
			
			var animObj = this._axesObjects.animationValues.lines[i];
			if (!animObj) {
				animObj = this._axesObjects.animationValues.lines[i] = { axisLength:0 };
			}			
			
			// Animate in X,Y,Z Axes
			this._createGraphTween(animObj, {axisLength: axisObj.endValue}, this._animLength, delay, this._updateTimeCallback);
			
			delay += 500;		
		}

		this._renderAxis(delay, this._xAxisValues, "_xAxisObjects", "GDP Per Capita (2005 Int $)", this._xAxisViewModel);
		this._renderAxis(delay += 500, this._yAxisValues, "_yAxisObjects", "Estimated HIV Prevalence % (Ages 15-49)", this._yAxisViewModel);
		this._renderAxis(delay += 500, this._zAxisValues, "_zAxisObjects", "Time", this._zAxisViewModel);
	}
	
	p._renderAxis = function _renderAxis(delay, axisValuesObj, axisObjsName, title, axisViewModel)
	{
		var axisNum = axisValuesObj.minVal;
		var numSteps = axisValuesObj.numSteps;

		this[axisObjsName] = axisViewModel;

		this._graphObj.add( axisViewModel.container );	
		
		axisViewModel.markerTextDefaults = [];
		
		for ( var i = 0; i <= numSteps; i ++ )
		{
			var geometry = new THREE.Geometry();
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		
			var markerObj = new THREE.Object3D();
			axisViewModel.container.add( markerObj );
			axisViewModel.markers.push( markerObj );
			
			markerObj.position = axisViewModel.getAxisMarkerPos(i * (this._axisLength/numSteps));
			
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 1 } ) );
			
			markerObj.add( line );
			axisViewModel.lines.push(line);

			var text = this._createText(axisNum.toString());
			text.children[0].material.opacity = 0;
			
			var state = axisViewModel.getMarkerInitState(text);
			
			if (!axisViewModel.markerTextDefaults[i]) {
				axisViewModel.markerTextDefaults.push(state);
			}
			
			text.position = state.position;
			text.rotation = state.rotation;
			
			markerObj.add( text );
			axisViewModel.text.push(text);
			
			// Set animation values to tween in marker objects (containing text and marker line for point on axis)
			//var animVal = axisViewModel.animationValues.markers[i];

			// Begin tween for marker objects
			var animInitObj = axisViewModel.getMarkerInitAnimValues();
			axisViewModel.animationValues.markers[i] = animInitObj.animObj;
			
			this._createGraphTween(animInitObj.animObj, animInitObj.targObj, animInitObj.animLength, delay, this._updateTimeCallback);
			
			delay += 50;
			
			axisNum += axisValuesObj.stepSize;
		}
		
		var text = this._createText(title, 20);
		
		state = axisViewModel.getTitleInitState(text);
		
		axisViewModel.markerTitleDefault = state;
		
		text.position = axisViewModel.markerTitleDefault.position;
		text.rotation = axisViewModel.markerTitleDefault.rotation;
		
		axisViewModel.container.add( text );
		axisViewModel.titleText = text;
		
		text.children[0].material.opacity = 0;
		
		var animInitObj = axisViewModel.getTitleInitAnimValues(state);
		axisViewModel.animationValues.titleText = animInitObj.animObj;
		
		this._createGraphTween(animInitObj.animObj, animInitObj.targObj, animInitObj.animLength, delay, this._updateAxesTextCallback);
	}

	
	p._xAxisToDefaultView = function _xAxisToDefaultView(delay)
	{
		if (!this._xAxisObjects) return;
		
		if (!delay) delay = 0;
		
		var numSteps = this._xAxisValues.numSteps;
		//this._xAxisObjects.container.rotation.x = 0;
		
		var animLength = 1000;
		var animObj = this._xAxisObjects.animationValues.container = { rX: this._xAxisObjects.container.rotation.x };
		this._createGraphTween(animObj, { rX: 0 }, animLength, delay, this._updateTimeCallback);
		
		delay += 1200;
		
		for ( var i = 0; i < this._xAxisObjects.markers.length; i ++ )
		{
			var markerObj = this._xAxisObjects.markers[i];
			//var xpos = ( i * (this._axisLength/numSteps) );
			var text = markerObj.children[1];

			var state = {};
			state.position = new THREE.Vector3(-10, -50, 0);
			state.rotation = new THREE.Vector3(0, 0, Math.PI + Math.PI/2);
			
			//text.position = state.position;
			//text.rotation = state.rotation;
			
			var animLength = 150;
			var animObj = this._xAxisObjects.animationValues.text[i] = {};
			
			this._animateAxisText( text, animObj, state, animLength, delay );
			
			delay += 50;
		}
		
		text = this._xAxisObjects.titleText;
		
		delay += 100;
		
		var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
		
		state = { position: new THREE.Vector3(centreOffset + this._axisLength/2, -160, 0),
				  rotation: new THREE.Vector3(0, 0, 0) };		
		
		var animLength = 500;
		if (!this._xAxisObjects.animationValues.titleText) {
			this._xAxisObjects.animationValues.titleText = {};
		}
		var animObj = this._xAxisObjects.animationValues.titleText;
		
		this._animateAxisText( text, animObj, state, animLength, delay );
	}
	
	p._yAxisToDefaultView = function _yAxisToDefaultView()
	{
		if (!this._yAxisObjects) return;
		
		var numSteps = this._yAxisValues.numSteps;
		this._yAxisObjects.container.rotation.y = 0;
		this._yAxisObjects.container.rotation.y = 0;
		
		for ( var i = 0; i < this._yAxisObjects.markers.length; i ++ )
		{
			var markerObj = this._yAxisObjects.markers[i];
			//var xpos = ( i * (this._axisLength/numSteps) );
			var text = markerObj.children[1];

			var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			var state = {};
			state.position = new THREE.Vector3(rightOffset - 40, -this._defaultTextSize/2, 0);
			state.rotation = new THREE.Vector3(0, 0, Math.PI + Math.PI/2);

			//var text = this._yAxisObjects.children[i];		
			
			text.position = state.position;
			text.rotation = state.rotation;
			
			//text.position.x = rightOffset - 40;
			//text.position.y = ypos - 10;
		}
		
		text = this._yAxisObjects.titleText;
		var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
		//text.position.x = -120;
		//text.position.y = centreOffset + this._axisLength/2;
		//text.rotation.z = Math.PI/2;
		
		state = { position: new THREE.Vector3(-120, centreOffset + this._axisLength/2, 0),
				  rotation: new THREE.Vector3(0, 0, Math.PI/2) };
				  
		text.position = state.position;
		text.rotation = state.rotation;
	}
	
	p._xAxisToBottomView = function _xAxisToBottomView()
	{
		if (!this._xAxisObjects) return;
		
		var numSteps = this._xAxisValues.numSteps;
		
		//this._xAxisObjects.container.rotation.x = Math.PI + Math.PI/2;

		var delay = 0;

		var animLength = 1000;
		var animObj = this._xAxisObjects.animationValues.container = { rX: this._xAxisObjects.container.rotation.x };
		this._createGraphTween(animObj, { rX: Math.PI + Math.PI/2 }, animLength, delay, this._updateTimeCallback);		
		
		this._xMarkerTextBottom = [];
		
		delay += 1200;
		
		for ( var i = 0; i < this._xAxisObjects.markers.length; i ++ )
		{
			//var xpos = ( i * (this._axisLength/numSteps) );
			var text = this._xAxisObjects.markers[i].children[1];
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
			var animObj = this._xAxisObjects.animationValues.text[i] = {};
			
			this._animateAxisText( text, animObj, state, animLength, delay );
			
			delay += 50;			
		}
		
		delay += 100;
		
		text = this._xAxisObjects.titleText;
		var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
		
		state = { position: new THREE.Vector3(centreOffset + this._axisLength/2, -140, 0),
				  rotation: new THREE.Vector3(Math.PI, 0, 0) };
		
		this._xMarkerTitleBottom = state;
		
		//text.position = this._xMarkerTitleBottom.position;
		//text.rotation = this._xMarkerTitleBottom.rotation;	
		
		var animLength = 500;
		if (!this._xAxisObjects.animationValues.titleText) {
			this._xAxisObjects.animationValues.titleText = {};
		}
		var animObj = this._xAxisObjects.animationValues.titleText = {};
		this._animateAxisText( text, animObj, state, animLength, delay );		
	}
	
	p._yAxisToRightView = function _yAxisToRightView()
	{
		if (!this._yAxisObjects) return;
		
		this._yAxisObjects.container.rotation.y = Math.PI/2;
		this._yAxisObjects.container.rotation.y = Math.PI/2;
	}	

	p._zAxisToDefaultView = function _zAxisToDefaultView()
	{
		if (!this._zAxisObjects) return;
		
		var numSteps = this._zAxisValues.numSteps;
		this._zAxisObjects.container.rotation.z = 0;
	
		for ( var i = 0; i < this._zAxisObjects.markers.length; i ++ )
		{
			var zpos = -( i * (this._axisLength/numSteps) );
			var text = this._zAxisObjects.markers[i].children[1];

			var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			text.position.x = rightOffset - 40; //?
			text.position.y = 20;				//?
			text.position.z = this._defaultTextSize / 2;
			text.rotation.x = -Math.PI/2;
			text.rotation.z = 0;	
		}
		
		text = this._zAxisObjects.titleText;
		var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
		text.position.x = -120;
		text.position.z = -this._axisLength/2 - centreOffset;
		text.rotation.x = -Math.PI/2;
		text.rotation.z = Math.PI/2;
	}
	p._zAxisToRightView = function _zAxisToRightView()
	{
		if (!this._zAxisObjects) return;
		
		var numSteps = this._zAxisValues.numSteps;
		this._zAxisObjects.container.rotation.z = Math.PI/2;
		
		for ( var i = 0; i < this._zAxisObjects.markers.length; i ++ )
		{
			var zpos = -( i * (this._axisLength/numSteps) );
			var text = this._zAxisObjects.markers[i].children[1];

			var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			text.position.x = rightOffset - 40;
			text.position.z = - this._defaultTextSize/2;
			text.rotation.x = Math.PI/2;
			text.rotation.z = 0;
		}
		
		text = this._zAxisObjects.titleText;
		var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
		text.position.x = -140;
		text.position.z = -this._axisLength/2 - centreOffset;		
		text.rotation.x = Math.PI/2;
		text.rotation.z = Math.PI + Math.PI/2;
	}
	p._zAxisToBottomView = function _zAxisToBottomView()
	{
		if (!this._zAxisObjects) return;
		
		var numSteps = this._zAxisValues.numSteps;
		this._zAxisObjects.container.rotation.z = 0;
		
		for ( var i = 0; i < this._zAxisObjects.markers.length; i ++ )
		{
			var zpos = -( i * (this._axisLength/numSteps) );
			var text = this._zAxisObjects.markers[i].children[1];

			var rightOffset = -1 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
			
			text.position.x = rightOffset - 40;
			text.position.z = -this._defaultTextSize/2;
			text.rotation.x = Math.PI/2;
			text.rotation.z = 0;
		}
		
		text = this._zAxisObjects.titleText;
		var centreOffset = -0.5 * ( text.children[0].geometry.boundingBox.max.x - text.children[0].geometry.boundingBox.min.x );
		text.position.x = -140;
		text.position.z = -this._axisLength/2 - centreOffset;		
		text.rotation.x = Math.PI/2;
		text.rotation.z = Math.PI + Math.PI/2;
	}	
	
	// RENDER GRIDS =========================================
	p._renderGridXY = function _renderGridXY()
	{
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, this._axisLength, 0 ) );
		
		var numSteps = this._xAxisValues.numSteps;
		var stepSize = this._axisLength / numSteps;
		
		// Render X lines (Up)
		for ( var i = 0; i <= numSteps; i ++ ) 
		{
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.x = ( i * stepSize );
			line.position.z = -this._axisLength;
			this._graphObj.add( line );
		}
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( this._axisLength, 0,  0 ) );
		
		var numSteps = this._yAxisValues.numSteps;
		var stepSize = this._axisLength / numSteps;	
		
		// Render Y lines (Across)
		for ( var i = 0; i <= numSteps; i ++ ) 
		{
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.y = ( i * stepSize );
			line.position.z = -this._axisLength;
			this._graphObj.add( line );
		}
	}
	
	p._renderGridYZ = function _renderGridYZ()
	{
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, 0, this._axisLength ) );
		
		var numSteps = this._yAxisValues.numSteps;
		var stepSize = this._axisLength / numSteps;
		
		// Render Y lines (Across)
		for ( var i = 0; i <= numSteps; i ++ ) 
		{
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.y = ( i * stepSize );
			line.position.z = -this._axisLength;
			this._graphObj.add( line );
		}
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, this._axisLength, 0 ) );
		
		var numSteps = this._zAxisValues.numSteps;
		var stepSize = this._axisLength / numSteps;	
		
		// Render Z lines (Up)
		for ( var i = 0; i <= numSteps; i ++ ) 
		{
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.z = ( i * stepSize ) -this._axisLength;
			this._graphObj.add( line );
		}
	}
	
	p._renderGridXZ = function _renderGridXZ()
	{
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, 0, this._axisLength ) );

		var numSteps = this._xAxisValues.numSteps;
		var stepSize = this._axisLength / numSteps;
		
		// Render X lines (Front/Back)
		for ( var i = 0; i <= numSteps; i ++ ) 
		{
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.x = ( i * stepSize );
			line.position.z = -this._axisLength;
			this._graphObj.add( line );
		}		
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( this._axisLength, 0, 0 ) );
		
		var numSteps = this._zAxisValues.numSteps;
		var stepSize = this._axisLength / numSteps;		
		
		// Render Z lines (Left/Right)
		for ( var i = 0; i <= numSteps; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.z = ( i * stepSize ) - this._axisLength;
			this._graphObj.add( line );
		}
	}
	
	// CREATE TEXT =================================
	
	p._createText = function _createText(str, size)
	{
		// Get text from hash
		var hash = document.location.hash.substr( 1 );

		if ( hash.length !== 0 ) {

			str = hash;

		}
		
		if (!size)	size = this._defaultTextSize;

		var geometry = new THREE.TextGeometry( str, {

			size: size,
			height: 1,
			curveSegments: 2,
			font: "helvetiker"

		});

		geometry.computeBoundingBox();
		var centerOffset = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		var rightOffset = -1 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		
		var textMaterial = new THREE.MeshBasicMaterial( { color:  0x000000, overdraw: true } );
		var text = new THREE.Mesh( geometry, textMaterial );

		text.doubleSided = false;

		var parent = new THREE.Object3D();
		parent.add( text );
		
		return parent;
	}
}

})();	