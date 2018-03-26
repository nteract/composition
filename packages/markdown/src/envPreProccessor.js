/* Author: Trevor Lyon <github.com/tlyon3>
 *
 * Finds environments in the src text that are not inside a math block ($$) or inline math ($)
 * and wraps them in a block so that it will render correctly.
 * 
 * This should be a temporary solution until a plugin for the remark parser can be written.
 */

const ENVIRONMENT = /^\\begin{(\s\S*)}(?:\s\S|\n)*?\\end{\1}/;
const BEGIN = /\\begin{(.*)}(?:.|\n)*?/;
const END = /\\end{(.*)}(?:.|\n)*?/;
const ENV = /\\begin{(.*)}(?:.|\n)*?\\end{\1}/;

const processEnv = src => {
  var newSrc = src;
  var envIndexes = [];
  for (var i = 0; i < src.length; i++) {
    // Find environment outside of math mode
    if (src[i] === "\\") {
      var env = src[i];
      var envBegin = i;

      // Get first token
      while (src[i] != "\n" && src[i] != " " && i < src.length) {
        env += src[++i];
      }

      var beginMatch = BEGIN.exec(env);
      // In environment eat text until end
      if (beginMatch) {
        var foundEnd = false;
        var beginCount = 1;
        while (i < src.length) {
          var end = "";
          if (src[i] == "\\") {
            while (src[i] != "\n" && src[i] != " " && i < src.length) {
              end += src[i++];
            }

            //If we find another begin, skip to next token. Increment env count
            if (BEGIN.exec(end)) {
              beginCount++;
              continue;
            }

            // Check end env
            var endMatch = END.exec(end);
            // Found end env
            if (endMatch) {
              // Decrement env count
              beginCount--;
              // Check env names match
              if (beginCount === 0 && endMatch[1] === beginMatch[1]) {
                // Found end of environment. Push begin and end indices and break out of loop
                envIndexes.push({ begin: envBegin, end: i });
                foundEnd = true;
                break;
              }
            }
          }
          // Current char not '\'
          i++;
        }
        // Searched through text, couldn't find end match
        if (!foundEnd) {
          console.error(
            "[EnvPreProcessor] - Couldn't find matching end tag for environment: ",
            beginMatch
          );
          return {
            error: true,
            message: "Couldn't find matching end tag for environment.",
            beginMatch: beginMatch
          };
        }
      }
    } else if (src[i] === "$") {
      // skip over any math blocks
      var fenceCount = 1;

      if (src[i + 1] === "$") {
        // Check if for math block
        fenceCount = 2;
      }
      var foundCount = 0;
      // Move past '$' to next char
      i++;

      // Move through text until have found correct number of '$'
      while (foundCount != fenceCount && i < src.length) {
        // skip over escaped characters
        if (src[i] == "\\") {
          var ch = src[i];
          while (src[i] != " " && src[i] != "\n" && i < src.length) {
            ch = src[i];
            i++;
          }
        } else if (src[i] == "$") {
          foundCount += 1;
          // If inline math, break
          if (foundCount == fenceCount) {
            break;
          } else if (src[i + 1] == "$") {
            // Check next char for math block and break
            i++;
            break;
          } else {
            foundCount = 0;
          }
        }
        i++;
      }
    }
  }

  var prevEnd = 0;
  var modSrc = [];

  // Add "$$\n" before the begin and "\n$$" after the end
  envIndexes.forEach(env => {
    modSrc.push(src.slice(prevEnd, env.begin));
    var newEnv = ["\n$$\n", src.slice(env.begin, env.end), "\n$$\n"].join("");
    modSrc.push(newEnv);
    prevEnd = env.end;
  });

  if (modSrc.length) {
    // Found env. Join all strings and return
    return modSrc.join("");
  } else {
    // No envs found. Return original string
    return newSrc;
  }
};

module.exports = {
  processEnv
};
