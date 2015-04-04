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