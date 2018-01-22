const sppull = require('sppull').sppull
const readYaml = require('read-yaml')
const rmdirRecursiveSync = require('rmdir-recursive').sync
const Cpass = require('cpass').Cpass
const cpass = new Cpass()
const email   = require("emailjs/email");

function readConfigs (fn) {
  return readYaml.sync(fn)
}

const configsFn = './configs/secured_config.yaml'
const configs = readConfigs(configsFn)

const emailConfigFn  = './configs/email_config_server.yaml'
const emailConfigs = readConfigs(emailConfigFn)
// remove all files in the directory before downloading

const directory = configs.dlRootFolder

try {
  rmdirRecursiveSync(directory)
  console.log(directory + ' removed')
} catch (err) {
  console.log(directory + ' cant removed with status ' + err)
}

// uses cpass to decode password
const context = {
  siteUrl: configs.siteUrl,
  creds: {
    username: configs.username,
    password: cpass.decode(configs.password) + "blahblahblahhhhhhhh"
  }
}

let emailServer = email.server.connect({
   host:   emailConfigs.server_addr,
   port: emailConfigs.server_port,
});

const emailServerFailureMsg = {
   text:    emailConfigs.etl_failure_msg, 
   from:    emaillConfigs.etl_sender_addr, 
   to:      emailConfigs.etl_recipients
   subject: emailConfigs.etl_failure_subject
}
 

const options = {
  // root remote folder
  spRootFolder: configs.spRootFolder,
  // root local download folder
  dlRootFolder: configs.dlRootFolder,
  // don't search for sub-directories inside the root folder
  recursive: false
}

/*
 * All files will be downloaded from http://some.sharepoint.com/subsite/Shared%20Documents/blah folder
 * to __dirname + /Downloads/ folder.
 * If you set recursive to true, folders structure will remain original as it is in SharePoint's target folder.
*/

sppull(context, options)
  .then(function (downloadResults) {
    console.log('Files are downloaded')
    console.log('For more, please check the results', JSON.stringify(downloadResults))
  })
  .catch(function (err) {
    console.log('Core error has happened', err)
    // send the message and get a callback with an error or details of the message that was sent
    emailServer.send( emailServerFailureMsg, function(err, message) { console.log(err || message); });

  })
