
exports.log = function (list, cpl) { // cpl: count per line
    if (!list || !list.length) return console.log(list);

    cpl = cpl || 1;
    var line = '  ';

    console.log('[');
    for (var i = 0; i < list.length; i++) {
        line += list[i].toString() + ', ';
        if ((i + 1) % cpl === 0) {
            console.log (line);
            line = '  ';
        }
    }
    if (line.length > 2) {
        console.log(line.substring(0, line.length - 1));
    }

    console.log(']');

};

exports.str2codes = function (str) {
    var codes = [];
    for (var i = 0; i < str.length; i++) {
        codes.push(str.charCodeAt(i));
    }
    return codes;
};
