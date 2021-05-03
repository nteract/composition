FROM nikolaik/python-nodejs:python3.9-nodejs16

COPY . /app

RUN echo "fs.inotify.max_user_instances=524288" >> /etc/sysctl.conf
RUN echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.conf
RUN echo "fs.inotify.max_queued_events=524288" >> /etc/sysctl.conf

WORKDIR /app/applications/jupyter-extension

RUN pip3 install -e .

ENTRYPOINT [ "bash" ]
