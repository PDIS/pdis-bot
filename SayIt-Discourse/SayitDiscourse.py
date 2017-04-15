# encoding: utf-8
from HTMLParser import HTMLParser
import time
import urllib2
import requests
import json
import yaml
from lxml import etree



class MLStripper(HTMLParser):
    def __init__(self):
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)

def strip_tags(html):
    try:
        s = MLStripper()
        s.feed(html)
        return s.get_data()
    except:
        return html

with open('config.json', 'r') as f:
    config = json.load(f)

hdr = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
       'Accept-Encoding': 'none',
       'Accept-Language': 'en-US,en;q=0.8',
       'Connection': 'keep-alive'}

request = urllib2.Request(config['sayit-url']+"speeches", headers=hdr)
response = urllib2.urlopen(request)
html = response.read()

#print html
page = etree.HTML(html)

for txt in page.xpath(u"//li/span/a"):
    txt_title = txt.text
    txt_url = config['sayit-url'] + txt.values()[0]
    if txt.text[:6] == "2016-1":
        txt_date = txt.text[:10]
        raw = {}
        raw['title'] = txt_title
        raw['date'] = txt_date
        raw['category'] = None
        raw['tags'] = ['transcript']
        raw['participants'] = ['PDIS']
        raw['content'] = [
            {"Transcript":txt_url}
        ]
        # print yaml.dump(raw,default_flow_style=False)
        # post to pdis discourse
        
        url = "https://talk.pdis.nat.gov.tw/posts?api_key="+config['discourse-api-key']+\
            "&api_username="+config['discourse-api-username']

        post_details = {
            "title":  txt_title,
            "raw": yaml.safe_dump(raw, encoding='utf-8', allow_unicode=True, default_flow_style=False),
            "category": config['discourse-category-id']
            }
        resp = requests.post(url, data=post_details, allow_redirects=True, verify=False)
        print post_details
        time.sleep(3)
    else:
        print '{"url":"' + 'https://sayit.pdis.nat.gov.tw'+txt.values()[0]+'", "title":"'+txt.text + '"}'
    
