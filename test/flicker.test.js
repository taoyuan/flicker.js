var t = require('chai').assert;
var s = require('./support');
var Buffer = require('buffer/').Buffer;
var Flicker = require('../lib/flicker');


describe('Flicker', function () {

    describe('encode', function () {

        it('should encode with sync bits', function () {
            var msg = 'hello';
            var buf = Flicker.encode(msg, true);
            s.log(buf, 8);
        });
    });
});