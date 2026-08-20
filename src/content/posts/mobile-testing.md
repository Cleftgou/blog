---
title: 移动端测试
published: 2026-08-20
description: APP 项目测试范围梳理（功能/性能/专项测试、安装包类型），以及 ADB 常用命令（连接设备、安装卸载、启动耗时、Monkey、日志文件）的实操笔记。
image: /images/covers/cover_22.jpg
tags: [移动端测试, ADB, Monkey, 性能测试, 专项测试, Android]
category: 测试
draft: false
---

## 一、APP 测试范围

#### 功能测试

功能测试主要分三类：业务测试、功能模块测试，以及 H5 测试（打开的用户协议一般就是 H5 页面）。

#### 性能测试

安卓常用的性能测试工具是 **solopi**——apk 形式，安装到手机即可，本质上是个监控工具。

APP 性能主要关注两个方面：

- App 程序运行时占用手机硬件资源的情况（性能指标，一般需要测半小时及以上）
- App 稳定性（长时间运行是否出现异常）

各性能关注点如下：

**内存占用**（关注 Private dirty【私有内存】、PSS【实际使用内存】）：查看图表内存变化是否是有上有下，避免出现内存泄漏进而内存溢出的问题。

**CPU 占用**（关注全局占用 CPU、应用进程 CPU）：查看图表 CPU 利用率（CPU 执行非系统空闲进程事件【也就是被测 APP】/ CPU 总的执行时间），长时间处于 90% 以上会导致手机发热、耗电量增加，响应变慢引起 ANR（应用无响应）。

**流量**（上行消息是 APP 发送给服务器的数据，下行数据是 APP 接收服务器的数据）：查看图表网络监控（看 main 进程的上行和下行速率），一般看下行，流量越少越好（跟竞品和老版本比较）。优化策略：图片压缩、降低访问频次、合理利用缓存、根据不同的网络类型设置不同的访问策略。

**电量消耗**（常见耗电量大的场景：定位、网络传输、屏幕亮度、锁屏-解锁）：查看图表即可，跟竞品和老版本比较耗电情况。

**流畅度**（动画播放或图片切换的流畅性）：看图表帧率 FPS（GPU 在一秒内绘制的帧数）。

**启动速度**（从启动 App 到主页面加载完成的速度，分冷启动和热启动）：看【启动耗时计算】，但这个指标用 solopi 不准确，推荐用 adb。

**稳定性**：通过长时间运行、Monkey 压测等方式观察是否出现异常。

#### 专项测试

**安装：**

| 正常场景 | 异常场景 |
| --- | --- |
| 来源（从不同的安装渠道安装） | 出现关机、断网 |
| 去向（在不同的操作系统版本上安装） | 空间不足 |
| 不同的安装路径 | 取消后再次安装 |
| 卸载后安装 | 低版本覆盖高版本安装 |
| 正在运行时覆盖安装 |  |

**卸载：**

| 关注点 |
| --- |
| 正常卸载 |
| 运行时卸载 |
| 取消卸载 |
| 卸载异常中断 |
| 卸载后无数据残留 |

**升级：**

| 关注点 |
| --- |
| 从临近版本升级 |
| 跨版本升级 |
| 不同渠道升级 |
| 升级提醒成功 |
| 应用内升级时非 WIFI 提醒 |

**兼容性测试：**

| 关注点 | 说明 |
| --- | --- |
| 手机型号 | 考虑 APP 的线上排名 |
| 系统版本 | Android、iOS 版本 |
| 分辨率、屏幕尺寸 | 略 |
| 网络 | 2G、3G、4G、5G、WIFI 等 |
| 应用兼容性 | 是否与手机硬件、系统、其他 APP 产生冲突 |

**push 消息推送：** 流程是服务器有更新信息（服务器端人群/频率配置）→ 推送服务器 → APP（推送设置以及推送结果验证）→ 用户。前台推送一般用 WebSocket，后台用极光，似乎是主流的消息方案。

**交叉事件测试：** 指一个功能正在执行过程中，另一个事件或操作对该过程进行干扰的测试。比如软件使用中接听了电话、手机触发休眠等。

**用户体验测试：** UI、横竖屏、易用性、辅助功能。

#### 安装包类型

- **APK**（Android Application Package）：安卓应用程序安装包
- **IPA**（iOS Application Archive）：苹果应用程序文件

## 二、ADB

#### 什么是 ADB

> ADB（Android Debug Bridge，安卓调试桥）是一种允许计算机与 Android 设备通信的命令行工具。

主要用途：

- 功能（自动化）测试：模拟用户的各种操作（点击、滑动、输入）
- 专项测试：安装、卸载、文件传输等操作
- 性能测试：采集性能指标数据、记录日志、monkey 稳定性测试

ADB 由三部分组成：客户端、服务端、Daemon 守护进程（安卓设备自带）。

#### 连接设备

