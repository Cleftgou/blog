---
title: Spring Boot 核心学习笔记
published: 2024-05-15
description: 深入理解 Spring Boot 的自动配置原理、依赖管理机制与核心特性，包括 starter 机制、底层注解等内容。
tags: [Spring Boot, Java, 框架]
category: Java
image: /images/covers/cover_10.jpg
draft: false
---

# 第一章 Spring Boot核心

### spring boot的典型特征

- #### **依赖管理机制**

  - 主要体现在pom文件里引入依赖是以starter的方式，以及继承父项目从而达到正确的依赖版本管理

    ```xml
    <!--依赖管理机制starter-->
        <dependencies>
            <!--starter称之为场景启动器-->
            <!--
            所有一级starter（比如spring-boot-starter-web）都包含有这个依赖
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter</artifactId>
                <version>3.2.5</version>
                <scope>compile</scope>
            </dependency>
            然后这个starter里又包含
                <dependency>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-autoconfigure</artifactId>
                    <version>3.2.5</version>
                    <scope>compile</scope>
                </dependency>
                虽然全场景的属性配置类都在这里，但并非全部都生效，因为有的相关类没有导入，所以不生效（按需加载自动配置）
            -->
            <!--总结：导入场景启动器，触发spring-boot-autoconfigure包下的自动配置生效，容器中就会有相应的功能-->
    </dependencies>
    ```

- #### **自动配置机制**

  - 自动配置的核心原理就是 `@SpringBootApplication` 注解，这是一个合成注解，包含以下三个注解：

    - `@SpringBootConfiguration` → 底层是 `@Configuration`，表明这是一个配置类
    - `@EnableAutoConfiguration` → 开启自动配置
    - `@ComponentScan` → 包扫描

  - `@EnableAutoConfiguration` 是自动配置的核心

    - 底层包含 `@Import(AutoConfigurationImportSelector.class)`
    - 会读取 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件
    - 该文件列出了所有自动配置类的全限定名

  - 按需开启：

    - 虽然自动配置类全部加载，但并不是所有都生效
    - 通过 `@Conditional` 系列注解实现条件装配
    - 比如 `@ConditionalOnClass` 表示只有导入了特定类时才生效

- #### **自动包规则**

  - Spring Boot 默认会将主启动类所在的包及其子包中的所有组件扫描到 Spring 容器中

### spring boot底层注解

- `@SpringBootApplication`：标注主程序类，表明这是一个Spring Boot应用

- `@Bean`：给容器中添加组件，以方法名作为组件的id，返回类型就是组件类型

- `@Configuration`：告诉Spring Boot这是一个配置类

  - `proxyBeanMethods` 属性：代理bean的方法
    - Full 模式（`proxyBeanMethods = true`）：保证每个 `@Bean` 方法被调用多少次返回的组件都是单例的
    - Lite 模式（`proxyBeanMethods = false`）：每个 `@Bean` 方法被调用多少次返回的组件都是新创建的

- `@Import`：导入组件，在类上标注，可以导入第三方包中的组件

- `@Conditional`：条件装配，满足条件时才注入组件

- `@ImportResource`：导入Spring配置文件，让Spring的xml配置文件生效

- `@ConfigurationProperties`：配置绑定，将properties文件中的内容绑定到JavaBean上
