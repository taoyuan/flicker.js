var Codec = require('./codec');
var crc = require('./crc');
var Serializer = require('./serializer').Serializer;
var Buffer = require('buffer/').Buffer;

var noop = function () {};

function Flicker(width, height) {
    // create an new instance of a pixi stage
    this.stage = new PIXI.Stage(0x000000);

    width = width || window.innerWidth;
    height = height || window.innerHeight;

    // create a renderer instance.
    this.renderer = PIXI.autoDetectRenderer(width, height);

}

Object.defineProperty(Flicker.prototype, 'view', {
    get: function() {
        return this.renderer.view;
    },
    set: function(value) {
        this.renderer.view = value;
    }
});

Flicker.prototype.resize = function (width, height) {
    // resize renderer
    if (width) {
        this.renderer.view.style.width = width + 'px';
    }
    if (height) {
        this.renderer.view.style.height = height + 'px';
    }
};

Flicker.prototype.add = function (step) {
    this._steps = this._steps || [];
    this._steps.push(step);
};

Flicker.prototype._run = function (done) {
    this._stopSteps();

    if (!this._steps) return;

    var that = this,
        steps = this._steps,
        index = 0;

    function next() {
        var step = steps[index++];
        if (!step) {
            that._stop = true; // run complete
            return done();
        }
        that.step = step(that, next);
    }

    next();
};

Flicker.prototype._stopSteps = function () {
    if (this.step && this.step.stop) this.step.stop();
    this.step = null;
};

Flicker.prototype.start = function (data, done) {
    var that = this;
    done = done || noop;
    that._stop = false;

    that.data = data;
    this._run(done);

    if (that._running) {
        return that;
    }
    that._running = true;
    var startTime = Date.now();
    var lastTime = that._stopTime || 0;

    requestAnimationFrame(function loop() {
        var t = Date.now() - startTime + (that._stopTime || 0);
        if (that._stop) { // handle stop request and ensure the last start loop is running
            //log("stop at "+t);
            that._running = false;
            that._stopTime = t;
            return;
        }
        requestAnimationFrame(loop);
        var delta = t - lastTime;
        lastTime = t;
        that.update(t, delta);
        that.render();
    });
    return that;
};

Flicker.prototype.stop = function () {
    this._stopSteps();
    this._stop = true;
    return this;
};

Flicker.prototype.update = function (time, delta) {
    if (this.step && this.step.update) this.step.update(time, delta);
};

Flicker.prototype.render = function () {
    // render the stage
    this.renderer.render(this.stage);
};

Flicker.encode = function encode(message) {
    if (!message) return Buffer(0);

    var data = Codec.encode(message);
    var sum = Codec.encodeUInt16(crc.crc16(message));
    return Buffer.concat([data, sum]);

};

Flicker.serialize = function (data) {

    var start = data[0];

    var serializer = new Serializer();
    serializer.write(start);
    for (var i = 0; i < 9; i++) {
        serializer.reverse();
    }

    serializer.reverse(6);
    serializer.reverse(6);

    serializer.write(data);

    serializer.reverse(8);
    serializer.reverse(8);

    return serializer.buffer;
};

Flicker.Countdown = require('./countdown');

exports.Flicker = Flicker;