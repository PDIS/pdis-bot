var YouTube = require('youtube-node');
var YAML = require('yamljs');
var request = require('request');
var fs = require("fs");
var config = require('./config');

//Set the headers
var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}
var topic_ary = [];
var topic_obj = [];
var page = 0;
var length = 0;
//取得討論分類內已有的文章列表
getTopic();
function getTopic(){
	var opts = {
		url: config.GET_URI+page,
		method: 'GET',
		headers: headers,
		form: {
			'api_key': config.API_KEY,
			'api_username': config.API_NAME
		}
	}
	request(opts, function (error, response, results) {
		if (!error && response.statusCode == 200) {
			var res = JSON.parse(results);
			length = res.topic_list.topics.length;
			//console.log('length='+length);
			for (var i = 0; i < length; i++) {
				var title = res.topic_list.topics[i].title;
				var chk = title.lastIndexOf('-');
				if(chk > -1){
					title = title.substring(chk+3, title.length);
				}
				var id = res.topic_list.topics[i].id;
				topic_ary.push(title.toUpperCase());
				topic_obj[title.toUpperCase()] = id;
				//console.log(res.topic_list.topics[i]);
			}
			//console.log(topic_obj);
			if(length>0) {
				page++;
				getTopic();
			}else{
				postTo();
			}
		}else{
			console.log('get topic list error='+error+' '+response.statusCode);
		}
	})
}
/*
fs.readFile(config.JSON_PATH+config.JSON_NAME, 'utf8', function(err, file) {
	if (err) {
		//console.log('File not Found');
		return;
	}
	var obj = JSON.parse(file);
	for(var v in obj[0].object){
		//console.log(obj[0].object[v].topic_id);
		//console.log(obj[0].object[v].post_id);
		//console.log(obj[0].object[v].title);
		var title = obj[0].object[v].title;
		var chk = title.lastIndexOf('-');
		if(chk > -1){
			title = title.substring(chk+3, title.length);
		}
		var id = obj[0].object[v].topic_id;
		topic_ary.push(title.toUpperCase());
		topic_obj[title.toUpperCase()] = id;
	}
	//console.log(topic_obj);
	//postTo();
});
*/
//介接與發文
function postTo(){
	//取得頻道內所有的影片列表
	var youTube = new YouTube();
	youTube.setKey(config.YOUTUBE_KEY);
	youTube.getChannelById(config.CHANNEL_ID, function(error, results) {
		if (error) {
			console.log('getChannelById error='+error);
		}else {
		//console.log(JSON.stringify(results, null, 2));
		//取得頻道內所有影片資訊
		for(var i in results.items) {
			var item = results.items[i];
			var playlistId = item.contentDetails.relatedPlaylists.uploads;
			for (var i = 0; i < results.items.length; i++) {
				yt1 = new YouTube();
				yt1.setKey(config.YOUTUBE_KEY);
				yt1.getPlayListsItemsById(playlistId, function(error, result) {
					if (error) {
						console.log('getPlayListsItemsById error='+error);
					}else {
						//console.log(JSON.stringify(result, null, 2));
						//取得單一影片資訊
						for (var j = 0; j < result.items.length; j++) {
							var playlistItem = result.items[j];
							var videoId = playlistItem.snippet.resourceId.videoId;
							yt2 = new YouTube();
							yt2.setKey(config.YOUTUBE_KEY);
							yt2.getById(videoId, function(error, result) {
								if (error) {
									console.log('getById error='+error);
								}else {
									//console.log(JSON.stringify(result, null, 2));
									var id = result.items[0].id;
									var date = result.items[0].snippet.publishedAt;
									var title = result.items[0].snippet.title;
									var desc = result.items[0].snippet.description;
									date = date.substring(0, date.indexOf('T'));
									var chk = title.lastIndexOf('-');
									//檢查標題是否含有日期，有就取用標題日期
									if(chk > -1){
										date = title.substring(0, title.indexOf(' '));
										title = title.substring(title.indexOf(' ')+1, title.length);
									}
									//console.log(id+" "+date+" "+title);
									//檢查影片是否已存在要介接的討論區，沒有就介接並發文
									if(!inArray(title.toUpperCase(), topic_ary)){
										postNew(id, title, date);
										/*
										var options = {
											url: config.POST_URI,
											method: 'POST',
											headers: headers,
											form: {
												'title': title,
												'created_at': date,
												'raw': setContent(id),
												'category': config.CATEGORY_ID,
												'api_key': config.API_KEY,
												'api_username': config.API_NAME
											}
										}
										// Start the request
										request(options, function (error, response, body) {
											//console.log('post new '+title);
											if (!error && response.statusCode == 200) {
												// Print out the response body
												//console.log(body)
											}else{
												//console.log('error='+error+' '+response.statusCode);
											}
										})
										*/
									}else{
										//已存在文章檢查是否需要更新
										var tid = topic_obj[title.toUpperCase()];
										//console.log('repeat: '+tid);
										var options = {
											url: config.TOPIC_URI+tid+'.json?include_raw=1',
											method: 'GET',
											headers: headers,
											form: {
												'api_key': config.API_KEY,
												'api_username': config.API_NAME
											}
										}
										// Start the request
										request(options, function (error, response, result) {
											//console.log('get topic');
											if (!error && response.statusCode == 200) {
												var res = JSON.parse(result);
												var raw = YAML.parse(res.post_stream.posts[0].raw);
												var stream_id = res.post_stream.stream[0];
												var hasTag = -1;	//是否有youtube標籤
												var needUpdate = 0;	//是否需要更新
												//console.log("length="+raw.content.length);
												for(var i=0;i<raw.content.length;i++){
													for(var v in raw.content[i]){
														if(v==config.TAGNAME) hasTag = i;
													}
												}
												if(hasTag >=0){
													if(raw.content[hasTag].Youtube==undefined || raw.content[hasTag].Youtube==""){
														raw.content[hasTag].Youtube = config.YOUTUBE_URI+id;
														//raw.date = date;
														var yaml = obj2yaml(raw);
														needUpdate = 1;
													}
												}else{
													var tmp = {};
													tmp[config.TAGNAME] = config.YOUTUBE_URI+id;
													raw.content.push(tmp);
													//raw.date = date;
													var yaml = obj2yaml(raw);
													needUpdate = 1;
												}
												if(needUpdate){
													//console.log(config.POST_URI+'/'+stream_id);
													var options = {
													url: config.POST_URI+'/'+stream_id,
													method: 'PUT',
													headers: headers,
													form: {
														'post[raw]': yaml,
														'api_key': config.API_KEY,
														'api_username': config.API_NAME
													}
												}
												// Start the request
												request(options, function (error, response, body) {
													//console.log('update old');
													if (!error && response.statusCode == 200) {
														// Print out the response body
														//console.log(body)
													}else{
														console.log('update post error='+error+' '+response.statusCode);
													}
												})
												}
											}else{
												console.log('get topic error='+error+' '+response.statusCode);
											}
										})
									}
								}
							});
							//break;
						}
					}
				});
			}
		}
	  }
	});
}
//貼出新文章
function postNew(id, title, date){
	//console.log('post new');
	var options = {
		url: config.POST_URI,
		method: 'POST',
		headers: headers,
		form: {
			'title': title,
			'created_at': date,
			'raw': setContent(id),
			'category': config.CATEGORY_ID,
			'api_key': config.API_KEY,
			'api_username': config.API_NAME
		}
	}
	// Start the request
	request(options, function (error, response, body) {
		//console.log('post new '+title);
		//console.log(body)
		if (error && response.statusCode != 200) {
			console.log('post new error='+error+' '+response.statusCode);
		}
	})
}
//產生文章內容
function setContent(id){
	var obj = {};
	var obj2 = {};
	var ary = [];
	
	obj2[config.TAGNAME] = config.YOUTUBE_URI+id;
	ary.push(obj2);
	obj["content"] = ary;
	//var json = JSON.stringify(obj);
	var yaml = obj2yaml(obj);
	//console.log(json);
	//console.log(yaml);
	return yaml;
}
//是否在陣列內
function inArray(str, ary) {
    var length = ary.length;
    for(var i = 0; i < length; i++) {
        if(ary[i] == str) return true;
    }
    return false;
}
//物件轉yaml，刪除不要的'{}
function obj2yaml(str){
	var yaml = YAML.stringify(str);
	yaml = yaml.replace(/[\'\{\}]/g, "");
	return yaml;
}
// parse a date in yyyy-mm-dd format
function parseDate(input) {
  var parts = input.split('-');
  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[0], parts[1]-1, parts[2]); // Note: months are 0-based
}
