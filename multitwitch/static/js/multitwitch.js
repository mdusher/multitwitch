var chat_hidden = false;
var num_streams = -1;
var streams = new Array();
var chat_tabs;

function optimize_size(n) {
    // Call with n = -1 to use previously known quantity
    if (n == -1) {
        if (num_streams == -1) {
            return;
        } else {
            n = num_streams;
        }
    } else {
        if (n == 0) {
            $("#helpbox").show();
            hide_chat();
        } else {
            $("#helpbox").hide();
            if (num_streams == 0) {
                chat_tabs.tabs({ active: 0 });
            }
        }
        num_streams = n;
    }

    // Resize chat
    // height is off by 16 due to body margin
    var height = $(window).innerHeight() - 16;
    var width = $("#streams").width();
    if(!chat_hidden) {
        var chat_width = 304;
        var wrapper_width = $("#wrapper").width();
        width = wrapper_width - chat_width - 5;
        var chat_height = height - $("#tablist").height() - 24;
        $("#streams").width(width);
        $("#chatbox").width(chat_width);
        $(".stream_chat").height(chat_height);
    } else {
        var wrapper_width = $("#wrapper").width();
        width = wrapper_width;
        $("#streams").width(width);
    }

    var best_height = 0;
    var best_width = 0;
    var wrapper_padding = 0;
    for (var per_row = 1; per_row <= n; per_row++) {
        var num_rows = Math.ceil(n / per_row);
        var max_width = Math.floor(width / per_row) - 4;
        var max_height = Math.floor(height / num_rows) - 4;
        if (max_width * 9/16 < max_height) {
            max_height = max_width * 9/16;
        } else {
            max_width = (max_height) * 16/9;
        }
        if (max_width > best_width) {
            best_width = max_width;
            best_height = max_height;
            wrapper_padding = (height - num_rows * max_height)/2;
        }
    }
    $(".stream").height(Math.floor(best_height));
    $(".stream").width(Math.floor(best_width));
    $("#streams").css("padding-top", wrapper_padding);
}

function absolute_center(object) {
    var window_height = $(window).height();
    var window_width = $(window).innerWidth();
    var obj_height = object.height();
    var obj_width = object.width();
    var pos_x = (window_width - obj_width)/2;
    var pos_y = (window_height - obj_height)/2;
    if (pos_x < 0) {
        pos_x = 0;
    }
    if (pos_y < 0) {
        pos_y = 0;
    }
    object.css('position', 'absolute');
    object.css('left', pos_x);
    object.css('top', pos_y);
}

function hide_chat() {
    chat_hidden = true;
    $("#chatbox").hide();
    optimize_size(-1);
}

function show_chat() {
    chat_hidden = false;
    $("#chatbox").show();
    optimize_size(-1);
}

function toggle_chat() {
    if (chat_hidden) {
        show_chat();
    } else {
        hide_chat();
    }
}

function change_streams() {
    absolute_center($("#change_streams"));
    $("#change_streams").show();
    focus_last_stream_box();
}

function add_stream_item() {
    $("#streamlist").append($(item_string));
    absolute_center($("#change_streams"));
    focus_last_stream_box();
}

function stream_item_keyup(e) {
    if (e.keyCode == 13 || e.which == 13) {
        add_stream_item();
        return false;
    }
    return true;
}

