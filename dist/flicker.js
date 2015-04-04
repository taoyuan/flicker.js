/**
 * @license
 * flicker.js - v0.1.0
 * Copyright (c) 2012-2014, Yuan Tao
 * 
 *
 * Compiled: 2015-04-04
 *
 * flicker.js is licensed under the MIT License.
 * 
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Flicker = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/flicker');

},{"./lib/flicker":2}],2:[function(require,module,exports){
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


},{"./hamming":3,"./serializer":4}],3:[function(require,module,exports){
var Hamming = module.exports = {};

function isPowerOfTow(x) {
    return !(x & (x - 1)) && x;
}

Hamming.getBit = getBit;
function getBit(byte, bit) {
    return byte & (0x80 >> bit);
}

Hamming.setBit = setBit;
function setBit(byte, bit, value) {
    var mask = 0x80 >> bit;
    if (value) {
        byte |= mask
    } else {
        byte &= ~mask;
    }
    return byte;
}

Hamming.setBitForArray = setBitForArray;
function setBitForArray(dest, index, bit, value) {
    dest[index] = setBit(dest[index], bit, value);
}

Hamming.getParityBit = getParityBit;
function getParityBit(data, bit, data_bits) {
    var numOnes = 0;
    for (var j = bit - 1; j < data_bits; j += 2 * bit) {
        for (var k = j; k < j + bit && k < data_bits; k++) {
            // skip the first one
            if (j == bit - 1 && k == j) {
                continue;
            }
            if (getBit(data[k >> 3], k & 0x07)) {
                numOnes++;
            }
        }
    }
    // set parity bit to 1 if numOnes is odd
    return numOnes & 1;
}

Hamming.encode = function (packet) {
    var destBit = 0;
    var len = packet.length;
    var dest = [];

    var source = [];
    if (typeof packet === "string") {
        for (var i = 0; i < len; i++) {
            source.push(packet.charCodeAt(i));
        }
        packet = source;
    }

    // write data bits to dest
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < 8; j++) {
            // is it not a parity bit?
            if (isPowerOfTow(destBit + 1)) {
                j--;
            } else {
                setBitForArray(dest, destBit >> 3, destBit & 0x07, getBit(packet[i], j));
            }
            // then set dest bit to packet bit
            destBit++;
        }
    }

    // the full length in bits
    var fullLen = Math.ceil(destBit / 8.0) << 3;

    console.log("full length of the packet: %d", fullLen);

    // 0-out the unused bits
    for (var i = destBit; i < fullLen; i++) {
        setBitForArray(dest, i >> 3, i & 0x07, false);
    }

    // write parity bits
    for (var i = 1; i < fullLen; i <<= 1) {
        setBitForArray(dest, (i - 1) >> 3, (i - 1) & 0x07, getParityBit(dest, i, fullLen));
    }
    return dest;
};

Hamming.decode = function (packet) {
    var errBit = -1;
    var len = packet.length;
    var dest = [];

    // fix error
    for (var i = 1; i < len * 8; i <<= 1) {
        if (getBit(packet[(i - 1) >> 3], (i - 1) & 0x07) != getParityBit(packet, i, len * 8)) {
            if (errBit < 0) {
                errBit = 0;
            }
            errBit += i;
        }
    }

    if (errBit > 0) {
        // pull to 0 index
        errBit -= 1;
        setBitForArray(packet, errBit >> 3, errBit & 0x07, !getBit(packet[errBit >> 3], errBit & 0x07));

        console.log("fixed error at %d", errBit);

    }
    // write data
    var destBit = 0;
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < 8; j++) {
            var bit = i * 8 + j;
            // is it a parity bit
            if (!isPowerOfTow(bit + 1)) {
                setBitForArray(dest, destBit >> 3, destBit & 0x07, getBit(packet[i], j));
                destBit++;
            }
        }
    }
    return dest;
};

Hamming.getEncodedLength = function (len) {
    if (len < 31) {
        return len + 1;
    }
    return len + 2;
};

Hamming.getDecodedLength = function (len) {
    if (len < 33) {
        return len - 1;
    }
    return len - 2;
};
},{}],4:[function(require,module,exports){
exports.Serializer = Serializer;

function Serializer() {
    this.buffer = [];
    this.last = false;
}

Serializer.prototype.writeBit = function (bit, num) {
    this.last = bit & 1;
    num = num || 1;
    for (var i = 0; i < num; i++) {
        this.buffer.push(this.last);
    }
};

Serializer.prototype.writeList = function (list, len) {
    len = len || list.length;
    this.last = list[len - 1] & 1;
    for (var i = 0; i < list.length; i++) {
        this.buffer.push(list[i]);
    }
};

Serializer.prototype.write = function (value, num) {
    if (value && value.length > 0) {
        this.writeList(value, value.length);
    } else {
        this.writeBit(value, num);
    }

};

Serializer.prototype.reverse = function (num) {
    this.write(!this.last, num);
};
},{}]},{},[1])(1)
});