---
title: MyBatis 学习笔记
published: 2024-03-20
description: MyBatis 是 Java 持久层框架，本文记录了 MyBatis 的核心概念、配置与使用，包括 SQL映射、动态SQL以及与 MyBatis 框架的核心流程。
tags: [MyBatis, Java, ORM, 持久层, 框架]
category: Java
image: /images/covers/cover_06.jpg
draft: false
---

# 😗第一章 MyBatis概述

- SSM三大框架：Spring + SpringMVC + MyBatis

- framework：框架其实就是对通用代码的封装，提前写好了一堆接口和类，我们可以在做项目的时候直接引入这些接口和类（引入框架），基于这些现有的接口和类进行开发，可以大大提高开发效率。框架一般都以jar包的形式存在。

- MyBatis本质上就是对JDBC的封装，通过MyBatis完成CRUD。MyBatis在三层架构中负责持久层的，属于持久层框架。

- ORM（对象关系映射）

  - O（Object）：Java虚拟机中的Java对象
  - R（Relational）：关系型数据库
  - M（Mapping）：将Java虚拟机中的Java对象映射到数据库表中一行记录，或是将数据库表中一行记录映射成Java虚拟机中的一个Java对象。
  - MyBatis属于半自动化ORM框架（可以自己去写sql语句，更加灵活）。
  - Hibernate属于全自动化的ORM框架（内置sql语句）。

# 😘第二章 MySQL数据库

- 命令行基本命令的使用示例

  - ```t
    Microsoft Windows [版本 10.0.22631.3085]
    (c) Microsoft Corporation。保留所有权利。
    
    C:\Users\bairimengchang>mysql -uroot -p123456
    ```

- MySQL常用命令

  - `show databases;` — 查看所有数据库
  - `use 数据库名;` — 使用某个数据库
  - `show tables;` — 查看当前数据库中的所有表
  - `desc 表名;` — 查看表结构
  - `select database();` — 查看当前使用的数据库
  - `select version();` — 查看 MySQL 版本号
  - `\q` 或 `exit` — 退出 MySQL

# 😎第三章 MyBatis 核心配置

### 核心配置文件 mybatis-config.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/bjpowernode"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="CarMapper.xml"/>
    </mappers>
</configuration>
```

### SQL 映射文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.niu.mapper.CarMapper">
    <select id="selectAll" resultType="com.niu.pojo.Car">
        select * from t_car
    </select>
    
    <select id="selectById" resultType="com.niu.pojo.Car">
        select * from t_car where id = #{id}
    </select>
    
    <insert id="insert" parameterType="com.niu.pojo.Car">
        insert into t_car(car_num, brand, guide_price, produce_time, car_type)
        values(#{carNum}, #{brand}, #{guidePrice}, #{produceTime}, #{carType})
    </insert>
</mapper>
```

### MyBatis 使用步骤

1. 创建 `SqlSessionFactory` 对象
2. 通过 `SqlSessionFactory` 获取 `SqlSession` 对象
3. 通过 `SqlSession` 执行 SQL 语句
4. 关闭 `SqlSession`

```java
// 1. 创建SqlSessionFactory
SqlSessionFactoryBuilder sqlSessionFactoryBuilder = new SqlSessionFactoryBuilder();
SqlSessionFactory sqlSessionFactory = sqlSessionFactoryBuilder.build(
    Resources.getResourceAsStream("mybatis-config.xml"));

// 2. 获取SqlSession
SqlSession sqlSession = sqlSessionFactory.openSession();

// 3. 执行SQL
List<Car> cars = sqlSession.selectList("com.niu.mapper.CarMapper.selectAll");
cars.forEach(car -> System.out.println(car));

// 4. 关闭
sqlSession.close();
```

### 关于 `namespace`

- 在 MyBatis 中，`namespace` 属性用于区分不同的 SQL 映射文件
- 它必须唯一，通常使用 Mapper 接口的全限定名作为 namespace
- namespace 配合 id 组成了 SQL 语句的唯一标识

### 事务管理

- MyBatis 默认是手动提交事务（`openSession()` 等同于 `openSession(false)`）
- 可以使用 `sqlSession.commit()` 提交事务
- 可以使用 `sqlSession.rollback()` 回滚事务
- 也可以使用 `sqlSessionFactory.openSession(true)` 开启自动提交
- 这种方式不够灵活，实际开发中通常交给 Spring 来管理事务
