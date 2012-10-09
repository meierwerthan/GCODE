///////////////////////////////////////////////////////////////////////////////



// gcodeFile = new GCodeFile();

// gcodeFile.codes // doesn't include comments
// gcodeFile.codesWithComments // includes comments
// gcodeFile.layers // grouped by z axis (array of z values each with array of xy)
// gcodeFile.bounds // [minX, maxX, minY, maxY, minZ, maxZ]
// gcodeFile.plane  // "XY", "XZ", "YZ", undefined (defined if codes contain G17-19)
// gcodeFile.units  // "mm", "in" (assuming no changes midfile)
// gcodeFile.extrusion // true if codes contain M101-108 or G1 E

// gcodeFile.codes.forEach(function(gcode) {
//   gcode.raw // returns the raw line of gcode text used to generate
//   gcode.code // G0, G1, M3, etc
//   gcode.params // { X:-3.141, Y:'[8*4]', Z:'#42', A:'acos[0]' }, undefined
//   gcode.coordinates // undefined (use current), absolute, relative

//   if(gcode.params['Z'] != undefined) {
//     gcodeFile.layers[gcode['Z']] = gcode;
//   }
// });



// renderer = new GCodeRenderer();
// renderer.render(gcodeFile)



///////////////////////////////////////////////////////////////////////////////

// gcode_file = IO
// gcode_model = new GCodeCollection();
//
// gcode_model = (new GcodeParser()).parse(gcode_file)
// renderer = (new GcodeRenderer(webgl_context))

var config = {
  lastImportedKey: 'last-imported',
  notFirstVisitKey: 'not-first-visit',
  defaultFilePath: 'examples/octocat.gcode'
}


var scene = null,
    object = null;

function about() {
  $('#aboutModal').modal();
}

function openDialog() {
  $('#openModal').modal();
}

function createObjectFromGCode(gcode) {
  // GCode descriptions come from:
  //    http://reprap.org/wiki/G-code
  //    http://en.wikipedia.org/wiki/G-code
  //    SprintRun source code

  var lastLine = {x:0, y:0, z:0, e:0, f:0, extruding:false};


  var parser = new OldGCodeParser({

    'F5.00': function(args) {
      // F: Sets feed rate
      // No-op
    },

    G0: function(args, line) {
      // G0: Rapid motion

      // For now, do the same as G1

      // Example: G0 Z1.0 F3000
      //          G0 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
      //          G0 E104.25841 F1800.0
      // Go in a straight line from the current (X, Y) point
      // to the point (90.6, 13.8), extruding material as the move
      // happens from the current extruded length to a length of
      // 22.4 mm.

      var newLine = {
        x: args.x !== undefined ? args.x : lastLine.x,
        y: args.y !== undefined ? args.y : lastLine.y,
        z: args.z !== undefined ? args.z : lastLine.z,
        e: args.e !== undefined ? args.e : lastLine.e,
        f: args.f !== undefined ? args.f : lastLine.f,
      };

      newLine.extruding = (newLine.e - lastLine.e) > 0;
      var color = new THREE.Color(newLine.extruding ? 0xFFFFFF : 0x0000FF);

      if (newLine.extruding) {
        geometry.vertices.push(new THREE.Vertex(
            new THREE.Vector3(lastLine.x, lastLine.y, lastLine.z)));
        geometry.vertices.push(new THREE.Vertex(
            new THREE.Vector3(newLine.x, newLine.y, newLine.z)));
        geometry.colors.push(color);
        geometry.colors.push(color);
      }

      lastLine = newLine;
    },

    G1: function(args, line) {
      // Example: G1 Z1.0 F3000
      //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
      //          G1 E104.25841 F1800.0
      // Go in a straight line from the current (X, Y) point
      // to the point (90.6, 13.8), extruding material as the move
      // happens from the current extruded length to a length of
      // 22.4 mm.

      var newLine = {
        x: args.x !== undefined ? args.x : lastLine.x,
        y: args.y !== undefined ? args.y : lastLine.y,
        z: args.z !== undefined ? args.z : lastLine.z,
        e: args.e !== undefined ? args.e : lastLine.e,
        f: args.f !== undefined ? args.f : lastLine.f,
      };

      newLine.extruding = (newLine.e - lastLine.e) > 0;
      var color = new THREE.Color(newLine.extruding ? 0xFFFFFF : 0x0000FF);

      if (newLine.extruding) {
        geometry.vertices.push(new THREE.Vertex(
            new THREE.Vector3(lastLine.x, lastLine.y, lastLine.z)));
        geometry.vertices.push(new THREE.Vertex(
            new THREE.Vector3(newLine.x, newLine.y, newLine.z)));
        geometry.colors.push(color);
        geometry.colors.push(color);
      }

      lastLine = newLine;
    },

    G17: function(args) {
      // G17: Sets XY plane
      // No-op
    },

    G20: function(args) {
      // G20: Set Units to Inches
      // No-op
    },

    G21: function(args) {
      // G21: Set Units to Millimeters
      // Example: G21
      // Units from now on are in millimeters. (This is the RepRap default.)

      // No-op: So long as G20 is not supported.
    },

    G90: function(args) {
      // G90: Set to Absolute Positioning
      // Example: G90
      // All coordinates from now on are absolute relative to the
      // origin of the machine. (This is the RepRap default.)

      // TODO!
    },

    G91: function(args) {
      // G91: Set to Relative Positioning
      // Example: G91
      // All coordinates from now on are relative to the last position.

      // TODO!
    },

    G92: function(args) { // E0
      // G92: Set Position
      // Example: G92 E0
      // Allows programming of absolute zero point, by reseting the
      // current position to the values specified. This would set the
      // machine's X coordinate to 10, and the extrude coordinate to 90.
      // No physical motion will occur.

      // TODO: Only support E0
    },

    M2: function(args) {
      // M2: End program.
      // No-op
    },

    M5: function(args) {
      // M5: Stop spindle.
      // No-op
    },

    M82: function(args) {
      // M82: Set E codes absolute (default)
      // Descriped in Sprintrun source code.

      // No-op, so long as M83 is not supported.
    },

    M84: function(args) {
      // M84: Stop idle hold
      // Example: M84
      // Stop the idle hold on all axis and extruder. In some cases the
      // idle hold causes annoying noises, which can be stopped by
      // disabling the hold. Be aware that by disabling idle hold during
      // printing, you will get quality issues. This is recommended only
      // in between or after printjobs.

      // No-op
    },

    'default': function(args, info) {
      console.error('Unknown command:', args.cmd, args, info);
    },
  });

  parser.parse(gcode);

  var lineMaterial = new THREE.LineBasicMaterial({
      opacity:0.4,
      linewidth: 1,
      vertexColors: THREE.FaceColors});
  object.add(new THREE.Line(geometry, lineMaterial, THREE.LinePieces));

  // Center
  geometry.computeBoundingBox();
  var center = new THREE.Vector3()
      .add(geometry.boundingBox.min, geometry.boundingBox.max)
      .divideScalar(2);
  var scale = 3; // TODO: Auto size

  object.position = center.multiplyScalar(-scale);
  object.scale.multiplyScalar(scale);

  return object;
}

