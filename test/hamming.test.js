var Hamming = require('../lib/hamming');
var s = require('./support');
var t = require('chai').assert;

function reverseBit(byte, bit) {
    var mask = 0x80 >> bit;
    return Hamming.setBit(byte, bit, !(byte & mask));
}

describe('Hamming', function () {

    it('#getBit', function () {
        // 200 == 1100 1000
        t.equal(0x80, Hamming.getBit(200, 0));
        t.equal(0x40, Hamming.getBit(200, 1));
        t.equal(0x08, Hamming.getBit(200, 4));
    });

    it('#setBit', function () {
        // 192 == 1100 0000
        var c = 192;
        var data = c;
        data = Hamming.setBit(data, 1, true);
        t.equal(data, 0xFF & c);

        data = c;
        data = Hamming.setBit(data, 1, false);
        t.equal(data, 0xBF & c);
    });


    it('#setBitForArray', function () {
        // 192 == 1100 0000
        var c = 192;
        var arr = [c];
        Hamming.setBitForArray(arr, 0, 1, true);
        t.equal(arr[0], 0xFF & c);

        arr = [c];
        Hamming.setBitForArray(arr, 0, 1, false);
        t.equal(arr[0], 0xBF & c);
    });

    it('encode and decode', function () {
        var message = 'h';

        var encoded = Hamming.encode(message);
        var expected = s.str2codes(message);
        expected[expected.length] = 0;
        var decoded = Hamming.decode(encoded);
        t.deepEqual(expected, decoded);

    });

    it('one error bit correction', function () {
        var message = 'hello';

        var encoded = Hamming.encode(message);
        encoded[0] = reverseBit(encoded[0], 6);

        var expected = s.str2codes(message);
        expected[expected.length] = 0;
        var decoded = Hamming.decode(encoded);
        t.deepEqual(expected, decoded);
    });

    it('encode string more than 32 bytes', function () {
        var message = '12345678901234abcdefghijklmnopqrstuvwxyz';

        var encoded = Hamming.encode(message);
        t.deepEqual(message.length + 2, encoded.length);
        encoded[0] = reverseBit(encoded[0], 6);

        var expected = s.str2codes(message);
        expected[expected.length] = 0;
        var decoded = Hamming.decode(encoded);
        t.deepEqual(expected, decoded);
    });

});