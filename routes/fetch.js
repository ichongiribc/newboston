var express = require('express');
var router = express.Router();
var xml = require('xml');
var validator = require('validator');

var Advert = require('../models/advert');


/* GET fetch  page. */
router.get('/', function(req, res, next) {
    res.render('fetch', { title: 'Fetch - Bromley' });
});

//refs: http://www.sitepoint.com/creating-restful-apis-express-4/

/* GET fetch/adverts  contents from MongoDB */
router.route('/adverts').get(function(req, res) {
    //Advert.find(function(err, adverts) {
    //    if (err) {
    //        return res.send(err);
    //    }
    //
    //    res.json(adverts);
    //});

    //var query =  req.params.q;
    //var limit =  req.params.p;
    //var offset =  req.params.s;

    var limit = 5;
    var offset = 0;


    var xml = '<?xml version="1.0" encoding="utf-8"?><freecycle>';
    //if (req.params.id !== "" && validator.isMongoId(req.params.id)) {

        Advert.find({}, function (err, resultSet) {
            if (err) {
                res.set('Content-Type', 'text/xml');

                xml += "<error> An error occurred: "+ err +"</error></freecycle>";
                return res.send(xml);
            }

            //console.log(resultSet);

            resultSet.forEach(function(result){
                result.adverts.forEach(function(advert){

                    xml += "<advert aid='BRO-" + advert._id + "'>";
                    xml += "<title>" + advert.title + "</title>";
                    xml += "<description>" + advert.description + "</description>";
                    xml += "<area_postcode>" + result.postcode + "</area_postcode>";
                    xml += "<advertiser username='" + result.username + "' email='" + result.email + "' mid='USER-BRO-" + result._id + "'/>";
                    xml += "<posted_on>" + advert.posted_on + "</posted_on>";


                    xml += "<photos>";
                    advert.photos.forEach(function(photo){
                        xml += "<photo height='150' width='150' source='" + photo.source + "' alternate_text='" + photo.alt_text + "'/>";
                    });
                    xml += "</photos>";
                    xml += "</advert>";
                });
            });

            xml += '</freecycle>';
            res.set('Content-Type', 'text/xml');
            res.send(xml);

        });
        //}).skip(offset).limit(limit).sort({title : 1 });

    //}else{
    //    xml = "<freecycle/>";
    //}




});

/* Also POST adverts to MongoDB using  fetch/adverts  */
router.route('/adverts').post(function(req, res) {
        var advert = new Advert(req.body);

        advert.save(function(err) {
            if (err) {
                return res.send(err);
            }

            res.send({ message: 'Advert(s) Added' });
        });
    });

/* UPDATE/PUT fetch/adverts/:id  contents IN MongoDB */
router.route('/adverts/:id').put(function(req,res){

    Advert.findOne({ _id: req.params.id }, function(err, advert) {
        if (err) {
            return res.send(err);
        }

        for (detail in req.body) {
            advert[detail] = req.body[detail];
        }

        // save the movie
        advert.save(function(err) {
            if (err) {
                return res.send(err);
            }

            res.json({ message: 'Advert updated!' });
        });
    });

});
/* GET fetch/adverts/:id  contents from MongoDB */
router.route('/adverts/:aid').get(function(req, res) {
    //Advert.findOne({ _id: req.params.id}, function(err, advert) {
    //    if (err) {
    //        return res.send(err);
    //    }
    //
    //    res.json(advert);
    //});

    var xml = '<?xml version="1.0" encoding="utf-8"?><freecycle>';
    //if (req.params.id !== "") {

    Advert.findOne({'adverts._id': req.params.aid}, function (err, result) {
        if (err) {

            res.set('Content-Type', 'text/xml');
            xml += "<error> An error occurred: "+ err +"</error></freecycle>";
            return res.send(xml);
        }

        var aid = req.params.aid;

                for (var index =0; index < result.adverts.length; index++) {
                    var advert = result.adverts[index];

                    if ( advert._id.toString().localeCompare(aid) ) {
                        xml += "<advert aid='BRO-" + advert._id + "'>";
                        xml += "<title>" + advert.title + "</title>";
                        xml += "<description>" + advert.description + "</description>";
                        xml += "<area_postcode>" + result.postcode + "</area_postcode>";
                        xml += "<advertiser username='" + result.username + "' email='" + result.email + "' mid='USER-BRO-" + result._id + "'/>";
                        xml += "<posted_on>" + advert.posted_on + "</posted_on>";


                        xml += "<photos>";
                        advert.photos.forEach(function (photo) {
                            xml += "<photo height='150' width='150' source='" + photo.source + "' alternate_text='" + photo.alt_text + "'/>";
                        });
                        xml += "</photos>";
                        xml += "</advert>";
                        xml += "</freecycle>";
                        res.set('Content-Type', 'text/xml');
                        return res.send(xml);;
                    }
                }

        xml = '<freecycle/>';
        res.set('Content-Type', 'text/xml');
        return res.send(xml);;
        });
});

