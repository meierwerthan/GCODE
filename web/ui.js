function FileIO() { }

FileIO.error = function(msg) {
  alert(msg);
}

FileIO.loadPath = function(path, callback) {
  var self = this;
  $.get(path, null, callback, 'text')
    .error(function() { self.error('Unable to load gcode.') });
}

FileIO.load = function(files, callback) {
  if (files.length) {
    var i = 0, l = files.length;
    for ( ; i < l; i++) {
      FileIO.load(files[i], callback);
    }
  }
  else {
    var reader = new FileReader();
    reader.onload = function() {
      callback(reader.result);
    };
    reader.readAsText(files);
  }
}

///////////////////////////////////////////////////////////////////////////////

function GCodeImporter() { }

GCodeImporter.importPath = function(path, callback) {
  FileIO.loadPath(path, function(gcode) {
    GCodeImporter.importText(gcode, callback);
  });
}

GCodeImporter.importText = function(gcode, callback) {
  var gcodeObj = createObjectFromGCode(gcode);

  localStorage.removeItem(config.lastImportedKey);
  try {
    localStorage.setItem(config.lastImportedKey, gcode);
  }
  catch(e) {
    // localstorage error - probably out of space
  }

  callback(gcodeObj);
}

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

function onGCodeLoaded(gcodeObj) {
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

