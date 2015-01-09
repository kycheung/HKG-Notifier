chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		var storage = chrome.storage.local;
		if (request.action == "bookmark") {
			var url = request.url;
			var post_id = url.match(/http:\/\/.+hkgolden\.com\/.+message=([0-9]+)/)[1];
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, false);
			xhr.send(null);
			if(xhr.status == 200) {
				var title = xhr.responseText.match(/<Attribute name="title">(.*?)<\/Attribute>/)[1];
				var last_viewed_time = xhr.responseText.match(/<Attribute name="last_update">(.*?)<\/Attribute>/)[1];
				var num_of_replies = xhr.responseText.match(/([0-9]+).+?個回應/)[1];
				var object = {"url":url, "title":title, "last_viewed_time":last_viewed_time, "num_of_replies":num_of_replies, "new_reply":false, "post_id":post_id};
				obj = {}; obj[post_id] = object;
				storage.set(obj, function (){
					sendResponse({msg: title + " Bookmarked", "post_id":post_id, "title":title, "last_viewed_time":last_viewed_time, "num_of_replies":num_of_replies, "url":url});
				});
			}
		} else if (request.action == "query") {
			storage.get(null, function(items) {
				sendResponse(items);
			});
		} else if (request.action == "clear") {
			storage.clear(function() {
				sendResponse({msg : "All bookmarks are clear!"});
			});
		} else if (request.action == "refresh") {
			storage.get(null, function(items) {
				var keys = Object.keys(items);
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i]; 
					var post_id = items[key].post_id;
					var url = items[key].url;
					var title = items[key].title;
					
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url, false);
					xhr.send(null);
					if (xhr.status == 200) {
						var last_viewed_time = xhr.responseText.match(/<Attribute name="last_update">(.*?)<\/Attribute>/)[1];
						var num_of_replies = xhr.responseText.match(/([0-9]+).+?個回應/)[1];
						var new_reply;
						if (num_of_replies != items[key].num_of_replies) {new_reply = true;} else {new_reply = items[key].new_reply;}
						console.log(new_reply);
						var object = {"url":url, "title":title, "last_viewed_time":last_viewed_time, "num_of_replies":num_of_replies, "new_reply":new_reply, "post_id":post_id};
						obj = {}; obj[post_id] = object;
						storage.set(obj, function (){
							;
						});
					}
				}
				sendResponse({msg : "Database Updated!"});
			});
		} else if (request.action == "removeOne") {
			post_id = request.post_id;
			console.log(post_id);
			storage.remove(post_id, function() {
				sendResponse({msg : "Post " + post_id + " is removed!"});
			});
		}
		return true;
	}
);