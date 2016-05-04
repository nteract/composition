// This file was originally written by @drudru (https://github.com/drudru/Anser), MIT, 2011

var Anser = require('../src/anser');

var should = require('should');

describe('Anser', function() {

  describe('escapeForHtml', function() {

    describe('ampersands', function() {

      it('should escape a single ampersand', function() {
        var start = "&";
        var expected = "&amp;";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

      it('should escape some text with ampersands', function() {
        var start = "abcd&efgh";
        var expected = "abcd&amp;efgh";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

      it('should escape multiple ampersands', function() {
        var start = " & & ";
        var expected = " &amp; &amp; ";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

      it('should escape an already escaped ampersand', function() {
        var start = " &amp; ";
        var expected = " &amp;amp; ";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });
    });

    describe('less-than', function() {

      it('should escape a single less-than', function() {
        var start = "<";
        var expected = "&lt;";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

      it('should escape some text with less-thans', function() {
        var start = "abcd<efgh";
        var expected = "abcd&lt;efgh";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

      it('should escape multiple less-thans', function() {
        var start = " < < ";
        var expected = " &lt; &lt; ";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

    });

    describe('greater-than', function() {

      it('should escape a single greater-than', function() {
        var start = ">";
        var expected = "&gt;";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

      it('should escape some text with greater-thans', function() {
        var start = "abcd>efgh";
        var expected = "abcd&gt;efgh";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

      it('should escape multiple greater-thans', function() {
        var start = " > > ";
        var expected = " &gt; &gt; ";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

    });

    describe('mixed characters', function() {

      it('should escape a mix of characters that require escaping', function() {
        var start = "<&>/\\'\"";
        var expected = "&lt;&amp;&gt;/\\'\"";

        var l = Anser.escapeForHtml(start);
        l.should.eql(expected);
      });

    });

  });

  describe('linkify', function() {

      it('should linkify a url', function() {
        var start = "http://link.to/me";
        var expected = "<a href=\"http://link.to/me\">http://link.to/me</a>";

        var l = Anser.linkify(start);
        l.should.eql(expected);
      });

  });

  describe('ansi to html', function() {

    describe('default colors', function() {
      it('should transform a foreground to html', function() {
        var attr = 0;
        var fg = 32;
        var start = "\u001b[" + fg + "m " + fg + " \u001b[0m";

        var expected = "<span style=\"color:rgb(0, 187, 0)\"> " + fg + " </span>";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });


      it('should transform a attr;foreground to html', function() {
        var attr = 0;
        var fg = 32;
        var start = "\u001b[" + attr + ";" + fg + "m " + fg + "  \u001b[0m";

        var expected = "<span style=\"color:rgb(0, 187, 0)\"> " + fg + "  </span>";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      it('should transform an empty code to a normal/reset html', function() {
        var attr = 0;
        var fg = 32;
        var start = "\u001b[" + attr + ";" + fg + "m " + fg + "  \u001b[m x";

        var expected = "<span style=\"color:rgb(0, 187, 0)\"> " + fg + "  </span> x";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      it('should transform a bold attr;foreground to html', function() {
        var attr = 1;
        var fg = 32;
        var start = "\u001b[" + attr + ";" + fg + "m " + attr + ";" + fg + " \u001b[0m";

        var expected = "<span style=\"color:rgb(0, 255, 0)\"> " + attr + ";" + fg + " </span>";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      it('should transform a bold-foreground to html', function() {
        var fg = 92;
        var start = "\u001b[" + fg + "m " + fg + " \u001b[0m";

        var expected = "<span style=\"color:rgb(0, 255, 0)\"> " + fg + " </span>";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      it('should transform a bold attr;background;foreground to html', function() {
        var attr = 1;
        var fg = 33;
        var bg = 42;
        var start = "\u001b[" + attr + ";" + bg + ";" + fg + "m " + attr + ";" + bg + ";" + fg + " \u001b[0m";

        var expected = "<span style=\"color:rgb(255, 255, 85);background-color:rgb(0, 187, 0)\"> " + attr + ";" + bg + ";" + fg + " </span>";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      it('should transform a bold-background;foreground to html', function() {
        var fg = 33;
        var bg = 102;
        var start = "\u001b[" + bg + ";" + fg + "m " + bg + ";" + fg + " \u001b[0m";

        var expected = "<span style=\"color:rgb(187, 187, 0);background-color:rgb(0, 255, 0)\"> " + bg + ";" + fg + " </span>";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });


      it('should transform a complex multi-line sequence to html', function() {
        var attr = 1;
        var fg = 32;
        var bg = 42;
        var start = "\n \u001b[" + fg + "m " + fg + "  \u001b[0m \n  \u001b[" + bg + "m " + bg + "  \u001b[0m \n zimpper ";

        var expected = "\n <span style=\"color:rgb(0, 187, 0)\"> " + fg + "  </span> \n  <span style=\"background-color:rgb(0, 187, 0)\"> " + bg + "  </span> \n zimpper ";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      it('should transform a foreground and background and reset foreground to html', function() {
        var fg = 37;
        var bg = 42;
        var start = "\n\u001b[40m \u001b[49m\u001b[" + fg + ";" + bg + "m " + bg + " \u001b[39m foobar ";

        var expected = "\n<span style=\"background-color:rgb(0, 0, 0)\"> </span><span style=\"color:rgb(255,255,255);background-color:rgb(0, 187, 0)\"> " + bg + " </span><span style=\"background-color:rgb(0, 187, 0)\"> foobar </span>";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      it('should transform a foreground and background and reset background to html', function() {
        var fg = 37;
        var bg = 42;
        var start = "\n\u001b[40m \u001b[49m\u001b[" + fg + ";" + bg + "m " + fg + " \u001b[49m foobar ";

        var expected = "\n<span style=\"background-color:rgb(0, 0, 0)\"> </span><span style=\"color:rgb(255,255,255);background-color:rgb(0, 187, 0)\"> " + fg + " </span><span style=\"color:rgb(255,255,255)\"> foobar </span>";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      it('should transform a foreground and background and reset them to html', function() {
        var fg = 37;
        var bg = 42;
        var start = "\n\u001b[40m \u001b[49m\u001b[" + fg + ";" + bg + "m " + fg + ';' + bg + " \u001b[39;49m foobar ";

        var expected = "\n<span style=\"background-color:rgb(0, 0, 0)\"> </span><span style=\"color:rgb(255,255,255);background-color:rgb(0, 187, 0)\"> " + fg + ';' + bg + " </span> foobar ";

        var l = Anser.ansiToHtml(start);
        l.should.eql(expected);
      });

      describe('transform extend colors (palette)', function() {
        it('system color, foreground', function() {
          var start = "\u001b[38;5;1m" + "red" + "\u001b[0m";
          var expected = '<span style="color:rgb(187, 0, 0)">red</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });

        it('system color, foreground (bright)', function() {
          var start = "\u001b[38;5;9m" + "red" + "\u001b[0m";
          var expected = '<span style="color:rgb(255, 85, 85)">red</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });

        it('system color, background', function() {
          var start = "\u001b[48;5;1m" + "red" + "\u001b[0m";
          var expected = '<span style="background-color:rgb(187, 0, 0)">red</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });

        it('system color, background (bright)', function() {
          var start = "\u001b[48;5;9m" + "red" + "\u001b[0m";
          var expected = '<span style="background-color:rgb(255, 85, 85)">red</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });

        it('palette, foreground', function() {
          var start = "\u001b[38;5;171m" + "foo" + "\u001b[0m";
          var expected = '<span style="color:rgb(215, 95, 255)">foo</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });

        it('palette, background', function() {
          var start = "\u001b[48;5;171m" + "foo" + "\u001b[0m";
          var expected = '<span style="background-color:rgb(215, 95, 255)">foo</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });

        it('combination of bold and palette', function() {
          var start = "\u001b[1;38;5;171m" + "foo" + "\u001b[0m";
          var expected = '<span style="color:rgb(215, 95, 255)">foo</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });

        it('combination of palette and bold', function() {
          var start = "\u001b[38;5;171;1m" + "foo" + "\u001b[0m";
          var expected = '<span style="color:rgb(215, 95, 255)">foo</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });
      });

      describe('transform extend colors (true color)', function() {
        it('foreground', function() {
          var start = "\u001b[38;2;42;142;242m" + "foo" + "\u001b[0m";
          var expected = '<span style="color:rgb(42, 142, 242)">foo</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });
        it('background', function() {
          var start = "\u001b[48;2;42;142;242m" + "foo" + "\u001b[0m";
          var expected = '<span style="background-color:rgb(42, 142, 242)">foo</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });
        it('both foreground and background', function() {
          var start = "\u001b[38;2;42;142;242;48;2;1;2;3m" + "foo" + "\u001b[0m";
          var expected = '<span style="color:rgb(42, 142, 242);background-color:rgb(1, 2, 3)">foo</span>';
          var l = Anser.ansiToHtml(start);
          l.should.eql(expected);
        });
      });
    });

    describe('themed colors', function() {
      it('should transform a foreground to html', function() {
        var attr = 0;
        var fg = 32;
        var start = "\u001b[" + fg + "m " + fg + " \u001b[0m";

        var expected = "<span class=\"ansi-green-fg\"> " + fg + " </span>";

        var l = Anser.ansiToHtml(start, {use_classes: true});
        l.should.eql(expected);
      });


      it('should transform a attr;foreground to html', function() {
        var attr = 0;
        var fg = 32;
        var start = "\u001b[" + attr + ";" + fg + "m " + fg + "  \u001b[0m";

        var expected = "<span class=\"ansi-green-fg\"> " + fg + "  </span>";

        var l = Anser.ansiToHtml(start, {use_classes: true});
        l.should.eql(expected);
      });

      it('should transform a bold attr;foreground to html', function() {
        var attr = 1;
        var fg = 32;
        var start = "\u001b[" + attr + ";" + fg + "m " + attr + ";" + fg + " \u001b[0m";

        var expected = "<span class=\"ansi-bright-green-fg\"> " + attr + ";" + fg + " </span>";

        var l = Anser.ansiToHtml(start, {use_classes: true});
        l.should.eql(expected);
      });

      it('should transform a bold attr;background;foreground to html', function() {
        var attr = 1;
        var fg = 33;
        var bg = 42;
        var start = "\u001b[" + attr + ";" + bg + ";" + fg + "m " + attr + ";" + bg + ";" + fg + " \u001b[0m";

        var expected = "<span class=\"ansi-bright-yellow-fg ansi-green-bg\"> " + attr + ";" + bg + ";" + fg + " </span>";

        var l = Anser.ansiToHtml(start, {use_classes: true});
        l.should.eql(expected);
      });

      it('should transform a complex multi-line sequence to html', function() {
        var attr = 1;
        var fg = 32;
        var bg = 42;
        var start = "\n \u001b[" + fg + "m " + fg + "  \u001b[0m \n  \u001b[" + bg + "m " + bg + "  \u001b[0m \n zimpper ";

        var expected = "\n <span class=\"ansi-green-fg\"> " + fg + "  </span> \n  <span class=\"ansi-green-bg\"> " + bg + "  </span> \n zimpper ";

        var l = Anser.ansiToHtml(start, {use_classes: true});
        l.should.eql(expected);
      });

      describe('transform extend colors (palette)', function() {
        it('system color, foreground', function() {
          var start = "\u001b[38;5;1m" + "red" + "\u001b[0m";
          var expected = '<span class="ansi-red-fg">red</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });

        it('system color, foreground (bright)', function() {
          var start = "\u001b[38;5;9m" + "red" + "\u001b[0m";
          var expected = '<span class="ansi-bright-red-fg">red</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });

        it('system color, background', function() {
          var start = "\u001b[48;5;1m" + "red" + "\u001b[0m";
          var expected = '<span class="ansi-red-bg">red</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });

        it('system color, background (bright)', function() {
          var start = "\u001b[48;5;9m" + "red" + "\u001b[0m";
          var expected = '<span class="ansi-bright-red-bg">red</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });

        it('palette, foreground', function() {
          var start = "\u001b[38;5;171m" + "foo" + "\u001b[0m";
          var expected = '<span class="ansi-palette-171-fg">foo</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });

        it('palette, background', function() {
          var start = "\u001b[48;5;171m" + "foo" + "\u001b[0m";
          var expected = '<span class="ansi-palette-171-bg">foo</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });

        it('combination of bold and palette', function() {
          var start = "\u001b[1;38;5;171m" + "foo" + "\u001b[0m";
          var expected = '<span class="ansi-palette-171-fg">foo</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });

        it('combination of palette and bold', function() {
          var start = "\u001b[38;5;171;1m" + "foo" + "\u001b[0m";
          var expected = '<span class="ansi-palette-171-fg">foo</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });
      });

      describe('transform extend colors (true color)', function() {
        it('foreground', function() {
          var start = "\u001b[38;2;42;142;242m" + "foo" + "\u001b[0m";
          var expected = '<span class="ansi-truecolor-fg" data-ansi-truecolor-fg="42, 142, 242">foo</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });
        it('background', function() {
          var start = "\u001b[48;2;42;142;242m" + "foo" + "\u001b[0m";
          var expected = '<span class="ansi-truecolor-bg" data-ansi-truecolor-bg="42, 142, 242">foo</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });
        it('both foreground and background', function() {
          var start = "\u001b[38;2;42;142;242;48;2;1;2;3m" + "foo" + "\u001b[0m";
          var expected = '<span class="ansi-truecolor-fg ansi-truecolor-bg" data-ansi-truecolor-fg="42, 142, 242" data-ansi-truecolor-bg="1, 2, 3">foo</span>';
          var l = Anser.ansiToHtml(start, {use_classes: true});
          l.should.eql(expected);
        });
      });
    });
    describe('ignore unsupported CSI', function() {
      it('should correctly convert a string similar to CSI', function() {
        // https://github.com/drudru/Anser/pull/15
        // "[1;31m" is a plain text. not an escape sequence.
        var start = "foo\u001b[1@bar[1;31mbaz\u001b[0m";
        var l = Anser.ansiToHtml(start);

        // is all plain texts exist?
        l.should.containEql('foo');
        l.should.containEql('bar');
        l.should.containEql('baz');
        l.should.containEql('1;31m');
      });
      it('(italic)', function() {
        var start = "foo\u001b[3mbar\u001b[0mbaz";
        var l = Anser.ansiToHtml(start);
        l.should.eql('foobarbaz');
      });
      it('(cursor-up)', function() {
        var start = "foo\u001b[1Abar";
        var l = Anser.ansiToHtml(start);
        l.should.eql('foobar');
      });
      it('(scroll-left)', function() {
        // <ESC>[1 @ (including ascii space)
        var start = "foo\u001b[1 @bar";
        var l = Anser.ansiToHtml(start);
        l.should.eql('foobar');
      });
      it('(DECMC)', function() {
        var start = "foo\u001b[?11ibar";
        var l = Anser.ansiToHtml(start);
        l.should.eql('foobar');
      });
      it('(RLIMGCP)', function() {
        var start = "foo\u001b[<!3ibar";
        var l = Anser.ansiToHtml(start);
        l.should.eql('foobar');
      });
      it('(DECSCL)', function() {
        var start = "foo\u001b[61;0\"pbar"
        var l = Anser.ansiToHtml(start);
        l.should.eql('foobar');
      });
    });
  });
  describe('ansi to text', function() {
    it('should remove color sequence', function() {
      var start = "foo \u001b[1;32mbar\u001b[0m baz";
      var l = Anser.ansiToText(start);
      l.should.eql("foo bar baz");
    });
    it('should remove unsupported sequence', function() {
      var start = "foo \u001b[1Abar";
      var l = Anser.ansiToText(start);
      l.should.eql('foo bar');
    });
    it('should keep multiline', function() {
      var start = "foo \u001b[1;32mbar\nbaz\u001b[0m qux";
      var l = Anser.ansiToText(start);
      l.should.eql("foo bar\nbaz qux");
    });
  });
  describe('ansi to json', function() {
    it('should convert ansi to json', function() {
      var attr = 0;
      var fg = 32;
      var start = "\u001b[" + fg + "m " + fg + " \u001b[0m";
      var output = Anser.ansiToJson(start, {
          remove_empty: true
      });
      output[0].fg.should.eql("0, 187, 0");
      output[0].content.should.eql(" 32 ");
    });
  });
});