/* DELETE fetch/adverts/:id  contents from MongoDB */
router.route('/adverts/:id').delete(function(req, res) {
    Advert.remove({
        _id: req.params.id
    }, function(err, advert) {
        if (err) {
            return res.send(err);
        }

        res.json({ message: 'Successfully deleted' });
    });
});



// GET fetch/adverts/q= matching a title
router.get('/adverts/search',function(req,res){
    var query =  req.query.q;
    var limit =  req.query.p;
    var offset =  req.query.s;
    var xml = "<freecycle>";

    Advert.find({ "title" : new RegExp(query, 'i') } , function(err,items){

        for(x in items){
            xml += "<advert aid='BRO-"+items[x]._id+ "'>";
            xml +="<title>"+items[x].title+"</title>";
           // xml +="<image src='"+items[x].thumbPath+"' alt='Thumbnail picture for item"+items[x].title+"'/>";
            xml +="<description>"+items[x].description+"</description>";
            xml +="<area_postcode>"+items[x].postcode+"</area_postcode>";
            xml +="<photos_count>"+items[x].photos.length+"</photos_count>";
            xml += "</advert>";
        }

        xml += "</freecycle>";

        res.set('Content-Type', 'text/xml');
        res.send(xml);
    }).skip(offset).limit(limit).sort({title : 1 });

});

//http://188.166.157.197:3000/advancedSearch
router.get('/adverts/searchfull',function(req,res) {
    var limit = req.params.p;
    var offset = req.params.s;
    var sort = req.params.sort;

    limit = 5;
    offset = 0;

    if (sort !== "") {
        if (sort == "ASC") {
            sorting = 1;
        } else {
            sorting = -1;
        }
    }

    var xml = "<freecycle>";

    if (req.params.adid !== "" && validator.isMongoId(req.params.adid)) {

        Advert.find({'_id': req.params.adid}, function (err, advert) {
            if (err) {
                return res.send(err);
            }

            for (x in advert) {
                xml += "<advert aid='BRO-" + advert[x].adverts._id + "'>";
                xml += "<title>" + advert[x].adverts.title + "</title>";
                xml += "<description>" + advert[x].adverts.description + "</description>";
                xml += "<area_postcode>" + advert[x].postcode + "</area_postcode>";
                xml += "<advertiser username='" + advert[x].username + "' email='" + advert[x].email + "' mid='" + advert[x]._id + "'/>";
                xml += "<posted_on>" + advert[x].adverts.posted_on + "</posted_on>";
                xml += "<photos>";
                advert[x].adverts.photos.forEach(function (photo) {
                    xml += "<photo height='150' width='150' source='" + photo.source + "' alternate_text='" + photo.alt_text + "'/>";
                });
                xml += "</photos>";
                xml += "</advert>";
            }

            xml += "</offers>";
            res.set('Content-Type', 'text/xml');
            res.send(xml);
        }).skip(offset).limit(limit).sort({title: sorting});

    }
});


module.exports = router;
