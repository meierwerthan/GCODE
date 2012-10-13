function GCodeViewModel(code, geometry, material) {
  this.code = code;
  this.geometry = geometry;
  this.material = material;
}

function GCodeRenderer() {

  var self = this;

  this.motionGeo = new THREE.Geometry();
  this.feedGeo = new THREE.Geometry();
  this.motionMat = new THREE.LineBasicMaterial({
        // color: 0xff0000,
        opacity: 0.5,
        transparent: true,
        linewidth: 3,
        // vertexColors: THREE.NoColors }),
        vertexColors: THREE.VertexColors });
  this.feedMat = new THREE.LineBasicMaterial({
        // color: 0x0000ff,
        opacity: 1.0,
        transparent: true,
        linewidth: 3,
        // vertexColors: THREE.NoColors });
        vertexColors: THREE.VertexColors });



  this.lastLine = {x:0, y:0, z:0, e:0, f:0};
  this.relative = false;


  // this.renderer = renderer;
  this.bounds = {
    min: { x: 100000, y: 100000, z: 100000 },
    max: { x:-100000, y:-100000, z:-100000 }
  };

  this.geometryHandlers = {

    G0: function(code) {
      // console.log("in g0 renderer handler " + code)

      var newLine = {};

      code.words.forEach(function(word) {
        // TODO: handle non-numerical values
        switch(word.letter) {
          case 'X': case 'Y': case 'Z':  case 'E':  case 'F':
            var p = word.letter.toLowerCase();
            newLine[p] = self.absolute(self.lastLine[p], parseFloat(word.value));
            break;
        }
      });

      ['x','y','z','e','f'].forEach(function(prop) {
        if (newLine[prop] === undefined) {
          newLine[prop] = self.lastLine[prop];
        }
      });

      // var geometry = new THREE.Geometry();
      var color =  new THREE.Color(0x0000ff);
      self.motionGeo.vertices.push(new THREE.Vector3(self.lastLine.x, self.lastLine.y, self.lastLine.z));
      self.motionGeo.vertices.push(new THREE.Vector3(newLine.x, newLine.y, newLine.z));

      self.motionGeo.colors.push(color);
      self.motionGeo.colors.push(color);

      self.lastLine = newLine;

      return self.motionGeo;
    },
    G1: function(code) {
      // console.log("in g1 renderer handler " + code)

      var newLine = {};

      code.words.forEach(function(word) {
        // TODO: handle non-numerical values
        switch(word.letter) {
          case 'X': case 'Y': case 'Z':  case 'E':  case 'F':
            var p = word.letter.toLowerCase();
            newLine[p] = self.absolute(self.lastLine[p], parseFloat(word.value));
            break;
        }
      });

      ['x','y','z','e','f'].forEach(function(prop) {
        if (newLine[prop] === undefined) {
          newLine[prop] = self.lastLine[prop];
        }
      });

      var color =  new THREE.Color(0xff0000);
      self.feedGeo.vertices.push(new THREE.Vector3(self.lastLine.x, self.lastLine.y, self.lastLine.z));
      self.feedGeo.vertices.push(new THREE.Vector3(newLine.x, newLine.y, newLine.z));
      self.feedGeo.colors.push(color);
      self.feedGeo.colors.push(color);

      self.lastLine = newLine;

      return self.feedGeo;
    },
    G2: function(code) {
    }

  } // end geometryHandlers

  this.materialHandlers = {

    G0: function(code) {
      // var material = new THREE.LineBasicMaterial({
      //       color: new THREE.Color( GCodeRenderer.colors[code.index%GCodeRenderer.colors.length] ),
      //       opacity: 0.0,
      //       transparent: true,
      //       linewidth: 3,
      //       vertexColors: THREE.NoColors });
      // return material;
      // return GCodeRenderer.materials[code.index%GCodeRenderer.materials.length];
      return this.motionMat;
    },
    G1: function(code) {
      // var material = new THREE.LineBasicMaterial({
      //       color: new THREE.Color( GCodeRenderer.colors[code.index%GCodeRenderer.colors.length] ),
      //       opacity: 1.0,
      //       transparent: true,
      //       linewidth: 3,
      //       vertexColors: THREE.NoColors });
      // return material;
      // return GCodeRenderer.materials[code.index%GCodeRenderer.materials.length];
      return this.feedMat;
    },
    G2: function(code) {
      return this.feedMat;
    }

  } // end materialHandlers

};

GCodeRenderer.prototype.absolute = function(v1, v2) {
    return this.relative ? v1 + v2 : v2;
  }



// GCodeRenderer.colors = [ 0xffffff, 0xff0000, 0x00ff00, 0x0000ff ]

GCodeRenderer.colors = [ 0xffcc66, // canteloupe
                         0x66ccff, // sky
                         0xccff66, // honeydew
                         0xff70cf, // carnation
                         0xfffe66, // banana
                         0xff6666, // salmon
                         0xcc66ff // lavender
                         // 0x66ffcc, // spindrift
                         // 0x66ff66, // flora
                       ]

