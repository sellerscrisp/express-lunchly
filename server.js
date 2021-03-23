/** Start server for Lunchly. */

const app = require("./app");

app.listen(3000, function() {
  console.log("listening on port 3000 -> http://localhost:3000");
});
