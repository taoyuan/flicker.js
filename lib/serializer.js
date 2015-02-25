var Buffer = require('buffer/').Buffer;

exports.Serializer = Serializer;

function Serializer() {
    this.buffer = [];
    this._state = false;
}

Serializer.prototype.writeBit = function (bit, num) {
    this._state = bit & 1;
    num = num || 1;
    for (var i = 0; i < num; i++) {
        this.buffer.push(this._state);
    }
};

Serializer.prototype.writeList = function (list, len) {
    len = len || list.length;
    this._state = list[len - 1] & 1;
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
    this.write(!this._state, num);
};