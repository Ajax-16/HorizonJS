export function clean_text(txt) {
    if (!txt) return null;

    // Reemplazar <div> y </div> por espacios antes de eliminar las etiquetas
    txt = txt.replace(/<\/?div>/gi, ' ');

    // Eliminar cualquier otra etiqueta HTML
    txt = txt.replace(/<\/?[^>]+(>|$)/g, "");

    let result = '';
    let pos1 = 0;
    let start = 0;

    while ((pos1 = txt.indexOf('&#', start)) !== -1) {
        let pos2 = txt.indexOf(';', pos1 + 2);
        if (pos2 === -1) break;

        let entity = txt.substring(pos1, pos2 + 1);
        let codepoint;

        if (/^&#\d+;/.test(entity)) {
            codepoint = parseInt(entity.substring(2, entity.length - 1), 10);
        } else if (/^&#x[\da-fA-F]+;/.test(entity)) {
            codepoint = parseInt(entity.substring(3, entity.length - 1), 16);
        }

        if (codepoint > 31 || codepoint === 10) {  // Include new line character
            result += txt.substring(start, pos1);
            result += String.fromCodePoint(codepoint);
        } else {
            result += txt.substring(start, pos2 + 1);
        }

        start = pos2 + 1;
    }

    result += txt.substring(start);

    // Reemplazar múltiples espacios y saltos de línea con un solo espacio
    result = result.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');

    // Eliminar espacios en blanco extra
    result = result.trim();

    return result;
}

export function format_date(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}