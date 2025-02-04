const express = require("express");
var morgan = require("morgan");
const db = require("./config/db");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const app = express();
const http = require("http");
const { setIO } = require("./helper/io_setup")
const { socketConfig } = require("./helper/eventHandlers")

app.use(express.json());
app.use("uploads/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.use("/api", routes);

app.get('/', (req, res) => {
  res.status(200).send('server is running')
})

let httpServer = http.createServer(app);
let io = setIO(httpServer);
socketConfig(io);

const port = 5000;
httpServer.listen(port, async () => {
  try {
    // await db.sequelize.sync({ alert: true, force: true });
    console.log(
      "------------>>>>> Model has been synced successfully. ------------>>>>>"
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  console.log(`App listening at port http://localhost:${port}`);
});
