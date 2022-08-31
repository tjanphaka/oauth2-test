import axios from "axios";
import express from "express";
import dotenv from "dotenv";

const config = dotenv.config();

// salesforces
const sfBaseUrl = process.env.SF_BASE_URL
const sfClientId = process.env.SF_CLIENT_ID
const sfClientSecret = process.env.SF_CLIENT_SECRET
const sfAuthorizeUrl = `${sfBaseUrl}/services/oauth2/authorize?client_id=${sfClientId}&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Foauth%2Fredirect&response_type=code`;

const app = express();

app.set("view engine", "ejs");

let accessToken;
let refreshToken;

app.get("/oauth/redirect", async (req, res) => {
    try {
        const response = await axios.post(`${sfBaseUrl}/services/oauth2/token`, new URLSearchParams({
            grant_type: "authorization_code",
            code: req.query.code,
            client_id: sfClientId,
            client_secret: sfClientSecret,
            redirect_uri: "http://localhost:8000/oauth/redirect",
        }));

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
    } catch (err) {
        console.error(err.response.data);
    }
    res.redirect('http://localhost:8000');
});

app.post("/oauth/refresh_token", async (req, res) => {
    try {
        const response = await axios.post(`https://login.salesforce.com/services/oauth2/token`, new URLSearchParams({
            grant_type: "refresh_token",
            client_id: sfClientId,
            client_secret: sfClientSecret,
            refresh_token: refreshToken
        }));

        accessToken = response.data.access_token;
    } catch (err) {
        console.error(err.response.data);
    }
    res.redirect('http://localhost:8000');
});

app.post("/oauth/revoke_token", async (req, res) => {
    try {
        const response = await axios.post(`${sfBaseUrl}/services/oauth2/revoke`, new URLSearchParams({
            token: accessToken
        }));
    } catch (err) {
        console.error(err.response.data);
    }
    res.redirect('http://localhost:8000');
});

app.get("/", async (req, res) => {
    res.render("index", {
        accessToken,
        authorizeUrl: sfAuthorizeUrl
    });
})

app.listen(8000, () => {
    console.log("listening on port 8000");
});