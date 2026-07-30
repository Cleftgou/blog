---
title: Docker 部署常用服务实战
published: 2024-06-01
description: CentOS 7 下 Docker 安装配置，以及 MySQL、Redis、Minio、WordPress、Portainer、Nacos、Kafka 等常用服务的容器化部署笔记。
image: /images/covers/cover_11.jpg
tags: [Docker, MySQL, Redis, Minio, Nacos, Kafka, Portainer, 运维, 环境配置]
category: 运维
draft: false
---

## 一、安装 Docker

### 1.1 基础安装

1. 更新 yum：

```
yum update
```

```shell
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

2. 安装 Docker 前置依赖：

```
yum install -y yum-utils device-mapper-persistent-data lvm2
```

```shell
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

3. 配置 Docker 下载镜像：

```
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

```shell
[root@bogon ~]# yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
已加载插件：fastestmirror, langpacks
adding repo from: http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
grabbing file http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo to /etc/yum.repos.d/docker-ce.repo
repo saved to /etc/yum.repos.d/docker-ce.repo
```

4. 清理 yum 缓存：

```
yum clean all
```

```shell
[root@bogon ~]# yum clean all
已加载插件：fastestmirror, langpacks
正在清理软件源： base docker-ce-stable extras updates
Cleaning up list of fastest mirrors
```

5. 重新加载 yum：

```
yum makecache fast
```

```shell
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

6. 安装 Docker：

```
yum install -y docker-ce docker-ce-cli containerd.io
```

```shell
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

7. 启动并设置开机自启：

```
systemctl start docker
systemctl enable docker
```

```shell
[root@bogon ~]# systemctl start docker
[root@bogon ~]# systemctl enable docker
Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service.
```

8. 验证——查看 Docker 版本：

```
docker version
```

```shell
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

### 1.2 配置镜像加速

