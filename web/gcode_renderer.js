

function GCodeRenderer() {

  var self = this;

  this.lastLine = {x:0, y:0, z:0, e:0, f:0};
  this.relative = false;


  // this.renderer = renderer;
  this.bounds = {
    min: { x: 100000, y: 100000, z: 100000 },
    max: { x:-100000, y:-100000, z:-100000 }
  };

  this.handlers = {

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

      /* layer change detection is or made by watching Z, it's made by
         watching when we extrude at a new Z position */
      var geometry = new THREE.Geometry();
      self.addSegment(self.lastLine, newLine, geometry);
      self.lastLine = newLine;

      return geometry;
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

      /* layer change detection is or made by watching Z, it's made by
         watching when we extrude at a new Z position */
      var geometry = new THREE.Geometry();
      self.addSegment(self.lastLine, newLine, geometry);
      self.lastLine = newLine;

      return geometry;
    },
    G2: function(code) {

      var points = [];

      for ( i = 0; i < points.length; i ++ ) {

        geometry.vertices.push( points[ i ] );

        colors[ i ] = new THREE.Color( 0xffffff );
        colors[ i ].setHSV( 0.6, ( 200 + points[ i ].x ) / 400, 1.0 );
      }




      // console.log("in g2 renderer handler " + code)

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

      /* layer change detection is or made by watching Z, it's made by
         watching when we extrude at a new Z position */
      var geometry = new THREE.Geometry();
      self.addSegment(self.lastLine, newLine, geometry);
      self.lastLine = newLine;

      return geometry;
    }


  }

};

GCodeRenderer.prototype.absolute = function(v1, v2) {
    return this.relative ? v1 + v2 : v2;
  }

GCodeRenderer.prototype.addSegment = function(p1, p2, geometry) {
  // var geometry = new THREE.Geometry(),
  // var color =  new THREE.Color(0x0000ff);
  var color =  new THREE.Color(0xffffff);

  geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
  geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));
  geometry.colors.push(color);
  geometry.colors.push(color);

  this.bounds.min.x = Math.min(this.bounds.min.x, p2.x);
  this.bounds.min.y = Math.min(this.bounds.min.y, p2.y);
  this.bounds.min.z = Math.min(this.bounds.min.z, p2.z);
  this.bounds.max.x = Math.max(this.bounds.max.x, p2.x);
  this.bounds.max.y = Math.max(this.bounds.max.y, p2.y);
  this.bounds.max.z = Math.max(this.bounds.max.z, p2.z);
}


GCodeRenderer.prototype.render = function(model) {
  var self = this;

  self.model = model;


  var object = new THREE.Object3D();
  var geometry, // = new THREE.Geometry(),
      material = new THREE.LineBasicMaterial({
            opacity: 0.5,
            transparent: true,
            linewidth: 1,
            vertexColors: THREE.FaceColors });


  self.model.codes.forEach(function(code) {
    geometry = self.renderGCode(code);
    if(geometry) {
      // console.log("ADDING LINE", geometry)
      object.add(new THREE.Line(geometry, material, THREE.LinePieces));
    }
  });

  // Center
  var scale = 3; // TODO: Auto size

  var center = new THREE.Vector3(
      this.bounds.min.x + ((this.bounds.max.x - this.bounds.min.x) / 2),
      this.bounds.min.y + ((this.bounds.max.y - this.bounds.min.y) / 2),
      this.bounds.min.z + ((this.bounds.max.z - this.bounds.min.z) / 2));

  object.position = center.multiplyScalar(-scale);

  object.scale.multiplyScalar(scale);
  console.log("bbox ", this.bounds);
  console.log("center ", center);
  console.log("object ", object);

  return object;
};

GCodeRenderer.prototype.renderGCode = function(code) {
  var cmd = code.words[0].letter+code.words[0].value;

  var handler = this.handlers[cmd] || this.handlers['default'];
  if (handler) {
    return handler(code);
  }
};


