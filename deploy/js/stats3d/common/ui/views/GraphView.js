(function(){

var namespace = STATS3D.namespace("STATS3D.common.ui.views");
var GraphUtils = STATS3D.namespace("STATS3D.common.data").GraphUtils;
//var EventDispatcher = STATS3D.namespace("STATS3D.utils.events").EventDispatcher;

if(namespace.GraphView === undefined) 
{
	var GraphView = function GraphView() {
		this._init();
		this._animate();
	};
	
	namespace.GraphView = GraphView;
		
	var p = GraphView.prototype = {};//new EventDispatcher();
	
	GraphView.create = function create() 
	{
		var newGraphView = new GraphView();
		return newGraphView;
	};	
	
	p._init = function _init()
	{
		//var container, stats;
		//var camera, scene, renderer;
		this.dataProvider = null;
		this._graphUtils = GraphUtils.create();
		
		this._offsetTop = 600;
		
		this._container = document.createElement( 'div' );
		document.body.appendChild( this._container );

		var distance = 2000;
		this._camera = new THREE.CombinedCamera( window.innerWidth /2, window.innerHeight/2, 70, 1, distance, -distance, distance, distance );
		
		this._camera.position.x = 0//200;
		this._camera.position.y = this._offsetTop;
		this._camera.position.z = 0//200;

		this._scene = new THREE.Scene();

		this._scene.add( this._camera );
		this._scene.position.y = this._offsetTop;

		
		this._axisLength = 1000;
		
		// Grid

		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( this._axisLength, 0, 0 ) );

		var numSteps = 20;
		var stepSize = this._axisLength / numSteps;
		
		for ( var i = 0; i <= numSteps; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.z = ( i * stepSize ) - this._axisLength;
			this._scene.add( line );

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.x = ( i * stepSize );
			line.position.z = 0;//-this._axisLength;
			line.rotation.y = 90 * Math.PI / 180;
			this._scene.add( line );

		}

		// X-AXIS (red)
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( this._axisLength, 0, 0 ) );

		var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 0.5 } ) );
		this._scene.add( line );
	
		// Y-AXIS (green)
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, this._axisLength, 0 ) );

		var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x00ff00, opacity: 0.5 } ) );
		this._scene.add( line );
		
		// Z-AXIS (blue)
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, 0, -this._axisLength ) );

		var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x0000ff, opacity: 0.5 } ) );
		this._scene.add( line );			
		

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
		//this._renderer.setSize( "100%", "100%" );
		
		this._container.appendChild( this._renderer.domElement );

		this._stats = new Stats();
		this._stats.domElement.style.position = 'absolute';
		this._stats.domElement.style.top = '0px';
		this._container.appendChild( this._stats.domElement );

		
		var scope = this;
		window.addEventListener( 'resize', function() { scope._onWindowResize() }, false );
		
		document.addEventListener( 'mousemove', function(event) { scope._onDocumentMouseMove(event) }, false );
		
		this.enable();
	}
	
	p._onWindowResize = function _onWindowResize() 
	{
		this._camera.setSize( window.innerWidth, window.innerHeight );
		this._camera.updateProjectionMatrix();

		this._renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	p._onDocumentMouseMove = function _onDocumentMouseMove( event ) 
	{
		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;
		
		this._mouseX = ( event.clientX - windowHalfX );
		this._mouseY = ( event.clientY - windowHalfY );
	}	
	
	p.destroy = function destroy() 
	{
	
	};
	
	p.enable = function enable()
	{
		this.setOrthographic();
		this.setLens(12);
		this.toOverView();
		this._camera.setZoom(2);
		
		this._topViewButton = document.getElementById("topView");
		this._rightViewButton = document.getElementById("rightView");
		this._frontViewButton = document.getElementById("frontView");
		this._overViewButton = document.getElementById("overView");
		
		var scope = this;
		
		this._topViewButton.addEventListener( "click", function() { scope.toTopView(); } );
		this._rightViewButton.addEventListener( "click", function() { scope.toRightView(); } );
		this._frontViewButton.addEventListener( "click", function() { scope.toFrontView(); } );
		this._overViewButton.addEventListener( "click", function() { scope.toOverView(); } );
		
		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;
		
		//this._mouseX =  window.innerWidth / 4 * 3;
		//this._mouseY =  0 - window.innerHeight;
		//this._mouseX = 1000;
		//this._mouseY = 1000;
		
	};
	p.disable = function disable()
	{

	};
	
	p._toFixedView = function _toFixedView()
	{
		this._rotating = false;
		this._camera.position.x = 0;
		this._camera.position.y = 0;
		this._camera.position.z = 0;		
	}
	p._toDynamicView = function _toDynamicView()
	{
		this._rotating = true;
		this._camera.position.x = 200;
		this._camera.position.y = 100;
		this._camera.position.z = 200;	
	}
	
	p.toTopView = function toTopView()
	{
		this._toFixedView();
		this._camera.toTopView();
		this._camera.position.z = -this._offsetTop;
	}
	p.toRightView = function toRightView()
	{
		this._toFixedView();
		this._camera.toRightView();
		this._camera.position.y = this._offsetTop;
	}
	p.toFrontView = function toFrontView()
	{
		this._toFixedView();
		this._camera.toFrontView();
		this._camera.position.y = this._offsetTop;
	}
	p.toOverView = function toOverView()
	{
		this._toDynamicView();
		this._camera.rotationAutoUpdate = true;
		//this._camera.position.y = this._offsetTop;
	}
	
	p.setFov = function setFov( fov )
	{
		this._camera.setFov( fov );

		document.getElementById('fov').innerHTML = 'FOV '+ fov.toFixed(2) +'&deg;' ;
	}

	p.setLens = function setLens( lens ) 
	{
		// try adding a tween effect while changing focal length, and it'd be even cooler!

		var fov = this._camera.setLens( lens );

		document.getElementById('fov').innerHTML = 'Converted ' + lens + 'mm lens to FOV '+ fov.toFixed(2) +'&deg;' ;
	}

	p.setOrthographic = function setOrthographic() 
	{
		this._camera.toOrthographic();

		document.getElementById('fov').innerHTML = 'Orthographic mode' ;
	}

	p.setPerspective = function setPerspective() 
	{
		this._camera.toPerspective();

		document.getElementById('fov').innerHTML = 'Perspective mode' ;
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
	/*
		if ( this._rotating )
		{
			var timer = Date.now() * 0.0001;
			this._camera.position.x = Math.cos( timer ) * 200;
			this._camera.position.z = Math.sin( timer ) * 200;
			this._camera.lookAt( this._scene.position );
		}
	*/
	
		if ( this._rotating )
		{
			var multiplier = 0.1;//05;
			var xInc = ( this._mouseX - this._camera.position.x ) * multiplier;
			var yInc = ( - this._mouseY + this._offsetTop - this._camera.position.y ) * multiplier;
			
			if (xInc) this._camera.position.x += xInc;
			if (yInc) this._camera.position.y += yInc;
			
			this._camera.lookAt( this._scene.position );
		}
	
		this._renderer.render( this._scene, this._camera );
	}
	
	p.setDataProvider = function setDataProvider(data)
	{
		var numSteps = 20;
		
		this._dataProvider = data;
		
		// Compute X-Axis (GDP)
		this._xAxisValues = this._graphUtils.mapToAxis(data.gdpPerCapita.minValue, data.gdpPerCapita.maxValue, numSteps);
		// Compute Y-Axis (HIV)
		this._yAxisValues = this._graphUtils.mapToAxis(data.hivPrevalence.minValue, data.hivPrevalence.maxValue, numSteps);
		// Compute Z-Axis (Time)
		this._zAxisValues = this._graphUtils.mapToAxis(data.time.minYear, data.time.maxYear, numSteps);
		
		this._renderAxes();
		
		// draw line for country
		//this._plotData(data.countries["Lesotho"]);
		
		for ( var country in data.countries ) 
		{
			this._plotData(data.countries[country]);
		}

		//console.log("Z (Time) axis minVal "+this._zAxisValues.minVal+" maxVal "+this._zAxisValues.maxVal);
	}
	
	p._plotData = function _plotData(country)
	{		
		// massage data
		var yearsObj = {};
		for ( var year in country.gdpPerCapita )
		{
			var value = country.gdpPerCapita[year];
			
			if (!yearsObj[year]) {
				yearsObj[year] = {};
			}
			
			yearsObj[year].gdpPerCapita = value;
		}
		
		for ( var year in country.hivPrevalence )
		{
			var value = country.hivPrevalence[year];
			if (!yearsObj[year]) {
				yearsObj[year] = {};
			}
			
			yearsObj[year].hivPrevalence = value;
		}
		
		var colors = [];
		var color = new THREE.Color();
		color.setHSV(Math.random(), 1.0, 1.0);
		
		//init Particles
		var lineGeom = new THREE.Geometry();
		var geometry = new THREE.Geometry();
		//create one shared material
		
		var sprite = THREE.ImageUtils.loadTexture("../files/img/particle2.png");
		material = new THREE.ParticleBasicMaterial({
			size: 20,
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
		this._scene.add(particles);		
		
		// lines

		var line = new THREE.Line( lineGeom, new THREE.LineBasicMaterial( { color: color.getHex(), opacity: 0.5 } ) );
		this._scene.add( line );
	}
	
	p._renderAxes = function _renderAxes()
	{
		// draw X-Axis lines
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, -20, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		
		var axisNum = this._xAxisValues.minVal;
		var numSteps = this._xAxisValues.numSteps;
		
		for ( var i = 0; i <= numSteps; i ++ )
		{
			var xpos = ( i * (this._axisLength/numSteps) );
		
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.x = xpos;
			this._scene.add( line );
			
			
			var text = this._createText(axisNum.toString());
			text.position.x = xpos - 10;
			text.position.y -= 50;
			text.rotation.z = Math.PI + Math.PI/2;
			
			axisNum += this._xAxisValues.stepSize;

		}
		
		// draw Y-Axis lines
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( -20, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		
		var axisNum = this._yAxisValues.minVal;
		var numSteps = this._yAxisValues.numSteps;
		
		for ( var i = 0; i <= numSteps; i ++ )
		{
			var ypos = ( i * (this._axisLength/numSteps) );
		
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.y = ypos;
			this._scene.add( line );
			
			
			var text = this._createText(axisNum.toString());
			text.position.y = ypos - 10;
			text.position.x -= 40;
			
			axisNum += this._yAxisValues.stepSize;

		}
		
		// draw Z-Axis lines
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( -20, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		
		var axisNum = this._zAxisValues.minVal;
		var numSteps = this._zAxisValues.numSteps;
		
		for ( var i = 0; i <= numSteps; i ++ )
		{
			var zpos = -( i * (this._axisLength/numSteps) );
		
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.z = zpos;
			this._scene.add( line );
			
			
			var text = this._createText(axisNum.toString());
			text.position.z = zpos + 10;
			text.position.x -= 40;
			text.rotation.x = -Math.PI/2;
			//text.rotation.z = Math.PI + Math.PI/2;
			
			axisNum += this._zAxisValues.stepSize;
		}	
	}
	
	p._createText = function _createText(str)
	{
		// Get text from hash
		var hash = document.location.hash.substr( 1 );

		if ( hash.length !== 0 ) {

			str = hash;

		}

		var text3d = new THREE.TextGeometry( str, {

			size: 16,
			height: 1,
			curveSegments: 2,
			font: "helvetiker"

		});

		text3d.computeBoundingBox();
		var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
		var rightOffset = -1 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
		
		var textMaterial = new THREE.MeshBasicMaterial( { color:  0x000000, overdraw: true } );
		var text = new THREE.Mesh( text3d, textMaterial );

		text.doubleSided = false;

		var parent = new THREE.Object3D();
		parent.add( text );

		parent.position.x = rightOffset;
		parent.position.y = 20;
		parent.position.z = 0;

		parent.rotation.x = 0;
		parent.rotation.y = Math.PI * 2;		
		
		this._scene.add( parent );
		
		return parent;
	}
}

})();	