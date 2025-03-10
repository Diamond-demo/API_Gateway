const express = require('express');
const app = express();

const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; // Corrected variable name

const REGISTER_IP = process.env.REGISTER_IP;
const LOGIN_IP = process.env.LOGIN_IP;
const UPDATE_IP = process.env.UPDATE_IP;
const SEARCH_IP = process.env.SEARCH_IP;
const VIEW_IP = process.env.VIEW_IP;
const ADD_IP = process.env.ADD_IP;
const DELETE_IP = process.env.DELETE_IP;

const port = 5000;

app.get("/", (req, res) => {
    console.log("API Gateway is running..")
    return res.send("API Gateway is running..")
});

function authToken(req, res, next) {

    const header = req.headers.authorization;
    const token = header && header.split(' ')[1];

    if (token == null) return res.status(401).json({ message: "Please send token" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token", error: err });
        req.user = user;
        next();
    });
}

function authRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        next();
    };
}

app.use('/register', (req, res) => {
    console.log("INSIDE API GATEWAY REGISTRATION");
    proxy.web(req, res, { target: `http://${REGISTER_IP}:5001` }); // Assuming registration is part of auth service
});

app.use('/auth', (req, res) => {
    console.log("INSIDE API GATEWAY AUTHENTICATION/LOGIN");
    proxy.web(req, res, { target: `http://${LOGIN_IP}:5002` }); // Assuming login is part of auth service
});

app.use('/update-product', authToken, authRole('admin'), (req, res) => {
    console.log("INSIDE API GATEWAY UPDATE PRODUCT");
    proxy.web(req, res, { target: `http://${UPDATE_IP}:5003` });
});

app.use('/search-product', authToken, (req, res) => {
    console.log("INSIDE API GATEWAY SEARCH PRODUCT");
    proxy.web(req, res, { target: `http://${SEARCH_IP}:5004` });
});

app.use('/view-product', authToken, (req, res) => {
    console.log("INSIDE API GATEWAY VIEW PRODUCT");
    proxy.web(req, res, { target: `http://${VIEW_IP}:5005` });
});


app.use('/add-product', authToken, authRole('admin'), (req, res) => {
    console.log("INSIDE API GATEWAY ADD PRODUCT");
    proxy.web(req, res, { target: `http://${ADD_IP}:5006` });
});

app.use('/delete-product', authToken, authRole('admin'), (req, res) => {
    console.log("INSIDE API GATEWAY DELETE PRODUCT");
    proxy.web(req, res, { target: `http://${DELETE_IP}:5007` });
});

app.listen(port, () => {
    console.log("API Gateway Service is running on PORT NO:", port);
});
