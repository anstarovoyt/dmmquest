"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getVideo() {
    var links = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        links[_i] = arguments[_i];
    }
    var result = '';
    links.forEach(function (el) {
        result += "<br>";
        result += "<iframe width=\"280\" height=\"157\" src=\"${link}\" frameborder=\"0\" allowfullscreen></iframe>";
    });
    result += "<br>";
    links.forEach(function (el) {
        result += "br";
        result += "<a style=\"text-decoration:underline !important\" href=\"${link}\">YouTube link</a>`";
    });
}
exports.getVideo = getVideo;
//# sourceMappingURL=helper.js.map