#!/bin/bash
NOW=$(date +"%Y%m%d_%H%M%S")
ACCESS_FILE="discupdater_access.$NOW.log"
ACTION_FILE="discupdater_action.$NOW.log"
DIRECTORY="discupdater_log"
LOG_FILE="discupdater.log"

# check log file & folder exist
if [ ! -f "$LOG_FILE" ]; then
  touch $LOG_FILE
fi
if [ ! -d "$DIRECTORY" ]; then
  # Control will enter here if $DIRECTORY doesn't exist.
  mkdir $DIRECTORY
  touch $DIRECTORY/discupdater.00000000_000000.log
fi

# tar old logs
cd $DIRECTORY
FILE_NAME=`ls discupdater.*.log`
FILE="$FILE_NAME.tar.gz"
rm discupdater.*.log
tar -zcvf "$FILE" *.log
rm *.log
cd ..

# cat info from logs
cat $LOG_FILE | grep "discourse_"  > $DIRECTORY/$ACCESS_FILE
cat $LOG_FILE | grep "===== ACTION ====="  > $DIRECTORY/$ACTION_FILE
mv $LOG_FILE $DIRECTORY/discupdater.$NOW.log
