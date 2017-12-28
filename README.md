# Spring+SpringMVC+Mybatis+MySql项目
***
## 前  言
本项目是用maven管理创建的一个简单的SpringMvc+Spring+MyBatis的web框架，里面用到些常用的技术，能够快速的搭建一套web框架，如说明的不好还望谅解。
***
## 项目介绍
1、项目管理：Maven
2、框架：SpringMVC+Spring+MyBatis
3、数据库：mysql
4、开发工具：eclipse
5、JDK版本：1.8.0_102
6、服务器：tomcat7.0.57
7、Java命名规则：驼峰命名法，方法名和属性首字母小写、类首字母大写
8、数据命名规则：全部小写用下划线连接如：create_date
***
## 目录
* [第一章、创建Maven项目](#第一章maven项目)
* [第二章、整合springmvc、spring、mybatis框架](#第二章整合springmvc_spring_mybatis框架)
* [第三章、前后台交互DEMO](#第三章、前后台交互DEMO)
* [第四章、登录验证DEMO](#第四章、登录验证DEMO)
* [第五章、登录拦截器DEMO](#第五章、登录拦截器DEMO)
* [第六章、使用MyBatis逆向工程生成代码](#第六章、使用MyBatis逆向工程生成代码)
* [第七章、利用AOP、注解实现日志管理](#第七章、利用AOP、注解实现日志管理)
***
***
***
### 第一章、maven项目
#### 1、创建Maven项目  
![1](/img/1.png)  
#### 2、选择工作中心  
![2](/img/2.png)  
#### 3、选择Maven项目原型-WEB项目  
![3](/img/3.png)  
#### 4、填写项目Group Id（一般为域名反写）、Artifact Id、Package（可不填会自动生成）  
![4](/img/4.png)  
#### 5、创建完成项目目录  
![5](/img/5.png)  
#### 6、添加源文件夹  
Maven规定，必须创建以下几个Source Folder：  
src/main/resources  
src/main/java（如果创建时报错说已经存在，它确实存在了只是你看不到，别急后面会显示出来）  
src/test/resources  
src/test/java（如果创建时报错说已经存在，它确实存在了只是你看不到，别急后面会显示出来）  
 ![6](/img/6.png)  
#### 7、选中项目右击选择Build Path，配置Build Path，双击修改，分别修改为：  
src/main/resources		对应　　target/classes  
src/main/java			对应　　target/classes  
src/test/resources		对应　　target/test-classes  
src/test/java			对应　　target/test-classes  
![7](/img/7.png)  
#### 8、修改Libraries  
![8](/img/8.png)  
![9](/img/9.png)  
![10](/img/10.png)  
然后再看目录那两个java文件夹就出来了  
![11](/img/11.png)  
#### 9、修改Web Module版本和java版本-选择项目右键Properties，选择 Project Facets  
Dynamic Web Module版本修改为3.0  
Java版本修改1.8（和前面jdk版面一样就行了）  
![12](/img/12.png)  
如果修改版本后出现提示Further configuration available…则点击修改ContentDirectory：src/main/webapp；  
如果修改Dynamic Web Module版本报错则可以修改文件：  
![13](/img/13.png)  
![14](/img/14.png)  
然后刷新下项目他就改成3.0了  
#### 10、配置tomcat，如果已经创建了就不需要新建了直接选中Apply就行了  
![15](/img/15.png)  
![16](/img/16.png)  
选择tomcat路径  
![17](/img/17.png)  
![18](/img/18.png)  
#### 11、修改web.xml文件  
![19](/img/19.png)  
修改为：  
```
 <?xml version="1.0" encoding="UTF-8"?>  
 <web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
     xmlns="http://java.sun.com/xml/ns/javaee"  
     xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"  
     id="WebApp_ID" version="3.0">  
     <display-name>test-hd-</display-name>  
     <welcome-file-list>  
         <welcome-file>index.jsp</welcome-file>  
     </welcome-file-list>  
 </web-app>  
```
#### 12、设置部署程序集（Web Deployment Assembly）-选择项目右键Properties，选择Deployment Assembly  
我们要删除test的两项，因为test是测试使用，并不需要部署  
然后将Maven的jar包发布到lib下  
![20](/img/20.png)  
#### 13、项目创建完成，启动项目  
![21](/img/21.png)  
***
***
### 第二章整合springmvc_spring_mybatis框架
***
***
### 第三章、前后台交互DEMO
***
***
### 第四章、登录验证DEMO
***
***
### 第五章、登录拦截器DEMO
***
***
### 第六章、使用MyBatis逆向工程生成代码
***
***
### 第七章、利用AOP、注解实现日志管理

