---
title: 从零搭建 Jira 本地环境
published: 2026-08-13
description: Docker Compose 本地部署 Jira + PostgreSQL，atlassian-agent 激活说明，Confluence 配套部署与应用链接，以及 Scrum 敏捷核心概念（史诗/版本/冲刺/泳道/燃尽图）与自动化规则的实践笔记。
image: /images/covers/cover_21.jpg
tags: [Jira, Confluence, Scrum, Agile, Docker, PostgreSQL, 项目管理, 运维]
category: 运维
draft: false
---

## 一、Jira 是什么

Jira 是 Atlassian 出品的项目和事务跟踪工具，核心能力包括问题管理、工作流驱动、敏捷支持（Scrum/Kanban）、权限与字段配置、报告与度量、自动化规则，在软件行业是缺陷管理和研发协作的标准工具之一。

几个关键概念：

| 概念 | 说明 |
|------|------|
| 项目 | 顶层容器，如"IOS App" |
| 问题 | 原子工作单元：故事/任务/故障/子任务 |
| 史诗 | 大功能模块归类，跨冲刺存在 |
| 版本 | 对外发布里程碑，跨冲刺，完成后发布 |
| 冲刺 | 固定时间盒的开发周期，1~4周滚动 |
| 故事点 | 相对估算单位，1/2/3/5/8 |

> Confluence 是 Atlassian 出品的团队协作与知识管理平台，通常作为 Jira 的配套 Wiki 使用，存放需求文档、设计文档、测试报告等。一句话区分两者：Jira 管"做什么、谁在做、做完没"，Confluence 管"怎么做、为什么这么做、结果是什么"。本文以 Jira 为主，Confluence 仅作为补充说明。

## 二、接触经历

此前在一家公司做测试工程师，日常用 Jira 提 Bug、用 Confluence 看需求文档。公司用的是自托管部署的 Jira，权限管理比较严格，配置相关的东西只有管理员能接触，普通用户没有机会上手。

用了一段时间后，发现有些事一直没弄明白：

- **字段配置**：为什么这个字段出现在这里，那个字段出现在那里？哪些必填、哪些可选，背后是谁决定的？
- **项目划分**：不同项目之间的隔离和权限是怎么控制的？为什么有的项目我能看，有的不能？
- **流程设计**：整个工作流是怎么设计出来的？状态流转、问题类型、界面方案是怎么串在一起的？
- **看板划分**：看板上的泳道按什么规则拆分？"待办/进行中/已完成"是固定的还是可以自定义的？卡片出现在看板上，背后的筛选逻辑是什么？
- **子任务设计**：什么时候该用子任务？子任务和父任务的状态是怎么联动的？为什么有的任务有子任务，有的没有？

问过身边的人，大多只清楚自己手头那部分操作，对整个配置层面没什么概念。但我觉得只停留在"点按钮"的层面，换个公司、换个项目，照样只会点按钮。于是决定在本地用 Docker 从零搭一套，把配置的每个环节亲手过一遍，搞清楚这套工具到底是怎么组织的。Confluence 作为配套，在 Jira 跑通之后顺带部署，把需求→开发→测试的协作链路完整串起来。

## 三、Jira 环境搭建

#### 方案选型

用 Docker Compose 在本地部署一套完整的 Jira + PostgreSQL 环境。

#### 配置文件

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: jira
      POSTGRES_PASSWORD: jira123
      POSTGRES_DB: jiradb
    volumes:
      - jira-db-data:/var/lib/postgresql/data

  jira:
    image: atlassian/jira-software:8.13.7-jdk8
    depends_on:
      - db
    ports:
      - "8080:8080"
    environment:
      JVM_MINIMUM_MEMORY: 1g
      JVM_MAXIMUM_MEMORY: 2g
      JVM_SUPPORT_RECOMMENDED_ARGS: "-javaagent:/opt/agent/atlassian-agent-jar-with-dependencies.jar"
    volumes:
      - jira-home:/var/atlassian/application-data/jira
      - ./agent:/opt/agent

volumes:
  jira-db-data:
  jira-home:
