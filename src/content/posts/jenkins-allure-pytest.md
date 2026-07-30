---
title: Jenkins + Allure + Pytest 流水线搭建实践
published: 2024-06-20
description: 基于 Docker 部署 Jenkins，集成 Allure 测试报告与 Pytest 框架，搭建自动化测试流水线的完整配置笔记。
image: /images/covers/cover_14.jpg
tags: [Jenkins, Allure, Pytest, CI/CD, Docker, 自动化测试, 运维]
category: 运维
draft: false
---

## 环境概览

| 组件       | 版本                             |
| ---------- | -------------------------------- |
| Jenkins    | 2.541.3 (LTS)，Docker 部署       |
| 基础镜像   | jenkins/jenkins:lts              |
| 宿主机系统 | Windows（Docker Desktop）        |
| Java       | OpenJDK 21（容器自带）           |
| Python     | 3.13（手动安装）                 |
| Allure     | 2.44.0（手动安装）               |
| 代码仓库   | Gitee（私有）                    |

## 一、容器网络配置

> Jenkins 容器默认使用 Debian 官方软件源，国内访问速度慢或无法连接，必须先切换镜像源再安装任何工具。

建议顺序：配置镜像源 → 安装 Python → 安装 Allure。

1. 以 root 身份进入容器（不要用 `su root`，容器未设置 root 密码）：

```bash
docker exec -u root -it my-jenkins /bin/bash
```

2. 写入清华镜像源：

```bash
cat > /etc/apt/sources.list << 'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ trixie main contrib non-free non-free-firmware
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ trixie-updates main contrib non-free non-free-firmware
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ trixie-backports main contrib non-free non-free-firmware
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security trixie-security main contrib non-free non-free-firmware
EOF
```

3. 验证：

```bash
apt-get update
```

`apt-get update` 成功即说明镜像源配置生效。

## 二、安装 Python 环境

> Jenkins 官方镜像不含 Python，需手动安装。

```bash
apt-get install -y python3 python3-pip python3-venv python3-full
```

各包的作用：

| 包名           | 作用                             |
| -------------- | -------------------------------- |
| `python3`      | Python 3 运行时                  |
| `python3-pip`  | Python 包管理器                  |
| `python3-venv` | 虚拟环境创建工具（必须手动指明） |
| `python3-full` | 完整标准库（含 `ensurepip`）     |

`PATH` 和 `PYTHONHOME` 均无需手动配置——`apt-get` 安装已自动处理。

## 三、安装 Allure

> Jenkins 的自动下载功能可能因网络问题失败，建议手动安装。

```bash
cd /opt

# 下载
curl -L -o allure-2.44.0.tgz https://github.com/allure-framework/allure2/releases/download/2.44.0/allure-2.44.0.tgz

# 解压
tar -zxvf allure-2.44.0.tgz

# 清理压缩包
rm allure-2.44.0.tgz
```

## 四、Jenkins 全局工具配置

> 前提：Jenkins 已安装 Allure 插件。

路径：**系统管理 → 全局工具配置 → Allure Commandline**。

| 配置项                             | 填写内容             |
| ---------------------------------- | -------------------- |
| 别名（Name）                       | `allure-2.44.0`      |
| 自动安装                           | 不勾选               |
| 安装目录（Installation Directory） | `/opt/allure-2.44.0` |

## 五、Jenkins 任务配置

在任务的构建步骤中添加 Execute Shell，脚本如下：

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
