const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')
const app = express();
const port = process.env.PORT || 5000
var zipcodes = require('zipcodes-nearby');


function getCoord(latitude, longitude, dist){
    console.log(latitude, longitude, dist)
    return zipcodes.near({longitude: longitude, latitude: latitude}, dist, { datafile: 'zipcodes.csv' })
}

app.use(express.static(path.join(__dirname, 'build')));

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/express_backend', (req, res) => {
    console.log(req)
    getCoord(req.query.latitude, req.query.longitude, req.query.dist).then(function(results) {
        res.send({express: 'Connected to react!', results: results})
    });
})