var gp, gm, gi, gr;

function onGCodeLoaded(gcode) {
      gp = new GCodeParser();
      gm = gp.parse(gcode);
      // gi = new GCodeInterpreter();
      // gi.interpret(gm);
      gr = new GCodeRenderer();
      var gcodeObj = gr.render(gm);


  // var gcodeObj = createObjectFromGCode(gcode);

  // // var gcodeModel = OldGCodeParser.parse(gcode);

  // localStorage.removeItem(config.lastImportedKey);
  // try {
  //   localStorage.setItem(config.lastImportedKey, gcode);
  // }
  // catch(e) {
  //   // localstorage error - probably out of space
  // }

  $('#openModal').modal('hide');
  if (object) {
    scene.remove(object);
  }



  object = gcodeObj;

  scene.add(object);
}

$(function() {

  // if (!Modernizr.webgl) {
  //   alert("Sorry, you need a WebGL capable browser to use this.\n\nGet the latest Chrome or FireFox.");
  //   return;
  // }

  if (!Modernizr.localstorage) {
    alert("This app uses local storage to save settings, but your browser doesn't support it.\n\nGet the latest Chrome or FireFox.");
    return;
  }

  // Show 'About' dialog for first time visits.
  if (!localStorage.getItem(config.notFirstVisitKey)) {
    localStorage.setItem(config.notFirstVisitKey, true);
    setTimeout(about, 500);
  }

  $('.gcode_examples a').on('click', function(event) {
    GCodeImporter.importPath($(this).attr('href'), onGCodeLoaded);
    return false;
  })

  // Drop files from desktop onto main page to import them.
  $('body').on('dragover', function(event) {

    event.stopPropagation();
    event.preventDefault();
    event.originalEvent.dataTransfer.dropEffect = 'copy';

  }).on('drop', function(event) {

    event.stopPropagation();
    event.preventDefault();

    FileIO.load(event.originalEvent.dataTransfer.files, function(gcode) {
      GCodeImporter.importText(gcode, onGCodeLoaded);
    });

  });

  scene = createScene($('#renderArea')[0]);

  var lastImported = localStorage.getItem(config.lastImportedKey);
  if (lastImported) {
    GCodeImporter.importText(lastImported, onGCodeLoaded);
  } else {
    GCodeImporter.importPath(config.defaultFilePath, onGCodeLoaded);
  }
});

