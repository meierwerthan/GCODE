function createScene(container) {
  var containerWidth  = container.offsetWidth,
      containerHeight = container.offsetHeight;

  var camera, controls, scene, renderer;

  // Renderer
  renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialias: false } );
  renderer.setSize(containerWidth, containerHeight);
  renderer.autoClear = false;

  container.appendChild(renderer.domElement);
  renderer.clear();

  scene = new THREE.Scene();

  // Lights...
  // [[ 0, 0, 1, 0xFFFFCC],
  //  [ 0, 1, 0, 0xFFCCFF],
  //  [ 1, 0, 0, 0xCCFFFF],
  //  [ 0, 0,-1, 0xCCCCFF],
  //  [ 0,-1, 0, 0xCCFFCC],
  //  [-1, 0, 0, 0xFFCCCC]].forEach(function(position) {
  //   var light = new THREE.DirectionalLight(position[3]);
  //   light.position.set(position[0], position[1], position[2]).normalize();
  //   scene.add(light);
  // });

  // Camera...
  var fov    = 45,
      aspect = containerWidth / containerHeight,
      near   = 1,
      far    = 10000,
      camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 300;

  scene.add(camera);

  controls = new THREE.TrackballControls(camera);
  controls.dynamicDampingFactor = 0.15;

  // Action!
  function render() {
    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(render); // And repeat...
  }

  render();

  function setSize(width, height) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    controls.handleResize();
  }

  // Fix coordinates up if window is resized.
  $(window).on('resize', function() {
    setSize(container.offsetWidth, container.offsetHeight);
  });

  return scene;
}
