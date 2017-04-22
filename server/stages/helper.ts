export function getVideo(video: boolean, ...links: string[]) {
    let result = '';

    let height = video ? "130" : "50";

    links.forEach(el => {
        result += "<br>";
        result += `<iframe width=\"200\" height=\"${height}\" src=\"${el}\?modestbranding=1&autohide=0&showinfo=0" frameborder=\"0\" allowfullscreen></iframe>`;
    });

    result += "<br>";

    links.forEach(el => {
        result += `<a style=\"text-decoration:underline !important\" href=\"${el}\">YouTube link</a>`;
    });

    return result;
}

