var http = require('http');
var url = require('url');
var fs = require('fs');
// var port = process.env.PORT || 3000;
var port = 8080;   // uncomment to run local

const MongoClient = require('mongodb').MongoClient;
const connStr = "mongodb+srv://database_user:db123@stock.zrcipph.mongodb.net/?appName=SecondhandStories";


console.log("Server ready");

// Create the server
var server = http.createServer(function (req, res) {
    
    // Parse the url to get the form inputs
    urlObj = url.parse(req.url, true);

    // Load the home page
    if (req.url == "/home") {
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
    else if (req.url == "/login") {
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
    // Load the home page
    else if (req.url == "/signup") {
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
    // Load the home page
    else if (req.url == "/cart") {
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
    else if (req.url == "/catalog") {
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
    else if (req.url == "/donate") {
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
    else if (req.url == "/about") {
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
    else if (req.url == "/privacy-policy") {
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
    else if (req.url == "/terms-of-service") {
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
    else if (req.url == "/leaderboard") {
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
    else if (urlObj.pathname == "/style.css") {
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
    else if (urlObj.pathname.match(/\.(jpg|jpeg|png|gif)$/)) {
        // Determine the file path (assumes images are in the same folder as the script)
        var imagePath = "." + urlObj.pathname; 
        
        fs.readFile(imagePath, function(err, data) {
            if (err) {
                res.writeHead(404);
                res.end("Image not found");
            } else {
                // Get the extension to set the right header
                var ext = urlObj.pathname.split('.').pop();
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
