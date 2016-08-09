// -- local     
var dbName = 'socialCRM'; //--EDIT in config 
var connectionString = 'mongodb://localhost:27017/' + dbName;

//-- Openshift 
if (process.env.OPENSHIFT_MONGODB_DB_URL){
    dbName = "crm";
    connectionString = process.env.OPENSHIFT_MONGODB_DB_URL + dbName;
    //connectionString = "mongodb://admin:wn9bHy6xpnPu@$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/"+ dbName;
}

//-- mLab mongodb -- khong dung!
var mLab = false; 
if (mLab==true) { 
    dbName = 'web01'; //--EDIT in config 
    connectionString = 'mongodb://admin:admin@ds023694.mlab.com:23694/'+ dbName;
} 

module.exports = {
    'connectionString': connectionString
};