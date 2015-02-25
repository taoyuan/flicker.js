var Buffer = require('buffer/').Buffer;

var CODEC_ENC = [
    0x05,   // 0
    0x06,   // 1
    0x09,   // 2
    0x0A,   // 3
    0x0B,   // 4
    0x0C,   // 5
    0x0D,   // 6
    0x0E,   // 7
    0x11,   // 8
    0x12,   // 9
    0x13,   // A
    0x14,   // B
    0x15,   // C
    0x16,   // D
    0x19,   // E
    0x1A    // F
];

var CODEC_DEC_ERR = 0x1F;

var CODEC_DEC = [
    CODEC_DEC_ERR, 	// 00000    0x00
    CODEC_DEC_ERR, 	// 00001    0x01
    CODEC_DEC_ERR, 	// 00010    0x02
    CODEC_DEC_ERR, 	// 00011    0x03
    CODEC_DEC_ERR, 	// 00100    0x04
    0x00,           // 00101    0x05
    0x01,           // 00110    0x06
    CODEC_DEC_ERR, 	// 00111    0x07
    CODEC_DEC_ERR, 	// 01000    0x08
    0x02, 			// 01001    0x09
    0x03, 			// 01010    0x0A
    0x04, 			// 01011    0x0B
    0x05, 			// 01100    0x0C
    0x06, 			// 01101    0x0D
    0x07, 			// 01110    0x0E
    CODEC_DEC_ERR, 	// 01111    0x0F
    CODEC_DEC_ERR, 	// 10000    0x10
    0x08, 			// 10001    0x11
    0x09, 			// 10010    0x12
    0x0A, 			// 10011    0x13
    0x0B, 	        // 10100    0x14
    0x0C, 			// 10101    0x15
    0x0D, 			// 10110    0x16
    CODEC_DEC_ERR, 	// 10111    0x17
    CODEC_DEC_ERR, 	// 11000    0x18
    0x0E, 			// 11001    0x19
    0x0F, 			// 11010    0x1A
    CODEC_DEC_ERR, 	// 11011    0x1B
    CODEC_DEC_ERR, 	// 11100    0x1C
    CODEC_DEC_ERR, 	// 11101    0x1D
    CODEC_DEC_ERR, 	// 11110    0x1E
    CODEC_DEC_ERR  	// 11111    0x1F
];

var Codec = module.exports = {};

Codec.RATIO = 10;

Codec.encode = function (data, buf, start) {
    if (typeof data === 'number') {
        throw new TypeError('Usage:Codec.encode(string|array, [buf, start])');
    }
    if (!Buffer.isBuffer(data)) {
        data = Buffer(data, 'ascii');
    }

    buf = buf || new Buffer(data.length * 10);
    var index = start || 0;

    function add(chunk) {
        for (var i = 0; i < 5; i++) {
            buf.writeUInt8((chunk >> i) & 1, index++);
        }
    }

    for (var i = 0; i < data.length; i++) {
        var c = data[i];
        add(CODEC_ENC[c & 0xF]);
        add(CODEC_ENC[(c >> 4) & 0xF]);
    }

    return buf;
};

Codec.encodeUInt16 = function (data, buf) {
    return Codec.encode([data & 0xFF, (data >> 8) & 0xFF], buf);
};