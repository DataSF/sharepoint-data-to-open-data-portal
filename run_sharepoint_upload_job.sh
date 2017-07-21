
#!/bin/bash
#
#bash script to update the asset fields, datadictionary attachments and the master data dictionary


OPTIND=1         # Reset in case getopts has been used previously in the shell.

display_help() {
    echo "Usage: $0 [option...] {d}" >&2
    echo
    echo "   -d, --main_dir   -- main path to package files"
    echo
    echo "   -p, --python path  -- path to python- ie run which python to find out"
    echo
    echo "   -n, --npm path  -- path to npm- ie run: npm bin -g to find out"
    echo
    echo " ***example usage: ./fetch_metadata_fields.sh -d ~/Desktop/fetch-socrata-fields/configs/ -a fieldConfig_desktop.yaml -p /usr/local/bin/python -m fieldConfigMasterDD_desktop.yaml -n /usr/local/bin/npm "
    echo " ***example usage: ./fetch_metadata_fields.sh -d /home/ubuntu/fetch-metadata-fields/configs/ -a fieldConfig_server.yaml -p /home/ubuntu/miniconda2/bin/python -m fieldConfigMasterDD_server.yaml -n /usr/local/bin/npm"
    exit 1
}
# Initialize our own variables:
path_to_main_dir=""
python_path=""
n_path=""

while getopts "h?:d:p:n:" opt; do
    case "$opt" in
    h|\?)
        display_help
        exit 0
        ;;
    d)  path_to_main_dir=$OPTARG
        ;;
    p)  python_path=$OPTARG
        ;;
    n)  npm_path=$OPTARG
        ;;
    esac
done

shift $((OPTIND-1))


#[ "$1" = "--" ] && shift
if [ -z "$path_to_main_dir" ]; then
    echo "*****You must enter a path to main package directory****"
    display_help
    exit 1
fi
if [ -z "$python_path" ]; then
    echo "*****You must enter a path for python****"
    display_help
    exit 1
fi

if [ -z "$npm_path" ]; then
    echo "*****You must enter a path for npm: try- npm bin -g****"
    display_help
    exit 1
fi

npm_path_to_package_json=$path_to_main_dir
config1="configs/"
config_dir=$path_to_main_dir$config1
upload_sharepoint_files="upload_sharepoint_files.py"
upload_sharepoint_files_config="base_config.yaml"

#grab the data
$npm_path run --prefix $npm_path_to_package_json downloadfiles
#load the data to socrata
$python_path $path_to_main_dir$upload_sharepoint_files -c $upload_sharepoint_files_config -d $config_dir
