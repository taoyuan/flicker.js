var t = require('chai').assert;
var Buffer = require('buffer/').Buffer;

describe('Buffer', function () {
    it('should convert string to ascii', function () {
        var buf = Buffer('hello');
        t.equal(buf[0], 0x68);
    });

    it('should concat', function () {
        var buf1 = Buffer('hello ');
        var buf2 = Buffer('world');
        var buf3 = Buffer.concat([buf1, buf2]);
        var expected = Buffer('hello world');
        t.deepEqual(expected, buf3);
    });
});