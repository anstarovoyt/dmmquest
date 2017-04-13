export function getVideo(...links: string[]) {
    let result = '';

    links.forEach(el => {
        result += "<br>";
        result += "<iframe width=\"280\" height=\"157\" src=\"${link}\" frameborder=\"0\" allowfullscreen></iframe>";
    });

    result += "<br>";

    links.forEach(el => {
        result += "br";
        result += "<a style=\"text-decoration:underline !important\" href=\"${link}\">YouTube link</a>`";
    });
}

