FROM nikolaik/python-nodejs:python3.9-nodejs16

RUN apt-get update && apt-get install -y \
  build-essential \
  wget \
  lsb-release \
  software-properties-common \
  python3 \
  python3-pip \
  python3-dev \
  python3-numpy \
  apt-transport-https \
  ca-certificates \
  libz-dev

RUN wget https://apt.llvm.org/llvm.sh && \
  chmod +x llvm.sh && \
  ./llvm.sh 11

RUN wget https://github.com/Kitware/CMake/releases/download/v3.20.0/cmake-3.20.0-linux-x86_64.sh && \
    chmod +x cmake-3.20.0-linux-x86_64.sh && \
    mkdir /opt/cmake && \
    ./cmake-3.20.0-linux-x86_64.sh --skip-license --prefix=/opt/cmake && \
    ln -s /opt/cmake/bin/cmake /usr/local/bin/cmake

COPY requirements.txt /arrow/python/

RUN pip3 install -r /arrow/python/requirements.txt 

ENV PATH=${PATH}:/scripts

RUN echo "fs.inotify.max_user_instances=524288" >> /etc/sysctl.conf
RUN echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.conf
RUN echo "fs.inotify.max_queued_events=524288" >> /etc/sysctl.conf

COPY . /app

WORKDIR /app/applications/jupyter-extension

RUN pip3 install -e .

ENTRYPOINT [ "bash" ]
