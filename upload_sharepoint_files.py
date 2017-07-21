# coding: utf-8

#!/usr/bin/env python
from ConfigUtils import *
from SocrataStuff import *
from optparse import OptionParser
from PyLogger import *
from PandasUtils import *
from DictUtils import *
from JobStatusEmailerComposer import *
import glob

def parse_opts():
  helpmsgConfigFile = 'Use the -c to add a config yaml file. EX: fieldConfig.yaml'
  parser = OptionParser(usage='usage: %prog [options] ')
  parser.add_option('-c', '--configfile',
                      action='store',
                      dest='configFn',
                      default=None,
                      help=helpmsgConfigFile ,)

  helpmsgConfigDir = 'Use the -d to add directory path for the config files. EX: /home/ubuntu/configs'
  parser.add_option('-d', '--configdir',
                      action='store',
                      dest='configDir',
                      default=None,
                      help=helpmsgConfigDir ,)
  (options, args) = parser.parse_args()

  if options.configFn is None:
    print "ERROR: You must specify a config yaml file!"
    print helpmsgConfigFile
    exit(1)
  elif options.configDir is None:
    print "ERROR: You must specify a directory path for the config files!"
    print helpmsgConfigDir
    exit(1)

  configDir = None
  configFile = None
  configFile = options.configFn
  configDir  = options.configDir
  return configFile, configDir


def checkIfFilesDownloaded(downloadDirectory):
  downLoadedFiles =  glob.glob(downloadDirectory)
  if(len(downLoadedFiles)) > 0:
    return True
  return False


def parseFile(directory, dataset):
  df_dataset = PandasUtils.loadCsv(directory+ "/"+ dataset['file_name'])
  df_dataset =  PandasUtils.fillNaWithBlank(df_dataset)
  df_dataset_cols = list(df_dataset.columns)
  df_dataset_cols_lower =  [column.lower().replace(" ", "_").replace("-", "_").replace("/", "_") for column in df_dataset_cols]
  field_mapping_dict = dict(zip(df_dataset_cols,  df_dataset_cols_lower ))
  df_dataset = PandasUtils.mapFieldNames(df_dataset, field_mapping_dict)
  dataset_dictList = PandasUtils.convertDfToDictrows(df_dataset)
  return [ DictUtils.filterDictOnBlanks(dataset)for dataset in dataset_dictList]

def main():
  dataset_results = []
  configFile, configDir  =  parse_opts()
  configItems = ConfigUtils.setConfigs(configDir , configFile )
  lg = pyLogger(configItems)
  logger = lg.setConfig()
  sc = SocrataClient(configDir , configItems, logger)
  client = sc.connectToSocrata()
  clientItems = sc.connectToSocrataConfigItems()
  scrud = SocrataCRUD(client, clientItems, configItems, logger)
  sQobj = SocrataQueries(clientItems, configItems, logger)
  df_datasets = PandasUtils.loadCsv(configDir+configItems['datasetMappingCsv'])
  dsse = JobStatusEmailerComposer(configItems, logger)
  datasets = PandasUtils.convertDfToDictrows(df_datasets)
  if(checkIfFilesDownloaded(configItems['srcDataFolder'])):
    for dataset in datasets:
      datasetList = parseFile(configItems['srcDataFolder'], dataset)
      dataset_info = {'Socrata Dataset Name': dataset['dataset_name'], 'SrcRecordsCnt':len(datasetList), 'DatasetRecordsCnt':0, 'fourXFour': dataset['target_fbf'], 'row_id': ''}
      try:
        dataset_info = scrud.postDataToSocrata(dataset_info, datasetList )
        dataset_info['isLoaded'] = 'success'
      except Exception, e:
        print "ERROR OCCURRED"
        print str(e)
        dataset_info['isLoaded'] = 'failed'
      dataset_results.append(dataset_info)
    dsse.sendJobStatusEmail(dataset_results)
  else:
    print "ERRRRROR did not download files"
    for dataset in datasets:
       dataset_info = {'Socrata Dataset Name': dataset['dataset_name'], 'SrcRecordsCnt':0, 'DatasetRecordsCnt':0, 'fourXFour': dataset['target_fbf'], 'row_id': '', 'isLoaded':'failed'}
       dataset_results.append(dataset_info)
    dsse.sendJobStatusEmail(dataset_results, "FAILED: ERROR- could NOT download files from Sharepoint")


if __name__ == "__main__":
    main()

