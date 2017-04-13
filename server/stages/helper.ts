export function getVideo(video: boolean, ...links: string[]) {
    let result = '';

    let height = video ? "182" : "24";

    links.forEach(el => {
        result += "<br>";
        result += "<iframe width=\"300\" height=\"${height}\" src=\"${link}\" frameborder=\"0\" allowfullscreen></iframe>";
    });

    result += "<br>";

    links.forEach(el => {
        result += "br";
        result += "<a style=\"text-decoration:underline !important\" href=\"${link}\">YouTube link</a>`";
    });
}

