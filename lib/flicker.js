var Serializer = require('./serializer').Serializer;
var Hamming = require('./hamming');

function _visit(data, cb) {
    var byte, bit;
    cb = cb || function () {};

    for (var i = 0; i < data.length; i++) {
        byte = data[i];
        for (var j = 0; j < 8; j++) {
            bit = (byte >> j) & 1;
            cb(bit);
        }
    }
}

function _checkZeroOne(data) {
    var c0 = 0, c1 = 0;

    _visit(data, function (bit) {
        bit == 0 ? c0++ : c1++;
    });

    return c0 < c1;
}

function _encode(data, serializer, flag) {
    var zero = 1, one = 2;
    if (flag) {
        zero = 2;
        one = 1;
    }
    _visit(data, function (bit) {
        serializer.reverse(bit == 0 ? zero : one);
    });
}

exports.encode = function encode(message) {
    if (!message || typeof message !== "string") return [];

    //
    message = Hamming.encode(message);

    var serializer = new Serializer();

    serializer.write(0);

    // sync codes
    for (var i = 0; i < 9; i++) {
        serializer.reverse();
    }

    var flag = _checkZeroOne(message);

    // boot codes
    serializer.reverse(6);
    serializer.reverse(flag ? 10 : 6);

    _encode(message, serializer, flag);

    serializer.reverse(6);
    serializer.reverse(2);

    return serializer.buffer;

};

