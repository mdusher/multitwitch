FROM python:3-alpine
ADD . /multitwitch

WORKDIR /multitwitch
RUN pip install -r requirements.txt

CMD ["/multitwitch/run"]
