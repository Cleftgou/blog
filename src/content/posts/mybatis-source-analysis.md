---
title: MyBatis 框架源码分析
published: 2024-05-20
description: 手写迷你 MyBatis 框架，深入理解 SqlSessionFactoryBuilder、SqlSession 的核心实现，拆解 xml 解析 + 反射 + 设计模式的框架本质。
tags: [MyBatis, Java, 源码分析, ORM, 设计模式]
category: Java
image: /images/covers/cover_05.jpg
draft: false
---

# MyBatis框架分析概要

- 框架就是xml文件解析+反射机制+设计模式
- 核心类就是SqlSessionFactoryBuilder和SqlSession

# 第一步 从使用者角度出发

- 核心配置文件godbatis.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>

<configuration>
    <environments default="dev">
        <environment id="dev">
            <transactionManager type="JDBC"/>
            <dataSource type="UNPOOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/bjpowernode"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
        <environment id="pre">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${jdbc.driver}"/>
                <property name="url" value="${jdbc.url}"/>
                <property name="username" value="${jdbc.username}"/>
                <property name="password" value="${jdbc.password}"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="CarMapper.xml"/>
    </mappers>
</configuration>
```

- SQL映射文件 CarMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<mapper namespace="car">
    <select id="selectAll" resultType="com.niu.pojo.Car">
        select * from t_car
    </select>
    <select id="selectById" resultType="com.niu.pojo.Car">
        select * from t_car where id = #{id}
    </select>
</mapper>
```

- 使用

```java
SqlSessionFactoryBuilder sqlSessionFactoryBuilder = new SqlSessionFactoryBuilder();
SqlSessionFactory sqlSessionFactory = sqlSessionFactoryBuilder.build(
    Resources.getResourceAsStream("godbatis.xml"));
SqlSession sqlSession = sqlSessionFactory.openSession();

// 查询所有车辆
List<Car> cars = sqlSession.selectList("car.selectAll");
cars.forEach(car -> System.out.println(car));

// 根据id查询
Car car = sqlSession.selectOne("car.selectById", 1);
System.out.println(car);

sqlSession.close();
```

# 第二步 构建自己的 MyBatis 框架

### 1. Resources 资源加载类

```java
package com.niu.godbatis.core;

import java.io.InputStream;

public class Resources {
    private Resources() {}
    
    public static InputStream getResourceAsStream(String resource) {
        return ClassLoader.getSystemClassLoader().getResourceAsStream(resource);
    }
}
```

### 2. SqlSessionFactoryBuilder

```java
package com.niu.godbatis.core;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SqlSessionFactoryBuilder {
    
    public SqlSessionFactory build(InputStream in) {
        SqlSessionFactory factory = new SqlSessionFactory();
        try {
            SAXReader reader = new SAXReader();
            Document document = reader.read(in);
            
            // 解析environments，获取数据源配置
            Element environments = (Element) document.getRootElement()
                .selectSingleNode("environments");
            String defaultEnvId = environments.attributeValue("default");
            
            Element environment = (Element) environments
                .selectSingleNode("environment[@id='" + defaultEnvId + "']");
            
            Element dataSource = environment.element("dataSource");
            List<Element> propertyList = dataSource.elements("property");
            
            Map<String, String> props = new HashMap<>();
            for (Element prop : propertyList) {
                props.put(prop.attributeValue("name"), prop.attributeValue("value"));
            }
            factory.setProperties(props);
            
            // 解析mappers
            Element mappers = document.getRootElement().element("mappers");
            List<Element> mapperList = mappers.elements("mapper");
            for (Element mapper : mapperList) {
                String resource = mapper.attributeValue("resource");
                parseMapper(resource, factory);
            }
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return factory;
    }
    
    private void parseMapper(String resource, SqlSessionFactory factory) {
        try {
            SAXReader reader = new SAXReader();
            Document document = reader.read(
                Resources.getResourceAsStream(resource));
            Element mapper = document.getRootElement();
            String namespace = mapper.attributeValue("namespace");
            
            List<Element> selectList = mapper.elements("select");
            for (Element select : selectList) {
                String id = select.attributeValue("id");
                String resultType = select.attributeValue("resultType");
                String sql = select.getTextTrim();
                
                MappedStatement ms = new MappedStatement();
                ms.setId(namespace + "." + id);
                ms.setResultType(resultType);
                ms.setSql(sql);
                
                factory.getMappedStatements().put(ms.getId(), ms);
            }
        } catch (DocumentException e) {
            e.printStackTrace();
        }
    }
}
```

