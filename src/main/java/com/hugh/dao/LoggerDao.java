package com.hugh.dao;

import java.util.ArrayList;

import com.hugh.entity.Logger;

/**
 * 持久层-日志
 * 
 * @author jinhui
 *
 */
public interface LoggerDao {
	/**
	 * 查询日志信息
	 * 
	 * @return
	 */
	ArrayList<Logger> loadLogger();
	
	/**
	 * 新增日志信息
	 * @param logger 日志实体类
	 * @return 影响行数
	 */
	int insertLogger(Logger logger);
}