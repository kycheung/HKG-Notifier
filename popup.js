function addOne(post_id, title, last_view_time, num_of_replies, url, new_reply) {
	var tr = document.createElement("tr");
	tr.id = "row_" + post_id;
	var td; var a; var button;
	if (url == null) {
		td = document.createElement("td");
		td.appendChild(document.createTextNode(title));
		tr.appendChild(td);
	} else {
		td = document.createElement("td");
		a = document.createElement("a");
		a.appendChild(document.createTextNode(title));
		a.title = "Link to HKGolden Post"; a.href = url; a.target="_blank";
		td.appendChild(a);
		if (new_reply == true) {
			var sup = document.createElement("sup");
			sup.appendChild(document.createTextNode('NEW'));
			td.appendChild(sup);
		}
		tr.appendChild(td);
	}
	td = document.createElement("td");
	td.appendChild(document.createTextNode(last_view_time));
	tr.appendChild(td);
	td = document.createElement("td");
	td.appendChild(document.createTextNode(num_of_replies));
	tr.appendChild(td);
	td = document.createElement("td");
	button = document.createElement("input");
	button.type = "button";
	button.value = "Delete";
	button.id = "button_" + post_id;
	td.appendChild(button);
	tr.appendChild(td);
	document.getElementById("BookmarksTable").appendChild(tr);
	document.getElementById("button_" + post_id).addEventListener('click', function () {
		removeOne(post_id)
	});
}

function addTitle() {
	var tr = document.createElement("tr");
	var td;
	td = document.createElement("td");
	td.appendChild(document.createTextNode("題目"));
	tr.appendChild(td);
	td = document.createElement("td");
	td.appendChild(document.createTextNode("最後回應時間"));
	tr.appendChild(td);
	td = document.createElement("td");
	td.appendChild(document.createTextNode("回覆"));
	tr.appendChild(td);
	td = document.createElement("td");
	td.appendChild(document.createTextNode("移除"));
	tr.appendChild(td);
	document.getElementById("BookmarksTable").appendChild(tr);
}

function bookmarkCurrent() {
	chrome.tabs.query({"currentWindow" : true, active: true}, function (tabs) {
		url = tabs[0].url;
		var post_id = url.match(/http:\/\/.+hkgolden\.com\/.+message=([0-9]+)/);
		if (post_id == null) {
			alert("Current Tab is not a HKGolden Post!");
		} else {
			var existIds = getPostIds();
			if (existIds.indexOf(post_id[1]) == -1){
				chrome.runtime.sendMessage({"action":"bookmark", "url": url}, function(response) {
					if (existIds.length == 0) {
						addTitle();
					}

					addOne(response.post_id, response.title, response.last_viewed_time, response.num_of_replies, response.url);
				});
			}
		}
	});
}

function refreshAll() {
	chrome.runtime.sendMessage({"action":"refresh"}, function(response) {
		root = document.getElementById("BookmarksTable");
		while (root.firstChild) {
			root.removeChild(root.firstChild);
		}
		displayAll();
		alert(response.msg);
	});
}

function displayAll() {
	chrome.runtime.sendMessage({"action":"query"}, function(response) {
		result_object = response;
		var keys = Object.keys(result_object);

		if (keys.length == 0) {
			return;
		}

		addTitle();
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]; 
			var post_id = result_object[key].post_id;
			var last_view_time = result_object[key].last_viewed_time;
			var title = result_object[key].title;
			var url = result_object[key].url;
			var num_of_replies = result_object[key].num_of_replies;
			var new_reply = result_object[key].new_reply;
			addOne(post_id, title, last_view_time, num_of_replies, url, new_reply);
		}
	});
}

function clearAll() {
	chrome.runtime.sendMessage({"action":"clear"}, function(response) {
		var myNode = document.getElementById("BookmarksTable");
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}
	});
}

function removeOne(post_id) {
	row_id = "row_" + post_id;
	var element = document.getElementById(row_id);
	element.parentNode.removeChild(element);
	chrome.runtime.sendMessage({"action":"removeOne", "post_id":post_id}, function(response) {
		;
	});
	var post_ids = getPostIds();
	if (post_ids.length == 0){
		var myNode = document.getElementById("BookmarksTable");
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}
	}
}

// Get subscribed post ids from popup.html DOM
function getPostIds() {
	var post_ids = [];
	var table = document.getElementById("BookmarksTable");
	for (var i = 0; i < table.childNodes.length; i++) {
		var cur_node = table.childNodes[i];
		if (!cur_node || cur_node.tagName != "TR" || cur_node.id.indexOf("row_") != 0 ){
			continue;
		}

		var post_id = cur_node.id.substr(4); // in "row_{post_id}"
		post_ids.push(post_id);
	}
	return post_ids;
}

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('BookmarkThis').addEventListener('click', bookmarkCurrent);
	document.getElementById('RefreshAll').addEventListener('click', refreshAll);
	document.getElementById('ClearAll').addEventListener('click', clearAll);
	displayAll();
});