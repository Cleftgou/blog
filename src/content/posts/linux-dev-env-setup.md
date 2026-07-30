---
title: Linux基础开发环境配置
published: 2024-01-05
description: VMware 安装 CentOS 7，裸机部署 Java、Nginx、MySQL、Python 等基础开发环境，以及 1Panel 面板管理服务器的配置笔记。
image: /images/covers/cover_13.jpg
tags: [Linux, CentOS, Nginx, MySQL, Java, Python, 1Panel, 运维, 环境配置]
category: 运维
draft: false
---

## 一、安装 CentOS 7

参考文档：[在VMware中安装CentOS7（超详细的图文教程）](https://blog.csdn.net/qq_45743985/article/details/121152504)

镜像选用 CentOS-7-x86_64-DVD-2009.iso。VMware 操作流程如下，没有提到的步骤按系统推荐设置即可：

1. 新建虚拟机
2. 选自定义(高级)安装
3. 稍后安装操作系统
4. 更改虚拟机安装位置（比如 `E:\VMwareComputer\CentOS 7 64 位 04`，注意自己把文件夹创建出来）
5. 使用网络地址转换(NAT)
6. 将虚拟磁盘拆分成多个文件
7. 成功创建出空的虚拟机后再配置所选 iso

进入安装界面后，软件安装选择 **GNOME桌面**（方便后续图形化界面配置网络）。安装完成后会提示重启，进入 GUI 桌面环境，使用 root 账户登录。

## 二、网络及防火墙配置

参考文档：[Linux Centos7 防火墙（开启、关闭、重启、状态、端口）](https://blog.csdn.net/m0_47087822/article/details/123179648)

点击右上角网络图标，配置网络自动连接以及自定义 ip 地址：

![img](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/1.png)

![img](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2.png)

> CentOS 7 默认启用 firewalld，为了实现后续各个端口的远程访问连接，需要关闭。

#### 查看状态

```shell
systemctl status firewalld
```

```shell
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

#### 关闭与禁用

1. 临时关闭：

```shell
systemctl stop firewalld
```

2. 永久禁用（重启后也不启动）：

```shell
systemctl disable firewalld
```

```shell
[root@bogon ~]# systemctl disable firewalld
Removed symlink /etc/systemd/system/multi-user.target.wants/firewalld.service.
Removed symlink /etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service.
```

> 如需恢复：`systemctl start firewalld`（启动）、`systemctl enable firewalld`（启用开机自启）。

## 三、配置阿里云 yum 镜像

参考文档：[CentOS7配置阿里云镜像源（超详细过程）](https://blog.csdn.net/KingveyLee/article/details/114984534)

1. 备份官方 yum 源配置：

```shell
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
```

2. 下载阿里云 Centos-7.repo 文件：

```shell
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

3. 清除旧缓存并生成新缓存：

```shell
yum clean all
yum makecache
```

4. 验证——看到 `mirrors.aliyun.com` 即表示配置成功：

```shell
yum list | head -n 20
```

```shell
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

## 四、磁盘扩容

参考文档：[VMware CentOS7 磁盘扩容](https://blog.csdn.net/hualinger/article/details/121553556?spm=1001.2014.3001.5506)

按上述文档步骤操作即可。

## 五、安装 Java

> 下载地址：[OpenLogic OpenJDK Downloads](https://www.openlogic.com/openjdk-downloads)

1. 下载 tar.gz 压缩包，解压：

```shell
tar -xzvf openlogic-openjdk-8u432-b06-linux-x64.tar.gz
```

2. 配置环境变量——打开 `/etc/profile`：

```shell
vi /etc/profile
```

在文件末尾添加：

```shell
export JAVA_HOME=/opt/java/openlogic-openjdk-8u432-b06-linux-x64
export PATH=$JAVA_HOME/bin:$PATH
export CLASSPATH=.:$JAVA_HOME/lib
```

3. 使配置生效：

```shell
source /etc/profile
```

> OpenJDK 解压即用，无需 `make install`。

### 附加：SpringBoot 应用启动脚本

```shell
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

## 六、安装 Nginx

> 下载地址：[nginx: download](https://nginx.org/en/download.html)

1. 下载 tar.gz 压缩包，解压：

```shell
tar -xzvf nginx-1.27.0.tar.gz
```

2. 进入解压后的目录：

```shell
cd nginx-1.27.0
```

3. 安装依赖并配置安装路径：

```shell
# 阿里云服务器镜像可能会出现缺少必要依赖的情况，此时需要先执行以下命令安装依赖
yum install pcre pcre-devel
yum install zlib zlib-devel

# 指定安装位置
./configure --prefix=/opt/nginx/nginx
```

4. 编译安装：

```shell
make && make install
```

> 安装后，`conf` 文件夹下的 `nginx.conf` 是核心配置文件。初始目录结构如下：

```shell
[root@bogon nginx]# cd nginx
[root@bogon nginx]# ll
总用量 4
drwxr-xr-x. 2 root root 4096 1月  29 12:15 conf
drwxr-xr-x. 2 root root   40 1月  29 12:15 html
drwxr-xr-x. 2 root root    6 1月  29 12:15 logs
drwxr-xr-x. 2 root root   19 1月  29 12:15 sbin
```

#### 启动与停止

```shell
# 启动（在 sbin 目录下）
[root@bogon sbin]# ll
总用量 3840
-rwxr-xr-x. 1 root root 3930912 1月  29 12:15 nginx
[root@bogon sbin]# ./nginx

# 终止
[root@bogon sbin]# ./nginx -s quit
```

### 附加一：nginx.conf 参考配置

```nginx
 
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

### 附加二：Nginx 启动脚本

```shell
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

## 七、安装 MySQL

> 下载地址：[MySQL Community Downloads](https://downloads.mysql.com/archives/community/)

本节记录支持远程连接的账户配置：

```sql
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

## 八、安装 Python

> CentOS 7 自带 Python 2.7，不推荐卸载（`yum` 等系统工具依赖它）。建议直接安装新版本，通过虚拟环境使用。

本次采用源码方式安装 Python 3.8.8。

1. 安装编译依赖：

```shell
yum groupinstall "Development Tools" -y
yum install zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel libffi-devel -y
```

2. 下载源码：

```shell
mkdir -p /opt/python
cd /opt/python
wget https://mirrors.huaweicloud.com/python/3.8.8/Python-3.8.8.tgz
```

3. 解压并进入目录：

```shell
tar xzf Python-3.8.8.tgz
cd Python-3.8.8
```

4. 配置、编译和安装：

```shell
./configure --enable-optimizations --enable-shared
make altinstall
```

5. 将库路径添加到系统配置：

```shell
vi /etc/ld.so.conf.d/python3.8.conf
```

写入：

```
/usr/local/lib
```

```shell
sudo ldconfig
```

6. 验证安装：

```shell
python3.8 --version
```

#### 创建虚拟环境

```shell
# 创建一个虚拟环境
python3.8 -m venv /app/myproject_env

# 激活（在虚拟环境中直接用python命令即可）
source /app/myproject_env/bin/activate

# 退出虚拟环境
deactivate
```

## 九、安装 Jenkins

（待补充）

## 十、使用 1Panel 面板管理 Linux 服务器

参考文档：[1Panel 官方文档](https://1panel.cn/docs/)

> 1Panel 是一款开源 Linux 服务器管理面板，提供图形化的 Docker、文件、网站、数据库管理功能。

```shell
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sh quick_start.sh
```

```shell
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
