function createScene(container) {
  // var containerWidth  = container.offsetWidth,
  //     containerHeight = container.offsetHeight;

  // var camera, controls, scene, renderer;

  // // Renderer
  // renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialias: false } );
  // renderer.setSize(containerWidth, containerHeight);
  // renderer.autoClear = false;

  // container.appendChild(renderer.domElement);
  // // renderer.clear();

  // scene = new THREE.Scene();

  // // Lights...
  // // [[ 0, 0, 1, 0xFFFFCC],
  // //  [ 0, 1, 0, 0xFFCCFF],
  // //  [ 1, 0, 0, 0xCCFFFF],
  // //  [ 0, 0,-1, 0xCCCCFF],
  // //  [ 0,-1, 0, 0xCCFFCC],
  // //  [-1, 0, 0, 0xFFCCCC]].forEach(function(position) {
  // //   var light = new THREE.DirectionalLight(position[3]);
  // //   light.position.set(position[0], position[1], position[2]).normalize();
  // //   scene.add(light);
  // // });

  // // Camera...
  // var fov    = 45,
  //     aspect = containerWidth / containerHeight,
  //     near   = 1,
  //     far    = 10000,
  //     camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // camera.position.z = 300;

  // scene.add(camera);

  // controls = new THREE.TrackballControls(camera);
  // controls.dynamicDampingFactor = 0.15;

  // // Action!
  // function render() {
  //   controls.update();
  //   renderer.render(scene, camera);

  //   requestAnimationFrame(render); // And repeat...
  // }

  // render();

  // function setSize(width, height) {
  //   camera.aspect = width / height;
  //   camera.updateProjectionMatrix();

  //   renderer.setSize(width, height);

  //   controls.handleResize();
  // }

  // // Fix coordinates up if window is resized.
  // $(window).on('resize', function() {
  //   setSize(container.offsetWidth, container.offsetHeight);
  // });



  var effectFXAA,

  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,

  autoRotate = false,

  camera, controls, renderer, composer;

  init();
  animate();

  function init() {

    var i;

    // container = document.createElement( 'div' );
    // document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 33, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 700;

    controls = new THREE.TrackballControls( camera );

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;

    container.appendChild( renderer.domElement );


    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    //container.appendChild( stats.domElement );


    var renderModel = new THREE.RenderPass( scene, camera );
    var effectBloom = new THREE.BloomPass( 0.4 );
    var effectScreen = new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );

    effectFXAA = new THREE.ShaderPass( THREE.ShaderExtras[ "fxaa" ] );

    var width = window.innerWidth || 2;
    var height = window.innerHeight || 2;

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

    effectScreen.renderToScreen = true;

    composer = new THREE.EffectComposer( renderer );

    composer.addPass( renderModel );
    composer.addPass( effectFXAA );
    composer.addPass( effectBloom );
    composer.addPass( effectScreen );

    //

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'keydown', keydown, false );

  }

  function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );

    composer.reset();

  }

  function keydown(event) {

    if( event.keyCode == 32 ) { // 32 == spacebar
      autoRotate = !autoRotate;
    }
  }


  function animate() {

    requestAnimationFrame( animate );
    render();

    // stats.update();

  }

  function render() {

    var time = Date.now() * 0.0005;

    for ( var i = 0; i < scene.children.length; i ++ ) {

      var object = scene.children[ i ];

      if(autoRotate) {
        if ( object instanceof THREE.Object3D ) {
          object.rotation.y = object.rotation.y + 0.015;
        }
      }
    }

    if( effectController && gr ) {
      if( effectController.animate ) {
         try {
          gr.setIndex(gr.index + 1);
          effectController.gcodeIndex = gr.index;
        }
        catch(e) {
          effectController.animate = false;
        }
      }
      else {
        gr.setIndex(effectController.gcodeIndex);
      }
    }

    controls.update();

    renderer.clear();
    composer.render();

  }

  return scene;
}
