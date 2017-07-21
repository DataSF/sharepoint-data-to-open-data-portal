const sppull = require('sppull').sppull
const readYaml = require('read-yaml')
const rmdirRecursiveSync = require('rmdir-recursive').sync
const Cpass = require('cpass').Cpass
const cpass = new Cpass()

function readConfigs (fn) {
  return readYaml.sync(fn)
}

const configsFn = './configs/secured_config.yaml'
const configs = readConfigs(configsFn)

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
    password: cpass.decode(configs.password)
  }
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
  })
