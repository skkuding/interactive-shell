FROM ubuntu:20.04

COPY sandbox /sandbox
COPY sources.list /etc/apt/

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN buildDeps='software-properties-common git libtool cmake python-dev python3-pip libseccomp-dev curl' && \
    apt-get update && apt-get install -y build-essential python python3 python-pkg-resources python3-pkg-resources $buildDeps && \
    add-apt-repository ppa:ubuntu-toolchain-r/test && \
    add-apt-repository ppa:openjdk-r/ppa && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get update && apt-get install -y golang-go openjdk-11-jdk nodejs gcc-9 g++-9 && \
    update-alternatives --install  /usr/bin/gcc gcc /usr/bin/gcc-9 40 && \
    update-alternatives --install  /usr/bin/g++ g++ /usr/bin/g++-9 40 && \
    cd /sandbox && cmake CMakeLists.txt && make && make install && \
    apt-get purge -y --auto-remove $buildDeps && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV production

COPY server /server
RUN mkdir -p /code && mkdir -p /log

# run docker as non root user
# RUN groupadd -g 61000 server && \
#     useradd -g 61000 -l -M -s /bin/false -u 61000 server && \
#     chmod -R 755 /code && \
#     chmod -R 755 /log && \
#     chmod -R 755 /sandbox && \
#     chmod -R 755 /server && \
#     chmod -R 755 /usr/lib/judger/libjudger.so && \
#     chown -R server:server /code && \
#     chown -R server:server /log && \
#     chown -R server:server /sandbox && \
#     chown -R server:server /server && \
#     chown -R server:server /usr/lib/judger/libjudger.so
# USER server

WORKDIR /server

RUN cd /server && npm install
# HEALTHCHECK --interval=5s --retries=3 CMD python3 /code/service.py

EXPOSE 3000
ENTRYPOINT ["sh", "/server/entrypoint.sh"]