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