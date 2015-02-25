var t = require('chai').assert;
var s = require('./support');
var Buffer = require('buffer/').Buffer;
var Flicker = require('../lib/flicker').Flicker;


describe('Flicker', function () {

    describe('encode', function () {

        it('should encode crc result', function () {
            var msg = 'hello';
            var buf = Flicker.encode(msg);
            t.equal((msg.length + 2) * 10, buf.length);
        });
    });

    describe('serializer', function () {

        it.only('should serialize', function () {
            var msg = 'hello';
            var buf = Flicker.serialize(Flicker.encode(msg));
            s.log(buf, 10);
        });
    });
});