package com.hugh.service;

import com.hugh.entity.Logger;

/**
 * 业务层接口类-日志
 * 
 * @author jinhui
 *
 */
public interface LoggerService {
	
	/**
	 * 新增日志信息
	 * @param logger 日志实体类
	 * @return 影响行数
	 */
	int insertLogger(Logger logger);
}
