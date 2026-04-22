var http = require('http');
var url = require('url');
var fs = require('fs');
const querystring = require('querystring');
// var port = process.env.PORT || 3000;
var port = 8080;   // uncomment to run local

const MongoClient = require('mongodb').MongoClient;
const connStr = "mongodb+srv://login_user:db123@leaderboard.gw09mzd.mongodb.net/?appName=leaderboard";


console.log("Server ready");

// Create the server
var server = http.createServer(function (req, res) {
    
    // Parse the url to get the form inputs
    urlObj = url.parse(req.url, true);
    var path = urlObj.pathname;

    // Load the home page
    if (path == "/home") {
        fs.readFile("home.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading home.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    // Load the home page
    else if (path == "/login") {
        fs.readFile("login.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading login.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    else if (path == "/process-login" && req.method == 'POST') {
        
        let body = "";

        // Collect the data chunks
        req.on('data', chunk => {
            body += chunk.toString();
        });

        // Once all data is received
        req.on('end', async () => {
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
                const matchingUser = await collection.findOne({ "email": email, "password": pass });
                console.log(JSON.stringify(matchingUser));

                if (matchingUser) {
                    // Success! Redirect to home or show success
                    res.writeHead(302, { 'Location': '/home' });
                    res.end();
                } else {
                    // Failure
                    res.writeHead(302, { 'Location': '/login?error=true' });
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
        fs.readFile("signup.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading signup.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }

    else if (path == "/process-signup" && req.method == 'POST') {
        let body = "";
        // Collect the data
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            // Get the form data
            const formData = querystring.parse(body);
            // Create a new user
            const newUser = {
                "firstName": formData.first,
                "lastName": formData.last,
                "email": formData.email,
                "password": formData.password,
                "donations": 0 // New users have 0 donations
            }
            // Connect to MongoDB
            const client = new MongoClient(connStr);
            
            try {
                await client.connect();
                // Go to this database
                const db = client.db("secondhand-db");
                // Go to this collection
                const collection = db.collection("users");

                const existingAccount = await collection.find({"email": newUser.email});

                // Check for an existing account
                if (existingAccount) {
                    res.writeHead(302, { 'Location': '/signup?error=true' });
                    console.log(JSON.stringify(existingAccount));
                    res.end();
                }
                else {
                    // Insert a new user
                    const result = await collection.insertOne(newUser);

                    // Redirect to login page
                    res.writeHead(302, { 'Location': '/login' });
                    res.end();
                }
            }
            // Catch any errors that come up
            catch (err) {
                res.writeHead(500);
                res.end("Database Error: " + err.message);
            }
            finally {
                await client.close();
            }
        });
        return;
    }
    
    // Load the home page
    else if (path == "/cart") {
        fs.readFile("cart.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading cart.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    // Load the home page
    else if (path == "/catalog") {
        fs.readFile("catalog.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading catalog.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    // Load the home page
    else if (path == "/donate") {
        fs.readFile("donate.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading donate.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    // Load the home page
    else if (path == "/about") {
        fs.readFile("about.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading about.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    // Load the home page
    else if (path == "/privacy-policy") {
        fs.readFile("privacyPolicy.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading privacyPolicy.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    // Load the home page
    else if (path == "/terms-of-service") {
        fs.readFile("termsOfService.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading termsOfService.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    // Load the home page
    else if (path == "/leaderboard") {
        fs.readFile("leaderboard.html", function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            // Catch any errors
            if (err) {
                res.write("Error loading leaderboard.html");
            } else {
                res.write(txt);
            }
            res.end();
        });
    }
    // For loading my styles!
    else if (path == "/style.css") {
        fs.readFile("style.css", function(err, txt) {
            if (err) {
                res.writeHead(404);
                res.end("Style not found");
            } else {
                res.writeHead(200, {'Content-Type': 'text/css'});
                res.end(txt);
            }
        });
    } // End of style loading

    // For loading images
    else if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        // Determine the file path (assumes images are in the same folder as the script)
        var imagePath = "." + path; 
        
        fs.readFile(imagePath, function(err, data) {
            if (err) {
                res.writeHead(404);
                res.end("Image not found");
            } else {
                // Get the extension to set the right header
                var ext = path.split('.').pop();
                res.writeHead(200, {'Content-Type': 'image/' + ext});
                res.end(data);
            }
        });
    }

    // In all other cases, the page is not found
    else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write("Page not found");
        res.end();
    }
});

server.listen(port); // Listen at this port
