var request = require('request');
var fs = require("fs");
var sleep = require('system-sleep');
var config = require('./config');

//Set the headers
var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}
init();
function init(){
	fs.readFile(config.JSON_PATH+config.JSON_NAME, 'utf8', function(err, file) {
		if (err) {
			console.log('File not Found');
			return;
		}
		var obj = JSON.parse(file);
		//console.log(obj);
		var emp = 0;
		for(var i=0;i<obj.length;i++){
			emp++;
			console.log('post number '+emp);
			console.log('post id='+obj[i].id);
			postNew(obj[i]);
			var re_num = obj[i].replies.length;
			sleep(1000*(re_num));
			//if(i>2) break;
		}
	});
}
//貼出新文章
function postNew(obj){
	var title = obj.title;
	var body = obj.body;
	var user = obj.usr == config.AU_SHOW_NAME ? config.AU_NAME : config.API_NAME;
	if(title.length > 200){
		body = title+'\n\n'+body;
		title = title.substring(0, 200)+'...';
	}
	if(body.length==0) body = '內文如標題所示。';
	title = obj.id+'_'+title;
	console.log('user='+user);
	console.log('title ='+title);
	console.log('body ='+body);
	console.log('===============================');
	
	var options = {
		url: config.POST_URI,
		method: 'POST',
		headers: headers,
		form: {
			'title': title,
			'raw': body,
			'category': config.CATEGORY_ID,
			'api_key': config.API_KEY,
			'api_username': config.API_NAME
		}
	}
	// Start the request
	request(options, function (error, response, body) {
		
		if (response.statusCode != 200) {
			var body = JSON.parse(body);
			console.log('post new error='+body.errors+'  '+title);
			console.log('code='+response.statusCode);
			console.log('----------------------------------');
			fs.writeFile('error_'+obj.id+'.log', 'error_code='+response.statusCode+' '+body.errors+'  '+title);
		}else{
			console.log('post new '+title);
			var res = JSON.parse(body);
			console.log(res.topic_id);
			for(var j=0;j<obj.replies.length;j++){
				var reply_user = obj.replies[j].user == config.AU_SHOW_NAME ? config.AU_NAME : config.API_NAME;
				var reply_date = obj.replies[j].date;
				console.log('    reply number='+j);
				console.log('    reply user='+reply_user);
				console.log('    reply date ='+reply_date);
				console.log('    reply body ='+obj.replies[j].body);
				reply(res.topic_id, j+1, obj.replies[j].body, reply_user, reply_date);
				sleep(1000);
			}
		}
	})
	
}
//貼出新文章
function reply(id, num, body, user, date){
	var options = {
		url: config.POST_URI,
		method: 'POST',
		headers: headers,
		form: {
			'topic_id': id,
			'created_at': date,
			'raw': body,
			'category': config.CATEGORY_ID,
			'reply_to_post_number': num,
			'api_key': config.API_KEY,
			'api_username': user
		}
	}
	// Start the request
	request(options, function (error, response, body) {
		console.log('reply new '+num+' '+user);
		//console.log(body)
		if (response.statusCode != 200) {
			var body = JSON.parse(body);
			console.log('reply new error='+body.errors);
			console.log('code='+response.statusCode);
			fs.writeFile('error_reply_'+id+'_'+num+'.log', 'error_code='+response.statusCode+' '+body.errors);
		}
	})
}