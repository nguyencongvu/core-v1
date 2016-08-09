var modelName = 'page'; //--edit here movie to user modelName = viewName
var routePath = '/pages';  //--edit here -- routePath+'/:id'

var express = require('express');
var router = express.Router();

router.get(routePath, function(req, res){
    var data = {};
    res.render(modelName+'/home',data);
});


module.exports = router; //middleware 
