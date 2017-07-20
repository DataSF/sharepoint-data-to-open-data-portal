
// utilty script to get a password from the command line,
//  encode a password with cpass, and then write the configs with a password
//  to a new config file.

let prompt = require('prompt')
let readYaml = require('read-yaml')
const Cpass = require('cpass').Cpass
const cpass = new Cpass()
var writeYaml = require('write-yaml')
prompt.start()

function readConfigs (fn) {
  return readYaml.sync(fn)
}

prompt.get(['password', 'baseConfigsDir', 'baseConfigFn', 'config_file_with_password_name'], function (err, result) {
  if (err) { return onErr(err) }
    console.log('Command-line input received:')
    console.log('  Password: ' + result.password)
    console.log(' BaseConfigDir: ' + result.baseConfigsDir)
    console.log(' baseConfigFn: ' + result.baseConfigFn)
    if(! result.config_file_with_password_name){
      result.config_file_with_password_name = 'secured_config.yaml'
    }
    let secured = cpass.encode(result.password)
    let configs = readConfigs(result.baseConfigsDir + '/' + result.baseConfigFn)
    configs.password = secured
    console.log(configs)
    writeYaml(result.baseConfigsDir + '/' + result.config_file_with_password_name , configs, function(err) {
      if(err){
        console.log(err)
      }
    })
  })

function onErr(err) {
  console.log(err)
  return 1
}

