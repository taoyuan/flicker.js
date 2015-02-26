var Flicker = require('../flicker').Flicker;


module.exports = function (flicker, done) {

    done = done || noop;

    var textCountdown, textPoweredBy,
        renderer = flicker.renderer,
        stage = flicker.stage;

    function createTexts() {

        var size = Math.round(Math.min(renderer.width, renderer.height) * 0.6);

        // create countdown text
        textCountdown = new PIXI.Text("3", {
            font: "bold " + size + "px Arial",
            fill: "white",
            align: "center"
        });
        textCountdown.position.x = renderer.width / 2;
        textCountdown.position.y = size / 3;
        textCountdown.anchor.x = 0.5;

        // create powered text
        textPoweredBy = new PIXI.Text("Powered by Dolink Inc.", {
            font: "30px Arial",
            fill: "#CCCCCC",
            align: "center"
        });
        textPoweredBy.position.x = renderer.width / 2;
        textPoweredBy.position.y = renderer.height - textPoweredBy.height - 20;
        textPoweredBy.anchor.x = 0.5;

        stage.addChild(textCountdown);
        stage.addChild(textPoweredBy);
    }

    function clearTexts() {
        stage.removeChild(textCountdown);
        stage.removeChild(textPoweredBy);
        textCountdown = null;
        textPoweredBy = null;
    }

    var c = Flicker.Countdown(2, {
        begin: function () {
            createTexts();
        },
        tick: function (secs) {
            if (textCountdown) textCountdown.setText(secs);
        },
        end: function () {
            clearTexts();
            done();
        }
    });

    return {
        update: function () {
            if (c.running) return;
            c.start();
        },
        stop: function () {
            if (c.running) c.stop();
        }
    }

};