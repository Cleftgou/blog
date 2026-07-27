---
title: JDBC 学习笔记
published: 2024-01-20
description: JDBC（Java Database Connectivity）是 Java 连接数据库的标准规范，本文记录了 JDBC 的核心概念、编程六步以及最佳实践。
tags: [Java, JDBC, MySQL, 数据库]
category: Java
image: /images/covers/cover_03.jpg
draft: false
---

# **JDBC是由sun公司定义的一个规则（接口interface）**

这个过程中有三个参与角色

```txt
java程序员：面向接口写代码(想办法通过JDBC去调用数据库厂商实现类的方法)
sun公司：负责制定这套JDBC接口
数据库厂商：负责编写JDBC接口的实现类(驱动)
```

java程序员

```java
package com.bjpowernode.javaweb.servlet;

import java.util.ResourceBundle;

public class Test01 {
    public static void main(String[] args) throws Exception {
        // JDBC jdbc = new MySQL();

        //创建对象可以通过反射机制
        ResourceBundle bundle = ResourceBundle.getBundle("Jdbc");
        String className = bundle.getString("classname");
        Class c = Class.forName(className);
        //在java1.9版本中，newInstance()已经被弃用，被取代为下面这种方法
        JDBC jdbc = (JDBC)c.getDeclaredConstructor().newInstance();

        jdbc.getConnetion();
    }
}
```

sun公司

```java
public interface JDBC {
    /*
    连接数据库的方法
     */
    void getConnection();
}
```

数据库厂商：

```java
public class SqlServer implenments JDBC{
    
    public void getConnection(){
        System.out.println("连接SqlServer数据库成功！")
    }
}
```

# **JDBC编程六步**

1. 注册驱动(告诉Java程序要连接哪个品牌的数据库)
2. 获取连接(表示JVM的进程和数据库进程之间的通道打开了，这属于进程之间的通信)
3. 获取数据库操作对象(专门执行sql语句的对象)
4. 执行sql语句(DQL,DML)
5. 处理查询结果集(只有第四步是select语句时进行这一步)
6. 释放资源(这个通道一定要关闭)

具体实现

```java
package com.bjpowernode.javaweb.servlet;

import java.sql.*;

public class Test01{
    public static void main(String[] args) {
        //这里因为最后要在finally中关闭，所以要把这两个在try块外定义（作用域）
        Connection conn = null;
        Statement stmt = null;

        try {
            //1、注册驱动
            Driver driver = new com.mysql.cj.jdbc.Driver();//多态，父类型指向子类型对象
            DriverManager.registerDriver(driver);

            /*
                url:统一资源定位符（网络中某个资源的绝对路径）
                https://www.baidu.com/这就是url
                url的组成：
                    协议
                    IP
                    PORT(端口)
                    资源名

                http://182.61.200.7:80/index.html
                    http://通信协议
                    182.61.200.7:80IP地址
                    80 服务器上软件的端口
                    index.html是服务器上某个资源名

                jdbc:mysql://127.0.0.1:3306/bjpowernode
                    jdbc:mysql://协议
                    127.0.0.1 IP 地址
                    3306 mysql数据库端口号
                    bjpowernode 具体的数据库实例名

                注：localhost和127.0.0.1都是本机IP地址

                通信协议：
                    通信协议是通信之前就提前定好的数据传输格式。
                    数据包具体怎么传输数据，格式提前定好的。

             */
            //2、获取连接
            String url = "jdbc:mysql://127.0.0.1:3306/bjpowernode";
            String user = "root";
            String password = "123456";
            conn = DriverManager.getConnection(url, user, password);
            //实际上这里调用方法的操作，就是new了一个mysql数据库连接
            System.out.println("数据库连接对象："+conn);
            //输出结果即com.mysql.jdbc.JDBC4Connection@41cf53f9

            //3、获取数据库操作对象(statement专门用来专门执行sql语句的)，以后就专门操作stmt了
            stmt = conn.createStatement();

            //4、执行sql语句
            //JDBC中的sql语句不需要写分号
            //"delete from dept where deptno = 40";
            //"update dept set dname = '销售部',loc = '天津', where deptno = 20";
            String sql = "delete from dept where deptno = 40";
            //专门执行DML语句的（insert delete update）
            //返回值是"影响数据库中的记录条数"
            int count = stmt.executeUpdate(sql);
            System.out.println(count == 1?"保存成功":"保存失败");

        } catch (SQLException e) {
            e.printStackTrace();
        }finally {
            //6、释放资源
            //遵循从小到大依次关闭，分别对其try...catch
            if (stmt != null){
                try {
                    stmt.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            if (conn != null){
                try {
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }

    }
}
```

简化（标准）后

```java
package com.bjpowernode.javaweb.servlet;
//把配置信息写到一个配置文件properties中
import java.sql.*;
import java.util.ResourceBundle;

public class Test02 {
    public static void main(String[] args) {
        //使用资源绑定器绑定属性配置文件
        ResourceBundle bundle = ResourceBundle.getBundle("jdbc.properties");
        String driver = bundle.getString("driver");
        String url = bundle.getString("url");
        String user = bundle.getString("user");
        String password = bundle.getString("password");

        Connection conn = null;
        Statement stmt = null;
        try{
            //1、注册驱动
            //DriverManager.registerDriver(new com.mysql.jdbc.Driver());
//            driver = com.mysql.jdbc.Driver;
            Class.forName(driver);
            //2、获取连接
//            String url = "jdbc:mysql://localhost:3306/bjpowernode";
//            String user = "root";
//            String password = "123456";
            conn = DriverManager.getConnection(url,user,password);
            //3、获取数据库操作对象
            stmt = conn.createStatement();
            //4、执行sql语句
            String sql = "update dept set dname = '销售部',loc = '天津' where deptno = 20";
            int count = stmt.executeUpdate(sql);
            System.out.println(count == 1?"删除成功":"删除失败");
        }catch(SQLException | ClassNotFoundException e){
            e.printStackTrace();
        } finally {
            if(stmt != null){
                try {
                    stmt.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            if(conn !=null){
                try{
                    conn.close();
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
        }
    }

}

```

简化后的properties配置文件

```properties
driver=com.mysql.jdbc.Driver
url=mysql://192.168.151.9:3306/bjpowercode
user=root
password=123456
```
