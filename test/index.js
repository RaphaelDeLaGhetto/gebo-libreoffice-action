'use strict';

var agent = require('..'),
    fse = require('fs-extra'),
    mime = require('mime'),
    nconf = require('nconf'),
    sinon = require('sinon'),
    utils = require('gebo-utils');

var DOMAIN = nconf.get('domain');


/**
 * convert
 */
exports.convert = {

    setUp: function(callback) {
        fse.createReadStream('./test/docs/doc').pipe(fse.createWriteStream('/tmp/doc'));
        fse.createReadStream('./test/docs/doc.doc').pipe(fse.createWriteStream('/tmp/doc.doc'));
        fse.createReadStream('./test/docs/doc-mislabeled.pdf').pipe(fse.createWriteStream('/tmp/doc-mislabeled.pdf'));
        fse.createReadStream('./test/docs/docx').pipe(fse.createWriteStream('/tmp/docx'));
        fse.createReadStream('./test/docs/docx.docx').pipe(fse.createWriteStream('/tmp/docx.docx'));
        fse.createReadStream('./test/docs/odt').pipe(fse.createWriteStream('/tmp/odt'));
        fse.createReadStream('./test/docs/odt.odt').pipe(fse.createWriteStream('/tmp/odt.odt'));
        fse.createReadStream('./test/docs/pdf').pipe(fse.createWriteStream('/tmp/pdf'));
        fse.createReadStream('./test/docs/pdf.pdf').pipe(fse.createWriteStream('/tmp/pdf.pdf'));
        fse.createReadStream('./test/docs/rtf').pipe(fse.createWriteStream('/tmp/rtf'));
        fse.createReadStream('./test/docs/rtf.rtf').pipe(fse.createWriteStream('/tmp/rtf.rtf'));
        fse.createReadStream('./test/docs/txt').pipe(fse.createWriteStream('/tmp/txt'));
        fse.createReadStream('./test/docs/txt.txt').pipe(fse.createWriteStream('/tmp/txt.txt'));
        callback();
    },

    tearDown: function(callback) {
        fse.unlinkSync('/tmp/doc');
        fse.unlinkSync('/tmp/doc.doc');
        fse.unlinkSync('/tmp/doc-mislabeled.pdf');
        fse.unlinkSync('/tmp/docx');
        fse.unlinkSync('/tmp/docx.docx');
        fse.unlinkSync('/tmp/odt');
        fse.unlinkSync('/tmp/odt.odt');
        fse.unlinkSync('/tmp/pdf');
        fse.unlinkSync('/tmp/pdf.pdf');
        fse.unlinkSync('/tmp/rtf');
        fse.unlinkSync('/tmp/rtf.rtf');
        fse.unlinkSync('/tmp/txt');
        fse.unlinkSync('/tmp/txt.txt');
        callback();
    },

    'Reject an agent with inadequate permission': function(test) {
        test.expect(1);
        agent.actions.convert({ resource: 'convert' }, {}).
            then(function() {
                test.ok(false, 'Shouldn\'t get here');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'You are not permitted to request or propose that action');
                test.done();
              });
    },

    /**
     * Time out
     */
    'Kill the libreoffice process if it executes longer than allowed': function(test) {
        test.expect(1);
        var messageContent = { format: 'docx', raw: true, pidFile: '/tmp/file.pid', timeLimit: 5 };
        utils.setTimeLimit(messageContent, function(timer) {
            agent.actions.convert({ resource: 'convert',
                                    execute: 'true',
                                  },
                                  { content: messageContent,
                                    file: {
                                        path: '/tmp/doc.doc',
                                        originalname: 'mydoc.doc',
                                        type: 'application/msword',
                                        size: 9216,
                                    },
              }).
            then(function(doc) {
                test.equal(doc.error, 'Sorry, that file took too long to process');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
          });
    },

    /**
     * DOC
     */
    'Convert a DOC to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/doc.doc/mydoc.docx'));
                test.equal(doc.fileName, 'mydoc.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/doc.doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/doc.doc/mydoc.docx');
                try {
                  fse.removeSync('./public/doc.doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC to a PDF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/pdf');
                test.equal(doc.filePath, fse.realpathSync('./public/doc.doc/mydoc.pdf'));
                test.equal(doc.fileName, 'mydoc.pdf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/doc.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC to a PDF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/doc.doc/mydoc.pdf');
                try {
                  fse.removeSync('./public/doc.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC to an ODT and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.oasis.opendocument.text');
                test.equal(doc.filePath, fse.realpathSync('./public/doc.doc/mydoc.odt'));
                test.equal(doc.fileName, 'mydoc.odt');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/doc.doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC to an ODT and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/doc.doc/mydoc.odt');
                try {
                  fse.removeSync('./public/doc.doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
    
    'Convert a DOC to an RTF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/rtf');
                test.equal(doc.filePath, fse.realpathSync('./public/doc.doc/mydoc.rtf'));
                test.equal(doc.fileName, 'mydoc.rtf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/doc.doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
    
    'Convert a DOC to an RTF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/doc.doc/mydoc.rtf');
                try {
                  fse.removeSync('./public/doc.doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC to text and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'text/plain');
                test.equal(doc.filePath, fse.realpathSync('./public/doc.doc/mydoc.txt'));
                test.equal(doc.fileName, 'mydoc.txt');
                // There's some weird funky stuff going on here. If you try to read this with
                // utf8 encoding (which seems like the sensible thing to do), it will not 
                // match the expected value, even if you encode that as utf8. If you convert
                // the actual data starting at position 0, you get some weird characters at the
                // start of the string, so you have to start from position 3. What a pain.                                                                                   
                // Who can explain what is happening here?
                //
                // Shouldn't this work, at least? On the surface, the strings are identical
                // test.equal(data.toString('utf8'), new Buffer('This is supposed to be a Microsoft Word doc. It was created with LibreOffice.\n', 'utf8').toString('utf8'));
                var data = fse.readFileSync(doc.filePath);
                test.equal(data.toString('ascii', 3, data.length), 'This is supposed to be a Microsoft Word doc. It was created with LibreOffice.\n');
//                var data = fse.readFileSync(doc.filePath, { encoding: 'utf8' });
//                test.equal(data, 'This is supposed to be a Microsoft Word doc. It was created with LibreOffice.\n');
                fse.removeSync('./public/doc.doc');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC to text and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/doc.doc',
                                    originalname: 'mydoc.doc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/doc.doc/mydoc.txt');
                try {
                  fse.removeSync('./public/doc.doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC without a file extension to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/doc',
                                    originalname: 'mydoc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/doc/mydoc.docx'));
                test.equal(doc.fileName, 'mydoc.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC without a file extension to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/doc',
                                    originalname: 'mydoc',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/doc/mydoc.docx');
                try {
                  fse.removeSync('./public/doc');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC that thinks it\'s a PDF to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/doc-mislabeled.pdf',
                                    originalname: 'mydoc-mislabeled.pdf',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/doc-mislabeled.pdf/mydoc-mislabeled.docx'));
                test.equal(doc.fileName, 'mydoc-mislabeled.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/doc-mislabeled.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC that thinks it\'s a PDF to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/doc-mislabeled.pdf',
                                    originalname: 'mydoc-mislabeled.pdf',
                                    mimetype: 'application/msword', 
                                    size: 9216,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/doc-mislabeled.pdf/mydoc-mislabeled.docx');
                try {
                  fse.removeSync('./public/doc-mislabeled.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    /**
     * DOCX
     */
    'Convert a DOCX to a DOC and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/msword');
                test.equal(doc.filePath, fse.realpathSync('./public/docx.docx/mydocx.doc'));
                test.equal(doc.fileName, 'mydocx.doc');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/docx.docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX to a DOC and return link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/docx.docx/mydocx.doc');
                try {
                  fse.removeSync('./public/docx.docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },


    'Convert a DOCX to a PDF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/pdf');
                test.equal(doc.filePath, fse.realpathSync('./public/docx.docx/mydocx.pdf'));
                test.equal(doc.fileName, 'mydocx.pdf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/docx.docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX to a PDF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/docx.docx/mydocx.pdf');
                try {
                  fse.removeSync('./public/docx.docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX to an ODT and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.oasis.opendocument.text');
                test.equal(doc.filePath, fse.realpathSync('./public/docx.docx/mydocx.odt'));
                test.equal(doc.fileName, 'mydocx.odt');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/docx.docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX to an ODT and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/docx.docx/mydocx.odt');
                try {
                  fse.removeSync('./public/docx.docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
     
    'Convert a DOCX to an RTF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/rtf');
                test.equal(doc.filePath, fse.realpathSync('./public/docx.docx/mydocx.rtf'));
                test.equal(doc.fileName, 'mydocx.rtf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/docx.docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX to an RTF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/docx.docx/mydocx.rtf');
                try {
                  fse.removeSync('./public/mydocx.docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX to text and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'text/plain');
                test.equal(doc.filePath, fse.realpathSync('./public/docx.docx/mydocx.txt'));
                test.equal(doc.fileName, 'mydocx.txt');

                // Weird and woolly...
                var data = fse.readFileSync(doc.filePath);
                test.equal(data.toString('ascii', 3, data.length), 'This is supposed to be a Microsoft docx. It was created with Google Docs.\n');
                fse.removeSync('./public/docx.docx');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX to text and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/docx.docx',
                                    originalname: 'mydocx.docx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/docx.docx/mydocx.txt');
                try {
                  fse.removeSync('./public/docx.docx');
                  test.ok(true);
                }
                catch(err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX without a file extension to a PDF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/docx',
                                    originalname: 'mydocx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/pdf');
                test.equal(doc.filePath, fse.realpathSync('./public/docx/mydocx.pdf'));
                test.equal(doc.fileName, 'mydocx.pdf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX without a file extension to a PDF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/docx',
                                    originalname: 'mydocx',
                                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    size: 4857,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/docx/mydocx.pdf');
                try {
                  fse.removeSync('./public/docx');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    /**
     * ODT
     */
    'Convert an ODT to a DOC and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/msword');
                test.equal(doc.filePath, fse.realpathSync('./public/odt.odt/myodt.doc'));
                test.equal(doc.fileName, 'myodt.doc');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT to a DOC and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/odt.odt/myodt.doc');
                try {
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT to a PDF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/pdf');
                test.equal(doc.filePath, fse.realpathSync('./public/odt.odt/myodt.pdf'));
                test.equal(doc.fileName, 'myodt.pdf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
    
    'Convert an ODT to a PDF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/odt.odt/myodt.pdf');
                try {
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/odt.odt/myodt.docx'));
                test.equal(doc.fileName, 'myodt.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
    
    'Convert an ODT to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/odt.odt/myodt.docx');
                try {
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
 
    'Convert an ODT to an RTF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/rtf');
                test.equal(doc.filePath, fse.realpathSync('./public/odt.odt/myodt.rtf'));
                test.equal(doc.fileName, 'myodt.rtf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT to an RTF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/odt.odt/myodt.rtf');
                try {
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT to text and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'text/plain');
                test.equal(doc.filePath, fse.realpathSync('./public/odt.odt/myodt.txt'));
                test.equal(doc.fileName, 'myodt.txt');

                // Weird and woolly...
                var data = fse.readFileSync(doc.filePath);
                test.equal(data.toString('ascii', 3, data.length), 'This is an OpenOffice odt document. It was created with LibreOffice.\n');
                fse.removeSync('./public/odt.odt');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT to text and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/odt.odt',
                                    originalname: 'myodt.odt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/odt.odt/myodt.txt');
                try {
                  fse.removeSync('./public/odt.odt');
                  test.ok(true);
                }
                catch(err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT without a file extension to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/odt',
                                    originalname: 'myodt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/odt/myodt.docx'));
                test.equal(doc.fileName, 'myodt.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT without a file extension to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/odt',
                                    originalname: 'myodt',
                                    mimetype: 'application/vnd.oasis.opendocument.text', 
                                    size: 9936,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/odt/myodt.docx');
                try {
                  fse.removeSync('./public/odt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },


    /**
     * PDF
     */
    'Convert a PDF to a DOC and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/msword');
                test.equal(doc.filePath, fse.realpathSync('./public/pdf.pdf/mypdf.doc'));
                test.equal(doc.fileName, 'mypdf.doc');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/pdf.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF to a DOC and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/pdf.pdf/mypdf.doc');
                try {
                  fse.removeSync('./public/pdf.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/pdf.pdf/mypdf.docx'));
                test.equal(doc.fileName, 'mypdf.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/pdf.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/pdf.pdf/mypdf.docx');
                try {
                  fse.removeSync('./public/pdf.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF to an ODT and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.oasis.opendocument.text');
                test.equal(doc.filePath, fse.realpathSync('./public/pdf.pdf/mypdf.odt'));
                test.equal(doc.fileName, 'mypdf.odt');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/pdf.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
    
    'Convert a PDF to an ODT and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/pdf.pdf/mypdf.odt');
                try {
                  fse.removeSync('./public/mypdf.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
 
    'Convert a PDF to an RTF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/rtf');
                test.equal(doc.filePath, fse.realpathSync('./public/pdf.pdf/mypdf.rtf'));
                test.equal(doc.fileName, 'mypdf.rtf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/pdf.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF to an RTF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/pdf.pdf/mypdf.rtf');
                try {
                  fse.removeSync('./public/pdf.pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF to text and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(doc) {
                console.log('doc', doc);
                test.equal(mime.lookup(doc.filePath), 'text/plain');
                test.equal(doc.filePath, fse.realpathSync('./public/pdf.pdf/mypdf.txt'));
                test.equal(doc.fileName, 'mypdf.txt');

                // Weird and woolly...
//                var data = fse.readFileSync(doc.filePath);
//                test.equal(data.toString('ascii', 3, data.length), 'This is a pdf. It was created with Google Docs.\n\n\f');
 
                var data = fse.readFileSync(doc.filePath, { encoding: 'utf8' });
                // These look identical. Don't know what's going on here
                test.equal(data.trim(), 'This is a pdf. It was created with Google Docs.\n\n\f'.trim());
                fse.removeSync('./public/pdf.pdf');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF to text and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/pdf.pdf',
                                    originalname: 'mypdf.pdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/pdf.pdf/mypdf.txt');
                try {
                  fse.removeSync('./public/pdf.pdf');
                  test.ok(true)
                }
                catch(err) {
                  test.ok(false, err)
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF without a file extension to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/pdf',
                                    originalname: 'mypdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/pdf/mypdf.docx'));
                test.equal(doc.fileName, 'mypdf.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF without a file extension to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/pdf',
                                    originalname: 'mypdf',
                                    mimetype: 'application/pdf', 
                                    size: 19037,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/pdf/mypdf.docx');
                try {
                  fse.removeSync('./public/pdf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    /**
     * RTF
     */
    'Convert a RTF to a DOC and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/msword');
                test.equal(doc.filePath, fse.realpathSync('./public/rtf.rtf/myrtf.doc'));
                test.equal(doc.fileName, 'myrtf.doc');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a RTF to a DOC and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/rtf.rtf/myrtf.doc');
                try {
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a RTF to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/rtf.rtf/myrtf.docx'));
                test.equal(doc.fileName, 'myrtf.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a RTF to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/rtf.rtf/myrtf.docx');
                try {
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a RTF to an ODT and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.oasis.opendocument.text');
                test.equal(doc.filePath, fse.realpathSync('./public/rtf.rtf/myrtf.odt'));
                test.equal(doc.fileName, 'myrtf.odt');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
    
    'Convert a RTF to an ODT and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/rtf.rtf/myrtf.odt');
                try {
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
 
    'Convert a RTF to a PDF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/pdf');
                test.equal(doc.filePath, fse.realpathSync('./public/rtf.rtf/myrtf.pdf'));
                test.equal(doc.fileName, 'myrtf.pdf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a RTF to a PDF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/rtf.rtf/myrtf.pdf');
                try {
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an RTF to text and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'text/plain');
                test.equal(doc.filePath, fse.realpathSync('./public/rtf.rtf/myrtf.txt'));
                test.equal(doc.fileName, 'myrtf.txt');

                var data = fse.readFileSync(doc.filePath);
                test.equal(data.toString('ascii', 3, data.length), 'This is an rtf document. It was created with LibreOffice.\n');
 
//                var data = fse.readFileSync(doc.filePath, { encoding: 'utf8' });
//                test.equal(data, 'This is an rtf document. It was created with LibreOffice.\n');
                fse.removeSync('./public/rtf.rtf');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an RTF to text and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'txt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/rtf.rtf',
                                    originalname: 'myrtf.rtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/rtf.rtf/myrtf.txt');
                try {
                  fse.removeSync('./public/rtf.rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an RTF without a file extension to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/rtf',
                                    originalname: 'myrtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/rtf/myrtf.docx'));
                test.equal(doc.fileName, 'myrtf.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an RTF without a file extension to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/rtf',
                                    originalname: 'myrtf',
                                    mimetype: 'application/rtf', 
                                    size: 1763,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/rtf/myrtf.docx');
                try {
                  fse.removeSync('./public/rtf');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    /**
     * text
     */
    'Convert text to a DOC and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/msword');
                test.equal(doc.filePath, fse.realpathSync('./public/txt.txt/mytxt.doc'));
                test.equal(doc.fileName, 'mytxt.doc');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text to a DOC and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'doc', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/txt.txt/mytxt.doc');
                try {
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/txt.txt/mytxt.docx'));
                test.equal(doc.fileName, 'mytxt.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/txt.txt/mytxt.docx');
                try {
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text to an ODT and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.oasis.opendocument.text');
                test.equal(doc.filePath, fse.realpathSync('./public/txt.txt/mytxt.odt'));
                test.equal(doc.fileName, 'mytxt.odt');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text to an ODT and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'odt', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/txt.txt/mytxt.odt');
                try {
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
    
    'Convert text to a PDF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/pdf');
                test.equal(doc.filePath, fse.realpathSync('./public/txt.txt/mytxt.pdf'));
                test.equal(doc.fileName, 'mytxt.pdf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text to a PDF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'pdf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/txt.txt/mytxt.pdf');
                try {
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text to an RTF and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/rtf');
                test.equal(doc.filePath, fse.realpathSync('./public/txt.txt/mytxt.rtf'));
                test.equal(doc.fileName, 'mytxt.rtf');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text to an RTF and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'rtf', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/txt.txt',
                                    originalname: 'mytxt.txt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/txt.txt/mytxt.rtf');
                try {
                  fse.removeSync('./public/txt.txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text without a file extension to a DOCX and return raw data': function(test) {
        test.expect(4);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid', raw: true },
                                file: { 
                                    path: '/tmp/txt',
                                    originalname: 'mytxt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(doc) {
                test.equal(mime.lookup(doc.filePath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(doc.filePath, fse.realpathSync('./public/txt/mytxt.docx'));
                test.equal(doc.fileName, 'mytxt.docx');
                try {
                  fse.closeSync(fse.openSync(doc.filePath, 'r'));
                  fse.removeSync('./public/txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert text without a file extension to a DOCX and return a link': function(test) {
        test.expect(2);
        agent.actions.convert({ resource: 'convert',
                                execute: 'true',
                              },
                              { content: { format: 'docx', pidFile: '/tmp/file.pid' },
                                file: { 
                                    path: '/tmp/txt',
                                    originalname: 'mytxt',
                                    mimetype: 'text/plain', 
                                    size: 49,
                                },
              }).
            then(function(link) {
                test.equal(link, DOMAIN + '/txt/mytxt.docx');
                try {
                  fse.removeSync('./public/txt');
                  test.ok(true);
                }
                catch (err) {
                  test.ok(false, err);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },
};
