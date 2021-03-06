import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import {StaticRouter} from 'react-router';

import App from './App';

const app = express();

const server = http.createServer(app);

const staticFiles = [
    '/static/*',
    '/asset-manifest.json',
    '/manifest.json',
    '/service-worker.js',
    '/favicon.ico',
    '/logo.svg'
];

staticFiles.forEach(file => {
    app.get(file, (req, res) => {
        const filePath = path.join(__dirname, '../build', req.url);
        console.log(filePath);
        res.sendFile(filePath);
    });
});

app.get('*', (req, res) => {
    const html = path.join(__dirname, '../build/index.html');
    const htmlData = fs.readFileSync(html).toString();

    const context: {url?: string}  = {};

    const ReactApp = ReactDOMServer.renderToString(
        React.createElement(
            StaticRouter,
            {location: req.url, context: context},
            React.createElement(App)
        )
    );
    
    if (context.url) {
        res.redirect(301, '/');
    } else {
        const renderedHtml = htmlData.replace('{{SSR}}', ReactApp);
        res.status(200).send(renderedHtml);
    }
});

server.listen(3000);