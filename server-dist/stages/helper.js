"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getVideo(video) {
    var links = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        links[_i - 1] = arguments[_i];
    }
    var result = '';
    var height = video ? "130" : "50";
    links.forEach(function (el) {
        result += "<br>";
        result += "<iframe width=\"200\" height=\"" + height + "\" src=\"" + el + "?modestbranding=1&autohide=0&showinfo=0\" frameborder=\"0\" allowfullscreen></iframe>";
    });
    result += "<br>";
    links.forEach(function (el) {
        result += "<a style=\"text-decoration:underline !important\" href=\"" + el + "\">YouTube link</a>";
    });
    return result;
}
exports.getVideo = getVideo;
//# sourceMappingURL=helper.js.map