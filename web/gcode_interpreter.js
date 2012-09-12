/*
  Based on https://github.com/grbl/grbl/blob/edge/gcode.c
 */

// Parses the next statement and leaves the counter on the first character following
// the statement. Returns 1 if there was a statements, 0 if end of string was reached
// or there was an error (check state.status_code).
function parseWord(word)
{
  if (!word.length) {
    throw new Error('Bad word format: ' + word);
  }

  var letter = word[0].toUpperCase();
  if((letter < 'A') || (letter > 'Z')) {
    throw new Error('Unexpected command letter: ' + letter);
  }

  var value = parseFloat(word.slice(1));
  if (isNaN(value)) {
    throw new Error('Bad number format: ' + value);
  }

  return {
    'letter': letter,
    'value': value
  };
};

function interpretLine(line) {
  var words = line.split(' '),
      i = 0,
      l = words.length;
  for ( ; i < l; i++) {
    console.log('parsing word ' + words[i])
    parsed = this.parseWord(words[i]);
    console.log("    letter: " + parsed.letter + " value: " + parsed.value);
  }
};

function parse(gcode) {
  var lines = gcode.split('\n'),
      i = 0,
      l = lines.length;
  for ( ; i < l; i++) {
    interpretLine(lines[i])
  }
};

// interpretLine('G1 X79 Y84.9665 Z0.25 F900.0 E5.628');













// gc.status_code = STATUS_OK;

// /* Pass 1: Commands and set all modes. Check for modal group violations.
//    NOTE: Modal group numbers are defined in Table 4 of NIST RS274-NGC v3, pg.20 */
// uint8_t group_number = MODAL_GROUP_NONE;
// while(next_statement(&letter, &value, line, &char_counter)) {
//   int_value = parseInt(value, 10);
//   switch(letter) {
//     case 'G':
//       // Set modal group values
//       switch(int_value) {
//         case 4: case 10: case 28: case 30: case 53: case 92: group_number = MODAL_GROUP_0; break;
//         case 0: case 1: case 2: case 3: case 80: group_number = MODAL_GROUP_1; break;
//         case 17: case 18: case 19: group_number = MODAL_GROUP_2; break;
//         case 90: case 91: group_number = MODAL_GROUP_3; break;
//         case 93: case 94: group_number = MODAL_GROUP_5; break;
//         case 20: case 21: group_number = MODAL_GROUP_6; break;
//         case 54: case 55: case 56: case 57: case 58: case 59: group_number = MODAL_GROUP_12; break;
//       }
//       // Set 'G' commands
//       switch(int_value) {
//         case 0: gc.motion_mode = MOTION_MODE_SEEK; break;
//         case 1: gc.motion_mode = MOTION_MODE_LINEAR; break;
//         case 2: gc.motion_mode = MOTION_MODE_CW_ARC; break;
//         case 3: gc.motion_mode = MOTION_MODE_CCW_ARC; break;
//         case 4: non_modal_action = NON_MODAL_DWELL; break;
//         case 10: non_modal_action = NON_MODAL_SET_COORDINATE_DATA; break;
//         case 17: select_plane(X_AXIS, Y_AXIS, Z_AXIS); break;
//         case 18: select_plane(X_AXIS, Z_AXIS, Y_AXIS); break;
//         case 19: select_plane(Y_AXIS, Z_AXIS, X_AXIS); break;
//         case 20: gc.inches_mode = true; break;
//         case 21: gc.inches_mode = false; break;
//         case 28: case 30: non_modal_action = NON_MODAL_GO_HOME; break;
//         case 53: absolute_override = true; break;
//         case 54: case 55: case 56: case 57: case 58: case 59:
//           int_value -= 54; // Compute coordinate system row index (0=G54,1=G55,...)
//           if (int_value < N_COORDINATE_SYSTEM) {
//             sys.coord_select = int_value;
//           } else {
//             FAIL(STATUS_UNSUPPORTED_STATEMENT);
//           }
//           break;
//         case 80: gc.motion_mode = MOTION_MODE_CANCEL; break;
//         case 90: gc.absolute_mode = true; break;
//         case 91: gc.absolute_mode = false; break;
//         case 92:
//           int_value = trunc(10*value); // Multiply by 10 to pick up G92.1
//           switch(int_value) {
//             case 920: non_modal_action = NON_MODAL_SET_COORDINATE_OFFSET; break;
//             case 921: non_modal_action = NON_MODAL_RESET_COORDINATE_OFFSET; break;
//             default: FAIL(STATUS_UNSUPPORTED_STATEMENT);
//           }
//           break;
//         case 93: gc.inverse_feed_rate_mode = true; break;
//         case 94: gc.inverse_feed_rate_mode = false; break;
//         default: FAIL(STATUS_UNSUPPORTED_STATEMENT);
//       }
//       break;
//     case 'M':
//       // Set modal group values
//       switch(int_value) {
//         case 0: case 1: case 2: case 30: group_number = MODAL_GROUP_4; break;
//         case 3: case 4: case 5: group_number = MODAL_GROUP_7; break;
//       }
//       // Set 'M' commands
//       switch(int_value) {
//         case 0: gc.program_flow = PROGRAM_FLOW_PAUSED; break; // Program pause
//         case 1: // Program pause with optional stop on
//           // if (sys.opt_stop) { // TODO: Add system variable for optional stop.
//           gc.program_flow = PROGRAM_FLOW_PAUSED; break;
//           // }
//         case 2: case 30: gc.program_flow = PROGRAM_FLOW_COMPLETED; break; // Program end and reset
//         case 3: gc.spindle_direction = 1; break;
//         case 4: gc.spindle_direction = -1; break;
//         case 5: gc.spindle_direction = 0; break;
//         default: FAIL(STATUS_UNSUPPORTED_STATEMENT);
//       }
//       break;
//   }
//   // Check for modal group multiple command violations in the current block
//   if (group_number) {
//     if ( bit_istrue(modal_group_words,bit(group_number)) ) {
//       FAIL(STATUS_MODAL_GROUP_VIOLATION);
//     } else {
//       bit_true(modal_group_words,bit(group_number));
//     }
//     group_number = MODAL_GROUP_NONE; // Reset for next command.
//   }
// }

