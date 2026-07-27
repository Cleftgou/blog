---
title: Spring 框架源码分析
published: 2024-05-01
description: 深入分析 Spring 框架的 set 注入实现原理，从使用者角度出发，一步步拆解 xml 文件解析 + 反射机制 + 设计模式的框架核心。
tags: [Spring, Java, 源码分析, IoC, 设计模式]
category: Java
image: /images/covers/cover_08.jpg
draft: false
---

# Spring框架分析概要

- 这里只分析Spring框架的set注入
- 框架就是xml文件解析+反射机制+设计模式
- Map集合是很好用的数据存储对象

# 第一步 从使用者角度分析

- 普通Bean

```java
package com.niu.myspring.bean;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class Vip {
    private String name;
    private int age;
    private double height;
}
```

- 持久层Dao

```java
package com.niu.myspring.bean;

public interface UserDao {
    void insert();
}
```

```java
package com.niu.myspring.bean;

public class UserDaoImplForMySQL implements UserDao {
    @Override
    public void insert() {
        System.out.println("MySQL数据库正在插入数据");
    }
}
```

- spring.xml 配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans>
    <!-- vip对象 -->
    <bean id="vipBean" class="com.niu.myspring.bean.Vip">
        <!-- 注入简单类型 -->
        <property name="name" value="jack"/>
        <property name="age" value="20"/>
        <property name="height" value="180.0"/>
    </bean>

    <!-- UserDao对象 -->
    <bean id="userDao" class="com.niu.myspring.bean.UserDaoImplForMySQL"/>
</beans>
```

- 测试程序

```java
@Test
public void testMySpring() {
    ApplicationContext ac = new ClassPathXmlApplicationContext("myspring.xml");
    Vip vip = (Vip) ac.getBean("vipBean");
    System.out.println(vip);
    UserDao userDao = (UserDao) ac.getBean("userDao");
    userDao.insert();
}
```

# 第二步 开始分析 Spring 源码

- 解析 xml 文件，获取所有 bean 的配置信息

```java
package com.niu.myspring.core;

import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import java.util.*;

public class ClassPathXmlApplicationContext {
    private Map<String, Object> beanMap = new HashMap<>();
    private Map<String, BeanDefinition> beanDefinitionMap = new HashMap<>();

    public ClassPathXmlApplicationContext(String configLocation) {
        try {
            // 1. 解析xml配置文件
            SAXReader reader = new SAXReader();
            Document document = reader.read(ClassLoader.getSystemClassLoader().getResourceAsStream(configLocation));
            Element rootElement = document.getRootElement();
            List<Element> beanElements = rootElement.elements("bean");

            // 2. 遍历所有bean标签
            for (Element beanElement : beanElements) {
                String id = beanElement.attributeValue("id");
                String className = beanElement.attributeValue("class");

                BeanDefinition beanDefinition = new BeanDefinition();
                beanDefinition.setId(id);
                beanDefinition.setClassName(className);

                // 3. 获取property标签
                List<Element> propertyElements = beanElement.elements("property");
                for (Element propertyElement : propertyElements) {
                    String propertyName = propertyElement.attributeValue("name");
                    String propertyValue = propertyElement.attributeValue("value");

                    PropertyValue propertyValueObj = new PropertyValue(propertyName, propertyValue);
                    beanDefinition.getPropertyValues().add(propertyValueObj);
                }

                beanDefinitionMap.put(id, beanDefinition);
            }

            // 4. 实例化所有单例bean
            for (Map.Entry<String, BeanDefinition> entry : beanDefinitionMap.entrySet()) {
                String id = entry.getKey();
                BeanDefinition beanDefinition = entry.getValue();
                Object bean = createBean(beanDefinition);
                beanMap.put(id, bean);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Object createBean(BeanDefinition beanDefinition) throws Exception {
        String className = beanDefinition.getClassName();
        Class<?> clazz = Class.forName(className);
        Object bean = clazz.getDeclaredConstructor().newInstance();

        // 5. set方法注入属性值
        for (PropertyValue propertyValue : beanDefinition.getPropertyValues()) {
            String propertyName = propertyValue.getName();
            String propertyValueStr = propertyValue.getValue();

            // 通过反射调用set方法
            String setMethodName = "set" + propertyName.toUpperCase().charAt(0) + propertyName.substring(1);

            // 根据属性类型进行类型转换
            // 这里简化处理，实际Spring中有更复杂的类型转换机制
            if (propertyName.equals("name")) {
                clazz.getMethod(setMethodName, String.class).invoke(bean, propertyValueStr);
            } else if (propertyName.equals("age")) {
                clazz.getMethod(setMethodName, int.class).invoke(bean, Integer.parseInt(propertyValueStr));
            } else if (propertyName.equals("height")) {
                clazz.getMethod(setMethodName, double.class).invoke(bean, Double.parseDouble(propertyValueStr));
            }
        }

        return bean;
    }

    public Object getBean(String id) {
        return beanMap.get(id);
    }
}
```

- BeanDefinition

```java
package com.niu.myspring.core;

import java.util.ArrayList;
import java.util.List;

public class BeanDefinition {
    private String id;
    private String className;
    private List<PropertyValue> propertyValues = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public List<PropertyValue> getPropertyValues() { return propertyValues; }
    public void setPropertyValues(List<PropertyValue> propertyValues) { this.propertyValues = propertyValues; }
}
```

- PropertyValue

```java
package com.niu.myspring.core;

public class PropertyValue {
    private String name;
    private String value;

    public PropertyValue(String name, String value) {
        this.name = name;
        this.value = value;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
```

# 核心总结

框架的本质就是：

1. **XML 文件解析**：通过 dom4j 等工具解析配置文件，获取 bean 的定义信息
2. **反射机制**：通过 `Class.forName` 加载类，`newInstance` 创建对象，反射调用 setter 方法注入属性
3. **设计模式**：工厂模式（创建 bean）、单例模式（默认 scope 为 singleton）
4. **Map 集合**：用 `Map<String, Object>` 存储 bean 实例，`getBean` 方法从 Map 中获取

这就是 Spring IoC 容器最核心的实现原理。
