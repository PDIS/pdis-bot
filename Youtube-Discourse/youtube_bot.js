var YouTube = require('youtube-node');
var channel_id = 'UCExDf4hkbSU-pmJcyT_sDtg';
var youtube_key = 'AIzaSyD8F5XTORodGF6CdIVhRLx5mWEtg8w3gPc';

var category_id = '12';//隨意測試區
var post_uri = 'https://talk.pdis.nat.gov.tw/posts';
var get_uri = 'https://talk.pdis.nat.gov.tw/c/'+category_id+'.json';
//var api_key = '5345d7f5424ff8d2c1bc16ab1f115c7de218be4a8c4841f965b843d310eab1ab';
//var api_name = 'targee';
var api_key = '7af653838dfd6e9f1ed9b25bb447f298b5e855b48dbf22ead2abf5bd74d19576';
var api_name = 'youtube2discourse';
var request = require('request');

//Set the headers
var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}
var topic_ary = [];
var opts = {
    url: get_uri,
    method: 'GET',
    headers: headers,
    form: {
		'api_key': api_key,
		'api_username': api_name
	}
}
// Start the request
request(opts, function (error, response, results) {
    if (!error && response.statusCode == 200) {
		var res = JSON.parse(results);
        //console.log(res);
		for (var i = 0; i < res.topic_list.topics.length; i++) {
			var title = res.topic_list.topics[i].title;
			topic_ary.push(title.toUpperCase());
			//console.log(title);
		}
		console.log(topic_ary);
		postTo();
    }else{
		console.log('error='+error+' '+response.statusCode);
	}
})
function postTo(){
	var youTube = new YouTube();
	youTube.setKey(youtube_key);
	youTube.getChannelById(channel_id, function(error, results) {
		if (error) {
			console.log(error);
		}else {
		//console.log(JSON.stringify(results, null, 2));
		for(var i in results.items) {
			var item = results.items[i];
			var playlistId = item.contentDetails.relatedPlaylists.uploads;

			for (var i = 0; i < results.items.length; i++) {
				yt1 = new YouTube();
				yt1.setKey(youtube_key);
				yt1.getPlayListsItemsById(playlistId, function(error, result) {
					if (error) {
						console.log(error);
					}else {
						//console.log(JSON.stringify(result, null, 2));
						
						for (var j = 0; j < result.items.length; j++) {
							var playlistItem = result.items[j];
							var videoId = playlistItem.snippet.resourceId.videoId;
							yt2 = new YouTube();
							yt2.setKey(youtube_key);
							yt2.getById(videoId, function(error, result) {
								if (error) {
									console.log(error);
								}else {
									//console.log(JSON.stringify(result, null, 2));
									var id = result.items[0].id;
									var date = result.items[0].snippet.publishedAt;
									var title = result.items[0].snippet.title;
									var desc = result.items[0].snippet.description;
									date = date.substring(0, date.indexOf('T'));
									console.log(id+" "+date+" "+title+" "+desc);
									if(!inArray(title.toUpperCase(), topic_ary)){
										// Configure the request
										var options = {
											url: post_uri,
											method: 'POST',
											headers: headers,
											form: {
												'title': title,
												'raw': setContent(id, title, desc, date),
												'category': category_id,
												'api_key': api_key,
												'api_username': api_name
											}
										}
										// Start the request
										request(options, function (error, response, body) {
											console.log('post new');
											if (!error && response.statusCode == 200) {
												// Print out the response body
												console.log(body)
											}else{
												console.log('error='+error+' '+response.statusCode);
											}
										})
									}else{
										console.log('repeat: '+title);
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
function setContent(id, title, desc, date){
	var str = '';
	str += "title:"+title+"<br>";
	str += "description:"+desc+"<br>";
	str += "date:"+date+"<br>";
	str += "category:<br>";
	str += "tags:<br>";
	str += "participants:"+"<br>";
	str += "content:";
	str += "<ul>";
	str += '<li>youtube:<a href="https://www.youtube.com/watch?v='+id+'">https://www.youtube.com/watch?v='+id+'</li>';
	str += "<li>Transcript:</li>";
	str += "<li>Soundcloud:</li>";
	str += "<li>Slido:</li>";
	str += "<li>Wiselike:</li>";
	str += "</ul>";
	return str;
}

function inArray(str, ary) {
    var length = ary.length;
    for(var i = 0; i < length; i++) {
        if(ary[i] == str) return true;
    }
    return false;
}