```

#### atlassian-agent 激活工具

> 用于激活 Atlassian 家几乎所有产品：[atlassian-agent](https://gitcode.com/gh_mirrors/at/atlassian-agent.git)

按项目 README 用 mvn 编译源码后得到两个 jar 包，均放在 `/agent` 目录下（对应配置文件中的 `./agent` 挂载）。按作者指南理应只需 `atlassian-agent-jar-with-dependencies.jar` 这一个，但只放一个 jar 包时疑似激活失败，遂保留两个。此外，这个激活工具很挑版本号，当前教程里的版本是确定可以激活的（本人尝试了很多版本，只能说别再自己试了，就用教程里这个就行）

#### 激活

访问 `http://localhost:8080`，按安装向导操作，到许可证页面输入 Server ID，在容器内执行：

```bash
docker-compose exec jira /bin/bash
java -jar /opt/agent/atlassian-agent-jar-with-dependencies.jar -p jira -m admin@gmail.com -n admin -o admin -s <你的Server ID>
```

产品代码用 `jira`。

## 四、Confluence 环境搭建

Jira 跑通之后，顺带把 Confluence 也部署了，用于串联需求到开发的完整链路。

#### 配置文件（追加到上面的 docker-compose.yml）

```yaml
confluence-db:
  image: postgres:16
  environment:
    POSTGRES_USER: confluence
    POSTGRES_PASSWORD: confluence123
    POSTGRES_DB: confluencedb
  volumes:
    - confluence-db-data:/var/lib/postgresql/data

confluence:
  image: atlassian/confluence-server:7.4.8-jdk8
  depends_on:
    - confluence-db
  ports:
    - "8090:8090"
    - "8091:8091"
  environment:
    JVM_MINIMUM_MEMORY: 1g
    JVM_MAXIMUM_MEMORY: 2g
    JVM_SUPPORT_RECOMMENDED_ARGS: "-javaagent:/opt/agent/atlassian-agent-jar-with-dependencies.jar"
  volumes:
    - confluence-home:/var/atlassian/application-data/confluence
    - ./agent:/opt/agent

volumes:
  confluence-db-data:
  confluence-home:
```

#### 激活

访问 `http://localhost:8090`，按安装向导操作，到许可证页面输入 Server ID，在容器内执行：

```bash
docker-compose exec confluence /bin/bash
java -jar /opt/agent/atlassian-agent-jar-with-dependencies.jar -p conf -m admin@gmail.com -n admin -o admin -s <你的Server ID>
```

产品代码用 `conf`（Confluence）。

## 五、Scrum 敏捷核心概念与实操

#### 数据结构

```
项目
  └── 史诗（大功能归类）
        └── 问题
              ├── 故事（用户视角）
              ├── 任务（技术视角）
              └── 故障（缺陷）
```

#### 史诗、版本、冲刺三者关系

| 概念 | 维度 | 生命周期 |
|------|------|----------|
| 史诗 | 功能归类（纵向） | 跨多个冲刺 |
| 版本 | 发布里程碑（横向） | 跨多个冲刺，完成即发布 |
| 冲刺 | 执行时间盒 | 1~4周，持续滚动 |

三者独立，可以交叉使用。一般顺序：先创建**史诗**规划功能划分，再创建**版本**确定每个版本的发版日期，然后创建各种类型的问题关联史诗和版本，最后创建**冲刺**分时间段去完成版本计划。

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/08/13/1f3a1.png)

#### 故事点配置

默认故事点只对"故事"和"史诗"可见，在下图位置配置此字段（从项目设置下进入也可）。一般在创建问题时填写斐波那契数列值（1、2、3、5、8），表示任务的预估复杂度。

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/08/13/a00da.png)

#### 看板泳道

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/08/13/60751.png)

泳道决定看板如何分组。可以配置成"没有泳道"，看着更清晰。

#### 燃尽图

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/08/13/4767c.png)

可以查看当前冲刺的进展。

#### 状态流转定制

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/08/13/ba7f2.png)

自定义一个问题的状态流转。

## 六、自动化规则

在应用商店中下载插件 `Automation for Jira - Lite`。

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/08/13/cd5a7.png)

