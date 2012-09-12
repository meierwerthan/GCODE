/**
 * Parses a string of gcode instructions, and invokes handlers for
 * each type of command.
 *
 * Special handler:
 *   'default': Called if no other handler matches.
 */
function GCodeParser(handlers) {
  this.handlers = handlers || {};
  // this.handlers = {

  //   G0: function(args) {
  //     // G0: Rapid Linear Motion
  //     // Example: G0 Z1.0
  //     //          G0 X35.2 Y80.061
  //     //          X10 Y2.6
  //     //
  //     // All axis words are optional, except that at least one must be used.
  //     // The G0 is optional if the current motion mode is G0.
  //     // This will produce coordinated linear motion to the destination point
  //     // at the current traverse rate (or slower if the machine will not go
  //     // that fast). It is expected that cutting will not take place when a
  //     // G0 command is executing.
  //     //
  //     // Exceptions:
  //     //   If cutter radius compensation is active, the motion will differ.
  //     //   If G53 is programmed on the same line, the motion will differ.

  //     var newLine = {
  //       x: args.x !== undefined ? absolute(lastLine.x, args.x) : lastLine.x,
  //       y: args.y !== undefined ? absolute(lastLine.y, args.y) : lastLine.y,
  //       z: args.z !== undefined ? absolute(lastLine.z, args.z) : lastLine.z,
  //       e: args.e !== undefined ? absolute(lastLine.e, args.e) : lastLine.e,
  //       f: args.f !== undefined ? absolute(lastLine.f, args.f) : lastLine.f,
  //     };
  //     /* layer change detection is or made by watching Z, it's made by
  //        watching when we extrude at a new Z position */
  //   if (delta(lastLine.e, newLine.e) > 0) {
  //     newLine.extruding = delta(lastLine.e, newLine.e) > 0;
  //     if (layer == undefined || newLine.z != layer.z)
  //       newLayer(newLine);
  //   }
  //   addSegment(lastLine, newLine);
  //     lastLine = newLine;
  //   },

  //   G1: function(args, line) {
  //     // Example: G1 Z1.0 F3000
  //     //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
  //     //          G1 E104.25841 F1800.0
  //     // Go in a straight line from the current (X, Y) point
  //     // to the point (90.6, 13.8), extruding material as the move
  //     // happens from the current extruded length to a length of
  //     // 22.4 mm.

  //     var newLine = {
  //       x: args.x !== undefined ? absolute(lastLine.x, args.x) : lastLine.x,
  //       y: args.y !== undefined ? absolute(lastLine.y, args.y) : lastLine.y,
  //       z: args.z !== undefined ? absolute(lastLine.z, args.z) : lastLine.z,
  //       e: args.e !== undefined ? absolute(lastLine.e, args.e) : lastLine.e,
  //       f: args.f !== undefined ? absolute(lastLine.f, args.f) : lastLine.f,
  //     };
  //     /* layer change detection is or made by watching Z, it's made by
  //        watching when we extrude at a new Z position */
  //   if (delta(lastLine.e, newLine.e) > 0) {
  //     newLine.extruding = delta(lastLine.e, newLine.e) > 0;
  //     if (layer == undefined || newLine.z != layer.z)
  //       newLayer(newLine);
  //   }
  //   addSegment(lastLine, newLine);
  //     lastLine = newLine;
  //   },

  //   G17: function(args) {
  //     // G17: Sets XY plane
  //     // No-op
  //   },

  //   G20: function(args) {
  //     // G20: Set Units to Inches
  //     // No-op
  //   },

  //   G21: function(args) {
  //     // G21: Set Units to Millimeters
  //     // Example: G21
  //     // Units from now on are in millimeters. (This is the RepRap default.)

  //     // No-op: So long as G20 is not supported.
  //   },

  //   G90: function(args) {
  //     // G90: Set to Absolute Positioning
  //     // Example: G90
  //     // All coordinates from now on are absolute relative to the
  //     // origin of the machine. (This is the RepRap default.)

  //     relative = false;
  //   },

  //   G91: function(args) {
  //     // G91: Set to Relative Positioning
  //     // Example: G91
  //     // All coordinates from now on are relative to the last position.

  //     // TODO!
  //     relative = true;
  //   },

  //   G92: function(args) { // E0
  //     // G92: Set Position
  //     // Example: G92 E0
  //     // Allows programming of absolute zero point, by reseting the
  //     // current position to the values specified. This would set the
  //     // machine's X coordinate to 10, and the extrude coordinate to 90.
  //     // No physical motion will occur.

  //     // TODO: Only support E0
  //     var newLine = lastLine;
  //     newLine.x= args.x !== undefined ? args.x : newLine.x;
  //     newLine.y= args.y !== undefined ? args.y : newLine.y;
  //     newLine.z= args.z !== undefined ? args.z : newLine.z;
  //     newLine.e= args.e !== undefined ? args.e : newLine.e;
  //     lastLine = newLine;
  //   },

  //   M2: function(args) {
  //     // M2: End program.
  //     // No-op
  //   },

  //   M5: function(args) {
  //     // M5: Stop spindle.
  //     // No-op
  //   },

  //   M82: function(args) {
  //     // M82: Set E codes absolute (default)
  //     // Descriped in Sprintrun source code.

  //     // No-op, so long as M83 is not supported.
  //   },

  //   M84: function(args) {
  //     // M84: Stop idle hold
  //     // Example: M84
  //     // Stop the idle hold on all axis and extruder. In some cases the
  //     // idle hold causes annoying noises, which can be stopped by
  //     // disabling the hold. Be aware that by disabling idle hold during
  //     // printing, you will get quality issues. This is recommended only
  //     // in between or after printjobs.

  //     // No-op
  //   },

  //   'F5.00': function(args) {
  //     // F: Sets feed rate
  //     // No-op
  //   },

  //   'default': function(args, info) {
  //     console.error('Unknown command:', args.cmd, args, info);
  //   }
  // };
}

GCodeParser.prototype.parseLine = function(text) {
  text = text.replace(/[;(].*$/, '').trim(); // Remove comments
  if (text) {
    var tokens = text.split(' ');
    if (tokens) {
      var cmd = tokens[0];
      var args = {
        'cmd': cmd
      };
      tokens.splice(1).forEach(function(token) {
        var key = token[0].toLowerCase(),
            value = parseFloat(token.substring(1));
        args[key] = value;
      });
      var handler = this.handlers[cmd] || this.handlers['default'];
      if (handler) {
        return handler(args, text);
      }
    }
  }
};

GCodeParser.prototype.parse = function(gcode) {
  var lines = gcode.split('\n'),
      i = 0,
      l = lines.length;
  for ( ; i < l; i++) {
    if (this.parseLine(lines[i]) === false) {
      break;
    }
  }
};
