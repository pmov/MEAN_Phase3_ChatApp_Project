let fs = require("fs");
var msg = "******************** CHAT LOGS **********************\r\n";


let express = require("express");
//const { asap } = require("rxjs");

let app = express();

let bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

let http = require("http").Server(app);

let io = require("socket.io")(http);

//DB start

let obj = require("mongoose");
let url = "mongodb://localhost:27017/chatdb";
const Message = require('./model/messages.model');

const mongoDbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

obj.connect(url, mongoDbOptions).
    then(result => console.log("Database connected successfully")).
    catch(error => console.log("error generated" + error));

//DB End

let serverMessageList = ['How are you', 'It is a good day', 'I like chatting', 'Time to go', 'I am bored'];
const max = serverMessageList.length + 1;
const min = 0;


app.get("/", (req, res) => {
    res.sendFile(__dirname + "\\index.html");
});

app.get("/download", (req, res) => {
    //res.sendFile(__dirname + "\\index.html");
    let username = req.query["user"];
    res.download('hello.txt')
});

//Generate message id asynchronously
let generateId = async (req, res) => {
    let count = await Message.countDocuments();   // number of count documents. 
    console.log("Current count:" + count);
    return count;
}

io.on("connection", (socket) => {

    let nm = "Default Client";
    console.log("Client connected...");
    Message.find({ username: { $eq: nm } }).then(result => {
        socket.emit('output-messages', result)
    })



    
    socket.on("clientName", (msg) => {
        nm = msg;
        console.log("Username:" + nm);
    })
    socket.on("chatmessage", async (msg) => {
        console.log(msg);

       
        /*
        _id:Number,
    username:String,
    clientMessage:String,
    serverResponse:String,
    dateTime:String
        */



        let chatId = await generateId() + 1;

        if (msg == 'hi') {
            const message = new Message({ _id: chatId, username: nm, clientMessage: msg, serverResponse: "hello mam", dateTime: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() });
            message.save().then(() => {
                socket.emit("message", new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()+" : Hello Friend!");
            });
        }
        else if (msg == 'bye') {
            const message = new Message({ _id: chatId, username: nm, clientMessage: msg, serverResponse: "Bye see you later", dateTime: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() });
            message.save().then(() => {
                socket.emit("message", new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()+" : Bye see you later!");
            });
           
        }
        else {

            let resp = serverMessageList[Math.floor(Math.random() * serverMessageList.length)];

            const message = new Message({ _id: chatId, username: nm, clientMessage: msg, serverResponse: resp, dateTime: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() });
            message.save().then(() => {
                socket.emit("message", new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()+" : " + resp );
            });
            
        }

    })

    socket.on("downloadLog", (username) => {
        console.log("Download request for Username:" + username);
        Message.find({ username: { $eq: username } }).then(result => {

            fs.writeFileSync("hello.txt", msg, { flag: "w" });
                      
            result.forEach(c =>{
               // console.log(c);
               console.log(typeof c);
                          
               fs.writeFileSync("hello.txt", `${c['username']} said : ${c['clientMessage']} Server replied : ${c['serverResponse']} \r\n`, { flag: "a+" });
            })
            console.log("Data stored in file again"+result);

        })
    })


})


http.listen(9090, () => console.log("Server running on port 9090"));