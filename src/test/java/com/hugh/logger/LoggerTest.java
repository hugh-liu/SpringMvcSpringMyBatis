package com.hugh.logger;

import java.util.ArrayList;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.hugh.dao.LoggerDao;
import com.hugh.entity.Logger;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

@RunWith(SpringJUnit4ClassRunner.class)  
@ContextConfiguration(locations = "classpath*:spring/spring-*.xml") 
public class LoggerTest {
	
	@Autowired
	private LoggerDao loggerDao;
	
	@Test
	public void test() {
		ArrayList<Logger> logger = loggerDao.loadLogger();
		System.out.println("获取数据完成！"); 
		JSONArray jsonArray = JSONArray.fromObject(logger);
		for (Object object : jsonArray) {
			System.out.println(JSONObject.fromObject(object).toString());
		}
		System.out.println("转换数据完成！"); 
	}

}
