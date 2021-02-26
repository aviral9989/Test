
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
const socket_io = require('socket.io');
var mongoose = require('mongoose');
var url = "mongodb://myUserAdmin:iamadmin@localhost:27019/temp?authSource=admin&replicaSet=temp";
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var User = require('./models/user');
var Messages = require('./models/messages');
const { ChangeStream } = require('mongodb');
var app = express();
var arg = app.listen(4000);
var accSid = "AC3a56edf1b8b5e7a8f0f8a21420bc1b6e";
var authToken = "cc56e0054f852a242644dcedbed55fba";
const client = require('twilio')(accSid, authToken);
var io = socket_io(arg);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', indexRouter);
app.use('/users', usersRouter);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const TrustedComms = require('twilio/lib/rest/preview/TrustedComms');


const response = new MessagingResponse()
// catch 404 and forward to error handler
//app.use(function(req, res, next) {
 // next(createError(404));
//});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//var userChangeStream;

 mongoose.connect(url, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
.then(() => {
  console.log(""); 
  
})
var db = mongoose.connection;
const userCollection = db.collection("users");
io.on('connection',function(){
  console.log("Socket working");
})
/*db.once("open",function(){
  console.log("Db is connected");
  const likeChangeStream = userCollection.watch(); 
 



  
app.post('/users',async(req,res)=>{
  /*const userChangeStream = userCollection.watch();  
  userChangeStream.on("change",async(file)=>{
    let users = await User.find({}).lean();
    res.send(users);
  })*/
  try{
    
    let user = new User({
    email:req.body.email,
    userId:req.body.id,
    password:req.body.pass,
    phn:req.body.phn
  })
  //console.log(temp);
  await user.save();
  await client.messages 
      .create({ 
         body: 'Hi,'+user.userId+'.', 
         from: 'whatsapp:+14155238886',       
         to: 'whatsapp:+91'+user.phn 
       }) 
      .then(async(msg) => {
          console.log(msg);
        let temp = new Messages({
            phn:user.phn,
            messages:[]
          });
          temp.messages.push(JSON.stringify(msg));
          await temp.save();
      } )
      
  res.send("User added");
}catch(err){
  if(err) console.log(err);
}
})

app.post('/reply-whatsapp',async(req,res)=>{
  console.log(req.body);
  let phn = (req.body.From).slice(-10);
  let temp = await Messages.findOne({phn:phn});
  temp.messages.push(JSON.stringify(req.body));
  await temp.save();
  //client.messages.create({
//    client.messages 
//let user = await User.findOne({})
client.messages.create({ 
  body: 'You are talking to a bot who cant do anything *yet*', 
  from: 'whatsapp:+14155238886',       
  to: req.body.From
}) 
.then(async(message)=>{
  console.log(message.sid);
  
  temp.messages.push(JSON.stringify(message));
 await temp.save();
}) 
.done();

  //})
  response.message("getting replies!!");
})

app.put('/users',async(req,res)=>{
  
  const userChangeStream = userCollection.watch();  
  userChangeStream.on("update",async(file)=>{
    res.send(file.updateDescription);;
  })
  const userid = req.body.id;
  const password = req.body.pass;
  await User.findOneAndUpdate({userId:userid},{password:password});

})


// Checking change document in DB

likeChangeStream.on("change",async(file)=>{
  console.log(file);
 
   let user = await User.findOne({_id:file.documentKey._id});
   io.emit('likechangedEvent',user.likes);
  // res.redirect('a/'+user.userId+'/likes');
//  res.send("you have "+user.likes+" likes.");
});

// Get Likes by UID
app.get('/:user/likes',async(req,res)=>{
  let user =await User.findOne({userId:req.params.user});
  res.sendFile(__dirname+'/displayLikes.html');
  //
})
app.get('/user/like',(req,res)=>{
    res.sendFile(__dirname+'/like.html');
})
app.post("/user/like",async(req,res)=>{
  ///const userChangeStream = userCollection.watch();
  //userChangeStream.on("change",async(file)=>{
   // res.send("Thanks For liking");
  //})w
  const id = req.body.userId;
  console.log(id);
   let user = await User.findOne({userId:id});
  user.likes = user.likes+1;
  await user.save();
  res.send("Thanks for liking");
})



}); 


module.exports = app;
