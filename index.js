var vfs = require('vinyl-fs');
var through = require('through');

var fs = require('fs');
var Path = require('path');

function exists(path) {
    return new Promise(function(resolve) {
        return fs.exists(path, resolve);
    });
}

module.exports = function(source, dest, config) {
    var textuals = ['.js', '.less', '.svg', '.html', '.yaml', '.md'];

    return new Promise(function(resolve, reject) {
        // Check if the destination already exists
        return exists(dest)
            .then(function(exists) {
                if (exists) {
                    return reject(new Error('Destination already exists'));
                } else {
                    var stream = vfs.src(Path.resolve(source, '**/*.*'), {
                        allowEmpty: true
                    });

                    stream.pipe(through(function(_file) {
                        var file = _file.clone();
                        file.path = Handlebars.compile(file.path)(config);

                        // If file has textual contents
                        if (textuals.includes(Path.extname(file.path))) {
                            var source = file.contents.toString('utf-8');
                            file.contents = new Buffer(Handlebars.compile(source)(config));
                        }

                        return this.queue(file);
                    })).pipe(vfs.dest(dest));

                    stream.on('error', reject);
                    stream.on('end', function() { resolve(config) });
                    return stream;
                }
            });
    });
}
