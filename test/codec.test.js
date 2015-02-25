var t = require('chai').assert;
var Codec = require('../lib/codec');
var Buffer = require('buffer/').Buffer;

describe('Codec', function () {
    describe('encode', function () {

        it('should encode string', function () {
            var msg = 'hello';
            var data = Codec.encode(msg);
            t.equal(data[0], 1);
        });

        it('should encode word', function () {
            var data = Codec.encodeUInt16(0x0102);
            var expected = Buffer([1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
            t.deepEqual(expected, data);
        });
    });
});