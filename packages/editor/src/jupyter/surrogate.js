// @flow
// javascript stores text as utf16 and string indices use "code units",
// which stores high-codepoint characters as "surrogate pairs",
// which occupy two indices in the javascript string.
// We need to translate cursor_pos in the protocol (in characters)
// to js offset (with surrogate pairs taking two spots).
function js_idx_to_char_idx(js_idx: number, text: string): number {
  var char_idx = js_idx;
  for (var i = 0; i + 1 < text.length && i < js_idx; i++) {
    var char_code = text.charCodeAt(i);
    // check for surrogate pair
    if (char_code >= 0xd800 && char_code <= 0xdbff) {
      var next_char_code = text.charCodeAt(i + 1);
      if (next_char_code >= 0xdc00 && next_char_code <= 0xdfff) {
        char_idx--;
        i++;
      }
    }
  }
  return char_idx;
}

function char_idx_to_js_idx(char_idx: number, text: string): number {
  var js_idx = char_idx;
  for (var i = 0; i + 1 < text.length && i < js_idx; i++) {
    var char_code = text.charCodeAt(i);
    // check for surrogate pair
    if (char_code >= 0xd800 && char_code <= 0xdbff) {
      var next_char_code = text.charCodeAt(i + 1);
      if (next_char_code >= 0xdc00 && next_char_code <= 0xdfff) {
        js_idx++;
        i++;
      }
    }
  }
  return js_idx;
}

if ("𝐚".length === 1) {
  // If javascript fixes string indices of non-BMP characters,
  // don't keep shifting offsets to compensate for surrogate pairs
  char_idx_to_js_idx = js_idx_to_char_idx = function(
    idx: number,
    text: string // eslint-disable-line no-unused-vars
  ) {
    return idx;
  };
}

export { char_idx_to_js_idx, js_idx_to_char_idx };
