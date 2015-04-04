function FlashStep(flicker, done) {

    var stage = flicker.stage;

    var data = Flicker.encode(flicker.data, true);

    var index = 0;

    return {
        update: function () {
            if (index === data.length) return done();

            if (data[index++]) {
                stage.setBackgroundColor(0xFFFFFF);
            } else {
                stage.setBackgroundColor(0x000000);
            }
        },
        stop: function () {
            index = 0;
        }
    };
}