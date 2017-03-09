var vfs = require('vinyl-fs');
var through = require('through');
var Handlebars = require('handlebars');
var isBinaryFile = require('isbinaryfile');

var Path = require('path');

module.exports = function(source, dest, config) {
    return new Promise(function(resolve, reject) {
        var stream = vfs.src(Path.resolve(source, '**/*.*'), {
            allowEmpty: true,
            dot: true,
            ignore: [Path.resolve(source, '.scaffold.json')]
        });

        stream.pipe(through(function(_file) {
            var file = _file.clone();
            file.path = Handlebars.compile(file.path)(config);

            // If file has textual contents
            if (!isBinaryFile.sync(file.contents, file.stat.size)) {
                var source = file.contents.toString('utf8');
                file.contents = new Buffer(Handlebars.compile(source)(config));
            }
            return this.queue(file);
        })).pipe(vfs.dest(dest, {
            overwrite: false
        }));

        stream.on('error', reject);
        stream.on('end', function() { resolve(config) });
        return stream;
    });
}
