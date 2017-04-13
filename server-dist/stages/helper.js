"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getVideo(video) {
    var links = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        links[_i - 1] = arguments[_i];
    }
    var result = '';
    var height = video ? "182" : "24";
    links.forEach(function (el) {
        result += "<br>";
        result += "<iframe width=\"300\" height=\"${height}\" src=\"${link}\" frameborder=\"0\" allowfullscreen></iframe>";
    });
    result += "<br>";
    links.forEach(function (el) {
        result += "br";
        result += "<a style=\"text-decoration:underline !important\" href=\"${link}\">YouTube link</a>`";
    });
}
exports.getVideo = getVideo;
//# sourceMappingURL=helper.js.map