// GCodeRenderer.materials = (function() {
//     var materials = [];
//     GCodeRenderer.colors.forEach(function(color){
//       var material = new THREE.LineBasicMaterial({
//             color: color,
//             opacity: 1.0,
//             transparent: true,
//             linewidth: 3 });
//             // linewidth: 3,
//             // vertexColors: THREE.NoColors });
//             // vertexColors: THREE.VertexColors });
//       materials.push(material);
//     });
//     return materials;
//   })();

GCodeRenderer.prototype.render = function(model) {
  var self = this;
  self.model = model;

  geometry = new THREE.Geometry();


  var parentObject = new THREE.Object3D();
  // var parentObject = new THREE.Object3D(),
      // lineObject;

  self.model.codes.forEach(function(code) {
    self.renderGCode(code);
    // lineObject = self.renderGCode(code);
    // if(lineObject) {
      // parentObject.add(lineObject);
    // }
  });


  // rendered.forEach(function(viewModel) {
  //   // if(materials[code.index]) {
  //     // var lineObject = new THREE.Line(viewModel.geometry, viewModel.material, THREE.LinePieces);
  //     var lineObject = new THREE.Line(viewModel.geometry, undefined, THREE.LinePieces);
  //     // var lineObject = new THREE.Line(geometry, materials[code.index], THREE.LinePieces);
  //     // var lineObject = new THREE.Line(geometry, materials[code.index], THREE.LineStrip);
  //     parentObject.add(lineObject);
  //   // }
  // });

  var motionLine = new THREE.Line(this.motionGeo, this.motionMat, THREE.LinePieces);
  var feedLine = new THREE.Line(this.feedGeo, this.feedMat, THREE.LinePieces);
  // var motionLine = new THREE.Line(this.motionGeo, undefined, THREE.LinePieces);
  // var feedLine = new THREE.Line(this.feedGeo, undefined, THREE.LinePieces);
  parentObject.add(motionLine);
  parentObject.add(feedLine);


  // parentObject.add(new THREE.Line(geometry, undefined, THREE.LinePieces));

  // var i, line, material, p,
  //   parameters = [
  //                  [ 0.25, 0xff7700,    1, 2 ],
  //                  [  0.5, 0xff9900,    1, 1 ],
  //                  [ 0.75, 0xffaa00, 0.75, 1 ],
  //                  [    1, 0xffaa00,  0.5, 1 ],
  //                  [ 1.25, 0x000833,  0.8, 1 ],
  //                  // [  3.0, 0xaaaaaa, 0.75, 2 ],
  //                  // [  3.5, 0xffffff,  0.5, 1 ],
  //                  // [  4.5, 0xffffff, 0.25, 1 ],
  //                  // [ 5.5, 0xffffff, 0.125, 1 ]
  //                ];

  // for( i = 0; i < parameters.length; ++ i ) {

  //   p = parameters[ i ];

  //   material = new THREE.LineBasicMaterial( { color: p[ 1 ], opacity: p[ 2 ], linewidth: p[ 3 ] } );

  //   line = new THREE.Line( geometry, material, THREE.LinePieces );
  //   line.scale.x = line.scale.y = line.scale.z = p[ 0 ];
  //   line.originalScale = p[ 0 ];
  //   line.rotation.y = Math.random() * Math.PI;
  //   line.updateMatrix();
  //   parentObject.add( line );
  // }

  // Center
  var scale = 3; // TODO: Auto size

  var center = new THREE.Vector3(
      this.bounds.min.x + ((this.bounds.max.x - this.bounds.min.x) / 2),
      this.bounds.min.y + ((this.bounds.max.y - this.bounds.min.y) / 2),
      this.bounds.min.z + ((this.bounds.max.z - this.bounds.min.z) / 2));

  parentObject.position = center.multiplyScalar(-scale);

  parentObject.scale.multiplyScalar(scale);
  console.log("bbox ", this.bounds);
  console.log("center ", center);
  console.log("parentObject ", parentObject);

  return parentObject;
};

var rendered = [];

/* returns THREE.Object3D */
GCodeRenderer.prototype.renderGCode = function(code) {
  var cmd = code.words[0].letter+code.words[0].value,
      viewModel = new GCodeViewModel();

  var geometryHandler = this.geometryHandlers[cmd] || this.geometryHandlers['default'];
  if (geometryHandler) {
    viewModel.geometry = geometryHandler(code);
  }
  var materialHandler = this.materialHandlers[cmd] || this.materialHandlers['default'];
  if (materialHandler) {
    viewModel.material = materialHandler(code);
  }
  if(viewModel.geometry && viewModel.material) {
    rendered.push(viewModel);
  }

  // if(geometry && material) {
  //   // return new THREE.Line(geometry, material, THREE.LinePieces);
  //   // return new THREE.Line(geo, material, THREE.LineStrip);
  //   return new THREE.Line(geometry);
  // }
  // else {
  //   console.log("no geometry or material created, can't render for code: " + code);
  // }

};


