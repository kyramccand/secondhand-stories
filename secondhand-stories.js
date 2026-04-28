var http = require("http");
var url = require("url");
var fs = require("fs");
const querystring = require("querystring");
const stripe = require('stripe')('sk_test_51TQgpnJCbaB2R6Vgq3VCznggWkj39qLx8Seu1XRdeqNDNtK5i4smae3uaLwcB1OzYgiXLsCwekkd1VZBONmWsxVm00e6gfZSS0');
var port = process.env.PORT || 3000;
// var port = 8080;   // uncomment to run local

const { ObjectId } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const connStr =
  "mongodb+srv://login_user:db123@leaderboard.gw09mzd.mongodb.net/?appName=leaderboard";

// The header and footer to include on every page
const header = fs.readFileSync("header.html", "utf8");
const footer = fs.readFileSync("footer.html", "utf8");

console.log("Server ready");

// Create the server
var server = http.createServer(function (req, res) {
  // Parse the url to get the form inputs
  urlObj = url.parse(req.url, true);
  var path = urlObj.pathname;

  // Load the home page
  if (path == "/home" || path == "/") {
    fs.readFile("home.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading home.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  }
  // Load the home page
  else if (path == "/login") {
    fs.readFile("login.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading login.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  } else if (path == "/process-login" && req.method == "POST") {
    let body = "";

    // Collect the data chunks
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    // Once all data is received
    req.on("end", async () => {
      const formData = querystring.parse(body);
      const email = formData.email;
      const pass = formData.password;

      const client = new MongoClient(connStr);

      try {
        await client.connect();
        // Go to the database
        const db = client.db("secondhand-db");
        // Go to the users collection
        const collection = db.collection("users");

        // Search for the user
        const matchingUser = await collection.findOne({
          email: email,
          password: pass,
        });

        if (matchingUser) {
          // Construct the query string for the frontend to parse
          const query = `first=${matchingUser.firstName}&last=${matchingUser.lastName}&email=${matchingUser.email}`;
          res.writeHead(302, { Location: `/home?${query}` });
          res.end();
        } else {
          // Failure
          res.writeHead(302, { Location: "/login?error=account-not-found" });
          res.end();
        }
      } catch (err) {
        res.writeHead(500);
        res.end("Database Error: " + err.message);
      } finally {
        await client.close();
      }
    });
    return;
  }
  // Load the home page
  else if (path == "/signup") {
    fs.readFile("signup.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading signup.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  } else if (path == "/process-signup" && req.method == "POST") {
    let body = "";
    // Collect the data
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      // Get the form data
      const formData = querystring.parse(body);
      // Create a new user
      const newUser = {
        firstName: formData.first,
        lastName: formData.last,
        email: formData.email,
        password: formData.password,
        donations: 0, // New users have 0 donations
        credits: 0
      };
      // Connect to MongoDB
      const client = new MongoClient(connStr);

      try {
        await client.connect();
        // Go to this database
        const db = client.db("secondhand-db");
        // Go to this collection
        const collection = db.collection("users");

        const existingAccount = await collection.findOne({
          email: newUser.email,
        });

        // Check for an existing account
        if (existingAccount) {
          res.writeHead(302, { Location: "/signup?error=existing-account" });
          res.end();
        } else {
          // Insert a new user
          const result = await collection.insertOne(newUser);

          // Redirect to login page
          res.writeHead(302, { Location: "/login" });
          res.end();
        }
      } catch (err) {
        // Catch any errors that come up
        res.writeHead(500);
        res.end("Database Error: " + err.message);
      } finally {
        await client.close();
      }
    });
    return;
  }

  // Load the home page
  else if (path == "/cart") {
    fs.readFile("cart.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading cart.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  }
  // get info on a user's num of credits
  else if (path == "/creditInfo" && req.method == "GET") {
        (async () => {
            const client = new MongoClient(connStr);

            try {
                await client.connect();
                const db = client.db("secondhand-db");
                const collection = db.collection("users");

                // get user/email from query string
                const email = urlObj.query.email;

                // search and return their donation info
                const user = await collection.findOne({ email });

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ donations: user.donations }));

            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: error.message }));
            } finally {
                await client.close();
            }
        })();
    } 
    else if (path == "/useCredit" && req.method == "GET") {
        (async () => {
            const client = new MongoClient(connStr);

            try {
                await client.connect();
                const db = client.db("secondhand-db");
                const collection = db.collection("users");

                // get the user and their new amount of donation credits to update
                const donations = Math.round(parseFloat(urlObj.query.donations));
                const email = urlObj.query.email;

                const user = await collection.findOne({ email });

                await collection.updateOne({ email: email }, { $set: {donations: donations}});
                await collection.updateOne({ email: email }, { $set: {credits: donations}});

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: error.message }));
            } finally {
                await client.close();
            }
        })();
    }
    // remove books in cart from our library
    else if (path == "/updateLibrary" && req.method == "GET") {
        (async () => {
        const client = new MongoClient(connStr);
        try {
            await client.connect();
            const db = client.db("secondhand-db");
            const collection = db.collection("books");

            const title = urlObj.query.title;

            // search for book then remove it
            const book = await db.collection("books").findOne({ title: title });

            if (!book) {
                res.writeHead(404);
                return res.end("Book not found");
            }

            await collection.deleteOne({ title: title });

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
        } catch (err) {
            res.writeHead(500);
            res.end("Database Error: " + err.message);
        } finally {
            await client.close();
        }
    })();
    }
    // process the checkout via stripe
