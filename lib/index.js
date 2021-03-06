var exec = require('child_process').exec,
    fse = require('fs'),
    nconf = require('nconf'),
    q = require('q'),
    spawn = require('child_process').spawn,
    utils = require('gebo-utils'),
    winston = require('winston');

// Logging stuff           
nconf.file({ file: './gebo.json' });
var logLevel = nconf.get('logLevel');
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

    var outputFileName = utils.getOutputFileName(path, options.format);

    var command = 'libreoffice --headless -env:UserInstallation=file:///' +
                  outdir + ' --convert-to ' + options.format + filter + ' --outdir ' + outdir + ' ' + path +
                  utils.echoPidToFile(options);
    if (logLevel === 'trace') logger.info('gebo-libreoffice-action:', command);

    exec(command, function(err, stdout, stderr) {
        if (options.returnNow){
          deferred.reject(options.returnNow);
        } 
        else if (err) {
          if (logLevel === 'trace') logger.error('gebo-libreoffice-action:', err);
          deferred.reject(err);
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

