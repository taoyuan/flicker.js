module.exports = Countdown;

function Countdown(seconds, options) {
    if (!(this instanceof Countdown)) {
        return new Countdown(seconds, options);
    }

    if (typeof seconds !== 'number') {
        options = seconds;
        seconds = null;
    }
    seconds = seconds || 3;
    options = options || {};

    var that = this,
        timer,
        secs = seconds,
        begin = options.begin || noop,
        tick = options.tick || noop,
        end = options.end || noop;

    this.running = false;

    function decrementCounter() {
        tick(secs);
        if (secs === 0) {
            that.stop();
        }
        secs--;
    }

    this.start = function () {
        this.stop();
        this.running = true;
        secs = seconds;
        begin();
        timer = setInterval(decrementCounter, 1000);
    };

    this.stop = function () {
        if (timer) {
            clearInterval(timer);
            timer = 0;
            end();
        }
        this.running = false;
    };

}