else if (path == "/processCheckout" && req.method == "GET") {
    (async () => {
        try {
            const totalItems = parseInt(urlObj.query.totalItems);
            // Get the price from the frontend and convert to cents
            const finalPrice = parseFloat(urlObj.query.finalPrice);
            const amountInCents = Math.round(finalPrice * 100);

            // NOTE: this is the stripe checkout blueprint, provided by stripe (they do price in cents for some reason)
            const session = await stripe.checkout.sessions.create({
                line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        // Calculate unit_amount based on the total price divided by items
                        unit_amount: Math.round(amountInCents / totalItems),
                        product_data: {
                            name: 'book',
                            description: 'Enjoy your read!',
                        },
                    },
                    quantity: totalItems,
                },
              ],
              mode: 'payment',

              // landing pages for after payment
              success_url: 'https://secondhand-stories-eb69447276fa.herokuapp.com/home',
              cancel_url: 'https://secondhand-stories-eb69447276fa.herokuapp.com/cart',
            });

            // return the unique checkout link stripe creates for each purchase (auto loaded in front end)
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({stripeURL: session.url}));
        } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: error.message }));
        }
    })();
}
  // Load the home page
  else if (path == "/catalog") {
    (async () => {
      const client = new MongoClient(connStr);
      try {
        await client.connect();
        const db = client.db("secondhand-db");
        const collection = db.collection("books");

        // fetch 6 books to display
        const results = await collection.find({}).limit(6).toArray();

        //read
        fs.readFile("catalog.html", "utf8", function (err, txt) {
          if (err) {
            res.writeHead(500);
            res.end("Error loading catalog.html");
            return;
          }
          const data = `<script>window.myLibraryData = ${JSON.stringify(results)};</script>`;
          const final = txt.replace("<head>", "<head>" + data);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(header + final + footer);
        });
      } catch (err) {
        res.writeHead(500);
        res.end("Database Error: " + err.message);
      } finally {
        await client.close();
      }
    })();
  }
  // Load the home page
  else if (path == "/donate") {
    fs.readFile("donate.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading donate.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  } else if (path == "/process-autofill" && req.method == "POST") {
    // Get the form data
    let body = "";
    // Collect the data
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      // Get the form data
      const formData = querystring.parse(body);
      // Create a new book
      const title = formData.title;
      const isbn = formData.isbn;

      let apiUrl = "";

      if (isbn) {
        apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=AIzaSyAhyo9Gmq82G1N8vJWwaBITJNK0yxOH-wA`;
      } else if (title) {
        apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}&key=AIzaSyAhyo9Gmq82G1N8vJWwaBITJNK0yxOH-wA`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data && data["totalItems"] > 0) {
        const autofillResult = data["items"][0]["volumeInfo"];
        const autofillTitle = autofillResult.title;
        const autofillAuthor = autofillResult.authors[0];

        res.writeHead(302, {
          Location: `/donate?title=${autofillTitle}&author=${autofillAuthor}`,
        });
        res.end();
      } else {
        res.writeHead(302, { Location: `/donate?error=not_found` });
        res.end();
      }
    });
    return;
  }
  // Load the home page
  else if (path == "/about") {
    fs.readFile("about.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading about.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  }
  // Load the home page
  else if (path == "/privacy-policy") {
    fs.readFile("privacyPolicy.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading privacyPolicy.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  } else if (path == "/process-catalog" && req.method == "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const formData = querystring.parse(body);
      //connect mongodb
      const client = new MongoClient(connStr);

      try {
        await client.connect();
        const db = client.db("secondhand-db");

        const collection = db.collection("books");

        //allow for search to be close enough to title to pull information
        let mongoQuery = {};
        if (formData.title) {
          mongoQuery.title = new RegExp(formData.title, "i");
        }
        if (formData.author) {
          mongoQuery.author = new RegExp(formData.author, "i");
        }
        if (formData.genre) {
          mongoQuery.genre = new RegExp(formData.genre, "i");
        }
        if (formData.year) {
          mongoQuery.year = new RegExp(formData.year, "i");
        }

        const results = await collection.find(mongoQuery).toArray();

        fs.readFile("catalog.html", "utf8", function (err, txt) {
          if (err) {
            res.writeHead(500);
            res.end("Error loading catalog");
            return;
          }

          //put results as global variable
          const injectedData = `<script>window.myLibraryData = ${JSON.stringify(results)};</script>`;
          const finalHtml = txt.replace("<head>", "<head>" + injectedData);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(header + finalHtml + footer);
        });
      } catch (err) {
        res.writeHead(500);
        res.end("Database Error: " + err.message);
      } finally {
        await client.close();
      }
    });
    return;
  } else if (path == "/process-donate" && req.method == "POST") {
    // Get the form data
    let body = "";
    // Collect the data
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      // Get the form data
      const formData = querystring.parse(body);
      const isbn = formData.isbn;
      const email = formData.email;

      const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=AIzaSyAhyo9Gmq82G1N8vJWwaBITJNK0yxOH-wA`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      // Extract book data
      const bookData = data.items?.[0]?.volumeInfo;

      if (!bookData) {
        res.writeHead(302, { Location: "/donate?error=not_found" });
        return res.end();
      } else {
        // Create a new book
        const isbn13 = bookData.industryIdentifiers?.find(
          (id) => id.type === "ISBN_13",
        )?.identifier;

        const newBook = {
          title: bookData.title || "Unknown Title",
          author: bookData.authors?.[0] || "Unknown Author",
          year: bookData.publishedDate?.split("-")[0] || "N/A",
          genre: bookData.categories?.[0] || "General",
          isbn: isbn13 || "N/A",
          image: bookData.imageLinks?.thumbnail || "",
        };

        // Connect to MongoDB
        const client = new MongoClient(connStr);

        try {
          await client.connect();
          // Go to this database
          const db = client.db("secondhand-db");
          // Go to this collection
          const collection = db.collection("books");

          try {
            // Go to this database
            const usersDb = client.db("secondhand-db");
            // Go to this collection
            const usersCollection = usersDb.collection("users");
            const existingAccount = await usersCollection.findOne({
              email: email,
            });

            // Check for an existing account
            if (existingAccount) {
              currDonations = existingAccount.donations || 0;
              currCredits = existingAccount.credits || 0;
              currDonations += 1;
              currCredits += 1;
              await usersCollection.updateOne(
                { email: email },
                { $set: { donations: currDonations } },
              );
              await usersCollection.updateOne(
                { email: email },
                { $set: { credits: currCredits } },
              );

              // Insert the new book
              await collection.insertOne(newBook);
            } else {
              res.writeHead(302, { Location: "/login?error=before_donate" });
              return res.end();
            }
          } catch (err) {
            // Catch any errors that come up
            res.writeHead(500);
            return res.end("Database Error: " + err.message);
          }

          // Redirect to login page
          res.writeHead(302, { Location: "/home?status=donate_success" });
          return res.end();
        } catch (err) {
          // Catch any errors that come up
          res.writeHead(500);
          return res.end("Database Error: " + err.message);
        } finally {
          await client.close();
        }
      }
    });
    return;
  } else if (path == "/see-details") {
    (async () => {
      const bookId = urlObj.query.id;
      const client = new MongoClient(connStr);

      try {
        await client.connect();
        const db = client.db("secondhand-db");
        const book = await db
          .collection("books")
          .findOne({ _id: new ObjectId(bookId) });

        if (!book) {
          res.writeHead(404);
          return res.end("Book not found");
        }

        fs.readFile("see_details.html", "utf8", function (err, txt) {
          if (err) {
            res.writeHead(500);
            return res.end("Error loading page");
          }
          const injectedData = `<script>window.selectedBook = ${JSON.stringify(book)};</script>`;
          const finalHtml = txt.replace("<head>", "<head>" + injectedData);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(header + finalHtml + footer);
        });
      } catch (err) {
        res.writeHead(500);
        res.end("Database Error: " + err.message);
      } finally {
        await client.close();
      }
    })();
  }
  // Load the home page
  else if (path == "/about") {
    fs.readFile("about.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading about.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  }

  // Load the home page
  else if (path == "/privacy-policy") {
    fs.readFile("privacyPolicy.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading privacyPolicy.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  }
  // Load the home page
  else if (path == "/terms-of-service") {
    fs.readFile("termsOfService.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading termsOfService.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  }
  // Load the home page
  else if (path == "/leaderboard") {
    fs.readFile("leaderboard.html", function (err, txt) {
      res.writeHead(200, { "Content-Type": "text/html" });
      // Catch any errors
      if (err) {
        res.write("Error loading leaderboard.html");
      } else {
        res.write(header); // Write the pre-loaded header
        res.write(txt);
        res.write(footer); // Write the pre-loaded footer
      }
      res.end();
    });
  } else if (path == "/get-leaderboard") {
    (async () => {
      const client = new MongoClient(connStr);
      try {
        await client.connect();
        const db = client.db("secondhand-db");
        const collection = db.collection("users");

        // Fetch all users sorted by donations descending, limit to top 10
        const topDonors = await collection
          .find(
            {},
            { projection: { firstName: 1, lastName: 1, donations: 1, _id: 0 } },
          )
          .sort({ donations: -1 })
          .limit(10)
          .toArray();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(topDonors));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      } finally {
        await client.close();
      }
    })();
  }

  // For loading our styles!
  else if (path == "/style.css") {
    fs.readFile("style.css", function (err, txt) {
      if (err) {
        res.writeHead(404);
        res.end("Style not found");
      } else {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(txt);
      }
    });
  } // End of style loading

  // For loading images
  else if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    // Determine the file path (assumes images are in the same folder as the script)
    var imagePath = "." + path;

    fs.readFile(imagePath, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end("Image not found");
      } else {
        // Get the extension to set the right header
        var ext = path.split(".").pop();
        res.writeHead(200, { "Content-Type": "image/" + ext });
        res.end(data);
      }
    });
  }

  // In all other cases, the page is not found
  else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("Page not found");
    res.end();
  }
});

server.listen(port); // Listen at this port
