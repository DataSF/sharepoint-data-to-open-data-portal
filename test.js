var email 	= require("emailjs/email");
var server 	= email.server.connect({
   host:    "10.1.3.216", 
   port: 25,
});
 
// send the message and get a callback with an error or details of the message that was sent
server.send({
   text:    "i hope this works", 
   from:    "you <username@your-email.com>", 
   to:      "janine.heiser@sfgov.org",
   cc:      "else <else@your-email.com>",
   subject: "testing emailjs"
}, function(err, message) { console.log(err || message); });
