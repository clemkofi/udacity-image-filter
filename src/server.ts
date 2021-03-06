import express from "express";
import bodyParser from "body-parser";
import {
  filterImageFromURL,
  deleteLocalFiles,
  checkValidUrl,
} from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // array for the processed images
  let processedImages: Array<string> = [];

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  //CORS Should be restricted ==> allowed for the main restapi
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // Image filtering Endpoint
  // Creates a filter on top of the image and sends the processed image back
  app.get("/filteredimage", async (req, res) => {
    let imageURL = req.query.image_url;

    // check if the image_url is provided
    if (!imageURL) {
      return res.status(400).send({
        message:
          "Image url is required ... try GET /filteredimage?image_url={{}}",
      });
    }

    // check if the image_url is a valid URL
    let checkValidity: Boolean = checkValidUrl(imageURL);

    if (!checkValidity) {
      return res.status(400).send({ message: "Image url is invalid" });
    }

    // image path for deletion
    let imagePath: string;

    try {
      // apply the filter to the image and save locally
      imagePath = await filterImageFromURL(imageURL);

      // send the response from the server
      res.sendFile(imagePath, (error) => {
        // handle any errors that occur while sending file
        if (error) {
          console.log(error);
          res.status(404);
        }

        // clear the images from the server
        deleteLocalFiles([imagePath]);
      });
    } catch (error) {
      console.log(">", error);
      return res
        .status(422)
        .send({ message: "Filter not applied .. an error occurred" });
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