// // If there were any errors parsing this line, we will return right away with the bad news
// if (gc.status_code) { return(gc.status_code); }

// /* Pass 2: Parameters. All units converted according to current block commands. Position
//    parameters are converted and flagged to indicate a change. These can have multiple connotations
//    for different commands. Each will be converted to their proper value upon execution. */
// double p = 0, r = 0;
// uint8_t l = 0;
// char_counter = 0;
// while(next_statement(&letter, &value, line, &char_counter)) {
//   switch(letter) {
//     case 'F':
//       if (value <= 0) { FAIL(STATUS_INVALID_COMMAND); } // Must be greater than zero
//       if (gc.inverse_feed_rate_mode) {
//         inverse_feed_rate = to_millimeters(value); // seconds per motion for this motion only
//       } else {
//         gc.feed_rate = to_millimeters(value); // millimeters per minute
//       }
//       break;
//     case 'I': case 'J': case 'K': offset[letter-'I'] = to_millimeters(value); break;
//     case 'L': l = trunc(value); break;
//     case 'P': p = value; break;
//     case 'R': r = to_millimeters(value); break;
//     case 'S':
//       if (value < 0) { FAIL(STATUS_INVALID_COMMAND); } // Cannot be negative
//       gc.spindle_speed = value;
//       break;
//     case 'T':
//       if (value < 0) { FAIL(STATUS_INVALID_COMMAND); } // Cannot be negative
//       gc.tool = trunc(value);
//       break;
//     case 'X': target[X_AXIS] = to_millimeters(value); bit_true(axis_words,bit(X_AXIS)); break;
//     case 'Y': target[Y_AXIS] = to_millimeters(value); bit_true(axis_words,bit(Y_AXIS)); break;
//     case 'Z': target[Z_AXIS] = to_millimeters(value); bit_true(axis_words,bit(Z_AXIS)); break;
//   }
// }

// // If there were any errors parsing this line, we will return right away with the bad news
// if (gc.status_code) { return(gc.status_code); }

/*
  Not supported:

  - Canned cycles
  - Tool radius compensation
  - A,B,C-axes
  - Evaluation of expressions
  - Variables
  - Multiple home locations
  - Multiple coordinate systems (Up to 6 may be added via config.h)
  - Probing
  - Override control
  - Tool changes

   group 0 = {G92.2, G92.3} (Non modal: Cancel and re-enable G92 offsets)
   group 1 = {G38.2, G81 - G89} (Motion modes: straight probe, canned cycles)
   group 6 = {M6} (Tool change)
   group 8 = {M7, M8, M9} coolant (special case: M7 and M8 may be active at the same time)
   group 9 = {M48, M49} enable/disable feed and speed override switches
   group 12 = {G55, G56, G57, G58, G59, G59.1, G59.2, G59.3} coordinate system selection
   group 13 = {G61, G61.1, G64} path control mode
*/
