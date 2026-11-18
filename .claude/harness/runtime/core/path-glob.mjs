// One glob dialect for workspace paths: `**/` spans zero or more directories,
// `**` anything, `*` one segment, `?` one character; a leading `./` is
// ignored. Task scopes and workspace surfaces must agree on what a pattern
// covers, so both compile it here.
export function globRegExp(glob) {
  const raw = String(glob).replace(/^\.\//, "");
  let pattern = "";
  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    if (character === "*" && raw[index + 1] === "*") {
      pattern += raw[index + 2] === "/" ? "(?:.*/)?" : ".*";
      index += raw[index + 2] === "/" ? 2 : 1;
    } else if (character === "*") pattern += "[^/]*";
    else if (character === "?") pattern += "[^/]";
    else pattern += character.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${pattern}$`);
}