function stream_object(stream) {
    if (stream["platform"] === 'youtube') {
        stream_id = name.substring(3);
        return $('<iframe id="embed_' + stream["name"] + '" src="https://www.youtube.com/embed/live_stream?autoplay=1&mute=1&channel=' + stream["channel_id"] + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" class="stream" allowfullscreen="true"></iframe>');
    } else {
        return $('<iframe id="embed_' + stream["name"] + '" src="https://player.twitch.tv/?muted=true&channel=' + stream["channel_id"] + '" class="stream" allowfullscreen="true"></iframe>');
    }
}
function chat_object(stream) { 
    if (stream["platform"] === 'twitch') {
        return $('<div id="chat-' + stream["name"] + '" class="stream_chat"><iframe frameborder="0" scrolling="no" id="chat-' + stream["name"] + '-embed" src="http://twitch.tv/chat/embed?channel=' + stream["name"] + '&popout_chat=true" height="100%" width="100%"></iframe></div>');
    }
}

function chat_tab_object(stream) {
    if (stream["platform"] === 'twitch') {
        return $('<li><a href="#chat-' + stream["name"] + '">' + stream["name"] + '</a></li>');
    }
}

var item_string = '<div class="streamlist_item"><input type="text" class="stream_name" onkeyup="stream_item_keyup(event)" /></div>';

function update_stream_list() {
    // Update the contents of #streamlist to match streams
    $("#streamlist .streamlist_item").remove();
    for (var i = 0; i < streams.length; i++) {
        $("#streamlist").append($('<div class="streamlist_item"><input type="checkbox" class="check" checked=true" /> <span>' + streams[i]["name"] + '</span></div>'));
    }
    $("#streamlist").append($(item_string));
}

function focus_last_stream_box() {
    stream_boxes = $("#streamlist .stream_name");
    if (stream_boxes.length > 0) {
        stream_boxes[stream_boxes.length - 1].focus();
    }
}

function path_join(parts){
    const separator = '/';
    parts = parts.map(function (part, index) {
        if (index) {
            part = part.replace(new RegExp('^' + separator), '');
        }
        if (index !== parts.length - 1) {
            part = part.replace(new RegExp(separator + '$'), '');
        }
        return part;
    })
    return parts.join(separator);
}

function update_url(username) {
    new_url = path_join([window.location.href, username]);
    history.replaceState(null, "", new_url);
}

function close_change_streams(apply) {
    var new_streams;
    if(apply) {
        // Remove all the streams that got unchecked
        new_streams = new Array();
        var stream_elements = $("#streams .stream");
        var chat_elements = $("#chatbox .stream_chat");
        var chat_tab_elements = $("#tablist li");
        var list_checks = $("#streamlist .check");
        for (var i = 0; i < streams.length; i++) {
            if (!list_checks[i].checked) {
                stream_elements[i].remove();
		if (typeof chat_elements[i] !== 'undefined') {
                    chat_elements[i].remove();
		}
		if (typeof chat_tab_elements[i] !== 'undefined') {
                    chat_tab_elements[i].remove();
	        }
            } else {
                new_streams.push(streams[i]);
            }
        }
        streams = new_streams
	// add new streams
        var new_stream_inputs = $("#streamlist .stream_name");
        for (var i = 0; i < new_stream_inputs.length; i++) {
	    var stream_name = new_stream_inputs[i].value;
            if (stream_name == "") {
                continue;
            }
            var stream_item = {"name": stream_name, "channel_id": stream_name, "platform": "twitch"}
            if (stream_name.startsWith("yt-")) {
                stream_item["platform"] = "youtube"
		$.getJSON('/getYTChannelID/'+stream_name.substring(3), function (data) {
		    stream_item["channel_id"] = data.channel_id
                    $("#streams").append(stream_object(stream_item));
                    $("#chatbox").append(chat_object(stream_item));
                    $("#tablist").append(chat_tab_object(stream_item));
                    chat_tabs.tabs("refresh");
	            streams.push(stream_item)
                    optimize_size(streams.length);
                    update_url(stream_item["name"])
                    update_stream_list();
		});
	    } else {
                $("#streams").append(stream_object(stream_item));
                $("#chatbox").append(chat_object(stream_item));
                $("#tablist").append(chat_tab_object(stream_item));
                chat_tabs.tabs("refresh");
	        streams.push(stream_item)
                update_url(stream_item["name"])
            }
        }
        optimize_size(streams.length);
        $("#change_streams").hide();
        update_stream_list();
    }
}
