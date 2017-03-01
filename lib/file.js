var Promise = require('bluebird');
var _ = require('lodash/fp');

var fs = require('fs');

var readFileP = Promise.promisify(fs.readFile);

function exists(path) {
    return new Promise(function(resolve) {
        return fs.exists(path, resolve);
    });
}

function findP(f, xs) {
    return Promise.map(xs, f)
        .then(
            _.zipWith(function(source, result) {
                return result && source;
            }, xs)
        ).then(_.find(_.identity));
}

function read(path) {
    return readFileP(path, { encoding: 'utf-8' });
}

function withFirstExistent(fn, filePaths) {
    return findP(exists, filePaths)
        .then(function(result) {
            if (result) {
                return fn(result);
            } else {
                throw new Error('None of the paths tried exist:\n' + filePaths.join(',\n'));
            }
        });
}

module.exports = {
    exists,
    read,
    withFirstExistent
};