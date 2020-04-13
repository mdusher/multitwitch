from urllib2 import Request, urlopen, URLError
import re

class Youtube:
    @staticmethod
    def getChannelID(username):
        requrl = 'https://www.youtube.com/' + username
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
                        'username' : username}
            else:
                return {'error' : 'user not found'}

