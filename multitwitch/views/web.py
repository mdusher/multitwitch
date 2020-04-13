from multitwitch.lib.session import web, ajax
from multitwitch.lib.youtube import Youtube
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
                return Youtube.getChannelID(request.matchdict['username'])