### 3. SqlSessionFactory

```java
package com.niu.godbatis.core;

import java.util.HashMap;
import java.util.Map;

public class SqlSessionFactory {
    private Map<String, String> properties = new HashMap<>();
    private Map<String, MappedStatement> mappedStatements = new HashMap<>();
    
    public SqlSession openSession() {
        return new SqlSession(this);
    }
    
    public Map<String, String> getProperties() { return properties; }
    public void setProperties(Map<String, String> properties) { this.properties = properties; }
    public Map<String, MappedStatement> getMappedStatements() { return mappedStatements; }
}
```

### 4. SqlSession

```java
package com.niu.godbatis.core;

import java.lang.reflect.Field;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SqlSession {
    private SqlSessionFactory factory;
    private Connection connection;
    
    public SqlSession(SqlSessionFactory factory) {
        this.factory = factory;
        try {
            Map<String, String> props = factory.getProperties();
            String driver = props.get("driver");
            String url = props.get("url");
            String username = props.get("username");
            String password = props.get("password");
            
            Class.forName(driver);
            this.connection = DriverManager.getConnection(url, username, password);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public <T> List<T> selectList(String statementId) {
        return selectList(statementId, null);
    }
    
    public <T> List<T> selectList(String statementId, Object param) {
        MappedStatement ms = factory.getMappedStatements().get(statementId);
        String sql = ms.getSql();
        String resultType = ms.getResultType();
        
        try {
            PreparedStatement ps = connection.prepareStatement(sql);
            if (param != null) {
                // 简单处理：只有一个参数
                ps.setObject(1, param);
            }
            ResultSet rs = ps.executeQuery();
            
            List<T> list = new ArrayList<>();
            while (rs.next()) {
                Class<?> clazz = Class.forName(resultType);
                T obj = (T) clazz.getDeclaredConstructor().newInstance();
                
                // 通过反射，将查询结果封装到对象中
                ResultSetMetaData metaData = rs.getMetaData();
                for (int i = 0; i < metaData.getColumnCount(); i++) {
                    String columnName = metaData.getColumnName(i + 1);
                    Object columnValue = rs.getObject(i + 1);
                    
                    // 通过反射给属性赋值
                    try {
                        Field field = clazz.getDeclaredField(columnName);
                        field.setAccessible(true);
                        field.set(obj, columnValue);
                    } catch (NoSuchFieldException e) {
                        // 字段不存在则跳过
                    }
                }
                list.add(obj);
            }
            rs.close();
            ps.close();
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public <T> T selectOne(String statementId, Object param) {
        List<T> list = selectList(statementId, param);
        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }
    
    public void close() {
        if (connection != null) {
            try { connection.close(); } catch (SQLException e) { e.printStackTrace(); }
        }
    }
}
```

### 5. MappedStatement

```java
package com.niu.godbatis.core;

public class MappedStatement {
    private String id;
    private String resultType;
    private String sql;
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getResultType() { return resultType; }
    public void setResultType(String resultType) { this.resultType = resultType; }
    public String getSql() { return sql; }
    public void setSql(String sql) { this.sql = sql; }
}
```

# 核心总结

MyBatis 框架的本质依然是：

1. **XML 文件解析**：通过 dom4j 解析 `mybatis-config.xml`（数据源配置）和 SQL 映射文件（MappedStatement）
2. **JDBC 封装**：通过 `DriverManager.getConnection` 获取连接，`PreparedStatement` 执行 SQL
3. **反射机制**：查询结果集通过反射封装为 POJO 对象，`field.set(obj, value)` 赋值
4. **设计模式**
   - **建造者模式**：`SqlSessionFactoryBuilder` 负责一步步构建 `SqlSessionFactory`
   - **工厂模式**：`SqlSessionFactory` 创建 `SqlSession`
5. **动态代理**（真实 MyBatis 中）：Mapper 接口通过 `getMapper` 方法获取代理对象，代理对象在 `invoke` 方法中执行 SQL
