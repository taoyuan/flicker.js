var Flicker = module.exports = require('./lib/flicker').Flicker;

Flicker.steps = {
    Countdown: require('./lib/steps/countdown'),
    Sender: require('./lib/steps/Sender')
};