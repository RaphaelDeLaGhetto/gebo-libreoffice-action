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
        doc.convert('./test/docs/doc.doc', 'docx', '/tmp/gebo-libreoffice').
            then(function(path) {
                try {
                  fse.openSync('/tmp/doc.docx.pid', 'r');
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

    // This is not the most confidence-inspiring test. If all the subsequent tests pass
    // then the process-killing functionality works, because that means that there isn't a stray
    // libreoffice mucking everything up.
    //
    // The empty format string is what causes libreoffice to run forever.
    'Kill the libreoffice process if it executes longer than allowed': function(test) {
        test.expect(2);
        doc.convert('./test/docs/doc.doc', '', '/tmp/gebo-libreoffice').
            then(function(path) {
                try {
                  fse.openSync('/tmp/doc..pid', 'r');         
                  test.ok(true);
                  fse.openSync(path, 'r');         
                  test.ok(false, 'The file at the returned path shouldn\'t exist');
                }
                catch(err) {
                  test.ok(true);
                }
                test.done();
              }).
            catch(function(err) {
                test.ok(false, err);
                test.done();
              });
    },

    /**
     * DOC
     */
    'Convert a DOC to a DOCX': function(test) {
        test.expect(3);
        doc.convert('./test/docs/doc.doc', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/doc.doc', 'pdf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/doc.doc', 'odt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/doc.doc', 'rtf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/doc.doc', 'txt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/doc', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/docx.docx', 'doc', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/docx.docx', 'pdf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/docx.docx', 'odt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/docx.docx', 'rtf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/docx.docx', 'txt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/docx', 'pdf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/odt.odt', 'doc', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/odt.odt', 'pdf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/odt.odt', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/odt.odt', 'rtf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/odt.odt', 'txt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/odt', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/pdf.pdf', 'doc', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/pdf.pdf', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/pdf.pdf', 'odt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/pdf.pdf', 'rtf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/pdf.pdf', 'txt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/pdf', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/rtf.rtf', 'doc', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/rtf.rtf', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/rtf.rtf', 'odt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/rtf.rtf', 'pdf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/rtf.rtf', 'txt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/rtf', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/txt.txt', 'doc', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/txt.txt', 'docx', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/txt.txt', 'odt', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/txt.txt', 'pdf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/txt.txt', 'rtf', '/tmp/gebo-libreoffice').
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
        doc.convert('./test/docs/txt', 'docx', '/tmp/gebo-libreoffice').
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


/**
 * getOutputFileName
 */
exports.getOutputFileName = {

    'Change the file extension to that specified': function(test) {
        test.expect(2);
        var filename = doc.getOutputFileName('/tmp/gebo-libreoffice/doc.doc', 'pdf');        
        test.equal(filename, 'doc.pdf');
        filename = doc.getOutputFileName('pdf.pdf', 'docx');        
        test.equal(filename, 'pdf.docx');
        test.done();
    },

    'Change the file extension to that specified on an infile with no extension': function(test) {
        test.expect(2);
        var filename = doc.getOutputFileName('/tmp/gebo-libreoffice/doc', 'pdf');        
        test.equal(filename, 'doc.pdf');
        filename = doc.getOutputFileName('pdf.pdf', 'docx');
        test.equal(filename, 'pdf.docx');
        test.done();
    },

    'Change the file extension to that specified on hidden file with no extension': function(test) {
        test.expect(2);
        var filename = doc.getOutputFileName('/tmp/gebo-libreoffice/.hidden', 'pdf');        
        test.equal(filename, '.hidden.pdf');
        filename = doc.getOutputFileName('.hidden', 'docx');        
        test.equal(filename, '.hidden.docx');
        test.done();
    },

    'Change the file extension to that specified on a hidden file with an extension': function(test) {
        test.expect(2);
        var filename = doc.getOutputFileName('/tmp/gebo-libreoffice/.hidden.rtf', 'pdf');        
        test.equal(filename, '.hidden.pdf');
        filename = doc.getOutputFileName('.hidden.pdf', 'docx');        
        test.equal(filename, '.hidden.docx');
        test.done();
    },

    'Should overwrite any unusual extensions': function(test) {
        test.expect(2);
        var filename = doc.getOutputFileName('/tmp/gebo-libreoffice/somefile.someweirdextension', 'rtf');        
        test.equal(filename, 'somefile.rtf');
        filename = doc.getOutputFileName('somefile.someweirdextension', 'docx');        
        test.equal(filename, 'somefile.docx');
        test.done();
    },
};
