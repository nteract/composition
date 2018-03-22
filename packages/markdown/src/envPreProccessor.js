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
      while (src[i] != "\n" && src[i] != " " && i < src.length) {
        env += src[++i];
      }
      // In environment eat text until end
      var beginMatch = BEGIN.exec(env);

      if (beginMatch) {
        var beginCount = 1;
        while (i < src.length) {
          var end = "";
          if (src[i] == "\\") {
            while (src[i] != "\n" && src[i] != " " && i < src.length) {
              end += src[i++];
            }

            if (BEGIN.exec(end)) {
              beginCount++;
              continue;
            }
            // found end. Insert '$$' and continue
            var endMatch = END.exec(end);
            //Check to make sure envs are the same
            if (endMatch) {
              beginCount--;
              if (beginCount === 0 && endMatch[1] === beginMatch[1]) {
                envIndexes.push({ begin: envBegin, end: i });
                break;
              }
            }
          }
          i++;
        }
      }
    } else if (src[i] === "$") {
      // skip over any math blocks
      var fenceCount = 1;
      if (src[++i] === "$") {
        fenceCount = 2;
      }
      var foundCount = 0;
      i++;
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
          if (foundCount == fenceCount) {
            break;
          } else if (src[++i] == "$") {
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
  envIndexes.forEach(env => {
    modSrc.push(src.slice(prevEnd, env.begin));
    var newEnv = ["\n$$\n", src.slice(env.begin, env.end), "\n$$\n"].join("");
    modSrc.push(newEnv);
    prevEnd = env.end;
  });

  if (modSrc.length) {
    return modSrc.join("");
  } else {
    return newSrc;
  }
};

module.exports = {
  processEnv
};
