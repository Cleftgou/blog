---
title: 从阿里云 SLS 到本地 Loki 模拟实践
published: 2026-07-30
description: 了解 SLS 云日志服务，记录个人使用经历与踩坑故事，并在本地用 Loki + Promtail + Grafana 搭建一套轻量级日志系统的完整笔记。
image: /images/covers/cover_16.jpg
tags: [Loki, SLS, Grafana, Promtail, Docker, 日志系统, 运维]
category: 运维
draft: false
---

## 一、什么是 SLS

SLS（Simple Log Service）是阿里云的云原生日志与可观测数据服务平台，覆盖日志采集、存储、查询分析、可视化与告警全链路。简单说，它是一个中心化的日志管理方案，解决分布式系统下日志分散、检索困难、分析效率低的问题。

举个例子：一个项目部署在多台服务器上，日志散在各台机器。排查问题时需要逐台登录，用 `tail -f` 或 `grep` 翻找，效率低还容易遗漏。SLS 把日志统一上报到中心化存储，在控制台输入关键词即可秒级检索。

SLS 的核心能力：

| 能力 | 说明 |
|------|------|
| 数据采集 | Logtail、SDK、Syslog 等多种接入方式 |
| 数据存储 | 以 Project / Logstore 组织数据，支持冷热分层 |
| 查询分析 | 支持 SQL 语法，TB/PB 级数据秒级检索 |
| 可视化与告警 | 内置仪表盘，支持多渠道告警通知 |

几个关键概念：**Project** 是管理单元（相当于工作空间），**Logstore** 是存储单元（类似数据库中的表），**Logtail** 是阿里云自研的日志采集客户端，**Shard** 是 Logstore 分区用于水平扩展吞吐。

## 二、个人接触经历

此前担任测试工程师期间，日常使用 SLS 主要涉及两类场景。

#### 埋点数据查询

客户端在关键路径预置了埋点，记录用户行为（如页面访问、按钮点击、功能耗时）。需要验证某个埋点是否正常上报时，到 SLS 中按用户 ID 或事件类型检索特定时间范围内的埋点记录即可。

#### 线上问题排查

用户反馈线上问题时，通过 TraceID 或用户 ID 在 SLS 中检索相关日志，串联多服务调用链路来定位原因。

## 三、一次真实的踩坑经历

之前在一家外包团队实习，参与一个内部管理系统的开发。后端用的是 Spring Cloud 微服务架构，但项目组实际负责的只是一个业务模块，本质上是一个 Spring Boot 应用，jar 包部署在四台 Linux 机器上，通过负载均衡对外提供服务。

#### 日常排查流程

用户通过工单反馈问题，比如"某个数据状态显示不对"。排查流程大致是：

1. 询问用户出问题的大致时间——通常回答是"下午吧，具体几点记不清"
2. 询问相关业务 ID——这类信息用户通常能提供
3. 登录四台机器，逐台执行`tail -200f`查日志文件，远程登录堡垒机十分卡顿，只能把日志文件拉到本地一点点`ctrl + f`搜索
4. 运气好时能找到，但日志内容往往比较多且混乱，很难判断原因

**每次排查耗时 30～60 分钟，而且毫无技术含量。**

#### 事后反思：为什么不引入日志系统

- 存储成本：四台机器的日志集中存储，有额外的索引开销
- 责任边界：开发觉得是运维的事，但团队没有专职运维
- 求稳心态：系统能跑就别动，多一个组件就多一份风险
- 项目制思维：只关注当前迭代需求，没有人站在长期维护的角度思考基建

#### 这笔账

| 项目 | 数据 |
|------|------|
| 每月排查次数 | 约 10 次 |
| 单次耗时 | 约 40 分钟 |
| 每月耗时 | 约 6.7 小时 |

而引入一套 Loki，只需要一台机器几百 MB 内存，查询时间从 40 分钟变成 10 秒。团队没引入的原因不是技术难度，而是没人 push。

## 四、为什么用 Loki 模拟 SLS

想借这个机会了解日志系统的底层运作机制。经过搜索和对比，最终选了 Loki：

- 轻量：Loki 不对日志内容做全文索引，只对标签建立索引，存储成本低，资源占用少
- 原生集成 Grafana：查询和可视化直接复用 Grafana 仪表盘，不需要额外搭建 UI
- 上手简单：有现成的 Docker 镜像，配合 Promtail 采集器可以快速跑起来

目标是用这套组合收集一个简单 SpringBoot 应用的日志，在本地还原出"中心化日志检索"的核心体验，借此熟悉日志采集、存储、查询的完整链路。

## 五、环境搭建

#### 组件介绍

