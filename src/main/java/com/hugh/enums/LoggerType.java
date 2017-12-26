package com.hugh.enums;

/**
 * 系统日志类型-枚举
 * 
 * @author jinhui
 *
 */
public enum LoggerType {
	NORMAL("系统日志"), ABNORMAL("系统异常");

	private final String value;

	private LoggerType(String v) {
		this.value = v;
	}

	public String value() {
		return this.value;
	}

	public static LoggerType fromValue(String v) {
		LoggerType[] arr$ = values();
		int len$ = arr$.length;
		for (int i$ = 0; i$ < len$; ++i$) {
			LoggerType c = arr$[i$];
			if (c.value.equals(v)) {
				return c;
			}
		}
		throw new IllegalArgumentException(v);
	}
}