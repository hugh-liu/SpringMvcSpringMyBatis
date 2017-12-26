package com.hugh.dao;

import com.hugh.entity.Account;

/**
 * 持久层-用户
 * 
 * @author jinhui
 *
 */
public interface AccountDao {
	/**
	 * 登录验证
	 * 
	 * @param account 用户实体类
	 * @return 用户实体类
	 */
	Account findAccount(Account account);
}