| 组件 | 角色 | 说明 |
|------|------|------|
| Loki | 服务端 | 日志数据的存储和查询引擎 |
| Promtail | 采集端 | 从日志文件中读取内容并推送到 Loki |
| Grafana | 可视化 | 提供 Web UI 进行日志查询和展示 |

#### Docker Compose 配置

```yaml
services:
  loki:
    image: grafana/loki:2.9.8
    command: -config.file=/etc/loki/local-config.yaml
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - loki-data:/loki
    user: "0"
    restart: always

  promtail:
    image: grafana/promtail:2.9.8
    command: -config.file=/etc/promtail/config.yaml
    volumes:
      - ./promtail.yaml:/etc/promtail/config.yaml
      - D:/E-Projects/java/powercrm-ruoyi-server/logs:/logs
    depends_on:
      - loki
    restart: always

  grafana:
    image: grafana/grafana:10.4.10
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - loki
    restart: always

volumes:
  loki-data:
  grafana-data:
```

#### Loki 配置（loki-config.yaml）

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s
  wal:
    dir: /loki/wal

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/boltdb-cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

compactor:
  working_directory: /loki/compactor
  shared_store: filesystem

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 168h

table_manager:
  retention_deletes_enabled: false
  retention_period: 0h
```

#### Promtail 配置（promtail.yaml）

```yaml
server:
  http_listen_port: 9080
positions:
  filename: /tmp/positions.yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
scrape_configs:
  - job_name: spring-book-service
    static_configs:
      - targets: [localhost]
        labels:
          app: crm-service
          env: windows-local
          __path__: /logs/*.log
    pipeline_stages:
      - regex:
          expression: '.*\s+(?P<level>INFO|ERROR|WARN|DEBUG)\s+.*'
      - labels:
          level:
```

#### 启动

```bash
docker-compose up -d
```

访问 `http://localhost:3000`（Grafana），默认账号 `admin` / `admin`，登录成功后会强制让改密码，添加 Loki 数据源（URL 填 `http://loki:3100`）即可开始查询。

#### 销毁

```bash
docker-compose down
```

 **停止并移除** 由 `docker-compose.yml` 文件定义的容器、网络等资源。

## 六、标签的设计

> Loki 不对日志内容做全文索引，只对标签建立索引。查询时先通过标签缩小范围，再在命中的日志中全文搜索。因此标签设计直接影响查询速度和存储成本。

标签分为两种：**静态标签**——所有日志共享，如 `app: your-app`、`env: prod`；**动态标签**——从日志内容中提取，如 `level`、`event`。

静态标签配置：

```yaml
labels:
  app: your-app
  env: prod
```

动态标签配置（通过 pipeline 从日志中解析）：

```yaml
pipeline_stages:
  - regex:
      expression: '^.*\s+(?P<level>\w+)\s+'
  - labels:
      level: ""
```

#### 设计原则

| 原则 | 说明 | 示例 |
|------|------|------|
| 低基数 | 标签值的种类要少 | `level` 只有 INFO/DEBUG/WARN/ERROR 四种，适合做标签 |
| 避免高基数 | 不要把唯一值设为标签 | `user_id`、`trace_id`、`ip` 不适合做标签 |
| 常用筛选维度 | 查询时经常用来过滤的字段 | `app`、`env`、`level`、`event` |

#### 埋点场景配置示例

日志内容为 `2026-07-30 14:30:15.123 INFO - event=enter_room, user_id=12345, platform=ios`，对应的 Promtail 配置：

```yaml
pipeline_stages:
  - regex:
      expression: 'event=(?P<event>[^,\s]+).*platform=(?P<platform>[^,\s]+)'
  - labels:
      event: ""
      platform: ""
```

查询时直接按标签过滤：

```
{event="enter_room", platform="ios"}
```

## 七、使用Grafana

#### 汉化

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/07/31/6d7b3.png)

#### 数据源配置

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/07/31/4dcbd.png)

#### 日志查询面板

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/07/31/f27d7.png)

## 八、总结

SLS 和 Loki 在核心思路上一致：通过标签/索引字段加速检索，配合全文搜索定位具体内容。区别在于 SLS 功能更全、支持 SQL 分析；Loki 更轻量，适合小规模场景。

当年那个项目，团队花大量时间在低效的日志排查上，却没想过引入一个日志系统来从根本上解决问题。原因不是技术门槛高，而是没有人 push，没有人算这笔账。后来接触到 SLS 才发现原来查日志可以这么简单。

这次用 Loki 在本地搭建模拟环境，一方面是技术学习，另一方面也是在回应那个场景——"原来当时只要这样就可以了。"
