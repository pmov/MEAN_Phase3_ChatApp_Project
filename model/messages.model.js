let mongoose = require("mongoose");

mongoose.pluralize(null); // avoid to create collection in lower case as well as add s postfix

//Schema is ready
//objectid, username, client message , server response, date-time
let messageSchema = mongoose.Schema({
    _id:Number,
    username:String,
    clientMessage:String,
    serverResponse:String,
    dateTime:String
});

// Model is ready 1st parameter collection name and second parameter schema
let messageModel = mongoose.model("Messages",messageSchema);

module.exports = messageModel;