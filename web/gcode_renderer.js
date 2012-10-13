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
        opacity: 0.5,
        transparent: true,
        linewidth: 3,
        vertexColors: THREE.VertexColors });
  this.feedMat = new THREE.LineBasicMaterial({
        opacity: 1.0,
        transparent: true,
        linewidth: 3,
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

      var color =  new THREE.Color(GCodeRenderer.motionColors[code.index%GCodeRenderer.motionColors.length]);
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

      var color =  new THREE.Color(GCodeRenderer.feedColors[code.index%GCodeRenderer.feedColors.length]);
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
      return this.motionMat;
    },
    G1: function(code) {
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



GCodeRenderer.motionColors = [ 0xdddddd ]

GCodeRenderer.feedColors = [ 0xffcc66, // canteloupe
                             0x66ccff, // sky
                             0xccff66, // honeydew
                             0xff70cf, // carnation
                             0xfffe66, // banana
                             0xff6666, // salmon
                             0xcc66ff // lavender
                             // 0x66ffcc, // spindrift
                             // 0x66ff66, // flora
                           ]

GCodeRenderer.prototype.render = function(model) {
  var self = this;
  self.model = model;

  geometry = new THREE.Geometry();


  var parentObject = new THREE.Object3D();

  self.model.codes.forEach(function(code) {
    self.renderGCode(code);
  });

  var motionLine = new THREE.Line(this.motionGeo, this.motionMat, THREE.LinePieces);
  var feedLine = new THREE.Line(this.feedGeo, this.feedMat, THREE.LinePieces);
  parentObject.add(motionLine);
  parentObject.add(feedLine);

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

};


