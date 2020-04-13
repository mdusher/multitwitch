from multitwitch.lib.session import web, ajax
from pyramid.response import FileResponse
from urllib2 import Request, urlopen, URLError
import re

class WebView:
    @web(template="web/home.tmpl")
    def home(request):
        streams = request.matchdict['streams']
        uniq_streams = []
        for s in streams:
            if s not in uniq_streams:
                uniq_streams.append(s)
        return {'project' : 'multitwitch',
                'streams' : streams,
                'unique_streams' : uniq_streams,
                'nstreams' : len(streams)}

    @staticmethod
    def favicon(request):
        return FileResponse("multitwitch/static/favicon.ico", content_type="image/x-icon")

    @staticmethod
    def getYTChannelID(request):
        requrl = 'https://www.youtube.com/' + request.matchdict['username']
        req = Request(requrl)
        try:
            response = urlopen(req)
        except URLError as e:
            if hasattr(e, 'reason'):
                return {'error' : e.reason }
            if hasattr(e, 'code'):
                return {'error' : 'Error code: ' + e.code}
        else:
            r = response.read()
            m = re.search('https:\/\/www\.youtube\.com\/channel\/([^\"]*)', r)
            if not m == None:
                channel_id = m.group(1)
                return {'channel_id' : channel_id,
                        'username' : request.matchdict['username']}
            else:
                return {'error' : 'user not found'}

