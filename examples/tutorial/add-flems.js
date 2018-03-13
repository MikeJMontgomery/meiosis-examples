/*global process*/
var fs = require("fs");
var fromDir = process.argv[2];
var toDir = process.argv[3];

var linkMap = {
  "flyd": "https://unpkg.com/flyd@0.2.6/flyd.js",
  "mithril": "https://unpkg.com/mithril@1.1.6",
  "mithril-stream": "https://unpkg.com/mithril-stream@1.1.0",
  "react": "https://unpkg.com/react@16.2.0/umd/react.development.js",
  "react-dom": "https://unpkg.com/react-dom@16.2.0/umd/react-dom.development.js"
};

var filenames = fs.readdirSync(fromDir);

filenames.forEach(source => {
  var input = fs.readFileSync(fromDir + "/" + source, "ascii");
  var lines = input.split("\n");
  var flemNumber = 1;

  lines = lines.map(function(line) {
    if (line.startsWith("@flems")) {
      var parts = line.split(" ");

      var files = parts[1].split(",");
      var fileContents = files.map(filename => {
        var file = JSON.stringify(fs.readFileSync(filename, "ascii"));
        var shortname = filename.substring(filename.lastIndexOf("/") + 1);
        var compiler = "";
        if (shortname.endsWith("jsx")) {
          compiler = ", compiler: \"babel\"";
          shortname = shortname.substring(0, shortname.length - 1);
        }
        return `{name: "${shortname}", content: ${file}${compiler}}`;
      });
      var fileString = "[" + fileContents.join(",") + "]";

      var links = parts[2].split(",");
      var linkContents = links.map(link => {
        var url = linkMap[link];
        return `{name: "${link}", type: "js", url: "${url}"}`;
      });
      var linkString = "[" + linkContents.join(",") + "]";

      line = `
  <div id="flems${flemNumber}" class="flemscode"></div>

  <script>
    window.Flems(flems${flemNumber}, {
      files: ${fileString},
      links: ${linkString}
    })
  </script>
      `;

      flemNumber++;
    }
    return line;
  });

  var dest = toDir + "/" + source;
  fs.writeFileSync(dest, lines.join("\n"));
});