# Postgres-Discourse
---
## setting
Please modify `CONTAINER_ID` of `discourse_cronjob.sh` 
```
# container id of discourse
CONTAINER_ID=your_container_id
```

## add views in postgres
execute this line in container
```
# sudo -u discourse psql -c 'CREATE VIEW _pdis_object AS select tl.topic_id AS topic_id, p.id AS post_id, t.title FROM topics t, posts p, topic_links tl WHERE t.category_id = 13 AND tl.topic_id = t.id AND tl.post_id = p.id AND post_number = 1 GROUP BY tl.topic_id, p.id, t.title ORDER BY p.id;'
# sudo -u discourse psql -c 'CREATE VIEW _pdis_object_json AS select array_to_json(array_agg(obj_json)) FROM (SELECT now() AS ts, count(*) AS count, array_to_json(array_agg(_pdis_object)) AS object FROM _pdis_object) obj_json;'
```

## add to crontab
- at host:
```
# echo '* * * * * root /root/discourse-updater/pdis-bot/Postgres-Discourse/discourse_cronjob.sh' >> /etc/crontab
```
- at discourse container:
```
# echo '* * * * * discourse /usr/bin/psql -t --output=/tmp/discourse_posts.json -c "SELECT * FROM _pdis_object_json;"' >> /etc/crontab
```

##
