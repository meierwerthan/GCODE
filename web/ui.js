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

  var layers = [];
  var layer = undefined;
  var bbbox = { min: { x:100000,y:100000,z:100000 }, max: { x:-100000,y:-100000,z:-100000 } };

  function newLayer(line) {
    layer = { type: {}, layer: layers.count(), z: line.z, };
    layers.push(layer);
  }
  function getLineGroup(line) {
    if (layer == undefined)
      newLayer(line);
    line.extruding = true;
    var speed = Math.round(line.e / 1000);
    var grouptype = (line.extruding ? 10000 : 0) + speed;
    var color = new THREE.Color(line.extruding ? 0xffffff : 0x0000ff);
    if (layer.type[grouptype] == undefined) {
      layer.type[grouptype] = {
        type: grouptype,
        // feed: line.e,
        feed: 1.36645,
        extruding: line.extruding,
        color: color,
        segmentCount: 0,
        material: new THREE.LineBasicMaterial({
            opacity:line.extruding ? 0.5 : 0.4,
            transparent: true,
            linewidth: 1,
            vertexColors: THREE.FaceColors }),
        geometry: new THREE.Geometry(),
      }
    }
    return layer.type[grouptype];
  }
  function addSegment(p1, p2) {
    var group = getLineGroup(p2);
    var geometry = group.geometry;

    group.segmentCount++;
    geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
    geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));
    geometry.colors.push(group.color);
    geometry.colors.push(group.color);

    if (p2.extruding) {
      bbbox.min.x = Math.min(bbbox.min.x, p2.x);
      bbbox.min.y = Math.min(bbbox.min.y, p2.y);
      bbbox.min.z = Math.min(bbbox.min.z, p2.z);
      bbbox.max.x = Math.max(bbbox.max.x, p2.x);
      bbbox.max.y = Math.max(bbbox.max.y, p2.y);
      bbbox.max.z = Math.max(bbbox.max.z, p2.z);
    }
  }
    var relative = false;
  function delta(v1, v2) {
    return relative ? v2 : v2 - v1;
  }
  function absolute (v1, v2) {
    return relative ? v1 + v2 : v2;
  }

  var parser = new GCodeParser({

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
        x: args.x !== undefined ? absolute(lastLine.x, args.x) : lastLine.x,
        y: args.y !== undefined ? absolute(lastLine.y, args.y) : lastLine.y,
        z: args.z !== undefined ? absolute(lastLine.z, args.z) : lastLine.z,
        e: args.e !== undefined ? absolute(lastLine.e, args.e) : lastLine.e,
        f: args.f !== undefined ? absolute(lastLine.f, args.f) : lastLine.f,
      };
      /* layer change detection is or made by watching Z, it's made by
         watching when we extrude at a new Z position */
    if (delta(lastLine.e, newLine.e) > 0) {
      newLine.extruding = delta(lastLine.e, newLine.e) > 0;
      if (layer == undefined || newLine.z != layer.z)
        newLayer(newLine);
    }
    addSegment(lastLine, newLine);
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
        x: args.x !== undefined ? absolute(lastLine.x, args.x) : lastLine.x,
        y: args.y !== undefined ? absolute(lastLine.y, args.y) : lastLine.y,
        z: args.z !== undefined ? absolute(lastLine.z, args.z) : lastLine.z,
        e: args.e !== undefined ? absolute(lastLine.e, args.e) : lastLine.e,
        f: args.f !== undefined ? absolute(lastLine.f, args.f) : lastLine.f,
      };
      /* layer change detection is or made by watching Z, it's made by
         watching when we extrude at a new Z position */
    if (delta(lastLine.e, newLine.e) > 0) {
      newLine.extruding = delta(lastLine.e, newLine.e) > 0;
      if (layer == undefined || newLine.z != layer.z)
        newLayer(newLine);
    }
    addSegment(lastLine, newLine);
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

      relative = false;
    },

    G91: function(args) {
      // G91: Set to Relative Positioning
      // Example: G91
      // All coordinates from now on are relative to the last position.

      // TODO!
      relative = true;
    },

    G92: function(args) { // E0
      // G92: Set Position
      // Example: G92 E0
      // Allows programming of absolute zero point, by reseting the
      // current position to the values specified. This would set the
      // machine's X coordinate to 10, and the extrude coordinate to 90.
      // No physical motion will occur.

      // TODO: Only support E0
      var newLine = lastLine;
      newLine.x= args.x !== undefined ? args.x : newLine.x;
      newLine.y= args.y !== undefined ? args.y : newLine.y;
      newLine.z= args.z !== undefined ? args.z : newLine.z;
      newLine.e= args.e !== undefined ? args.e : newLine.e;
      lastLine = newLine;
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

  console.log("Layer Count ", layers.count());

  var object = new THREE.Object3D();

  for (var lid in layers) {
    var layer = layers[lid];
//    console.log("Layer ", layer.layer);
    for (var tid in layer.type) {
      var type = layer.type[tid];
//      console.log("Layer ", layer.layer, " type ", type.type, " seg ", type.segmentCount);
      object.add(new THREE.Line(type.geometry, type.material, THREE.LinePieces));
    }
  }
  console.log("bbox ", bbbox);

  // Center
  var scale = 3; // TODO: Auto size

  var center = new THREE.Vector3(
      bbbox.min.x + ((bbbox.max.x - bbbox.min.x) / 2),
      bbbox.min.y + ((bbbox.max.y - bbbox.min.y) / 2),
      bbbox.min.z + ((bbbox.max.z - bbbox.min.z) / 2));
  console.log("center ", center);

  object.position = center.multiplyScalar(-scale);

  object.scale.multiplyScalar(scale);

  return object;
}

function onGCodeLoaded(gcode) {

  var gcodeObj = createObjectFromGCode(gcode);

  // var gcodeModel = GCodeParser.parse(gcode);

  localStorage.removeItem(config.lastImportedKey);
  try {
    localStorage.setItem(config.lastImportedKey, gcode);
  }
  catch(e) {
    // localstorage error - probably out of space
  }

  $('#openModal').modal('hide');
  if (object) {
    scene.remove(object);
  }



  object = gcodeObj;

  scene.add(object);
}

$(function() {

  if (!Modernizr.webgl) {
    alert("Sorry, you need a WebGL capable browser to use this.\n\nGet the latest Chrome or FireFox.");
    return;
  }

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

