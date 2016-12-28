var YAML = require('json2yaml')
var ary = {};
var ary2 = [];
var tmp = {};
var tmp2 = {};
var tmp3 = {};
ary["title"] = "2016-12-16 Interview with Daekey Kim, Maekyung Media Group";
ary["date"] = "2016-12-17";
tmp["youtube"] = "https://www.youtube.com/watch?v=ObfnNZHIZT0";
tmp2["Transcript"] = "";
tmp3["Soundcloud"] = "";
ary2.push(tmp);
ary2.push(tmp2);
ary2.push(tmp3);
ary["content"] = ary2;
var json = JSON.stringify(ary);

console.log(json);
console.log(YAML.stringify(ary));
