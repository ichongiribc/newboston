/**
 * Created by chiemezieichongiri on 02/04/2016.

 "area_postcode": "BR4 0NQ",
 "area_postcode": "BR1 1QQ",
 "area_postcode": "BR4 9BJ",
 "area_postcode": "BR1 2HR",
 "area_postcode": "BR4 9BN",
 "area_postcode": "BR1 2NY",
 "area_postcode": "BR3 1ED",
 "area_postcode": "BR3 1DY",
 */




// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema
var advertSchema = new Schema({
    username: String,
    email: String,
    postcode: String,
    adverts: [{
        title: String,
        description: String,
        posted_on: Date,
        photos: [{
            alt_text: String,
            source: String
        }]
    }]
});

module.exports = mongoose.model('freecycle', advertSchema);