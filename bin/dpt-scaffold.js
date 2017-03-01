#!/usr/bin/env node

var inquirer = require('inquirer');
var _ = require('lodash');

var fs = require('fs');
var Path = require('path');

var File = require('../lib/file');
var scaffold = require('../index');

var homedir = require('os').homedir();
var cwd = process.cwd();

function go(source, dest) {
    var configPath = Path.resolve(source, '.scaffold.json');
    return File.read(configPath)
        .then(function(data) {
            var defaults = JSON.parse(data);
            var questions = _.map(defaults, function(v, k) {
                return {
                    name: k,
                    message: k,
                    default: v
                };
            });
            return inquirer.prompt(questions)
                .then(function(answers) {
                    return scaffold(source, dest, answers);
                });
        })
        .catch(function(e) {
            throw new Error('Could not read config file at ' + configPath);
        })
}

function main() {
    var source = process.argv[2];

    if (!source) {
        console.log('Usage: dpt-scaffold <source> [destination]');
        return;
    }

    var sourceInCwd = Path.resolve(cwd, source);
    var sourceInHomeDir = Path.resolve(homedir, '.templates', source);

    var actualSource;

    File.withFirstExistent(function(path) {
            return go(path, process.argv[3] || cwd);
        }, [sourceInCwd, sourceInHomeDir])
        .then(function() {
            console.log('Files created succesfully');
        })
        .catch(function(e) {
            console.error(e.message);
        });
}

main();