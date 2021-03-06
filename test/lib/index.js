var doc = require('../../lib'),
    exec = require('child_process').exec,
    fse = require('fs-extra'),
    mime = require('mime');

/**
 * convert
 */
exports.convert = {

    tearDown: function(callback) {
        fse.remove('/tmp/gebo-libreoffice', function() {
            callback();
          });
    },

    /**
     * Timeout stuff
     */
    'Write the libreoffice PID to a file in the output directory': function(test) {
        test.expect(1);
        doc.convert('./test/docs/doc.doc', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                try {
                  fse.openSync('/tmp/file.pid', 'r');
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

    // This doesn't actually time out. The option is set by the gebo-server
    'Return error if option.returnNow is set to true': function(test) {
        test.expect(1);
        var options = { format: 'docx', filePid: '/tmp/file.pid', returnNow: 'Sorry, that file took too long to process'};
        doc.convert('./test/docs/doc.doc', '/tmp/gebo-libreoffice', options).
            then(function(path) {
                test.ok(false, 'This should return an error');
                test.done();
              }).
            catch(function(err) {
                test.equal(err, 'Sorry, that file took too long to process');
                test.done();
              });
    },

    /**
     * DOC
     */
    'Convert a DOC to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/doc.doc', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/doc.docx');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a DOC to a PDF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/doc.doc', '/tmp/gebo-libreoffice', { format: 'pdf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/pdf');
                test.equal(path, '/tmp/gebo-libreoffice/doc.pdf');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a DOC to an ODT': function(test) {
        test.expect(3);
        doc.convert('./test/docs/doc.doc', '/tmp/gebo-libreoffice', { format: 'odt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.oasis.opendocument.text');
                test.equal(path, '/tmp/gebo-libreoffice/doc.odt');
                try {
                  fse.openSync(path, 'r');         
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
    
    'Convert a DOC to an RTF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/doc.doc', '/tmp/gebo-libreoffice', { format: 'rtf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/rtf');
                test.equal(path, '/tmp/gebo-libreoffice/doc.rtf');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a DOC to text': function(test) {
        test.expect(3);
        doc.convert('./test/docs/doc.doc', '/tmp/gebo-libreoffice', { format: 'txt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'text/plain');
                test.equal(path, '/tmp/gebo-libreoffice/doc.txt');

                // There's some weird funky stuff going on here. If you try to read this with
                // utf8 encoding (which seems like the sensible thing to do), it will not 
                // match the expected value, even if you encode that as utf8. If you convert
                // the actual data starting at position 0, you get some weird characters at the
                // start of the string, so you have to start from position 3. What a pain.
                // Who can explain what is happening here?
                //
                // Shouldn't this work, at least? On the surface, the strings are identical
                // test.equal(data.toString('utf8'), new Buffer('This is supposed to be a Microsoft Word doc. It was created with LibreOffice.\n', 'utf8').toString('utf8'));
                var data = fse.readFileSync(path);
                test.equal(data.toString('ascii', 3, data.length), 'This is supposed to be a Microsoft Word doc. It was created with LibreOffice.\n');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOC without a file extension to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/doc', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/doc.docx');
                try {
                  fse.openSync(path, 'r');         
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
    'Convert a DOCX to a DOC': function(test) {
        test.expect(3);
        doc.convert('./test/docs/docx.docx', '/tmp/gebo-libreoffice', { format: 'doc', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/msword');
                test.equal(path, '/tmp/gebo-libreoffice/docx.doc');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a DOCX to a PDF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/docx.docx', '/tmp/gebo-libreoffice', { format: 'pdf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/pdf');
                test.equal(path, '/tmp/gebo-libreoffice/docx.pdf');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a DOCX to an ODT': function(test) {
        test.expect(3);
        doc.convert('./test/docs/docx.docx', '/tmp/gebo-libreoffice', { format: 'odt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.oasis.opendocument.text');
                test.equal(path, '/tmp/gebo-libreoffice/docx.odt');
                try {
                  fse.openSync(path, 'r');         
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
    
    'Convert a DOCX to an RTF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/docx.docx', '/tmp/gebo-libreoffice', { format: 'rtf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/rtf');
                test.equal(path, '/tmp/gebo-libreoffice/docx.rtf');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a DOCX to text': function(test) {
        test.expect(3);
        doc.convert('./test/docs/docx.docx', '/tmp/gebo-libreoffice', { format: 'txt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'text/plain');
                test.equal(path, '/tmp/gebo-libreoffice/docx.txt');

                // Weird funky stuff. See DOC tests
                var data = fse.readFileSync(path);
                test.equal(data.toString('ascii', 3, data.length), 'This is supposed to be a Microsoft docx. It was created with Google Docs.\n');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a DOCX without a file extension to a PDF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/docx', '/tmp/gebo-libreoffice', { format: 'pdf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/pdf');
                test.equal(path, '/tmp/gebo-libreoffice/docx.pdf');
                try {
                  fse.openSync(path, 'r');
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
    'Convert an ODT to a DOC': function(test) {
        test.expect(3);
        doc.convert('./test/docs/odt.odt', '/tmp/gebo-libreoffice', { format: 'doc', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/msword');
                test.equal(path, '/tmp/gebo-libreoffice/odt.doc');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert an ODT to a PDF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/odt.odt', '/tmp/gebo-libreoffice', { format: 'pdf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/pdf');
                test.equal(path, '/tmp/gebo-libreoffice/odt.pdf');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert an ODT to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/odt.odt', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/odt.docx');
                try {
                  fse.openSync(path, 'r');         
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
    
    'Convert an ODT to an RTF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/odt.odt', '/tmp/gebo-libreoffice', { format: 'rtf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/rtf');
                test.equal(path, '/tmp/gebo-libreoffice/odt.rtf');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert an ODT to text': function(test) {
        test.expect(3);
        doc.convert('./test/docs/odt.odt', '/tmp/gebo-libreoffice', { format: 'txt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'text/plain');
                test.equal(path, '/tmp/gebo-libreoffice/odt.txt');

                // Weird funky stuff. See DOC tests.
                var data = fse.readFileSync(path);
                test.equal(data.toString('ascii', 3, data.length), 'This is an OpenOffice odt document. It was created with LibreOffice.\n');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an ODT without a file extension to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/odt', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/odt.docx');
                try {
                  fse.openSync(path, 'r');         
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
    'Convert a PDF to a DOC': function(test) {
        test.expect(3);
        doc.convert('./test/docs/pdf.pdf', '/tmp/gebo-libreoffice', { format: 'doc', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/msword');
                test.equal(path, '/tmp/gebo-libreoffice/pdf.doc');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a PDF to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/pdf.pdf', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/pdf.docx');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a PDF to an ODT': function(test) {
        test.expect(3);
        doc.convert('./test/docs/pdf.pdf', '/tmp/gebo-libreoffice', { format: 'odt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.oasis.opendocument.text');
                test.equal(path, '/tmp/gebo-libreoffice/pdf.odt');
                try {
                  fse.openSync(path, 'r');         
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
    
    'Convert a PDF to an RTF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/pdf.pdf', '/tmp/gebo-libreoffice', { format: 'rtf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/rtf');
                test.equal(path, '/tmp/gebo-libreoffice/pdf.rtf');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a PDF to text': function(test) {
        test.expect(3);
        doc.convert('./test/docs/pdf.pdf', '/tmp/gebo-libreoffice', { format: 'txt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'text/plain');
                test.equal(path, '/tmp/gebo-libreoffice/pdf.txt');

                // Weird funky stuff. See DOC tests.
                var data = fse.readFileSync(path);
                test.equal(data.toString('ascii', 3, data.length), 'This is a pdf. It was created with Google Docs.\n');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert a PDF without a file extension to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/pdf', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/pdf.docx');
                try {
                  fse.openSync(path, 'r');         
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
    'Convert a RTF to a DOC': function(test) {
        test.expect(3);
        doc.convert('./test/docs/rtf.rtf', '/tmp/gebo-libreoffice', { format: 'doc', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/msword');
                test.equal(path, '/tmp/gebo-libreoffice/rtf.doc');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a RTF to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/rtf.rtf', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/rtf.docx');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a RTF to an ODT': function(test) {
        test.expect(3);
        doc.convert('./test/docs/rtf.rtf', '/tmp/gebo-libreoffice', { format: 'odt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.oasis.opendocument.text');
                test.equal(path, '/tmp/gebo-libreoffice/rtf.odt');
                try {
                  fse.openSync(path, 'r');         
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
    
    'Convert a RTF to a PDF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/rtf.rtf', '/tmp/gebo-libreoffice', { format: 'pdf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/pdf');
                test.equal(path, '/tmp/gebo-libreoffice/rtf.pdf');
                try {
                  fse.openSync(path, 'r');         
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

    'Convert a RTF to text': function(test) {
        test.expect(3);
        doc.convert('./test/docs/rtf.rtf', '/tmp/gebo-libreoffice', { format: 'txt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'text/plain');

                test.equal(path, '/tmp/gebo-libreoffice/rtf.txt');

                // Weird funky stuff. See DOC tests.
                var data = fse.readFileSync(path);
                test.equal(data.toString('ascii', 3, data.length), 'This is an rtf document. It was created with LibreOffice.\n');
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    'Convert an RTF without a file extension to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/rtf', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/rtf.docx');
                try {
                  fse.openSync(path, 'r');         
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
    'Convert text to a DOC': function(test) {
        test.expect(3);
        doc.convert('./test/docs/txt.txt', '/tmp/gebo-libreoffice', { format: 'doc', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/msword');
                test.equal(path, '/tmp/gebo-libreoffice/txt.doc');
                try {
                  fse.openSync(path, 'r');
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

    'Convert text to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/txt.txt', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/txt.docx');
                try {
                  fse.openSync(path, 'r');
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

    'Convert text to an ODT': function(test) {
        test.expect(3);
        doc.convert('./test/docs/txt.txt', '/tmp/gebo-libreoffice', { format: 'odt', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.oasis.opendocument.text');
                test.equal(path, '/tmp/gebo-libreoffice/txt.odt');
                try {
                  fse.openSync(path, 'r');
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
    
    'Convert text to a PDF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/txt.txt', '/tmp/gebo-libreoffice', { format: 'pdf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/pdf');
                test.equal(path, '/tmp/gebo-libreoffice/txt.pdf');
                try {
                  fse.openSync(path, 'r');
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

    'Convert text to an RTF': function(test) {
        test.expect(3);
        doc.convert('./test/docs/txt.txt', '/tmp/gebo-libreoffice', { format: 'rtf', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/rtf');
                test.equal(path, '/tmp/gebo-libreoffice/txt.rtf');
                try {
                  fse.openSync(path, 'r');
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

    'Convert text without a file extension to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/txt', '/tmp/gebo-libreoffice', { format: 'docx', filePid: '/tmp/file.pid', }).
            then(function(path) {
                test.equal(mime.lookup(path), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                test.equal(path, '/tmp/gebo-libreoffice/txt.docx');
                try {
                  fse.openSync(path, 'r');
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

