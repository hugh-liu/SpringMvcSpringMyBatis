package com.hugh.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hugh.annotation.SystemServiceLog;
import com.hugh.dao.AccountDao;
import com.hugh.entity.Account;
import com.hugh.service.AccountService;
import com.hugh.vo.LoginVO;

/**
 * 业务层实现类-用户
 * 
 * @author jinhui
 *
 */
@Service
public class AccountServiceImpl implements AccountService {

	@Autowired
	private AccountDao accountDao;

	@Override
	@SystemServiceLog(description = "登录验证-业务处理")
	public boolean findAccount(LoginVO loginVO) {
		Account account = new Account(loginVO.getName(), loginVO.getPassword());
		account = accountDao.findAccount(account);
		if (account == null) {
			return false;
		}
		return true;
	}

}