> 由于 Docker Hub 在国内访问不稳定，需要配置镜像加速。截止目前（2024/12/06）可用的镜像合集见 [DockerHub Mirror](https://github.com/dongyubin/DockerHub)。

编辑 `/etc/docker/daemon.json`，可选镜像如下：

```json
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

快速写入并重启 Docker：

```
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

```shell
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

### 1.3 配置 Docker 远程连接

> IDEA 可以通过 Docker 插件直接连接到虚拟机上的 Docker 引擎。

修改 `/usr/lib/systemd/system/docker.service`：

```
vim /usr/lib/systemd/system/docker.service
```

将：
```
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
```
改为：
```
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock -H tcp://0.0.0.0:2375
```

```
systemctl daemon-reload
systemctl restart docker
```

远程连接示例（以 DataGrip 为例，MySQL 服务的配置见第二节）：

![Mysql](https://img.picui.cn/free/2024/11/10/67305376860bd.png)

![Mysql](https://img.picui.cn/free/2024/11/10/6730536d0d2c4.png)

### 1.4 验证安装

```shell
docker pull hello-world
docker run hello-world
```

```shell
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

### 1.5 常用命令速查

> 更多命令可参考[尚硅谷 Docker 教程笔记](https://pan.baidu.com/s/1PhTeMkX5vOg0ZRcw0abjCw?pwd=yyds#list/path=%2Fsharelink4035995002-769892715607674%2F%E5%B0%9A%E7%A1%85%E8%B0%B7Java%E5%AD%A6%E7%A7%91%E5%85%A8%E5%A5%97%E6%95%99%E7%A8%8B%2F3.%E5%B0%9A%E7%A1%85%E8%B0%B7%E5%85%A8%E5%A5%97JAVA%E6%95%99%E7%A8%8B--%E5%BE%AE%E6%9C%8D%E5%8A%A1%E7%94%9F%E6%80%81%EF%BC%8866.68GB%EF%BC%89%2F%E5%B0%9A%E7%A1%85%E8%B0%B72024%E6%96%B0%E7%89%883%E5%B0%8F%E6%97%B6%E9%80%9F%E9%80%9ADocker%E6%95%99%E7%A8%8B%2F%E7%AC%94%E8%AE%B0&parentPath=%2Fsharelink4035995002-769892715607674)。

查看可供选择的版本或安装指定版本：

```
yum list docker-ce --showduplicates | sort -r
yum install docker-ce-18.03.1.ce
```

日常高频命令：

| 操作 | 命令 |
|------|------|
| 查看运行中的容器 | `docker ps` |
| 查看所有容器 | `docker ps -a` |
| 下载指定版本镜像 | `docker pull nginx:1.26.0` |
| 查看所有镜像 | `docker images` |
| 删除指定镜像 | `docker rmi e784f4560448` |
| 运行一个新容器 | `docker run nginx` |
| 停止容器 | `docker stop keen_blackwell` |
| 启动已存在的容器 | `docker start e784f4560448` |
| 强制删除指定容器 | `docker rm -f e784f4560448` |
| 进入某个容器 | `docker exec -it gitlab /bin/bash` |

## 二、安装 MySQL

参考文档：[Docker配置MySQL容器+远程连接（全流程）](https://blog.csdn.net/qq_43781399/article/details/112650755)

拉取镜像：

```
docker pull mysql:5.7
```

```shell
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

#### 处理原有主机 MySQL 服务

> 如果主机原本安装了 MySQL 8，需要先停止以避免端口冲突。未安装则可跳过。

**查看状态：**

```
service mysqld status
```

```shell
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

**停止服务：**

```
service mysqld stop
```

```shell
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

**启动服务：**

```
service mysqld start
```

```shell
[root@bogon ~]# service mysqld start
Redirecting to /bin/systemctl start mysqld.service
```

**管理开机自启：**

```
# 查看当前状态（enabled 表示已开启自启动）
systemctl list-unit-files | grep 'mysql'
# 关闭自启动
systemctl disable mysqld
# 开启自启动
systemctl enable mysqld
```

```shell
[root@bogon ~]# systemctl list-unit-files | grep 'mysql'
mysqld.service                                enabled 
mysqld@.service                               disabled
[root@bogon ~]# systemctl disable mysqld
Removed symlink /etc/systemd/system/multi-user.target.wants/mysqld.service.
[root@bogon ~]# systemctl enable mysqld
Created symlink from /etc/systemd/system/multi-user.target.wants/mysqld.service to /usr/lib/systemd/system/mysqld.service.
```

#### 启动 MySQL 容器

> 如果主机 3306 已被占用，替换为 `-p3307:3306`，或者先停止原有 MySQL 服务。

```
docker run -d -p3306:3306 -v /app/myconf:/etc/mysql/conf.d -v /app/mydata:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7
```

```shell
[root@bogon ~]# docker run -d -p3306:3306 -v /app/myconf:/etc/mysql/conf.d -v /app/mydata:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7
b8dde08de161c19032018aecf47b4b475ebad4de42e13345e209ad10d9c009fc
[root@bogon ~]# docker ps -a
CONTAINER ID   IMAGE         COMMAND                   CREATED          STATUS                      PORTS                                                  NAMES
b8dde08de161   mysql:5.7     "docker-entrypoint.s…"   2 seconds ago    Up 1 second                 0.0.0.0:3306->3306/tcp, :::3306->3306/tcp, 33060/tcp   interesting_yalow
d6b0c1a3661a   hello-world   "/hello"                  34 minutes ago   Exited (0) 34 minutes ago                                                          boring_galileo
```

进入容器（`interesting_yalow` 是容器的 names）：

```
docker exec -it interesting_yalow mysql -uroot -p123456
```

```shell
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

#### 配置远程连接

在容器内执行以下 SQL，使 DataGrip 等工具可以远程连接：

```sql
alter user 'root'@'%' identified with mysql_native_password by '123456';
flush privileges;
```

```sql
mysql> alter user 'root'@'%' identified with mysql_native_password by '123456';
Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges;
Query OK, 0 rows affected (0.00 sec)

mysql> 
```

以 DataGrip 为例配置远程连接：

![Mysql](https://img.picui.cn/free/2024/11/10/67305221ad71a.png)

## 三、安装 Redis

参考文档：[Docker 安装 Redis 并配置文件挂载](https://blog.csdn.net/IT__learning/article/details/121495138)

拉取镜像：

```
docker pull redis:7.4
```

```shell
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

#### 自定义配置

> 下载官方配置文件 [redis.conf (7.4)](https://raw.githubusercontent.com/redis/redis/unstable/redis.conf)，修改以下项以支持远程连接和持久化：

- `bind 127.0.0.1` —— 注释掉，否则只允许本地访问
- `protected-mode no` —— 关闭保护模式
- `requirepass 123456` —— 设置连接密码
- `appendonly yes` —— 开启持久化，重启后数据不丢失

创建存放目录并放入修改好的配置文件：

```shell
mkdir -p /docker/redis/conf /docker/redis/data
# 将修改好的 redis.conf 放入 /docker/redis/conf/
```

启动：

```
docker run -itd -p 6379:6379 --name myredis -v /docker/redis/conf/redis.conf:/etc/redis/redis.conf -v /docker/redis/data:/data redis:7.4 redis-server /etc/redis/redis.conf
```

```shell
[root@bogon ~]# docker run -itd -p 6379:6379 --name myredis -v /docker/redis/conf/redis.conf:/etc/redis/redis.conf -v /docker/redis/data:/data redis:7.4 redis-server /etc/redis/redis.conf
a738aeaf904672e840ab430e8ee4a6c628ad129456f090c122424a88019f96a7
[root@bogon ~]# docker ps 
CONTAINER ID   IMAGE       COMMAND                   CREATED         STATUS         PORTS                                                  NAMES
a738aeaf9046   redis:7.4   "docker-entrypoint.s…"   7 seconds ago   Up 6 seconds   0.0.0.0:6379->6379/tcp, :::6379->6379/tcp              myredis
b8dde08de161   mysql:5.7   "docker-entrypoint.s…"   3 hours ago     Up 3 hours     0.0.0.0:3306->3306/tcp, :::3306->3306/tcp, 33060/tcp   interesting_yalow
```

远程连接（以 DataGrip 为例）：

![img](https://img.picui.cn/free/2024/11/11/673161214bd7e.png)

## 四、安装 Minio

> SDK 文档：[MinIO中文文档](https://minio.org.cn/docs/minio/linux/developers/minio-drivers.html?ref=docs#java-sdk)——安装教程：[MinIO下载和安装](https://minio.org.cn/download.shtml#/docker)

```shell
docker pull minio/minio
```

```shell
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

创建数据目录并启动：

```shell
mkdir -p ../docker/minio/data
docker run -d -p 9000:9000 -p 9001:9001 -v /docker/minio/data:/data --name minio minio/minio server /data --console-address ":9001"
```

控制台地址 `http://192.168.205.101:9001/login`，初始账号密码均为 `minioadmin`。

## 五、安装 WordPress

参考文档：[通过 Docker 部署 WordPress 搭建博客保姆级教程](https://www.cnblogs.com/pzy-Albert/p/18391693#博客主题更换与上传)

```shell
docker pull wordpress
mkdir -p /docker/wordpress
docker run -it --name wordpress -p 9999:80 -v /docker/wordpress:/var/www/html -d wordpress
```

WordPress 依赖 MySQL，需要提前启动 MySQL 容器并在库中创建名为 `wordpress` 的数据库。然后编辑 `/docker/wordpress/wp-config-sample.php`：

```php
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

返回网页端填写数据库配置即可。后台地址 `http://192.168.205.101:9999/wp-login.php`，账号 `cleftgou`，密码 `123456`。

### 附加：修改文件上传大小限制

> 安装第三方主题（如 [Argon Theme](https://github.com/solstice23/argon-theme/releases)）时需要放宽上传限制。

```shell
# 进入容器
docker exec -it wordpress /bin/bash
# 进入 PHP 配置目录
cd /usr/local/etc/php/conf.d
# 生成 uploads.ini
touch uploads.ini
# 退出容器
exit
# 查找文件路径
find / -name "uploads.ini"
```

```shell
[root@localhost ~]# find / -name "uploads.ini"
/var/lib/docker/overlay2/ed6f9b9f49c7fd92ca865829ccd98f00789339d883f24aceebf314234bbe44fa/diff/usr/local/etc/php/conf.d/uploads.ini
/var/lib/docker/overlay2/ed6f9b9f49c7fd92ca865829ccd98f00789339d883f24aceebf314234bbe44fa/merged/usr/local/etc/php/conf.d/uploads.ini
```

修改 `diff` 路径下的 `uploads.ini`（注意找 `diff` 那个文件）：

```ini
file_uploads = On
memory_limit = 500M
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 600
```

重启容器：

```shell
docker restart wordpress
```

## 六、安装 Portainer

参考文档：[Docker 安装 Portainer 图形化界面](https://blog.csdn.net/weixin_44649780/article/details/128401975)

Portainer 是 Docker 的 Web 管理工具，便于在图形化界面中管理镜像和容器。

```shell
docker pull portainer/portainer-ce
mkdir -p /docker/docker.sock/dockerData/portainer
docker run -d -p 9988:9000 -v /docker/docker.sock:/var/run/docker.sock -v /docker/docker.sock/dockerData/portainer:/data --restart=always --name portainer portainer/portainer-ce:latest
```

> `--restart=always` 表示容器退出时总是重启。其他策略：`no`、`on-failure`、`on-failure:n`、`unless-stopped`。

控制台地址 `http://192.168.205.101:9988/#!/auth`，账号 `admin`，密码 `adminadminadmin`。

连接虚拟机 Docker 环境（Add environment → Docker Standalone → Api）：

```
Name: docker-test
Docker API URL: 192.168.205.101:2375
```

之后即可通过 Portainer 管理 Docker。

## 七、安装 kkFileView

参考文档：[kkFileView 官方文档](https://kkfileview.keking.cn/zh-cn/docs/home.html)

kkFileView 是一个文件在线预览服务，支持 docx、pdf 等常见格式。

```shell
docker pull keking/kkfileview:4.1.0
docker run -d -p 8012:8012 keking/kkfileview:4.1.0
```

测试页：`http://192.168.205.101:8012/index`

#### 代码集成示例

前端（需 `npm install js-base64`）：

```javascript
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

后端：

```java
      @GetMapping("/user/getContract/{id}")
      public Result getContract(@PathVariable("id") Integer id) throws Exception {
          // 要调用第三方服务，所以需要public的存储桶，最后返回的url要类似 http://192.168.205.101:9000/kkfileview/闲拆app系统操作手册.docx
          String contractUrl = userContractService.getContractByUserId(id);
          return Result.SUCCESS(contractUrl);
      }
```

> 可以考虑将文件预览服务作为微服务的一部分。

## 八、安装 Nacos

参考文档：[Docker 安装 Nacos](https://blog.csdn.net/weixin_45692705/article/details/122100852)

```shell
docker pull nacos/nacos-server:1.1.3
mkdir -p /docker/nacos/logs/ /docker/nacos/conf/
cd /docker/nacos/conf/
touch custom.properties
vi custom.properties
```

`custom.properties` 内容：

```properties
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

启动：

```shell
docker run -d -p 8848:8848 -e MODE=standalone -v /docker/nacos/logs:/home/nacos/logs -v /docker/nacos/conf/custom.properties:/home/nacos/init.d/custom.properties --name nacos nacos/nacos-server:1.1.3
```

控制台地址 `http://192.168.205.101:8848/nacos/index.html#/login`，账号密码均为 `nacos`。

### 附加：配置 MySQL 持久化

> Nacos 内置 Derby 数据库不便于管理，建议改用 MySQL。

在安装好的 `mysql:5.7` 中执行初始化脚本。可从 Windows 版 Nacos（注意版本匹配）的 `nacos\conf` 目录获取 `nacos-mysql.sql`，库名为 `nacos-config`。

```sql
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

然后进入容器配置数据库连接：

```shell
docker exec -it 8fa47e2aef8a bash
vim conf/application.properties
```

在 `application.properties` 末尾添加：

```properties
#### db config
spring.datasource.platform=mysql
 
db.num=1
db.url.0=jdbc:mysql://192.168.205.101:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.user=root
db.password=123456
```

```shell
wq
exit
docker restart 8fa47e2aef8a
```

## 九、安装 Kafka

```shell
docker pull apache/kafka:3.7.0
```

> Kafka 默认配置不允许外部客户端连接，需要修改 `server.properties`。

可先启动再拷贝配置：

```shell
# 临时启动
docker run -p 9092:9092 apache/kafka:3.7.0
# 进入容器
docker exec -it 容器id /bin/bash 
# 复制配置文件（提前创建 /opt/docker/kafka/docker）
docker cp bf17abcf35f0:/etc/kafka/docker/server.properties /opt/docker/kafka/docker
```

编辑 `server.properties`，关键改动两处：

- `listeners=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093`
- `advertised.listeners=PLAINTEXT://192.168.205.101:9092`

完整配置如下（可直接使用）：

```properties
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

启动：

```shell
docker run --volume /opt/docker/kafka/docker:/mnt/shared/config -p 9092:9092 -d --name kafka apache/kafka:3.7.0
```

## 十、安装 FileCodeBox

FileCodeBox 是一款轻量级文件分享工具。

```shell
docker pull lanol/filecodebox:beta
docker run -d -p 12345:12345 -v /docker/FileCodeBox/:/app/data --name filecodebox lanol/filecodebox:beta
```

用户端 `http://192.168.205.101:12345/#/`（账号 `minioadmin` / 密码 `minioadmin`），管理端 `http://192.168.205.101:12345/#/admin`（密码 `FileCodeBox2023`）。

## 十一、安装 GitLab

环境变量需提前配置（若已按 Java 章节配置则跳过）：

```shell
export GITLAB_HOME=/srv/gitlab
sudo mkdir -p $GITLAB_HOME/{config,logs,data}
sudo chmod -R 775 $GITLAB_HOME

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

初始账号为 `root`，密码从容器内获取（24 小时内有效）：

```shell
docker exec -it gitlab cat /etc/gitlab/initial_root_password
```
