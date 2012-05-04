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
		
		this._updateTimeCallback = ListenerFunctions.createListenerFunction(this, this._updateTime);
		this._updateAxesTextCallback = ListenerFunctions.createListenerFunction(this, this._updateAxesText);
		this._completeTimeCallback = ListenerFunctions.createListenerFunction(this, this._completeTime);		
		
		this._xAxisViewModel = XAxisViewModel.create(this._axisLength, this._defaultTextSize);
		this._xAxisViewModel._updateAxesTextCallback = this._updateAxesTextCallback;
		this._xAxisViewModel._updateTimeCallback = this._updateTimeCallback;
			
		this._yAxisViewModel = YAxisViewModel.create(this._axisLength, this._defaultTextSize);
		this._yAxisViewModel._updateAxesTextCallback = this._updateAxesTextCallback;
		this._yAxisViewModel._updateTimeCallback = this._updateTimeCallback;
		
		this._zAxisViewModel = ZAxisViewModel.create(this._axisLength, this._defaultTextSize);
		this._zAxisViewModel._updateAxesTextCallback = this._updateAxesTextCallback;
		this._zAxisViewModel._updateTimeCallback = this._updateTimeCallback;
		
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
		
		/*
		//this._cameraValues = {"lineEnvelope": 0, "contentEnvelope": 0};
		this._cameraValues = {camRX: this._camera.rotation.x, 
							  camRY: this._camera.rotation.y, 
							  camRZ: this._camera.rotation.z, 
							  camPX: this._camera.position.x, 
							  camPY:this._camera.position.y, 
							  camPZ:this._camera.position.z};
		*/
		
		this._graphValues = {rX: 0, rY: 0, rZ: 0};
		
		document.addEventListener( 'mousedown', function(event) { scope._onDocumentMouseDown(event); }, false );
		document.addEventListener( 'touchstart', function(event) { scope._onDocumentTouchStart(event); }, false );
		document.addEventListener( 'touchmove', function(event) { scope._onDocumentTouchMove(event); }, false );
		
		this._renderAxes();
		//this._renderGridXY();
		//this._renderGridXZ();
		//this._renderGridYZ();
		//this._plotData();
		
		this.toOverView();
	};
	
	p.disable = function disable()
	{

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

		this._xAxisViewModel.axisToBottomView();
		this._yAxisViewModel.axisToBottomView();
		this._zAxisViewModel.axisToBottomView();
		
		//if (this._xAxisViewModel) 	this._graphObj.add(this._xAxisViewModel.container);
		//if (this._yAxisViewModel) 	this._graphObj.remove(this._yAxisViewModel);
		//if (this._zAxisViewModel) 	this._graphObj.add(this._zAxisViewModel);
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
		
		this._xAxisViewModel.axisToDefaultView();
		this._yAxisViewModel.axisToRightView();
		this._zAxisViewModel.axisToRightView();
		
		//if (this._xAxisViewModel) 	this._graphObj.remove(this._xAxisViewModel.container);
		//if (this._yAxisViewModel) 	this._graphObj.add(this._yAxisViewModel);
		//if (this._zAxisViewModel) 	this._graphObj.add(this._zAxisViewModel);
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
		
		this._xAxisViewModel.axisToDefaultView();
		this._yAxisViewModel.axisToDefaultView();
		this._zAxisViewModel.axisToRightView();
		//this._zAxisViewModel.axisToDefaultView();
		
		//if (this._xAxisViewModel) 	this._graphObj.add(this._xAxisViewModel.container);
		//if (this._yAxisViewModel) 	this._graphObj.add(this._yAxisViewModel);
		//if (this._zAxisViewModel) 	this._graphObj.remove(this._zAxisViewModel);
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
		
		this._xAxisViewModel.axisToDefaultView();
		this._yAxisViewModel.axisToDefaultView();
		//this._zAxisViewModel.axisToRightView();
		this._zAxisViewModel.axisToDefaultView();
		
		//if (this._xAxisViewModel) 	this._graphObj.add(this._xAxisViewModel.container);
		//if (this._yAxisViewModel) 	this._graphObj.add(this._yAxisViewModel);
		//if (this._zAxisViewModel) 	this._graphObj.add(this._zAxisViewModel);
	}
	
	p._updateTime = function _updateTime() 
	{
		/*
		this._camera.rotation.x = this._cameraValues.camRX;
		this._camera.rotation.y = this._cameraValues.camRY;
		this._camera.rotation.z = this._cameraValues.camRZ;
		
		this._camera.position.x = this._cameraValues.camPX;
		this._camera.position.y = this._cameraValues.camPY;
		this._camera.position.z = this._cameraValues.camPZ;
		*/
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
		
		this._xAxisViewModel.updateAxis();
		this._yAxisViewModel.updateAxis();
		this._zAxisViewModel.updateAxis();
	};
	
	p._updateAxesText = function _updateAxesText()
	{
		this._xAxisViewModel.updateAxisText();
		this._yAxisViewModel.updateAxisText();
		this._zAxisViewModel.updateAxisText();
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
		this._xAxisViewModel.values = this._graphUtils.mapToAxis(data.gdpPerCapita.minValue, data.gdpPerCapita.maxValue, numSteps);
		// Compute Y-Axis (HIV)
		this._yAxisViewModel.values = this._graphUtils.mapToAxis(data.hivPrevalence.minValue, data.hivPrevalence.maxValue, numSteps, true);
		// Compute Z-Axis (Time)
		this._zAxisViewModel.values = this._graphUtils.mapToAxis(zMin, zMax, numSteps, true);
		
		// RENDER
		
		this.enable();
		//console.log("Z (Time) axis minVal "+this._zAxisViewModel.values.minVal+" maxVal "+this._zAxisViewModel.values.maxVal);
	}
	
	p._plotData = function _plotData()
	{
		// draw line for country
		//this._plotData(data.countries["Lesotho"]);
		var regionColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF, 0xFF00FF];
		this._regionColors = {};
		for ( var i = 0; i < data.regions.length; i ++ )
		{
			var region = data.regions[i];
			var color = new THREE.Color();
			//color.setHSV(Math.random(), 1.0, 1.0);
			color.setHex(regionColors[i]);
			this._regionColors[region.name] = color;
		}
		
		for ( var countryName in data.countries ) 
		{
			var country = data.countries[countryName];
			color = this._regionColors[country.region.name];
			//var color = new THREE.Color();
			//color.setHSV(Math.random(), 1.0, 1.0);
			this._plotLine(country, color);
		}	
	}
	
	p._plotLine = function _plotLine(country, color)
	{
		var minYear = this._zAxisViewModel.values.minVal;
		
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
			var diffFromZero = gdp - this._xAxisViewModel.values.minVal;
			var valueLengthOfAxis = this._xAxisViewModel.values.maxVal - this._xAxisViewModel.values.minVal;
			var ratio = diffFromZero / valueLengthOfAxis;
			
			xpos = ratio * this._axisLength;
			
			// YPOS
			var diffFromZero = hiv - this._yAxisViewModel.values.minVal;
			var valueLengthOfAxis = this._yAxisViewModel.values.maxVal - this._yAxisViewModel.values.minVal;
			var ratio = diffFromZero / valueLengthOfAxis;
			
			ypos = ratio * this._axisLength;			

			// ZPOS
			var diffFromZero = year - this._zAxisViewModel.values.minVal;
			var valueLengthOfAxis = this._zAxisViewModel.values.maxVal - this._zAxisViewModel.values.minVal;
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
	/*
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
	*/
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

		this._xAxisViewModel.renderAxis(delay, "GDP Per Capita (2005 Int $)", this._graphObj);
		this._yAxisViewModel.renderAxis(delay += 500, "Estimated HIV Prevalence % (Ages 15-49)", this._graphObj);
		this._zAxisViewModel.renderAxis(delay += 500, "Time", this._graphObj);
	}
	
	// RENDER GRIDS =========================================
	p._renderGridXY = function _renderGridXY()
	{
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, this._axisLength, 0 ) );
		
		var numSteps = this._xAxisViewModel.values.numSteps;
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
		
		var numSteps = this._yAxisViewModel.values.numSteps;
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
		
		var numSteps = this._yAxisViewModel.values.numSteps;
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
		
		var numSteps = this._zAxisViewModel.values.numSteps;
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

		var numSteps = this._xAxisViewModel.values.numSteps;
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
		
		var numSteps = this._zAxisViewModel.values.numSteps;
		var stepSize = this._axisLength / numSteps;		
		
		// Render Z lines (Left/Right)
		for ( var i = 0; i <= numSteps; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.z = ( i * stepSize ) - this._axisLength;
			this._graphObj.add( line );
		}
	}
}

})();	