插件安装完毕后，操作入口：

![](https://cleftgou-markdown.oss-cn-beijing.aliyuncs.com/2026/08/13/b8891.png)

#### 功能限制

| 功能 | 免费版 | Pro 版 |
|------|:------:|:------:|
| 议题已指派触发器 | ✅ | ✅ |
| 版本已发行触发器 | ❌ | ✅ |
| Webhook 动作（集成飞书机器人） | ❌ | ✅ |
| 评论议题动作 | ✅ | ✅ |

#### 可用配置示例

本质就是选择事件触发器和触发事件后的动作。例如：

- **触发器**：议题已指派
- **动作**：评论议题
- **内容模板**：

```
任务已指派
经办人：{{assignee.displayName}}
任务链接：{{issue.url}}
```

## 七、总结

从零搭完 Jira 之后，之前那些"黑箱"变得清晰了：

- **数据模型**：项目、史诗、版本、冲刺、问题、字段、工作流之间的关系，亲手建一遍就记住了。
- **协作链路**：从 Confluence 写需求 → Jira 创建任务 → 跑冲刺 → 燃尽图跟踪 → 版本发布，一条完整链路跑通了。
- **工具配置**：界面方案、字段配置、权限模型、自动化规则，不再是"系统设置"里不敢碰的按钮。

## 附录：Docker Compose 命令速查

> 以下命令基于本文的 Jira 部署实践，假设 compose 文件位于 `D:\H-Docker\docker_jira`。执行前先切换目录：`cd D:\H-Docker\docker_jira`（cmd）或 `cd /d/H-Docker/docker_jira`（Git Bash）。

#### Compose 是什么

Compose 用**一个 YAML 文件**描述一组容器的配置，然后用**一条命令**管理它们。它与 `docker run` 的对应关系：

| `docker run` 写法 | Compose 写法 |
| :---------------- | :----------- |
| `docker run -p 8080:8080 ...` | `ports:` 下写 `- "8080:8080"` |
| `docker run -v 卷名:路径 ...` | `volumes:` 下写 `- 卷名:路径` |
| `docker run -e KEY=val ...` | `environment:` 下写 `KEY: val` |
| 手动保证启动顺序 | `depends_on:` 下写 `- db` |

#### 生命周期命令

| 命令 | 作用 |
| :--- | :--- |
| `docker compose up -d` | 启动全部服务（`-d` 后台运行） |
| `docker compose down` | 停止并删除容器 + 网络，**默认保留命名卷** |
| `docker compose down -v` | **连命名卷一起删（数据丢失）** |
| `docker compose ps` | 查看所有服务的状态 |
| `docker compose logs -f jira` | 实时查看 Jira 日志 |
| `docker compose restart jira` | 重启某个服务 |

#### 网络

**同一个 Compose 文件中的所有服务，默认加入同一张内部网络**，服务名就是地址——Jira 连接数据库填 `db` 就能访问。

```bash
docker network ls                          # 列出所有网络
docker network inspect docker_jira_default # 查看网络内的容器和 IP
```

#### 数据卷

| 类型 | 写法 | 数据位置 |
| :--- | :--- | :--- |
| 命名卷 | `jira-home:/var/...` | Docker 内部 |
| 绑定挂载 | `./agent:/opt/agent` | 宿主指定路径 |

```bash
docker volume ls              # 列出所有卷
docker volume inspect <卷名>  # 查看卷的详细信息
docker volume prune           # 删除所有未被引用的卷
```

#### 常见误区

| 你以为 | 实际 |
| :----- | :--- |
| 数据库不暴露端口 = 连不上 | 同网内部可连 |
| `depends_on` = 能连上 | 只管启动顺序，不管就绪 |
| 容器里连库填 `localhost` | 指向容器自己，要填服务名 `db` |
| `down` = 数据没了 | 默认保留命名卷，`down -v` 才会删 |

一句话总结：compose 文件描述"要跑什么"，`up`/`down` 管生命周期，服务名当地址，命名卷管数据。遇到问题先看日志，再查网络——别轻易 `down -v`。
