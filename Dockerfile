FROM ubuntu:20.04

ADD sandbox /sandbox
RUN buildDeps='software-properties-common git libtool cmake python-dev python3-pip python-pip libseccomp-dev curl'
RUN apt-get update && apt-get install -y python python3 python-pkg-resources python3-pkg-resources software-properties-common cmake $buildDeps
RUN add-apt-repository ppa:ubuntu-toolchain-r/test
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update && apt-get install -y golang-go openjdk-11-jdk nodejs gcc-9 g++-9
RUN update-alternatives --install  /usr/bin/gcc gcc /usr/bin/gcc-9 40
RUN update-alternatives --install  /usr/bin/g++ g++ /usr/bin/g++-9 40
RUN cd /sandbox && cmake CMakeLists.txt && make && make install

RUN useradd -u 12001 compiler && useradd -u 12002 server

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

## root 계정 원격 접속 제한
## [취약] 콘솔 로그인 이외의 로그인이 가능한것 제외 
RUN apt-get install -y openssh-server
RUN mkdir /var/run/sshd

#set password
RUN echo 'root:root' |chpasswd

#replace sshd_config
RUN sed -ri 's/^#?PermitRootLogin\s+.*/PermitRootLogin no/' /etc/ssh/sshd_config

RUN /etc/init.d/ssh restart

## 리눅스 계정 잠금 임계값 설정
RUN echo 'auth required /lib/security/pam_tally.so deny=5 unlock_time=120 no_magic_root \n account required /lib/security/pam_tally.so no_magic_root reset' >> /etc/pam.d/system-auth


## shadow , passwd 파일 권한 변경
RUN chmod 400 /etc/shadow
RUN chown root:root /etc/shadow
RUN chmod 400 /etc/passwd

## /etc/(x)inetd.conf  파일 권한  설정
RUN apt-get install -y xinetd
RUN apt-get install -y openbsd-inetd
RUN chown root /etc/inetd.conf 
RUN chmod 600 /etc/inetd.conf 
RUN chown root /etc/xinetd.conf
RUN chmod 600 /etc/xinetd.conf

## /etc/(r)syslog.conf 파일 소유자 및 권한 설정
RUN apt-get install -y rsyslog
RUN chown root /etc/rsyslog.conf
RUN chmod 644 /etc/rsyslog.conf

## ftp 비활성화
RUN apt-get install -y vsftpd
RUN userdel ftp

## cron 파일 권한 설정
RUN apt-get install -y cron
# RUN chown root /etc/cron.allow
# RUN chmod 640 /etc/cron.allow
# RUN chown root /etc/cron.deny
# RUN chmod 640 /etc/cron.deny

## echo, discard, daytime, chargen 와 같은 Dos에 취약한 서비스 비활성화
RUN echo 'service echo \n { \n disable=yes \n id = echo-stream \n type = INTERNAL \n wait = no \n socket_type = stream \n }' >> /etc/xinetd.d/echo
RUN echo 'service echo \n { \n disable=yes \n id = echo-stream \n type = INTERNAL \n wait = no \n socket_type = stream \n }' >> /etc/xinetd.d/daytime
RUN echo 'service echo \n { \n disable=yes \n id = echo-stream \n type = INTERNAL \n wait = no \n socket_type = stream \n }' >> /etc/xinetd.d/discard
RUN echo 'service echo \n { \n disable=yes \n id = echo-stream \n type = INTERNAL \n wait = no \n socket_type = stream \n }' >> /etc/xinetd.d/chargen
RUN echo 'service echo \n { \n disable=yes \n wait = yes \n socket_type = stream \n protocol = udp \n user = root \n server = /usr/sbin/in.tftpd \n server_args = -s /tftpd \n }' >> /etc/xinetd.d/tftp
RUN echo 'service echo \n { \n disable=yes \n wait = yes \n socket_type = stream \n protocol = udp \n user = root \n server = /usr/sbin/in.tftpd \n server_args = -s /tftpd \n }' >> /etc/xinetd.d/talk
RUN service xinetd restart
RUN sed -ri 's/^#?echo/#echo/' /etc/services
RUN sed -ri 's/^#?discard/#discard/' /etc/services
RUN sed -ri 's/^#?daytime/#daytime/' /etc/services
RUN sed -ri 's/^#?chargen/#chargen/' /etc/services
RUN sed -ri 's/^#?tftp/#tftp/' /etc/services
RUN sed -ri 's/^#?talk/#talk/' /etc/services

# ## NFS 서비스 비활성
# RUN apt install nfs-kernel-server -y
# RUN kill -9 `ps -ef | grep nfsd | awk '{print $2}' `

RUN apt-get purge -y --auto-remove $buildDeps
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# HEALTHCHECK --interval=5s --retries=3 CMD python3 /code/service.py
WORKDIR /server

RUN cd /server && npm install
# HEALTHCHECK --interval=5s --retries=3 CMD python3 /code/service.py

EXPOSE 3000
ENTRYPOINT ["sh", "/server/entrypoint.sh"]