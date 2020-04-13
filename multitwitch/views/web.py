from multitwitch.lib.session import web, ajax
from multitwitch.lib.youtube import Youtube
from pyramid.response import FileResponse
from urllib2 import Request, urlopen, URLError
import re

class WebView:
    @web(template="web/home.tmpl")
    def home(request):
        streams = request.matchdict['streams']
        parsed_streams = []
        uniq_streams = []
        for s in streams:
            item = {"name": s, "channel_id": s, "platform": "twitch"} 
            if s.startswith('yt-'):
                item["platform"] = "youtube"
                yt = Youtube.getChannelID(s[3:])
                if "channel_id" in yt:
                    item["channel_id"] = yt["channel_id"]
            parsed_streams.append(item)

            if s not in uniq_streams:
                uniq_streams.append(s)
        return {'project' : 'multitwitch',
                'streams' : parsed_streams,
                'unique_streams' : uniq_streams,
                'nstreams' : len(parsed_streams)}

    @staticmethod
    def favicon(request):
        return FileResponse("multitwitch/static/favicon.ico", content_type="image/x-icon")

    @staticmethod
    def getYTChannelID(request):
                return Youtube.getChannelID(request.matchdict['username'])

