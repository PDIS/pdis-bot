#!/bin/bash

#
# Notice: please add this line to /etc/crontab of your container
# * * * * * discourse /usr/bin/psql -t --output=/tmp/discourse_posts.json -c "SELECT * FROM _pdis_object_json;"
#

# container id of discourse
CONTAINER_ID=your_container_id

# copy from container to the path of host
sleep 3
/usr/bin/docker cp $CONTAINER_ID:/tmp/discourse_posts.json /root/discourse-updater/pdis-bot/Postgres-Discourse

# exit
exit 0
