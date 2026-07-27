---
title: Spring 学习笔记
published: 2024-03-15
description: Spring 框架的核心是 IoC（控制反转）和 AOP（面向切面编程）。本文记录了 Spring 的核心概念、设计原则以及与 MyBatis 结合使用的实战。
tags: [Spring, Java, IoC, AOP, MyBatis, 框架]
category: Java
image: /images/covers/cover_09.jpg
draft: false
---

# 🤔第一章 软件开发原则与设计模式

- OCP开闭原则：对扩展开放，对修改关闭。
- 依赖倒置原则(Dependence Inversion Principle)，简称DIP，主要倡导面向抽象编程，面向接口编程，不要面向具体编程，让**上层**不再依赖**下层**，下面改动了，上面的代码不会受到牵连。**软件七大开发原则都是在为解耦合服务**
- 控制反转（Inversion of Control，缩写为IoC），是面向对象编程中的一种设计思想，可以用来降低代码之间的耦合度，符合依赖倒置原则。（不包含在23种设计模式之中）
  - 控制反转的核心是：**将对象的创建权交出去，将对象和对象之间关系的管理权交出去，由第三方容器来负责创建与维护**。
  - 控制反转常见的实现方式：依赖注入（Dependency Injection，简称DI）
  - 通常，依赖注入的实现又包括两种方式：set方法注入和构造方法注入。
  - 而Spring框架就是一个实现了IoC思想的框架。

# 😎第二章 Spring概述

- Spring是一个轻量级的控制反转(IoC)和面向切面(AOP)的容器框架。
- Spring由八大模块组成（重要部分有以下两部分）
  - Spring Core模块（控制反转IoC）
    - 提供了依赖注入（Dependency Injection）特征来实现容器对Bean的管理，将应用配置和依赖从实际的应用代码中分离出来。
  - Spring AOP模块（面向切面编程）
    - 为基于 Spring 的应用程序中的对象提供了事务管理服务，可以自定义拦截器、切点、日志等操作。

# 🤣第三章 Spring与Mybatis结合开发使用

- 项目结构

- pom文件

```xml
<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.niu</groupId>
    <artifactId>ch02-Spring_MyBatis</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <!--Spring上下文依赖-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.3.27</version>
        </dependency>
        <!--MyBatis依赖-->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.11</version>
        </dependency>
        <!--MyBatis集成Spring的依赖-->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>2.0.7</version>
        </dependency>
        <!--MySQL驱动-->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        <!--Spring事务-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-tx</artifactId>
            <version>5.3.27</version>
        </dependency>
        <!--Spring JDBC-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>5.3.27</version>
        </dependency>
        <!--德鲁伊连接池-->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.2.16</version>
        </dependency>
        <!--单元测试依赖-->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

- MyBatis核心配置文件（mybatis-config.xml）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <typeAliases>
        <typeAlias type="com.niu.pojo.Student" alias="Student"/>
    </typeAliases>
    <mappers>
        <mapper resource="StudentMapper.xml"/>
    </mappers>
</configuration>
```

- StudentMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.niu.mapper.StudentMapper">
    <select id="selectAll" resultType="com.niu.pojo.Student">
        select id, name, age, height, birth, sex from student
    </select>
</mapper>
```

- Spring配置文件（spring.xml），将 MyBatis 交给 Spring 管理

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context" xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx.xsd">

    <!--    引入外部配置文件-->
    <context:property-placeholder location="classpath:jdbc.properties"/>

    <!--    配置数据源-->
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="${jdbc.driver}"/>
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>

    <!--    配置SqlSessionFactoryBean-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <!--注入数据源-->
        <property name="dataSource" ref="dataSource"/>
        <!--指定MyBatis核心配置文件-->
        <property name="configLocation" value="classpath:mybatis-config.xml"/>
    </bean>

    <!--    配置Mapper扫描器-->
    <bean id="mapperScannerConfigurer" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="com.niu.mapper"/>
    </bean>

    <!--    配置事务管理器-->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <!--    开启事务注解-->
    <tx:annotation-driven transaction-manager="transactionManager"/>
</beans>
```

- jdbc.properties

```properties
jdbc.driver=com.mysql.cj.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/spring_mybatis
jdbc.username=root
jdbc.password=123456
```

- Mapper 接口

```java
package com.niu.mapper;

import com.niu.pojo.Student;
import java.util.List;

public interface StudentMapper {
    List<Student> selectAll();
}
```

- 测试代码

```java
@Test
public void testStudentMapper() {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("spring.xml");
    StudentMapper studentMapper = applicationContext.getBean("studentMapper", StudentMapper.class);
    List<Student> students = studentMapper.selectAll();
    students.forEach(student -> {
        System.out.println("id:" + student.getId() + ",name:" + student.getName());
    });
}
```

- 关键点总结：
  - **SqlSessionFactoryBean**：负责创建 `SqlSessionFactory`，需要注入数据源和指定 MyBatis 核心配置文件
  - **MapperScannerConfigurer**：自动扫描 Mapper 接口，生成代理对象并注册到 Spring 容器
  - 使用 Spring 的事务管理器 `DataSourceTransactionManager` 管理数据库事务
