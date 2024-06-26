const express = require('express');
const router = express.Router();
const db = require('../db');

const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// API Routes

/* Home */

router.get('/', function (req, res, next) {
  res.redirect('../');
});

// End Points
router.use(express.json())

// Create a new login token
function createNewToken(username) {
    
    // Create token object to store in DB
    const newToken = {
        id: crypto.randomBytes(64).toString('hex'),
        username: username,
        timestamp: new Date().getTime()
    }

    // Store token object in DB
    db.run(`INSERT INTO sessions (id, username, timestamp) VALUES('${newToken.id}', '${newToken.username}', '${newToken.timestamp}');`, (error) => {
        if (error) console.log(error);
    })

    // Return the object
    return newToken;
}

// This route will return the user object containing all information about the user when called with a valid user token
router.get('/me', async function requestHandler(req, res) {
    if (!req.headers.authorization) return res.status(403).json({ status: 403, error: 'No credentials sent!' });

    // Check token against SQL database
    db.get(`SELECT * FROM sessions WHERE id = '${req.headers.authorization}';`, (error, row) => {
        if (error) {
            console.log(error);
        }

        // If token cannot be found, return 403 error
        if (!row) {
            res.sendStatus(403);
        } else {
            // Otherwise return the user object
            db.get(`SELECT * FROM users WHERE id = '${row.username}';`, (error, row) => {
                if (error) {
                    console.log(error);
                }
                res.json(row);
            });
        }
  });
});

// This endpoint authenticates the user based on credentials sent from a POST request 
router.post('/login', async function requestHandler(req, res) {
    // Grab credentials from request body
    const username = req.body.username;
    const password = req.body.password;

    // Ensure that the body contains both a username and password
    if (username != null && password != null) {
        // Search in the database for that username
        db.get(`SELECT * FROM users WHERE id = '${username}';`,
        (error, row) => {
            if (error) {
                console.log(error);
            }
            // If the username does not exist in the database, send 404.
            if (row != null && row.password != null) {
                bcrypt.compare(password, row.password, function(error, result) {
                    if (error) {
                        console.log(err)
                    }
                    if (result) {
                        // Make new login token and save in database.
                        // First we want to make sure there are no current tokens.
                        db.get(`SELECT * FROM sessions WHERE username = '${username}';`, (error, row) => {
                            // If row exists, we want to delete it.
                            if (error) {
                                console.log(error);
                            }

                            if (row != null) {
                                db.run(`DELETE FROM sessions WHERE username = '${username}'`, (error) => {
                                    if (error) console.log(error);
                                })

                                let token = createNewToken(username);
                                return res.json(token);
                            } else {
                                // Otherwise we want to make a new session.
                                let token = createNewToken(username);
                                return res.json(token);
                            }
                        });
                    } else {
                        return res.sendStatus(403);
                    }
                });
                
            } else {
                return res.sendStatus(403);
            }
        });
    } else {
        return res.sendStatus(403);
    }
  });

  router.post('/logout', async function requestHandler(req, res) { 
    const id = req.body.id;
    if (id != null) {
        db.get(`SELECT * FROM sessions WHERE id = '${id}';`, (error, row) => {
            if (row != null) {
                db.run(`DELETE FROM sessions WHERE id = '${id}'`, (error) => {
                    if (error) console.log(error);
                })
            }
            return res.sendStatus(200);
        });
    } else {
        res.sendStatus(403);
    }
  });

module.exports = router;
