var exec = require('child_process').exec,
    fse = require('fs'),
    nconf = require('nconf'),
    q = require('q'),
    spawn = require('child_process').spawn,
    winston = require('winston');

// Logging stuff           
nconf.file({ file: './gebo.json' });
var logLevel = nconf.get('logLevel'),
    timeout = nconf.get('libre').timeout;
var logger = new (winston.Logger)({ transports: [ new (winston.transports.Console)({ colorize: true }) ] });

/**
 * Convert a given file from one format to another
 * 
 * @param string
 * @param string
 * @param options
 *
 * @return string
 */
function _convert(path, outdir, options) {
    var deferred = q.defer();

    if (!outdir) {
      outdir = '.';
    }
    else if (typeof outdir === 'object') {
      options = outdir;
      outdir = '.';
    }

    var filter = '';
    switch(options.format) {
        case 'txt':
            filter = ':Text';
            break;
    }

    var outputFileName = _getOutputFileName(path, options.format);

    // Set up time limit
    var executionTimer = setTimeout(function() {
            var kill = 'kill $(cat /tmp/' + _getOutputFileName(path, options.format) + '.pid)';
            exec(kill, function(err, stdout, stderr) {
                deferred.resolve({ error: 'Sorry, that file took too long to process' }); 
              });
        }, timeout);

    var command = 'libreoffice --headless -env:UserInstallation=file:///' +
                  outdir + ' --convert-to ' + options.format + filter + ' --outdir ' + outdir + ' ' + path +
                  ' & echo $! > /tmp/' + outputFileName + '.pid';
    if (logLevel === 'trace') logger.info('gebo-libreoffice-action:', command);

    exec(command, function(err, stdout, stderr) {
        clearTimeout(executionTimer);
        if (err) {
          if (logLevel === 'trace') logger.error('gebo-libreoffice-action:', err);
          deferred.resolve({ error: err });
        }
        else {
          if (logLevel === 'trace' && stderr) logger.warn('gebo-libreoffice-action:', stderr);
          fse.realpath(outdir, function(err, resolvedPath) {
                deferred.resolve(resolvedPath + '/' +  outputFileName);
            });
        }
      });

    return deferred.promise;
  };
exports.convert = _convert;


/**
 * Take the incoming filename and its extension
 * and return the hypothetical output filename
 *
 * @param string
 * @param string
 *
 * @return string
 */
function _getOutputFileName(path, extension) {
    var filename = path.split('/');
    filename = filename[filename.length - 1];
    filename = filename.split('.');

    // No extension found
    if (filename.length === 1) {
      return filename[0] + '.' + extension;
    }

    // Hidden file
    if (filename[0] === '') {
      filename = filename.slice(1);
      filename[0] = '.' + filename[0];
      if (filename.length === 1) {
        return filename[0] + '.' + extension;
      }
    }

    filename = filename.slice(0, -1);
    
    return filename + '.' + extension;
  };
exports.getOutputFileName = _getOutputFileName;

