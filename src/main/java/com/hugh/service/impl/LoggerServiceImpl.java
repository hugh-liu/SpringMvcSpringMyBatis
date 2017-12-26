package com.hugh.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hugh.annotation.SystemServiceLog;
import com.hugh.dao.LoggerDao;
import com.hugh.entity.Logger;
import com.hugh.service.LoggerService;

/**
 * 业务层实体类-日志
 * @author jinhui
 *
 */
@Service
public class LoggerServiceImpl implements LoggerService {

	@Autowired
	private LoggerDao logerDao;
	
	@Override
	@SystemServiceLog(description = "日志新增")
	public int insertLogger(Logger logger) {
		return logerDao.insertLogger(logger);
	}

}
