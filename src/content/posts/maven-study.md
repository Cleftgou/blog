---
title: Maven 学习笔记
published: 2024-02-01
description: Maven 是 Java 项目的构建管理工具，本文记录了 Maven 的核心概念、项目结构、生命周期、POM 文件详解以及常用命令。
tags: [Maven, Java, 构建工具]
category: Java
image: /images/covers/cover_04.jpg
draft: false
---

# Maven

- 查看文件的结构（使用powershell命令）

- ```bash
  Windows PowerShell
  版权所有（C） Microsoft Corporation。保留所有权利。
  
  安装最新的 PowerShell，了解新功能和改进！https://aka.ms/PSWindows
  
  PS C:\Users\bairimengchang> cd d:
  PS D:\> cd .\JAVA
  PS D:\JAVA> cd .\maven_work
  PS D:\JAVA\maven_work> dir
  
  
      目录: D:\JAVA\maven_work
  
  
  Mode                 LastWriteTime         Length Name
  ----                 -------------         ------ ----
  d-----         2024/1/31     17:47                HelloTest
  
  
  PS D:\JAVA\maven_work> tree HelloTest
  卷 Data 的文件夹 PATH 列表
  卷序列号为 0416-BAA6
  D:\JAVA\MAVEN_WORK\HELLOTEST
  └─src
      ├─main
      │  ├─java
      │  │  └─com
      │  │      └─niu
      │  │          └─javatest
      │  └─resources
      └─test
          ├─java
          └─resources
  PS D:\JAVA\maven_work>
  ```

- ```xml
  p24.如果各位同志们下载的tomcat10版本然后报错可以把这段复制一下到pom.xml中
  <dependency>
        <groupId>jakarta.servlet.jsp</groupId>
        <artifactId>jakarta.servlet.jsp-api</artifactId>
        <version>3.0.0</version>
        <scope>provided</scope>
      </dependency>
      <dependency>
        <groupId>jakarta.servlet</groupId>
        <artifactId>jakarta.servlet-api</artifactId>
        <version>5.0.0</version>
        <scope>provided</scope>
      </dependency>
  ```

- 在生成的classes文件夹下执行运行程序的命令

- ```bash
  D:\JAVA\maven_work\HelloTest\target\classes>java com.niu.javatest.Hello
  HELLO Maven!
  ```

- Maven的中央仓库地址：[Maven Repository: Search/Browse/Explore (mvnrepository.com)](https://mvnrepository.com/)

- 一段中央仓库某个jar包的pom.xml文件的信息

- ```xml
  <!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
  <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <version>8.0.33</version>
  </dependency>
  ```

- 对pom.xml信息的解释

- ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  
  <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://maven.apche.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  
  <!-- Maven模型的版本，固定是4.0 -->
  <modelVersion>4.0.0</modelVersion>
  <!-- 组织id，一般是公司域名的倒写（baidu.com写为com.baidu）可加项目名或者不加项目名 -->
  
  <!-- 以下三条是坐标，是项目的唯一标识 -->
  <groupId>com.niu</groupId>
  <!-- 项目名，应该是唯一的 -->
  <artifactId>ch01-maven</artifactId>
  <!-- 项目的版本号 -->
  <version>1.0.0-SNAPSHOT</version>
  
  <!-- 设置配置属性，比如jdk版本，处理乱码等等 -->
  <properties>
     <java.version>11</java.version>
     <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
     <maven.compiler.source>11</maven.compiler.source>
     <maven.compiler.target>11</maven.compiler.target>
  </properties>
  
  <!-- 项目所依赖的其它jar文件，如果本地有就直接用，否则去网上下载 -->
  <!-- https://mvnrepository.com/artifact/com.alibaba.fastjson2/fastjson2 -->
  <dependencies>
     <dependency>
        <groupId>com.alibaba.fastjson2</groupId>
        <artifactId>fastjson2</artifactId>
        <version>2.0.46</version>
     </dependency>
  </dependencies>
  </project>
  ```

- maven的生命周期

  - maven构建项目的过程：清理，编译，测试，报告，打包，安装，部署

  - maven的命令：maven可以独立使用，通过命令，完成整个生命周期。（执行后一个命令会把前面的命令也执行了）

    - mvn clean ：清理target目录

    - mvn compile ：编译main/java

    - mvn test-compile：编译test/java

    - mvn test：测试（会生成一个目录surefire-report，保存测试结果）

    - mvn package：打包主程序（会编译、编译测试、测试、并且按照pom.xml配置把主程序打包生成jar包或者war包）

    - mvn install：安装主程序（会把本工程打包，并且按照本工程的坐标保存到本地仓库中）

    - mvn deploy：部署主程序（会把本程序打包，按照本工程的坐标保存到本地库中，并且还会保存到私服仓库中，还会自动把项目部署到web容器中）

  - maven的插件：真正完成功能的是插件，插件就是一些jar文件（一些类）

  - 单元测试（测试方法）：使用junit框架（工具）。

    - 测试内容：测试的是类中的方法，每一个方法都是独立测试的，方法是测试的基本单元，

    - 在pom文件中加入下述依赖

    - ```xml
      <!-- https://mvnrepository.com/artifact/junit/junit -->
      <!-- junit单元测试的依赖 -->
      <dependency>
          <groupId>junit</groupId>
          <artifactId>junit</artifactId>
          <version>4.13.2</version>
          <scope>test</scope>
      </dependency>
      ```

    - 在src/test/java目录下，创建测试程序

      - 测试类的名称：Test+待测试的类名

      - 测试方法的名称：test+方法名称

      - 代码如下：

        - ```java
          package com.niu.javatest;
          
          import org.junit.Test;
          import org.junit.Assert;
          
          public class TestHello {
              @Test
              public void testAdd(){
                  System.out.println("maven测试方法执行了");
                  Hello hello = new Hello();
                  int s = hello.add(10, 20);
                  //验证10+20是不是30，junit提供的方法，对比结果的
                  //assertEquals(期望值，实际值)，值相等就是正确的，不等就抛异常
                  Assert.assertEquals(30, s);
              }
              @Test
              public void testAdd2(){
                  System.out.println("maven测试方法2执行了");
                  Hello hello = new Hello();
                  int s = hello.add(20, 20);
                  //验证20+20是不是40，junit提供的方法，对比结果的
                  //assertEquals(期望值，实际值)，值相等就是正确的，不等就抛异常
                  Assert.assertEquals(40, s);
              }
          }
          ```

- 在idea中创建maven项目

- ```
  选择对应的maven原型的模板如下：
  javase项目：maven-archetype-quickstart
  javaweb项目：maven-archetype-webapp
  ```
