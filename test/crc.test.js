var t = require('chai').assert;
var crc = require('../lib/crc');

describe('crc', function () {
    describe('crc16', function () {
        it('should work', function () {
            var message = 'hello';
            t.equal(crc.crc16(message), 0xCB42);
            //console.log(crc.crc16(message));
        });
    });
});