package com.hugh.entity;

import com.hugh.enums.LoggerState;
import com.hugh.enums.LoggerType;

/**
 * 实体类-日志
 * @author jinhui
 *
 */
public class Logger extends BaseEntity {
	private String uuid;// 主键（时间加随机）
	private String method;// 方法名
	private String methodDes;// 方法描述
	private String exceptionCode;// 异常代码
	private String exceptionMsg;// 异常信息
	private String params;// 请求参数
	private LoggerType loggerType;// 日志类型
	private LoggerState loggerState;// 日志状态
	private String solution;// 解决方案
	private String ip;// 请求ip
	private Account createAccount;// 创建用户
	private Account updateAccount;// 修改用户
	
	public Logger() {}
	
	public String getUuid() {
		return uuid;
	}
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
	public String getMethod() {
		return method;
	}
	public void setMethod(String method) {
		this.method = method;
	}
	public String getMethodDes() {
		return methodDes;
	}
	public void setMethodDes(String methodDes) {
		this.methodDes = methodDes;
	}
	public String getExceptionCode() {
		return exceptionCode;
	}
	public void setExceptionCode(String exceptionCode) {
		this.exceptionCode = exceptionCode;
	}
	public String getExceptionMsg() {
		return exceptionMsg;
	}
	public void setExceptionMsg(String exceptionMsg) {
		this.exceptionMsg = exceptionMsg;
	}
	public String getParams() {
		return params;
	}
	public void setParams(String params) {
		this.params = params;
	}
	public LoggerType getLoggerType() {
		return loggerType;
	}
	public void setLoggerType(LoggerType loggerType) {
		this.loggerType = loggerType;
	}
	public LoggerState getLoggerState() {
		return loggerState;
	}
	public void setLoggerState(LoggerState loggerState) {
		this.loggerState = loggerState;
	}
	public String getSolution() {
		return solution;
	}
	public void setSolution(String solution) {
		this.solution = solution;
	}
	public String getIp() {
		return ip;
	}
	public void setIp(String ip) {
		this.ip = ip;
	}
	public Account getCreateAccount() {
		return createAccount;
	}
	public void setCreateAccount(Account createAccount) {
		this.createAccount = createAccount;
	}
	public Account getUpdateAccount() {
		return updateAccount;
	}
	public void setUpdateAccount(Account updateAccount) {
		this.updateAccount = updateAccount;
	}
	
}
