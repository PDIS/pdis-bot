SayIt to Discourse Bot
------------------------

###How to RUN
-------------
   - install python2.7 & pip
   - ```pip install -r requirements.txt```
   - change ```config.json.template``` content
   - rename ```config.json.template``` to ```config.json```
   - python SayitDiscourse.py
   - Using Crontab running discupdater.py
     - ```0 * * * * user user /path/discupdater.py```
     - ```0 0 * * 0 user user cd /path && sh discupdater_log.sh```
