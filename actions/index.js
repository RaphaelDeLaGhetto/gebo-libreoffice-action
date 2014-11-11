var fse = require('fs-extra'),
    libre = require('../lib'),
    nconf = require('nconf'),
    q = require('q'),
    utils = require('gebo-utils'),
    winston = require('winston');

module.exports = function() {

    // Logging stuff           
    nconf.file({ file: './gebo.json' });
    var logLevel = nconf.get('logLevel');
    var logger = new (winston.Logger)({ transports: [ new (winston.transports.Console)({ colorize: true }) ] });
    var domain = nconf.get('domain');

    /**
     * Convert the given document to the specified format 
     *
     * @param object
     * @param object
     *
     * @return promise
     */
    exports.convert = function(verified, message) {
        var deferred = q.defer();
    
        if (verified.admin || verified.execute) {

          var destDir = './public/' + message.file.path.split('/').pop() + '/';
          fse.mkdirs(destDir, function(err) {
            if (err) {
              deferred.resolve({ error: err });
            }
            libre.convert(message.file.path, destDir, message.content).
                then(function(path) {
                    var filename = utils.getOutputFileName(message.file.originalname, message.content.format);
                    var newPath = path.split('/');
                    newPath.pop();
                    newPath.push(filename);
                    newPath = newPath.join('/');
        
                    fse.move(path, newPath, { clobber: true }, function(err) {
                        if (err) {
                          if (logLevel === 'trace') logger.error('fse.move:', err);
                          deferred.resolve({ error: err });
                        }
                        if (message.content.raw) {
                          deferred.resolve({ filePath: newPath, fileName: filename });
                        }
                        else {
                          deferred.resolve(domain + '/' + message.file.path.split('/').pop() + '/' + filename);
                        }
                      });
                    }).
                  catch(function(err) {
                      deferred.resolve({ error: err });
                    });
            });
        }
        else {
          deferred.reject('You are not permitted to request or propose that action');
        }
        return deferred.promise;
      };

    return exports;
};