```bash
# 版本号
C:\Users\bairimengchang>adb --version
Android Debug Bridge version 1.0.41
Version 37.0.0-14910828
Installed as D:\D-DevEnv\Android\Sdk\platform-tools\adb.exe
Running on Windows 10.0.22631

# 显示系统中全部接入设备
C:\Users\bairimengchang>adb devices
* daemon not running; starting now at tcp:5037
* daemon started successfully
List of devices attached
# 这个设备是指mumu模拟器的启动器，忽略即可 
emulator-5554   offline

# 手动连接设备
# 注意：
# 1、真机，有线连接，需要开启USB调试模式，然后连上数据线
# 2、真机，无线连接，通过wifi，需要知道手机连接Wifi对应的ip地址
C:\Users\bairimengchang>adb connect 127.0.0.1:16384
connected to 127.0.0.1:16384

# 手动断开设备
C:\Users\bairimengchang>adb disconnect 127.0.0.1:16384
disconnected 127.0.0.1:16384

# 先用USB连接设备，识别出设备id后，通过此命令开启远程监听，从而实现远程调试
C:\Users\bairimengchang>adb -s 10AE7A0PP10025C tcpip 5555
restarting in TCP mode port: 5555
C:\Users\bairimengchang>adb connect 192.168.125.2
connected to 192.168.125.2:5555

# 重启adb服务（也就是adb服务端）
C:\Users\bairimengchang>adb kill-server
C:\Users\bairimengchang>adb start-server
```

#### 查看包名与当前界面

```bash
# 查看包名（加-3参数表示只看自己安装的第三方程序，pm 含义 PackageManager 包管理器）
C:\Users\bairimengchang>adb shell pm list packages -3
package:com.alipay.hulu
package:cn.kaiheila

# 多设备连接时指定测试机（-s 参数指定设备）
C:\Users\bairimengchang>adb -s 127.0.0.1:16384 shell pm list packages -3
package:com.alipay.hulu
package:cn.kaiheila

# 查看设备里所有包名
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 shell pm list packages
package:com.android.providers.media.module
package:com.nemu.googleinstaller
package:com.alipay.hulu
package:com.android.modulemetadata
package:com.android.connectivity.resources
package:com.android.server.deviceconfig.resources
package:com.android.internal.display.cutout.emulation.hole
...

# 查看当前打开的app的界面名（dumpsys 表示系统信息）
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 shell dumpsys window | findstr mCurrentFocus
  mCurrentFocus=Window{dccd860 u0 cn.kaiheila/cn.kaiheila.business.login.LoginActivity}
```

#### 安装与卸载

```bash
# 删除app（使用包名，包名一般会是网站域名倒过来；加上-k表示保留数据和缓存文件）
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 uninstall cn.kaiheila
Success

# 安装app（使用apk名称）
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 install "C:\Users\bairimengchang\Downloads\kook.apk"
Performing Streamed Install
Success: streamed 236274516 bytes
Success

# 加上-r参数表示覆盖安装
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 install -r "C:\Users\bairimengchang\Downloads\kook.apk"
Performing Streamed Install
Success: streamed 236274516 bytes
Success
```

#### 启动、关闭与启动耗时

```bash
# 打开app并统计启动时间（需要指明首页界面名；am 含义 ActivityManager，-W 显示启动时间，-S 启动前先关闭程序进程，-R 后面跟重复测试次数）
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 shell am start -W -S -R 3 -n cn.kaiheila/.ui.main.SplashActivity
Stopping: cn.kaiheila
Starting: Intent { cmp=cn.kaiheila/.ui.main.SplashActivity }
Status: ok
LaunchState: COLD
Activity: cn.kaiheila/.ui.main.SplashActivity
TotalTime: 2097
WaitTime: 2100
Complete

# 关闭app
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 shell am force-stop cn.kaiheila
```

#### Monkey 稳定性测试

```bash
# Monkey，安卓系统自带的稳定性测试工具，由java语言编写，无需额外安装
# 查看日志时搜索以下关键词：ANR、timeout、Exception、error等（-v参数实际可能写几十万次）
C:\Users\bairimengchang>adb shell monkey -p cn.kaiheila -v 2000 > d:\temp.log
args: [-p, cn.kaiheila, -v, 2000]
 arg: "-p"
 arg: "cn.kaiheila"
 arg: "-v"
 arg: "2000"
data="cn.kaiheila"
```

#### 日志与文件传输

```bash
# 查看日志
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 logcat > d:/app.log

# 进入安卓系统（linux命令适用，sdcard就是手机文件管理里的东西）
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 shell
odin-a:/ $ ls
acct            data_mirror      odm                     sys
adb_keys        debug_ramdisk    odm_dlkm                system
apex            dev              oem                     system_dlkm
bin             etc              pcgame                  system_ext
bootstrap-apex  init             postinstall             tmp
bugreports      init.environ.rc  proc                    vendor
cache           linkerconfig     product                 vendor_dlkm
config          lost+found       sdcard
d               metadata         second_stage_resources
data            mnt              storage

# 从电脑往移动端推送文件
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 push d:\app.log /sdcard
d:\app.log: 1 file pushed, 0 skipped. 170.0 MB/s (1611670 bytes in 0.009s)

# 从移动端往电脑拉取文件
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 pull /sdcard/abc.log D:\迅雷下载
/sdcard/abc.log: 1 file pulled, 0 skipped. 34.8 MB/s (1611670 bytes in 0.044s)
```

#### 查看内存占用

```bash
# 查看app占用的内存（App Summary里的TOTAL PSS即可）
C:\Users\bairimengchang>adb -s 127.0.0.1:5555 shell dumpsys meminfo cn.kaiheila
```
