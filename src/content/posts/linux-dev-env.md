---
title: Linux开发环境配置
published: 2025-08-10
description: VMware 安装 CentOS 7 与 Java/Nginx/MySQL/Python，以及 Docker 部署常用服务的配置笔记。
image: /images/linux-cover.png
tags: [Linux, Docker, CentOS, Nginx, MySQL, Jenkins, 运维, 环境配置]
category: 运维
draft: false
---
## 第一章 使用VMware安装配置Linux基础开发环境

### 第一部分 安装CentOS 7

- 参考文档：[在VMware中安装CentOS7（超详细的图文教程）_在vmware上安装centos-CSDN博客](https://blog.csdn.net/qq_45743985/article/details/121152504)

- 镜像选择
  - 这里选用镜像：CentOS-7-x86_64-DVD-2009.iso
- VMware选择新建虚拟机->选自定义(高级)安装->稍后安装操作系统->更改虚拟机安装位置(比如E:\VMwareComputer\CentOS 7 64 位 04)注意自己把文件夹创建出来->使用网络地址转换(NAT)->将虚拟磁盘拆分成多个文件->成功创建出空的虚拟机后再配置所选iso即可 【没有提到的步骤按系统推荐设置即可】
- 进入安装界面，这里只提需要注意的步骤
  - 软件安装：最小安装(只有命令行)/GNOME桌面(标准的CentOS桌面)
    - 这里左侧勾选GNOME桌面，方便后续图形化界面配置网络
  - 之后会提示重启，进入GUI桌面环境，使用root账户登录进系统

### 第二部分 网络及防火墙配置

- 参考文档：[Linux Centos7 防火墙（开启、关闭、重启、状态、端口）_centos7.9 重启防火墙 断开连接-CSDN博客](https://blog.csdn.net/m0_47087822/article/details/123179648)

- 点击右上角网络图标，按下图进行配置（配置网络自动连接以及自定义ip地址）
  - ![img](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/1.png)
  - ![img](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2.png)

- 关闭防火墙

  - 为了实现后续各个端口的远程访问连接，需要关闭防火墙

  - 查看防火墙状态 active (running)表示已启用防火墙

    - ```shell
      systemctl status firewalld
      ```

    - ```shell
      [root@bogon ~]# systemctl status firewalld
      ● firewalld.service - firewalld - dynamic firewall daemon
         Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled; vendor preset: enabled)
         Active: active (running) since 日 2024-12-08 20:07:36 CST; 1h 0min ago
           Docs: man:firewalld(1)
       Main PID: 886 (firewalld)
          Tasks: 2
         CGroup: /system.slice/firewalld.service
                 └─886 /usr/bin/python2 -Es /usr/sbin/firewalld --nofork --nopid
      
      12月 08 20:07:36 localhost.localdomain systemd[1]: Starting firewalld - dynamic firewall daemon...
      12月 08 20:07:36 localhost.localdomain systemd[1]: Started firewalld - dynamic firewall daemon.
      12月 08 20:07:36 localhost.localdomain firewalld[886]: WARNING: AllowZoneDrifting is enabled. This is considered an insecure confi...t now.
      Hint: Some lines were ellipsized, use -l to show in full.
      ```

  - 关闭防火墙

    - ```shell
      systemctl stop firewalld
      ```

  - 启动防火墙

    - ```shell
      systemctl start firewalld
      ```

  - 禁用防火墙

    - ```shell
      systemctl disable firewalld
      ```

    - ```shell
      [root@bogon ~]# systemctl disable firewalld
      Removed symlink /etc/systemd/system/multi-user.target.wants/firewalld.service.
      Removed symlink /etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service.
      ```


### 第三部分 配置阿里云yum镜像

- 参考文档：[CentOS7配置阿里云镜像源（超详细过程）_centos7 一键配置 配置阿里源脚本-CSDN博客](https://blog.csdn.net/KingveyLee/article/details/114984534)

- 备份官方的原yum源的配置

  - ```shell
    mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
    ```

- 下载Centos-7.repo文件

  - ```shell
    wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
    ```

- 清除及生成缓存

  - ```shell
    yum clean all
    ```

  - ```shell
    yum makecache
    ```

- 测试yum配置（看到mirrors.aliyun.com即可）

  - ```shell
    yum list | head -n 20
    ```

  - ```shell
    [root@bogon ~]# yum list | head -n 20
    已加载插件：fastestmirror, langpacks
    Loading mirror speeds from cached hostfile
     * base: mirrors.aliyun.com
     * extras: mirrors.aliyun.com
     * updates: mirrors.aliyun.com
    已安装的软件包
    GConf2.x86_64                               3.2.6-8.el7                @anaconda
    GeoIP.x86_64                                1.5.0-14.el7               @anaconda
    ModemManager.x86_64                         1.6.10-4.el7               @anaconda
    ModemManager-glib.x86_64                    1.6.10-4.el7               @anaconda
    NetworkManager.x86_64                       1:1.18.8-1.el7             @anaconda
    NetworkManager-adsl.x86_64                  1:1.18.8-1.el7             @anaconda
    NetworkManager-bluetooth.x86_64             1:1.18.8-1.el7             @anaconda
    NetworkManager-glib.x86_64                  1:1.18.8-1.el7             @anaconda
    NetworkManager-libnm.x86_64                 1:1.18.8-1.el7             @anaconda
    NetworkManager-libreswan.x86_64             1.2.4-2.el7                @anaconda
    NetworkManager-libreswan-gnome.x86_64       1.2.4-2.el7                @anaconda
    NetworkManager-ppp.x86_64                   1:1.18.8-1.el7             @anaconda
    NetworkManager-team.x86_64                  1:1.18.8-1.el7             @anaconda
    NetworkManager-tui.x86_64                   1:1.18.8-1.el7             @anaconda
    ```


### 第三部分 磁盘扩容

- 参考文档：https://blog.csdn.net/hualinger/article/details/121553556?spm=1001.2014.3001.5506
- 按上述文档步骤即可

### 第四部分 安装Java

- openjdk 下载链接：https://www.openlogic.com/openjdk-downloads

- 下载tar.gz 后缀压缩包，解压

  - ```shell
    tar -xzvf openlogic-openjdk-8u432-b06-linux-x64.tar.gz
    ```

- 不需要安装，直接配置环境变量即可

  - 打开环境变量配置文件

    - ```shell
      vi /etc/profile
      ```

  - 配置java环境变量（在文件末尾添加以下内容）

    - ```shell
      export JAVA_HOME=/opt/java/openlogic-openjdk-8u432-b06-linux-x64
      export PATH=$JAVA_HOME/bin:$PATH
      export CLASSPATH=.:$JAVA_HOME/lib
      ```

  - 使配置生效

    - ```shell
      source /etc/profile
      ```

- 附加内容

  - 一份基于springboot的web应用启动脚本

    - ```shell
      #!/bin/bash
      
      # 环境变量（服务器已配置则无需使用）
      # export JAVA_HOME=/opt/java/openlogic-openjdk-8u432-b06-linux-x64
      # export JRE_HOME=$JAVA_HOME/jre
      # export CLASSPATH=.:$JAVA_HOME/jre/lib/rt.jar:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
      # export PATH=$PATH:$JAVA_HOME/bin:$JRE_HOME/bin
      
      APP_NAME=/opt/app/powercrm/powercrm-server/powercrm-admin.jar
      
      # 使用说明，用来提示输入参数
      usage() {
          echo "可用命令: ./project.sh [start|stop|restart|status]"
          exit 1
      }
      
      # 检查程序是否在运行
      is_exist() {
          pid=$(ps -ef | grep $APP_NAME | grep -v grep | awk '{print $2}')
          # 如果不存在返回1，存在返回0
          if [ -z "${pid}" ]; then
              return 1
          else
              return 0
          fi
      }
      
      # 启动方法
      start() {
          is_exist
          if [ $? -eq 0 ]; then
              echo "${APP_NAME} 正在运行中。进程ID=${pid}"
          else
              nohup java -jar ${APP_NAME} > /dev/null 2>&1 &
              echo "Java 应用已启动。进程ID=$!"
          fi
      }
      
      # 停止方法
      stop() {
          is_exist
          if [ $? -eq 0 ]; then
              kill -9 $pid
              echo "Java 应用已停止。进程ID=${pid}"
          else
              echo "${APP_NAME} 未在运行中"
          fi
      }
      
      # 输出运行状态
      status() {
          is_exist
          if [ $? -eq 0 ]; then
              echo "${APP_NAME} 正在运行中。进程ID=${pid}"
          else
              echo "${APP_NAME} 未在运行中"
          fi
      }
      
      # 重启
      restart() {
          stop
          sleep 5
          start
      }
      
      # 根据输入参数，选择执行对应方法，不输入则执行使用说明
      case "$1" in
          "start")
              start
              ;;
          "stop")
              stop
              ;;
          "status")
              status
              ;;
          "restart")
              restart
              ;;
          *)
              usage
              ;;
      esac
      
      ```

      

### 第五部分 安装nginx

- nginx下载链接：[nginx: download](https://nginx.org/en/download.html)

- 下载tar.gz 后缀压缩包，解压

  - ```shell
    tar -xzvf nginx-1.27.0.tar.gz
    ```

- 进入解压后的文件目录，进行配置并安装nginx

  - ```shell
    cd nginx-1.27.0
    ```

  - ```shell
    # 阿里云服务器镜像可能会出现缺少必要依赖的情况，此时需要先执行以下命令安装依赖
    yum install pcre pcre-devel
    yum install zlib zlib-devel
    
    # 指定安装位置
    ./configure --prefix=/opt/nginx/nginx
    ```
    
  - ```shell
    # 编译安装
    make && make install
    
    # 安装后的nginx文件夹内容初始如下，之后运行过以后文件会多。conf文件夹下可以配置nginx.conf
    [root@bogon nginx]# cd nginx
    [root@bogon nginx]# ll
    总用量 4
    drwxr-xr-x. 2 root root 4096 1月  29 12:15 conf
    drwxr-xr-x. 2 root root   40 1月  29 12:15 html
    drwxr-xr-x. 2 root root    6 1月  29 12:15 logs
    drwxr-xr-x. 2 root root   19 1月  29 12:15 sbin
    ```

  - ```shell
    # 在安装目录nginx下的sbin目录下启动nginx
    [root@bogon sbin]# ll
    总用量 3840
    -rwxr-xr-x. 1 root root 3930912 1月  29 12:15 nginx
    [root@bogon sbin]# ./nginx
    ```

  - ```shell
    # 终止nginx
    [root@bogon sbin]# ./nginx -s quit
    ```

- 附加内容：

  - 一份配置好的nginx.conf文件

    - ```nginx
       
      #user  nobody;
      worker_processes  1;
      
      #error_log  logs/error.log;
      #error_log  logs/error.log  notice;
      #error_log  logs/error.log  info;
      
      #pid        logs/nginx.pid;
      
      
      events {
          worker_connections  1024;
      }
      
      
      http {
          include       mime.types;
          default_type  application/octet-stream;
      
          #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
          #                  '$status $body_bytes_sent "$http_referer" '
          #                  '"$http_user_agent" "$http_x_forwarded_for"';
      
          #access_log  logs/access.log  main;
      
          sendfile        on;
          #tcp_nopush     on;
      
          #keepalive_timeout  0;
          keepalive_timeout  65;
      
          # 开启gzip压缩
          gzip  on;
      
          server {
              listen       80;
              server_name  localhost;
      
              #charset koi8-r;
      
              #access_log  logs/host.access.log  main;
      
              # 静态文件
              location / {
                  # 设置dist文件夹所在路径
                  root   /opt/app/powercrm/powercrm-front/dist;
                  index  index.html index.htm;
                  #解决刷新404
                  try_files $uri $uri/ /index.html;
              }
      
              # 生产环境配置
              location /prod-api/ {
                  # 设置代理目标
                  proxy_pass http://192.168.205.101:8080/;
              }
      
              #error_page  404              /404.html;
      
              # redirect server error pages to the static page /50x.html
              #
              error_page   500 502 503 504  /50x.html;
              location = /50x.html {
                  root   html;
              }
      
              # proxy the PHP scripts to Apache listening on 127.0.0.1:80
              #
              #location ~ \.php$ {
              #    proxy_pass   http://127.0.0.1;
              #}
      
              # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
              #
              #location ~ \.php$ {
              #    root           html;
              #    fastcgi_pass   127.0.0.1:9000;
              #    fastcgi_index  index.php;
              #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
              #    include        fastcgi_params;
              #}
      
              # deny access to .htaccess files, if Apache's document root
              # concurs with nginx's one
              #
              #location ~ /\.ht {
              #    deny  all;
              #}
          }
      
      
          # another virtual host using mix of IP-, name-, and port-based configuration
          #
          #server {
          #    listen       8000;
          #    listen       somename:8080;
          #    server_name  somename  alias  another.alias;
      
          #    location / {
          #        root   html;
          #        index  index.html index.htm;
          #    }
          #}
      
      
          # HTTPS server
          #
          #server {
          #    listen       443 ssl;
          #    server_name  localhost;
      
          #    ssl_certificate      cert.pem;
          #    ssl_certificate_key  cert.key;
      
          #    ssl_session_cache    shared:SSL:1m;
          #    ssl_session_timeout  5m;
      
          #    ssl_ciphers  HIGH:!aNULL:!MD5;
          #    ssl_prefer_server_ciphers  on;
      
          #    location / {
          #        root   html;
          #        index  index.html index.htm;
          #    }
          #}
      
      }
      
      ```

  - 一份nginx服务器的启动脚本

    - ```shell
      #!/bin/bash
      
      # 定义 Nginx 的路径和配置文件
      NGINX_BIN="/opt/nginx/nginx/sbin/nginx"
      NGINX_CONF="/opt/nginx/nginx/conf/nginx.conf"
      
      # 使用说明，用来提示输入参数
      usage() {
          echo "可用命令: ./project.sh [start|stop|restart|status]"
          exit 1
      }
      
      # 检查 Nginx 是否在运行
      is_running() {
          if pgrep -f "$NGINX_BIN -c $NGINX_CONF" > /dev/null; then
              return 0
          else
              return 1
          fi
      }
      
      # 启动 Nginx
      start() {
          if is_running; then
              echo "Nginx 正在运行中。"
          else
              "$NGINX_BIN" -c "$NGINX_CONF"
              if is_running; then
                  echo "Nginx 启动成功。"
              else
                  echo "启动 Nginx 失败。"
              fi
          fi
      }
      
      # 停止 Nginx
      stop() {
          if is_running; then
              "$NGINX_BIN" -s stop
              if ! is_running; then
                  echo "Nginx 停止成功。"
              else
                  echo "停止 Nginx 失败。"
              fi
          else
              echo "Nginx 未在运行中。"
          fi
      }
      
      # 重启 Nginx
      restart() {
          stop
          sleep 1
          start
      }
      
      # 检查 Nginx 状态
      status() {
          if is_running; then
              echo "Nginx 正在运行中。"
          else
              echo "Nginx 未在运行中。"
          fi
      }
      
      # 根据输入参数，选择执行对应方法，不输入则执行使用说明
      case "$1" in
          "start")
              start
              ;;
          "stop")
              stop
              ;;
          "restart")
              restart
              ;;
          "status")
              status
              ;;
          *)
              usage
              ;;
      esac
      
      ```

### 第六部分 安装MySQL

- MySQL下载链接：https://downloads.mysql.com/archives/community/

- 支持远程连接访问账户配置

  - ```sql
    # 表示任何ip地址的主机都可以通过这个账号访问这一个指定数据库增删改查，别的数据库无法操作
    mysql>CREATE USER 'remote_user'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
    mysql>GRANT ALL PRIVILEGES ON powercrm_ruoyi.* TO 'remote_user'@'%' WITH GRANT OPTION;
    mysql>FLUSH PRIVILEGES;
    
    # 通过以下sql查看当前数据库的账户信息
    mysql>SELECT User, Host FROM mysql.user;
    
    # 通过以下sql删除指定的账户信息
    mysql>DROP USER 'remote_user'@'%';
    
    # 记得刷新权限
    mysql>FLUSH PRIVILEGES;
    
    # 附加：因后续需要导出数据库文件，所以还需要赋予PROCESS权限
    mysql> GRANT PROCESS ON *.* TO 'remote_user'@'%';
    
    mysql>FLUSH PRIVILEGES;
    
    # 查看权限
    mysql> SHOW GRANTS FOR 'remote_user'@'%';
    +-----------------------------------------------------------------------------------+
    | Grants for remote_user@%                                                          |
    +-----------------------------------------------------------------------------------+
    | GRANT PROCESS ON *.* TO `remote_user`@`%`                                         |
    | GRANT ALL PRIVILEGES ON `powercrm_ruoyi`.* TO `remote_user`@`%` WITH GRANT OPTION |
    +-----------------------------------------------------------------------------------+
    ```
    

### 第七部分 安装python

- CentOS 7系统自带的有python2.7，不推荐卸载，因为很多系统工具（如`yum`）依赖于它，删除它可能导致系统管理功能出现问题。因此建议直接安装新版本python，再通过构建虚拟环境使用。本次采用源码方式安装python3.8.8

- 安装依赖包（编译Python源码需要一些开发工具和库）

  - ```shell
    yum groupinstall "Development Tools" -y
    yum install zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel libffi-devel -y
    ```

- 下载Python 3.8.8源码（）

  - ```shell
    mkdir -p /opt/python
    cd /opt/python
    wget https://mirrors.huaweicloud.com/python/3.8.8/Python-3.8.8.tgz
    ```

- 解压并进入目录

  - ```shell
    tar xzf Python-3.8.8.tgz
    cd Python-3.8.8
    ```

- 配置、编译和安装

  - ```shell
    ./configure --enable-optimizations --enable-shared
    make altinstall
    ```

- 将库路径添加到系统配置中

  - ```shell
    vi /etc/ld.so.conf.d/python3.8.conf
    ```

  - 在打开的文件中写入

  - ```
    /usr/local/lib
    ```

  - 更新动态链接器运行时绑定

  - ```shell
    sudo ldconfig
    ```

- 安装完毕

  - ```shell
    # 测试命令
    python3.8 --version
    ```

  - ```shell
    # 创建一个虚拟环境
    python3.8 -m venv /app/myproject_env
    
    # 激活（在虚拟环境中直接用python命令即可）
    source /app/myproject_env/bin/activate
    
    # 退出虚拟环境
    deactivate
    ```

### 第八部分 安装Jenkins

- 

## 第二章 Docker的安装以及Docker常用软件的配置

### 第一部分 安装Docker

- 更新yum

  - ```
    yum update
    ```

  - ```shell
    [root@bogon ~]# yum update
    已加载插件：fastestmirror, langpacks
    Determining fastest mirrors
     * base: mirrors.aliyun.com
     * extras: mirrors.aliyun.com
     * updates: mirrors.aliyun.com
    base                                                                                                                 | 3.6 kB  00:00:00     
    extras                                                                                                               | 2.9 kB  00:00:00     
    updates                                                                                                              | 2.9 kB  00:00:00     
    正在解决依赖关系
    --> 正在检查事务
    ---> 软件包 NetworkManager.x86_64.1.1.18.8-1.el7 将被 升级
    ---> 软件包 NetworkManager.x86_64.1.1.18.8-2.el7_9 将被 更新
    ...
      zenity.x86_64 0:3.28.1-2.el7_9                                       
    
    完毕！
    ```

- 安装docker的前置依赖

  - ```
    yum install -y yum-utils device-mapper-persistent-data lvm2
    ```

  - ```shell
    [root@bogon ~]# yum install -y yum-utils device-mapper-persistent-data lvm2
    已加载插件：fastestmirror, langpacks
    Loading mirror speeds from cached hostfile
     * base: mirrors.aliyun.com
     * extras: mirrors.aliyun.com
     * updates: mirrors.aliyun.com
    软件包 yum-utils-1.1.31-54.el7_8.noarch 已安装并且是最新版本
    软件包 device-mapper-persistent-data-0.8.5-3.el7_9.2.x86_64 已安装并且是最新版本
    软件包 7:lvm2-2.02.187-6.el7_9.5.x86_64 已安装并且是最新版本
    无须任何处理
    ```

- 配置docker下载镜像

  - ```
    yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    ```

  - ```shell
    [root@bogon ~]# yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    已加载插件：fastestmirror, langpacks
    adding repo from: http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    grabbing file http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo to /etc/yum.repos.d/docker-ce.repo
    repo saved to /etc/yum.repos.d/docker-ce.repo
    ```

- 清理yum缓存

  - ```
    yum clean all
    ```

  - ```shell
    [root@bogon ~]# yum clean all
    已加载插件：fastestmirror, langpacks
    正在清理软件源： base docker-ce-stable extras updates
    Cleaning up list of fastest mirrors
    ```

- 重新加载yum

  - ```
    yum makecache fast
    ```

  - ```shell
    [root@bogon ~]# yum makecache fast
    已加载插件：fastestmirror, langpacks
    Determining fastest mirrors
     * base: mirrors.aliyun.com
     * extras: mirrors.aliyun.com
     * updates: mirrors.aliyun.com
    base                                                                                                                 | 3.6 kB  00:00:00     
    ...    
    (6/6): updates/7/x86_64/primary_db                                                                                   |  27 MB  00:00:04     
    元数据缓存已建立
    ```

- 安装docker

  - ```
    yum install -y docker-ce docker-ce-cli containerd.io
    ```

  - ```shell
    [root@bogon ~]# yum install -y docker-ce docker-ce-cli containerd.io
    已加载插件：fastestmirror, langpacks
    Loading mirror speeds from cached hostfile
     * base: mirrors.aliyun.com
     * extras: mirrors.aliyun.com
     * updates: mirrors.aliyun.com
    正在解决依赖关系
    --> 正在检查事务
    ---> 软件包 containerd.io.x86_64.0.1.6.33-3.1.el7 将被 安装
    ...
    已安装:
      containerd.io.x86_64 0:1.6.33-3.1.el7            docker-ce.x86_64 3:26.1.4-1.el7            docker-ce-cli.x86_64 1:26.1.4-1.el7           
    
    作为依赖被安装:
      container-selinux.noarch 2:2.119.2-1.911c772.el7_8                       docker-buildx-plugin.x86_64 0:0.14.1-1.el7                       
      docker-ce-rootless-extras.x86_64 0:26.1.4-1.el7                          docker-compose-plugin.x86_64 0:2.27.1-1.el7                      
      fuse-overlayfs.x86_64 0:0.7.2-6.el7_8                                    fuse3-libs.x86_64 0:3.6.1-4.el7                                  
      slirp4netns.x86_64 0:0.4.3-4.el7_8                                      
    
    完毕！
    ```

- 启动docker（上述命令已经安装好了最新版本的docker）

  - ```
    systemctl start docker
    ```

  - ```
    systemctl enable docker
    ```

  - ```shell
    [root@bogon ~]# systemctl start docker
    [root@bogon ~]# systemctl enable docker
    Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service.
    ```

- 查看docker版本

  - ```
    docker version
    ```

  - ```shell
    [root@bogon ~]# docker version
    Client: Docker Engine - Community
     Version:           26.1.4
     API version:       1.45
     Go version:        go1.21.11
     Git commit:        5650f9b
     Built:             Wed Jun  5 11:32:04 2024
     OS/Arch:           linux/amd64
     Context:           default
    
    Server: Docker Engine - Community
     Engine:
      Version:          26.1.4
      API version:      1.45 (minimum version 1.24)
      Go version:       go1.21.11
      Git commit:       de5c9cf
      Built:            Wed Jun  5 11:31:02 2024
      OS/Arch:          linux/amd64
      Experimental:     false
     containerd:
      Version:          1.6.33
      GitCommit:        d2d58213f83a351ca8f528a95fbd145f5654e957
     runc:
      Version:          1.1.12
      GitCommit:        v1.1.12-0-g51d5e94
     docker-init:
      Version:          0.19.0
      GitCommit:        de40ad0
    ```

- 配置docker下载镜像

  - 由于docker镜像经常挂，这里直接给出截止目前（2024/12/06）仍然可用的镜像配置（直接编辑/etc/docker/daemon.json这个文件即可）地址合集：https://github.com/dongyubin/DockerHub

  - ```json
    {
      "registry-mirrors": [
        "https://dockerpull.org",
        "https://docker.1panel.dev",
        "https://docker.fxxk.dedyn.io",
        "https://docker.xn--6oq72ry9d5zx.cn",
        "https://docker.zhai.cm",
        "https://docker.5z5f.com",
        "https://a.ussh.net",
        "https://docker.cloudlayer.icu",
        "https://hub.littlediary.cn",
        "https://hub.crdz.gq",
        "https://docker.unsee.tech",
        "https://docker.kejilion.pro",
        "https://registry.dockermirror.com",
        "https://hub.rat.dev",
        "https://dhub.kubesre.xyz",
        "https://docker.nastool.de",
        "https://docker.udayun.com",
        "https://docker.rainbond.cc",
        "https://hub.geekery.cn",
        "https://docker.1panelproxy.com",
        "https://atomhub.openatom.cn",
        "https://docker.m.daocloud.io"
      ]
    }
    ```

  - ```
    tee /etc/docker/daemon.json <<-'EOF'
    {
      "registry-mirrors": [
        "https://docker.m.daocloud.io"
      ]
    }
    EOF
    systemctl daemon-reload
    systemctl restart docker
    ```

  - ```shell
    [root@bogon ~]# tee /etc/docker/daemon.json <<-'EOF'
    > {
    >   "registry-mirrors": [
    >     "https://docker.m.daocloud.io"
    >   ]
    > }
    > EOF
    {
      "registry-mirrors": [
        "https://docker.m.daocloud.io"
      ]
    }
    [root@bogon ~]# systemctl daemon-reload
    [root@bogon ~]# systemctl restart docker
    ```

- 配置docker支持远程链接（idea利用docker插件可以进行远程连接）

  - ```
    vim /usr/lib/systemd/system/docker.service
    ```

  - 将ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
    修改为ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock -H tcp://0.0.0.0:2375

  - ```
    systemctl daemon-reload
    systemctl restart docker
    ```

  - 远程连接（以DataGrip为例，图中mysql服务的配置见第二部分讲解）

    ![Mysql](https://img.picui.cn/free/2024/11/10/67305376860bd.png)

    ![Mysql](https://img.picui.cn/free/2024/11/10/6730536d0d2c4.png)

- 至此docker基础安装已完成，可使用以下命令来检测docker是否成功配置

  - ```
    docker pull hello-world
    docker run hello-world
    ```

  - ```shell
    [root@bogon ~]# docker pull hello-world
    Using default tag: latest
    latest: Pulling from library/hello-world
    c1ec31eb5944: Pull complete 
    Digest: sha256:d211f485f2dd1dee407a80973c8f129f00d54604d2c90732e8e320e5038a0348
    Status: Downloaded newer image for hello-world:latest
    docker.io/library/hello-world:latest
    [root@bogon ~]# docker run hello-world
    
    Hello from Docker!
    This message shows that your installation appears to be working correctly.
    
    To generate this message, Docker took the following steps:
     1. The Docker client contacted the Docker daemon.
     2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
        (amd64)
     3. The Docker daemon created a new container from that image which runs the
        executable that produces the output you are currently reading.
     4. The Docker daemon streamed that output to the Docker client, which sent it
        to your terminal.
    
    To try something more ambitious, you can run an Ubuntu container with:
     $ docker run -it ubuntu bash
    
    Share images, automate workflows, and more with a free Docker ID:
     https://hub.docker.com/
    
    For more examples and ideas, visit:
     https://docs.docker.com/get-started/
    ```

- 这里再提供两个安装时可能用到的命令

  - ```
    yum list docker-ce --showduplicates | sort -r -- 查看可供选择的docker版本
    yum install docker-ce-18.03.1.ce -- 安装其中一个（按上述步骤后会提示已经安装docker了）
    ```

- 常用docker命令（更多命令可参考https://pan.baidu.com/s/1PhTeMkX5vOg0ZRcw0abjCw?pwd=yyds#list/path=%2Fsharelink4035995002-769892715607674%2F%E5%B0%9A%E7%A1%85%E8%B0%B7Java%E5%AD%A6%E7%A7%91%E5%85%A8%E5%A5%97%E6%95%99%E7%A8%8B%2F3.%E5%B0%9A%E7%A1%85%E8%B0%B7%E5%85%A8%E5%A5%97JAVA%E6%95%99%E7%A8%8B--%E5%BE%AE%E6%9C%8D%E5%8A%A1%E7%94%9F%E6%80%81%EF%BC%8866.68GB%EF%BC%89%2F%E5%B0%9A%E7%A1%85%E8%B0%B72024%E6%96%B0%E7%89%883%E5%B0%8F%E6%97%B6%E9%80%9F%E9%80%9ADocker%E6%95%99%E7%A8%8B%2F%E7%AC%94%E8%AE%B0&parentPath=%2Fsharelink4035995002-769892715607674）

  - ```
    查看运⾏中的容器 docker ps
    
    查看所有容器 docker ps -a
    
    下载指定版本镜像 docker pull nginx:1.26.0
    
    查看所有镜像docker images
    
    删除指定id的镜像docker rmi e784f4560448
    
    运⾏⼀个新容器docker run nginx
    
    停⽌容器docker stop keen_blackwell
    
    启动容器（这里e784f4560448是指容器id）docker start e784f4560448
    
    强制删除指定容器docker rm -f e784f4560448
    
    进入某个容器docker exec -it gitlab /bin/bash
    ```

### 第二部分 安装MySQL

- 参考文档：[Docker配置MySQL容器+远程连接（全流程）](https://blog.csdn.net/qq_43781399/article/details/112650755)

- 拉取MySQL镜像

  - ```
    docker pull mysql:5.7
    ```

  - ```shell
    [root@bogon ~]# docker pull mysql:5.7
    5.7: Pulling from library/mysql
    20e4dcae4c69: Pull complete 
    1c56c3d4ce74: Pull complete 
    e9f03a1c24ce: Pull complete 
    68c3898c2015: Pull complete 
    6b95a940e7b6: Pull complete 
    90986bb8de6e: Pull complete 
    ae71319cb779: Pull complete 
    ffc89e9dfd88: Pull complete 
    43d05e938198: Pull complete 
    064b2d298fba: Pull complete 
    df9a4d85569b: Pull complete 
    Digest: sha256:4bc6bc963e6d8443453676cae56536f4b8156d78bae03c0145cbe47c2aad73bb
    Status: Downloaded newer image for mysql:5.7
    docker.io/library/mysql:5.7
    [root@bogon ~]# docker images
    REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
    mysql         5.7       5107333e08a8   11 months ago   501MB
    hello-world   latest    d2c94e258dcb   18 months ago   13.3kB
    ```

- 附：处理原本主机的mysql服务（这里原本主机配置的mysql 8版本）（主机没有配置mysql环境可无视）

  - 查看mysql允许状态（Active: active (running) since 日 2024-11-10 10:57:09 CST; 1h 24min ago表示正在运行）

  - ```
    service mysqld status
    ```

  - ```shell
    [root@bogon ~]# service mysqld status
    Redirecting to /bin/systemctl status mysqld.service
    ● mysqld.service - MySQL Server
       Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
       Active: active (running) since 日 2024-11-10 10:57:09 CST; 1h 24min ago
         Docs: man:mysqld(8)
               http://dev.mysql.com/doc/refman/en/using-systemd.html
     Main PID: 1554 (mysqld)
       Status: "Server is operational"
        Tasks: 34
       Memory: 0B
       CGroup: /system.slice/mysqld.service
               └─1554 /usr/sbin/mysqld
    
    11月 10 10:57:04 bogon systemd[1]: Starting MySQL Server...
    11月 10 10:57:09 bogon systemd[1]: Started MySQL Server.
    ```

  - 终止mysql服务

  - ```
    service mysqld stop
    ```

  - ```shell
    [root@bogon ~]# service mysqld stop
    Redirecting to /bin/systemctl stop mysqld.service
    [root@bogon ~]# service mysqld status
    Redirecting to /bin/systemctl status mysqld.service
    ● mysqld.service - MySQL Server
       Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
       Active: inactive (dead) since 日 2024-11-10 12:28:15 CST; 3s ago
         Docs: man:mysqld(8)
               http://dev.mysql.com/doc/refman/en/using-systemd.html
      Process: 1554 ExecStart=/usr/sbin/mysqld $MYSQLD_OPTS (code=exited, status=0/SUCCESS)
     Main PID: 1554 (code=exited, status=0/SUCCESS)
       Status: "Server shutdown complete (with return value = 0)"
    
    11月 10 10:57:04 bogon systemd[1]: Starting MySQL Server...
    11月 10 10:57:09 bogon systemd[1]: Started MySQL Server.
    11月 10 12:28:13 bogon systemd[1]: Stopping MySQL Server...
    11月 10 12:28:15 bogon systemd[1]: Stopped MySQL Server.
    ```

  - 启动mysql服务

  - ```
    service mysqld start
    ```

  - ```shell
    [root@bogon ~]# service mysqld start
    Redirecting to /bin/systemctl start mysqld.service
    ```

  - 开机自启动mysql服务相关

    - 查看mysql服务自启动当前状态（mysqld.service                                enabled 表示已开启自启动）

    - ```
      systemctl list-unit-files | grep 'mysql'
      ```

    - ```shell
      [root@bogon ~]# systemctl list-unit-files | grep 'mysql'
      mysqld.service                                enabled 
      mysqld@.service                               disabled
      ```

    - 关闭mysql服务自启动

    - ```
      systemctl disable mysqld
      ```

    - ```shell
      [root@bogon ~]# systemctl disable mysqld
      Removed symlink /etc/systemd/system/multi-user.target.wants/mysqld.service.
      ```

    - 开启mysql服务自启动

    - ```
      systemctl enable mysqld
      ```

    - ```shell
      [root@bogon ~]# systemctl enable mysqld
      Created symlink from /etc/systemd/system/multi-user.target.wants/mysqld.service to /usr/lib/systemd/system/mysqld.service.
      ```

      

- 启动MySQL（注意端口，如果主机3306已被占用，请替换为-p3307:3306，或者按上一步骤终止原本主机的mysql服务）

  - ```
    docker run -d -p3306:3306 -v /app/myconf:/etc/mysql/conf.d -v /app/mydata:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7
    ```

  - ```shell
    [root@bogon ~]# docker run -d -p3306:3306 -v /app/myconf:/etc/mysql/conf.d -v /app/mydata:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7
    b8dde08de161c19032018aecf47b4b475ebad4de42e13345e209ad10d9c009fc
    [root@bogon ~]# docker ps -a
    CONTAINER ID   IMAGE         COMMAND                   CREATED          STATUS                      PORTS                                                  NAMES
    b8dde08de161   mysql:5.7     "docker-entrypoint.s…"   2 seconds ago    Up 1 second                 0.0.0.0:3306->3306/tcp, :::3306->3306/tcp, 33060/tcp   interesting_yalow
    d6b0c1a3661a   hello-world   "/hello"                  34 minutes ago   Exited (0) 34 minutes ago                                                          boring_galileo
    ```

- 进入mysql容器内部（这里注意interesting_yalow是上一步骤中mysql容器的names）

  - ```
    docker exec -it interesting_yalow mysql -uroot -p123456
    ```

  - ```shell
    [root@bogon ~]# docker exec -it interesting_yalow mysql -uroot -p123456
    mysql: [Warning] Using a password on the command line interface can be insecure.
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 2
    Server version: 5.7.44 MySQL Community Server (GPL)
    
    Copyright (c) 2000, 2023, Oracle and/or its affiliates.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective
    owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    mysql> 
    ```

- 修改mysql配置，支持远程连接（使DataGrip等软件可以远程连接）

  - 执行以下两句sql

  - ```sql
    alter user 'root'@'%' identified with mysql_native_password by '123456';
    flush privileges;
    ```

  - ```sql
    mysql> alter user 'root'@'%' identified with mysql_native_password by '123456';
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> flush privileges;
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> 
    ```

  - 远程连接配置（以DataGrip为例）

    ![Mysql](https://img.picui.cn/free/2024/11/10/67305221ad71a.png)

### 第三部分 安装Redis

- 参考文档：https://blog.csdn.net/IT__learning/article/details/121495138

- 拉取Redis镜像

  - ```
    docker pull redis:7.4
    ```

  - ```shell
    [root@bogon ~]# docker pull redis:7.4
    7.4: Pulling from library/redis
    a480a496ba95: Pull complete 
    89511e3ccef2: Pull complete 
    4ca428e0bb5e: Pull complete 
    41cc262fb5bb: Pull complete 
    228fc9e0b0ff: Pull complete 
    23d1d45ab415: Pull complete 
    4f4fb700ef54: Pull complete 
    6adf9ee29d6f: Pull complete 
    Digest: sha256:a06cea905344470eb49c972f3d030e22f28f632c1b4f43bbe4a26a4329dd6be5
    Status: Downloaded newer image for redis:7.4
    docker.io/library/redis:7.4
    [root@bogon ~]# docker images
    REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
    redis         7.4       f02a7f566928   5 weeks ago     117MB
    mysql         5.7       5107333e08a8   11 months ago   501MB
    hello-world   latest    d2c94e258dcb   18 months ago   13.3kB
    ```

- 手动挂载外部 redis 配置文件（支持远程连接）

  - 官网原版配置文件链接（7.4）https://raw.githubusercontent.com/redis/redis/unstable/redis.conf
  - 下载后进行自定义配置
    - bind 127.0.0.1 ：注释掉这部分，这是限制 redis 只能本地访问
    - protected-mode no ：默认是yes，开启保护模式，限制为本地访问
    - requirepass 123456 ：配置 redis 连接密码，默认是注释的
    - appendonly yes ：redis 持久化，开启了这个 redis 就不会每次重启时自动清空了
  - 在 Linux 任意目录下创建存放 redis 配置文件和数据的目录结构：/docker/redis/conf，/docker/redis/data。
    将改好的配置文件 redis.conf 从官网下载下来放到配置文件目录 /docker/redis/conf 下

- 启动redis

  - ```
    docker run -itd -p 6379:6379 --name myredis -v /docker/redis/conf/redis.conf:/etc/redis/redis.conf -v /docker/redis/data:/data redis:7.4 redis-server /etc/redis/redis.conf
    ```

  - ```shell
    [root@bogon ~]# docker run -itd -p 6379:6379 --name myredis -v /docker/redis/conf/redis.conf:/etc/redis/redis.conf -v /docker/redis/data:/data redis:7.4 redis-server /etc/redis/redis.conf
    a738aeaf904672e840ab430e8ee4a6c628ad129456f090c122424a88019f96a7
    [root@bogon ~]# docker ps 
    CONTAINER ID   IMAGE       COMMAND                   CREATED         STATUS         PORTS                                                  NAMES
    a738aeaf9046   redis:7.4   "docker-entrypoint.s…"   7 seconds ago   Up 6 seconds   0.0.0.0:6379->6379/tcp, :::6379->6379/tcp              myredis
    b8dde08de161   mysql:5.7   "docker-entrypoint.s…"   3 hours ago     Up 3 hours     0.0.0.0:3306->3306/tcp, :::3306->3306/tcp, 33060/tcp   interesting_yalow
    ```

- 远程连接

  - 远程连接配置（以DataGrip为例）

    ![img](https://img.picui.cn/free/2024/11/11/673161214bd7e.png)

### 第四部分 安装Minio

- 参考文档
  - SDK：[软件开发工具包（SDK） — MinIO中文文档 | MinIO Linux中文文档](https://minio.org.cn/docs/minio/linux/developers/minio-drivers.html?ref=docs#java-sdk)
  - Minio安装：[MinIO下载和安装 | 用于创建高性能对象存储的代码和下载内容](https://minio.org.cn/download.shtml#/docker)

- 拉取镜像

  - ```shell
    docker pull minio/minio
    ```

  - ```shell
    [root@localhost ~]# docker pull minio/minio
    Using default tag: latest
    latest: Pulling from minio/minio
    55360c0b72d6: Pull complete 
    f2f8f30a646a: Pull complete 
    3440aa9567dd: Pull complete 
    4414594dd510: Pull complete 
    c1cc85e2de65: Pull complete 
    d57a4fe62ee8: Pull complete 
    48e0cffc0f68: Pull complete 
    2b027acd57fe: Pull complete 
    c1d0e26236f5: Pull complete 
    Digest: sha256:ac591851803a79aee64bc37f66d77c56b0a4b6e12d9e5356380f4105510f2332
    Status: Downloaded newer image for minio/minio:latest
    docker.io/minio/minio:latest
    ```

- 创建minio数据文件夹

  - ```shell
    mkdir -p ../docker/minio/data
    ```

- 启动minio

  - ```shell
    docker run -d -p 9000:9000 -p 9001:9001 -v /docker/minio/data:/data --name minio minio/minio server /data --console-address ":9001"
    ```

- 登录minio控制台

  - 地址: http://192.168.205.101:9001/login
  - 账号: minioadmin
  - 密码: minioadmin

### 第五部分 安装wordpress

- 参考文档

  - [通过 Docker 部署 WordPress 搭建博客保姆级教程 - -Xiaoyang- - 博客园](https://www.cnblogs.com/pzy-Albert/p/18391693#博客主题更换与上传)

- 拉取镜像

  - ```shell
    docker pull wordpress
    ```

- 创建文件夹

  - ```shell
    mkdir -p /docker/wordpress
    ```

- 启动wordpress

  - ```shell
    docker run -it --name wordpress -p 9999:80 -v /docker/wordpress:/var/www/html -d wordpress
    ```

- 配置mysql服务（注意提前启动mysql容器服务）

  - 在mysql数据库里创建一个名为"wordpress"的数据库

  - 编辑器打开/docker/wordpress/wp-config-sample.php。编辑以下内容并保存

    - ```php
      /** The name of the database for WordPress */
      define( 'DB_NAME', 'database_name_here' );
      
      /** Database username */
      define( 'DB_USER', 'root' );
      
      /** Database password */
      define( 'DB_PASSWORD', '123456' );
      
      /** Database hostname */
      define( 'DB_HOST', '192.168.205.101' );
      
      /** Database charset to use in creating database tables. */
      define( 'DB_CHARSET', 'utf8' );
      
      /** The database collate type. Don't change this if in doubt. */
      define( 'DB_COLLATE', '' );
      ```

  - 返回网页端，填写数据库配置信息即可

- 登录wordpress后台

  - 地址: http://192.168.205.101:9999/wp-login.php
  - 账号: cleftgou
  - 密码: 123456

- 附加内容：

  - 修改文件上传大小限制，实现安装第三方博客主题 [Releases · solstice23/argon-theme · GitHub](https://github.com/solstice23/argon-theme/releases)

  - 进入 wordpress 容器

    - ```shell
      docker exec -it wordpress /bin/bash
      ```

  - 进入 php 配置文件目录

    - ```shell
      cd /usr/local/etc/php/conf.d
      ```

  - 生成 uploads.ini 文件

    - ```shell
      touch uploads.ini
      ```

  - 退出容器

    - ```shell
      exit
      ```

  - 查找刚才创建好的文件路径

    - ```shell
      find / -name "uploads.ini"
      ```

    - ```shell
      [root@localhost ~]# find / -name "uploads.ini"
      /var/lib/docker/overlay2/ed6f9b9f49c7fd92ca865829ccd98f00789339d883f24aceebf314234bbe44fa/diff/usr/local/etc/php/conf.d/uploads.ini
      /var/lib/docker/overlay2/ed6f9b9f49c7fd92ca865829ccd98f00789339d883f24aceebf314234bbe44fa/merged/usr/local/etc/php/conf.d/uploads.ini
      ```

    - /var/lib/docker/overlay2/ed6f9b9f49c7fd92ca865829ccd98f00789339d883f24aceebf314234bbe44fa/diff/usr/local/etc/php/conf.d/uploads.ini 修改这个路径下的文件，文件内容如下

    - ```ini
      file_uploads = On
      memory_limit = 500M
      upload_max_filesize = 100M
      post_max_size = 100M
      max_execution_time = 600
      ```

  - 重启下docker容器并刷新网页即可

    - ```shell
      docker restart wordpress
      ```

### 第六部分 安装Portainer

- 参考文档

  - https://blog.csdn.net/weixin_44649780/article/details/128401975

- 拉取镜像

  - ```shell
    docker pull portainer/portainer-ce
    ```

- 创建文件夹

  - ```shell
    mkdir -p /docker/docker.sock/dockerData/portainer
    ```

- 启动Portainer（因为是docker监控管理软件，所以设置自启动）

  - ```shell
    docker run -d -p 9988:9000 -v /docker/docker.sock:/var/run/docker.sock -v /docker/docker.sock/dockerData/portainer:/data --restart=always --name portainer portainer/portainer-ce:latest
    ```

  - –restart=always: 代表在容器退出时总是重启容器，还有其他几种重启策略：no、on-failure、on-failuer:n、unless-stopped

- 登录Portainer控制台

  - 地址: http://192.168.205.101:9988/#!/auth
  - 账号: admin
  - 密码: adminadminadmin

- 连接虚拟机中的docker环境（建议看参考文档，这里只写几个关键步骤）

  - Add environment->Docker Standalone->Api->填写内容如下->Connect

    - ```
      Name: docker-test
      Docker API URL: 192.168.205.101:2375
      ```

- 之后就可以通过Portainer管理docker镜像等

### 第七部分 安装kkFileView

- 参考文档

  - https://kkfileview.keking.cn/zh-cn/docs/home.html

- 拉取镜像

  - ```shell
    docker pull keking/kkfileview:4.1.0
    ```

- 启动kkFileView

  - ```shell
    docker run -d -p 8012:8012 keking/kkfileview:4.1.0
    ```

- 访问测试页

  - 地址：http://192.168.205.101:8012/index

- 使用方法

  - 参考代码

  - 前端，记得执行npm install js-base64

  - ```javascript
      axios.get("/api/user/getContract/safe/" + row.id, {params})
          .then(res => {
            console.log(res.data.data);
            previewContractUrl.value = res.data.data;
            // 使用 js-base64 进行 Base64 编码
            const encodedUrl = Base64.encode(previewContractUrl.value);
            window.open("http://192.168.205.101:8012/onlinePreview?url=" + encodeURIComponent(encodedUrl));
          })
          .catch(err => {
            console.error("预览合同失败:", err);
            alert("预览合同失败，请稍后再试。");
            // 给个默认提示页
            previewContractUrl.value = "http://192.168.205.101:9000/kkfileview/闲拆app系统操作手册.docx";
            const encodedUrl = Base64.encode(previewContractUrl.value);
            window.open("http://192.168.205.101:8012/onlinePreview?url=" + encodeURIComponent(encodedUrl));
          });
    ```

  - 后端

  - ```java
        @GetMapping("/user/getContract/{id}")
        public Result getContract(@PathVariable("id") Integer id) throws Exception {
            // 要调用第三方服务，所以需要public的存储桶，最后返回的url要类似 http://192.168.205.101:9000/kkfileview/闲拆app系统操作手册.docx
            String contractUrl = userContractService.getContractByUserId(id);
            return Result.SUCCESS(contractUrl);
        }
    ```

  - 考虑可以将文件预览服务作为微服务的一部分


### 第八部分 安装Nacos

- 参考文档

  - https://blog.csdn.net/weixin_45692705/article/details/122100852

- 拉取镜像

  - ```shell
    docker pull nacos/nacos-server:1.1.3
    ```

- 创建启动所需文件夹

  - ```shell
    mkdir -p /docker/nacos/logs/
    mkdir -p /docker/nacos/conf/
    ```

  - 创建custom.properties

  - ```shell
    cd /docker/nacos/conf/
    touch custom.properties
    vi custom.properties
    ```

  - 配置文件内容如下

  - ```properties
    #spring.security.enabled=false
    #management.security=false
    #security.basic.enabled=false
    #nacos.security.ignore.urls=/**
    #management.metrics.export.elastic.host=http://localhost:9200
    # metrics for prometheus
    management.endpoints.web.exposure.include=*
    
    # metrics for elastic search
    #management.metrics.export.elastic.enabled=false
    #management.metrics.export.elastic.host=http://localhost:9200
    
    # metrics for influx
    #management.metrics.export.influx.enabled=false
    #management.metrics.export.influx.db=springboot
    #management.metrics.export.influx.uri=http://localhost:8086
    #management.metrics.export.influx.auto-create-db=true
    #management.metrics.export.influx.consistency=one
    #management.metrics.export.influx.compressed=true
    ```

- 启动nacos

  - ```shell
    docker run -d -p 8848:8848 -e MODE=standalone -v /docker/nacos/logs:/home/nacos/logs -v /docker/nacos/conf/custom.properties:/home/nacos/init.d/custom.properties --name nacos nacos/nacos-server:1.1.3
    ```

- 访问nacos

  - 地址：http://192.168.205.101:8848/nacos/index.html#/login
  - 账号：nacos
  - 密码：nacos

- 附加内容：

  - nacos本身就内置了Derby数据库，但不方便管理，所以选择配置mysql服务来管理配置数据

  - 这里使用上面安装好的mysql:5.7作数据库，执行mysql脚本文件，可下载一份windows版的nacos（注意版本）获取，nacos\conf目录下的nacos-mysql.sql，库名nacos-config

  - ```sql
    /******************************************/
    /*   数据库全名 = nacos_config   */
    /*   表名称 = config_info   */
    /******************************************/
    CREATE TABLE `config_info` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
      `data_id` varchar(255) NOT NULL COMMENT 'data_id',
      `group_id` varchar(255) DEFAULT NULL,
      `content` longtext NOT NULL COMMENT 'content',
      `md5` varchar(32) DEFAULT NULL COMMENT 'md5',
      `gmt_create` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '创建时间',
      `gmt_modified` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '修改时间',
      `src_user` text COMMENT 'source user',
      `src_ip` varchar(20) DEFAULT NULL COMMENT 'source ip',
      `app_name` varchar(128) DEFAULT NULL,
      `tenant_id` varchar(128) DEFAULT '' COMMENT '租户字段',
      `c_desc` varchar(256) DEFAULT NULL,
      `c_use` varchar(64) DEFAULT NULL,
      `effect` varchar(64) DEFAULT NULL,
      `type` varchar(64) DEFAULT NULL,
      `c_schema` text,
      PRIMARY KEY (`id`),
      UNIQUE KEY `uk_configinfo_datagrouptenant` (`data_id`,`group_id`,`tenant_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='config_info';
    
    /******************************************/
    /*   数据库全名 = nacos_config   */
    /*   表名称 = config_info_aggr   */
    /******************************************/
    CREATE TABLE `config_info_aggr` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
      `data_id` varchar(255) NOT NULL COMMENT 'data_id',
      `group_id` varchar(255) NOT NULL COMMENT 'group_id',
      `datum_id` varchar(255) NOT NULL COMMENT 'datum_id',
      `content` longtext NOT NULL COMMENT '内容',
      `gmt_modified` datetime NOT NULL COMMENT '修改时间',
      `app_name` varchar(128) DEFAULT NULL,
      `tenant_id` varchar(128) DEFAULT '' COMMENT '租户字段',
      PRIMARY KEY (`id`),
      UNIQUE KEY `uk_configinfoaggr_datagrouptenantdatum` (`data_id`,`group_id`,`tenant_id`,`datum_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='增加租户字段';
    
    
    /******************************************/
    /*   数据库全名 = nacos_config   */
    /*   表名称 = config_info_beta   */
    /******************************************/
    CREATE TABLE `config_info_beta` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
      `data_id` varchar(255) NOT NULL COMMENT 'data_id',
      `group_id` varchar(128) NOT NULL COMMENT 'group_id',
      `app_name` varchar(128) DEFAULT NULL COMMENT 'app_name',
      `content` longtext NOT NULL COMMENT 'content',
      `beta_ips` varchar(1024) DEFAULT NULL COMMENT 'betaIps',
      `md5` varchar(32) DEFAULT NULL COMMENT 'md5',
      `gmt_create` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '创建时间',
      `gmt_modified` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '修改时间',
      `src_user` text COMMENT 'source user',
      `src_ip` varchar(20) DEFAULT NULL COMMENT 'source ip',
      `tenant_id` varchar(128) DEFAULT '' COMMENT '租户字段',
      PRIMARY KEY (`id`),
      UNIQUE KEY `uk_configinfobeta_datagrouptenant` (`data_id`,`group_id`,`tenant_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='config_info_beta';
    
    /******************************************/
    /*   数据库全名 = nacos_config   */
    /*   表名称 = config_info_tag   */
    /******************************************/
    CREATE TABLE `config_info_tag` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
      `data_id` varchar(255) NOT NULL COMMENT 'data_id',
      `group_id` varchar(128) NOT NULL COMMENT 'group_id',
      `tenant_id` varchar(128) DEFAULT '' COMMENT 'tenant_id',
      `tag_id` varchar(128) NOT NULL COMMENT 'tag_id',
      `app_name` varchar(128) DEFAULT NULL COMMENT 'app_name',
      `content` longtext NOT NULL COMMENT 'content',
      `md5` varchar(32) DEFAULT NULL COMMENT 'md5',
      `gmt_create` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '创建时间',
      `gmt_modified` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '修改时间',
      `src_user` text COMMENT 'source user',
      `src_ip` varchar(20) DEFAULT NULL COMMENT 'source ip',
      PRIMARY KEY (`id`),
      UNIQUE KEY `uk_configinfotag_datagrouptenanttag` (`data_id`,`group_id`,`tenant_id`,`tag_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='config_info_tag';
    
    /******************************************/
    /*   数据库全名 = nacos_config   */
    /*   表名称 = config_tags_relation   */
    /******************************************/
    CREATE TABLE `config_tags_relation` (
      `id` bigint(20) NOT NULL COMMENT 'id',
      `tag_name` varchar(128) NOT NULL COMMENT 'tag_name',
      `tag_type` varchar(64) DEFAULT NULL COMMENT 'tag_type',
      `data_id` varchar(255) NOT NULL COMMENT 'data_id',
      `group_id` varchar(128) NOT NULL COMMENT 'group_id',
      `tenant_id` varchar(128) DEFAULT '' COMMENT 'tenant_id',
      `nid` bigint(20) NOT NULL AUTO_INCREMENT,
      PRIMARY KEY (`nid`),
      UNIQUE KEY `uk_configtagrelation_configidtag` (`id`,`tag_name`,`tag_type`),
      KEY `idx_tenant_id` (`tenant_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='config_tag_relation';
    
    /******************************************/
    /*   数据库全名 = nacos_config   */
    /*   表名称 = group_capacity   */
    /******************************************/
    CREATE TABLE `group_capacity` (
      `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
      `group_id` varchar(128) NOT NULL DEFAULT '' COMMENT 'Group ID，空字符表示整个集群',
      `quota` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '配额，0表示使用默认值',
      `usage` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '使用量',
      `max_size` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '单个配置大小上限，单位为字节，0表示使用默认值',
      `max_aggr_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '聚合子配置最大个数，，0表示使用默认值',
      `max_aggr_size` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '单个聚合数据的子配置大小上限，单位为字节，0表示使用默认值',
      `max_history_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '最大变更历史数量',
      `gmt_create` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '创建时间',
      `gmt_modified` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '修改时间',
      PRIMARY KEY (`id`),
      UNIQUE KEY `uk_group_id` (`group_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='集群、各Group容量信息表';
    
    /******************************************/
    /*   数据库全名 = nacos_config   */
    /*   表名称 = his_config_info   */
    /******************************************/
    CREATE TABLE `his_config_info` (
      `id` bigint(64) unsigned NOT NULL,
      `nid` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      `data_id` varchar(255) NOT NULL,
      `group_id` varchar(128) NOT NULL,
      `app_name` varchar(128) DEFAULT NULL COMMENT 'app_name',
      `content` longtext NOT NULL,
      `md5` varchar(32) DEFAULT NULL,
      `gmt_create` datetime NOT NULL DEFAULT '2010-05-05 00:00:00',
      `gmt_modified` datetime NOT NULL DEFAULT '2010-05-05 00:00:00',
      `src_user` text,
      `src_ip` varchar(20) DEFAULT NULL,
      `op_type` char(10) DEFAULT NULL,
      `tenant_id` varchar(128) DEFAULT '' COMMENT '租户字段',
      PRIMARY KEY (`nid`),
      KEY `idx_gmt_create` (`gmt_create`),
      KEY `idx_gmt_modified` (`gmt_modified`),
      KEY `idx_did` (`data_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='多租户改造';
    
    
    /******************************************/
    /*   数据库全名 = nacos_config   */
    /*   表名称 = tenant_capacity   */
    /******************************************/
    CREATE TABLE `tenant_capacity` (
      `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
      `tenant_id` varchar(128) NOT NULL DEFAULT '' COMMENT 'Tenant ID',
      `quota` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '配额，0表示使用默认值',
      `usage` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '使用量',
      `max_size` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '单个配置大小上限，单位为字节，0表示使用默认值',
      `max_aggr_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '聚合子配置最大个数',
      `max_aggr_size` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '单个聚合数据的子配置大小上限，单位为字节，0表示使用默认值',
      `max_history_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '最大变更历史数量',
      `gmt_create` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '创建时间',
      `gmt_modified` datetime NOT NULL DEFAULT '2010-05-05 00:00:00' COMMENT '修改时间',
      PRIMARY KEY (`id`),
      UNIQUE KEY `uk_tenant_id` (`tenant_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='租户容量信息表';
    
    
    CREATE TABLE `tenant_info` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
      `kp` varchar(128) NOT NULL COMMENT 'kp',
      `tenant_id` varchar(128) default '' COMMENT 'tenant_id',
      `tenant_name` varchar(128) default '' COMMENT 'tenant_name',
      `tenant_desc` varchar(256) DEFAULT NULL COMMENT 'tenant_desc',
      `create_source` varchar(32) DEFAULT NULL COMMENT 'create_source',
      `gmt_create` bigint(20) NOT NULL COMMENT '创建时间',
      `gmt_modified` bigint(20) NOT NULL COMMENT '修改时间',
      PRIMARY KEY (`id`),
      UNIQUE KEY `uk_tenant_info_kptenantid` (`kp`,`tenant_id`),
      KEY `idx_tenant_id` (`tenant_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='tenant_info';
    
    CREATE TABLE users (
    	username varchar(50) NOT NULL PRIMARY KEY,
    	password varchar(500) NOT NULL,
    	enabled boolean NOT NULL
    );
    
    CREATE TABLE roles (
    	username varchar(50) NOT NULL,
    	role varchar(50) NOT NULL
    );
    
    INSERT INTO users (username, password, enabled) VALUES ('nacos', '$2a$10$EuWPZHzz32dJN7jexM34MOeYirDdFAZm2kuWj7VEOJhhZkDrxfvUu', TRUE);
    
    INSERT INTO roles (username, role) VALUES ('nacos', 'ROLE_ADMIN');
    ```

  - 进入docker容器中进行配置

    - ```shell
      docker exec -it 8fa47e2aef8a bash
      ```

    - ```shell
      vim conf/application.properties
      ```

    - 在文件末尾加上下面的配置信息

    - ```properties
      #### db config
      spring.datasource.platform=mysql
       
      db.num=1
      db.url.0=jdbc:mysql://192.168.205.101:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
      db.user=root
      db.password=123456
      ```

    - 保存并退出文件，退出容器，重启docker容器

    - ```shell
      wq
      exit
      docker restart 8fa47e2aef8a
      ```

### 第九部分 安装kafka

- 拉取kafka镜像

  - ```shell
    docker pull apache/kafka:3.7.0
    ```

- 需要修改kafka配置文件以支持外部连接

  - 把docker容器中的配置文件复制到linux中（可以省略这一部，下面已经提供了修改好的配置文件）

  - ```shell
    # 可以先启动一个kafka容器，之后再删除
    docker run -p 9092:9092 apache/kafka:3.7.0
    
    # 进入容器
    docker exec -it 容器id /bin/bash 
    
    # 复制文件（提前建立好文件夹/opt/docker/kafka/docker）
    docker cp bf17abcf35f0:/etc/kafka/docker/server.properties /opt/docker/kafka/docker
    ```

  - 编辑复制好的server.properties（以下文件直接用即可）

  - 改动了

    - listeners=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
    - advertised.listeners=PLAINTEXT://192.168.205.101:9092

  - ```properties
    # Licensed to the Apache Software Foundation (ASF) under one or more
    # contributor license agreements.  See the NOTICE file distributed with
    # this work for additional information regarding copyright ownership.
    # The ASF licenses this file to You under the Apache License, Version 2.0
    # (the "License"); you may not use this file except in compliance with
    # the License.  You may obtain a copy of the License at
    #
    #    http://www.apache.org/licenses/LICENSE-2.0
    #
    # Unless required by applicable law or agreed to in writing, software
    # distributed under the License is distributed on an "AS IS" BASIS,
    # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    # See the License for the specific language governing permissions and
    # limitations under the License.
    
    #
    # This configuration file is intended for use in KRaft mode, where
    # Apache ZooKeeper is not present.
    #
    
    ############################# Server Basics #############################
    
    # The role of this server. Setting this puts us in KRaft mode
    process.roles=broker,controller
    
    # The node id associated with this instance's roles
    node.id=1
    
    # The connect string for the controller quorum
    controller.quorum.voters=1@localhost:9093
    
    ############################# Socket Server Settings #############################
    
    # The address the socket server listens on.
    # Combined nodes (i.e. those with `process.roles=broker,controller`) must list the controller listener here at a minimum.
    # If the broker listener is not defined, the default listener will use a host name that is equal to the value of java.net.InetAddress.getCanonicalHostName(),
    # with PLAINTEXT listener name, and port 9092.
    #   FORMAT:
    #     listeners = listener_name://host_name:port
    #   EXAMPLE:
    #     listeners = PLAINTEXT://your.host.name:9092
    # listeners=PLAINTEXT://:9092,CONTROLLER://:9093
    listeners=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
    
    # Name of listener used for communication between brokers.
    inter.broker.listener.name=PLAINTEXT
    
    # Listener name, hostname and port the broker will advertise to clients.
    # If not set, it uses the value for "listeners".
    # advertised.listeners=PLAINTEXT://localhost:9092
    advertised.listeners=PLAINTEXT://192.168.205.101:9092
    
    # A comma-separated list of the names of the listeners used by the controller.
    # If no explicit mapping set in `listener.security.protocol.map`, default will be using PLAINTEXT protocol
    # This is required if running in KRaft mode.
    controller.listener.names=CONTROLLER
    
    # Maps listener names to security protocols, the default is for them to be the same. See the config documentation for more details
    listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,SSL:SSL,SASL_PLAINTEXT:SASL_PLAINTEXT,SASL_SSL:SASL_SSL
    
    # The number of threads that the server uses for receiving requests from the network and sending responses to the network
    num.network.threads=3
    
    # The number of threads that the server uses for processing requests, which may include disk I/O
    num.io.threads=8
    
    # The send buffer (SO_SNDBUF) used by the socket server
    socket.send.buffer.bytes=102400
    
    # The receive buffer (SO_RCVBUF) used by the socket server
    socket.receive.buffer.bytes=102400
    
    # The maximum size of a request that the socket server will accept (protection against OOM)
    socket.request.max.bytes=104857600
    
    
    ############################# Log Basics #############################
    
    # A comma separated list of directories under which to store log files
    log.dirs=/tmp/kraft-combined-logs
    
    # The default number of log partitions per topic. More partitions allow greater
    # parallelism for consumption, but this will also result in more files across
    # the brokers.
    num.partitions=1
    
    # The number of threads per data directory to be used for log recovery at startup and flushing at shutdown.
    # This value is recommended to be increased for installations with data dirs located in RAID array.
    num.recovery.threads.per.data.dir=1
    
    ############################# Internal Topic Settings  #############################
    # The replication factor for the group metadata internal topics "__consumer_offsets" and "__transaction_state"
    # For anything other than development testing, a value greater than 1 is recommended to ensure availability such as 3.
    offsets.topic.replication.factor=1
    transaction.state.log.replication.factor=1
    transaction.state.log.min.isr=1
    
    ############################# Log Flush Policy #############################
    
    # Messages are immediately written to the filesystem but by default we only fsync() to sync
    # the OS cache lazily. The following configurations control the flush of data to disk.
    # There are a few important trade-offs here:
    #    1. Durability: Unflushed data may be lost if you are not using replication.
    #    2. Latency: Very large flush intervals may lead to latency spikes when the flush does occur as there will be a lot of data to flush.
    #    3. Throughput: The flush is generally the most expensive operation, and a small flush interval may lead to excessive seeks.
    # The settings below allow one to configure the flush policy to flush data after a period of time or
    # every N messages (or both). This can be done globally and overridden on a per-topic basis.
    
    # The number of messages to accept before forcing a flush of data to disk
    #log.flush.interval.messages=10000
    
    # The maximum amount of time a message can sit in a log before we force a flush
    #log.flush.interval.ms=1000
    
    ############################# Log Retention Policy #############################
    
    # The following configurations control the disposal of log segments. The policy can
    # be set to delete segments after a period of time, or after a given size has accumulated.
    # A segment will be deleted whenever *either* of these criteria are met. Deletion always happens
    # from the end of the log.
    
    # The minimum age of a log file to be eligible for deletion due to age
    log.retention.hours=168
    
    # A size-based retention policy for logs. Segments are pruned from the log unless the remaining
    # segments drop below log.retention.bytes. Functions independently of log.retention.hours.
    #log.retention.bytes=1073741824
    
    # The maximum size of a log segment file. When this size is reached a new log segment will be created.
    log.segment.bytes=1073741824
    
    # The interval at which log segments are checked to see if they can be deleted according
    # to the retention policies
    log.retention.check.interval.ms=300000
    
    ```

- 启动kafka

  - ```shell
    docker run --volume /opt/docker/kafka/docker:/mnt/shared/config -p 9092:9092 -d --name kafka apache/kafka:3.7.0
    ```

### 第十部分 安装FileCodeBox

- 拉取FileCodeBox镜像

  - ```shell
    docker pull lanol/filecodebox:beta
    ```

- 启动FileCodeBox（注意文件夹的创建）

  - ```shell
    docker run -d -p 12345:12345 -v /docker/FileCodeBox/:/app/data --name filecodebox lanol/filecodebox:beta
    ```

- 登录FileCodeBox用户端

  - 地址: http://192.168.205.101:12345/#/
  - 账号: minioadmin
  - 密码: minioadmin

- 登录FileCodeBox管理端

  - 地址:http://192.168.205.101:12345/#/admin
  - 密码:FileCodeBox2023

### 第十一部分 安装GitLab 

- 拉取并运行镜像（注意配置下环境变量，如何配置在Java章节有说明）

  - ```shell
    # 环境变量
    export GITLAB_HOME=/srv/gitlab
    
    # 创建文件夹
    sudo mkdir -p $GITLAB_HOME/{config,logs,data}
    sudo chmod -R 775 $GITLAB_HOME
    
    # 启动
    docker run --detach \
      --hostname 192.168.44.103 \
      --publish 443:443 --publish 80:80 \
      --name gitlab \
      --restart always \
      --volume $GITLAB_HOME/config:/etc/gitlab:Z \
      --volume $GITLAB_HOME/logs:/var/log/gitlab:Z \
      --volume $GITLAB_HOME/data:/var/opt/gitlab:Z \
      --shm-size 256m \
      registry.gitlab.cn/omnibus/gitlab-jh:latest
    ```

- 初始账户

  - 账号：root

  - 密码：见下方获取

    - ```shell
      # 进入容器后使用命令获取（注意24小时内有效）
      cat /etc/gitlab/initial_root_password
      ```

      


## 第三章 使用1Panel面板工具管理Linux服务器

### 第一部分 安装1Panel

- 参考文档：https://1panel.cn/docs/

- 安装

  - ```shell
    curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sh quick_start.sh
    ```

  - ```shell
    [root@localhost ~]# curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sh quick_start.sh
    开始下载 1Panel v1.10.21-lts 版本在线安装包
    安装包下载地址： https://resource.fit2cloud.com/1panel/package/stable/v1.10.21-lts/release/1panel-v1.10.21-lts-linux-amd64.tar.gz
      % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    100 41.6M  100 41.6M    0     0  2316k      0  0:00:18  0:00:18 --:--:-- 2316k
    1panel-v1.10.21-lts-linux-amd64/1panel.service
    1panel-v1.10.21-lts-linux-amd64/1pctl
    1panel-v1.10.21-lts-linux-amd64/LICENSE
    1panel-v1.10.21-lts-linux-amd64/README.md
    1panel-v1.10.21-lts-linux-amd64/install.sh
    1panel-v1.10.21-lts-linux-amd64/1panel
    
     ██╗    ██████╗  █████╗ ███╗   ██╗███████╗██╗     
    ███║    ██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     
    ╚██║    ██████╔╝███████║██╔██╗ ██║█████╗  ██║     
     ██║    ██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║     
     ██║    ██║     ██║  ██║██║ ╚████║███████╗███████╗
     ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
    [1Panel Log]: ======================= 开始安装 ======================= 
    设置 1Panel 安装目录（默认为/opt）：
    [1Panel Log]: 您选择的安装路径为 /opt 
    是否配置镜像加速？(y/n): y
    [1Panel Log]: 创建新的配置文件 /etc/docker/daemon.json... 
    [1Panel Log]: 镜像加速配置已添加。 
    [1Panel Log]: 正在重启 Docker 服务... 
    [1Panel Log]: Docker 服务已成功重启。 
    [1Panel Log]: ... 在线安装 docker-compose 
      % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    100 59.8M  100 59.8M    0     0  2279k      0  0:00:26  0:00:26 --:--:-- 2347k
    [1Panel Log]: docker-compose 安装成功 
    设置 1Panel 端口（默认为39862）：
    [1Panel Log]: 您设置的端口为：39862 
    [1Panel Log]: 防火墙未开启，忽略端口开放 
    设置 1Panel 安全入口（默认为c3903d1480）：
    [1Panel Log]: 您设置的面板安全入口为：c3903d1480 
    设置 1Panel 面板用户（默认为2b5b030eab）：admin123
    [1Panel Log]: 您设置的面板用户为：admin123 
    [1Panel Log]: 设置 1Panel 面板密码，设置完成后直接回车以继续（默认为7f89f698e7）： 
    ********
    [1Panel Log]: 配置 1Panel Service 
    Created symlink from /etc/systemd/system/multi-user.target.wants/1panel.service to /etc/systemd/system/1panel.service.
    [1Panel Log]: 启动 1Panel 服务 
    [1Panel Log]: 1Panel 服务启动成功! 
    [1Panel Log]:  
    [1Panel Log]: =================感谢您的耐心等待，安装已经完成================== 
    [1Panel Log]:  
    [1Panel Log]: 请用浏览器访问面板: 
    [1Panel Log]: 外网地址: http://171.8.200.20:39862/c3903d1480 
    [1Panel Log]: 内网地址: http://192.168.205.104:39862/c3903d1480 
    [1Panel Log]: 面板用户: admin123 
    [1Panel Log]: 面板密码: admin123 
    [1Panel Log]:  
    [1Panel Log]: 项目官网: https://1panel.cn 
    [1Panel Log]: 项目文档: https://1panel.cn/docs 
    [1Panel Log]: 代码仓库: https://github.com/1Panel-dev/1Panel 
    [1Panel Log]:  
    [1Panel Log]: 如果使用的是云服务器，请至安全组开放 39862 端口 
    [1Panel Log]:  
    [1Panel Log]: 为了您的服务器安全，在您离开此界面后您将无法再看到您的密码，请务必牢记您的密码。 
    [1Panel Log]:  
    [1Panel Log]: ================================================================
    ```

    

## 第四章 综合应用

### 第一部分 Jenkins + Allure + Pytest 流水线搭建

| 组件       | 版本                             |
| ---------- | -------------------------------- |
| Jenkins    | 2.541.3 (LTS)，Docker 部署       |
| 基础镜像   | jenkins/jenkins:lts              |
| 宿主机系统 | Windows（Docker Desktop）        |
| Java       | OpenJDK 21（容器自带）           |
| Python     | 3.13（手动安装，后面详细讲解）   |
| Allure     | 2.44.0（手动安装，后面详细讲解） |
| 代码仓库   | Gitee（私有）                    |

#### 一. 容器网络配置

由于 Jenkins 容器默认使用 Debian 官方软件源，在国内访问速度慢或无法连接，需要**在安装任何工具之前（本节中的python安装）**先配置国内镜像源。

> 📌 **建议顺序**：配置镜像源 → 安装 Python → 安装 Allure

##### 1.1 以 root 身份进入容器

```bash
docker exec -u root -it my-jenkins /bin/bash
```

> ⚠️ **注意**：不要使用 `su root`，容器未设置 root 密码，会报 `Authentication failure`。

##### 1.2 备份原有源配置（实测直接跳过就行）

```bash
cp /etc/apt/sources.list /etc/apt/sources.list.bak 2>/dev/null
```

##### 1.3 写入清华镜像源

```bash
cat > /etc/apt/sources.list << 'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ trixie main contrib non-free non-free-firmware
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ trixie-updates main contrib non-free non-free-firmware
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ trixie-backports main contrib non-free non-free-firmware
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security trixie-security main contrib non-free non-free-firmware
EOF
```

##### 1.4 验证源配置

```bash
apt-get update
```

如果 `apt-get update` 成功，说明镜像源配置生效。

#### 三. 安装 Python 环境

Jenkins 官方镜像不包含 Python。需要手动安装。

##### 3.1 安装 Python 及相关包

```bash
apt-get install -y python3 python3-pip python3-venv python3-full
```

| 包名           | 作用                             |
| -------------- | -------------------------------- |
| `python3`      | Python 3 运行时                  |
| `python3-pip`  | Python 包管理器                  |
| `python3-venv` | 虚拟环境创建工具（必须手动指明） |
| `python3-full` | 完整标准库（含 `ensurepip`）     |

##### 3.2 关于环境变量

| 变量         | 是否需要配置 | 说明                     |
| ------------ | ------------ | ------------------------ |
| `PATH`       | ❌ 不需要     | `apt-get` 安装会自动配置 |
| `PYTHONHOME` | ❌ 不需要     | 系统级安装不需要设置     |

#### 四. 安装 Allure

Jenkins 的自动下载功能因网络问题可能失败，建议采用手动安装方式。

##### 4.1 在容器内直接下载

```bash
cd /opt

# 使用 curl 下载
curl -L -o allure-2.44.0.tgz https://github.com/allure-framework/allure2/releases/download/2.44.0/allure-2.44.0.tgz

# 解压
tar -zxvf allure-2.44.0.tgz

# 删除压缩包
rm allure-2.44.0.tgz
```

#### 五. Jenkins 全局工具配置

##### 5.1 配置 Allure Commandline（Jenkins需要已经安装allure插件）

路径：**系统管理 → 全局工具配置 → Allure Commandline**

| 配置项                             | 填写内容             |
| ---------------------------------- | -------------------- |
| 别名（Name）                       | `allure-2.44.0`      |
| 自动安装                           | ❌ 不勾选             |
| 安装目录（Installation Directory） | `/opt/allure-2.44.0` |

#### 六. Jenkins 任务配置

##### 6.1 构建步骤（Execute Shell）脚本

```bash
#!/bin/bash
cd ${WORKSPACE}

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行测试（相关命令在pytest.ini中提前配置）
pytest
```
