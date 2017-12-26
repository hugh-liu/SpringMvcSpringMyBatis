package com.hugh.enums;

/**
 * 系统日志状态-枚举
 * 
 * @author jinhui
 *
 */
public enum LoggerState {
	NEW("未解决"), RUNNING("解决中"), SOLVE("解决");

	private final String value;

	private LoggerState(String v) {
		this.value = v;
	}

	public String value() {
		return this.value;
	}

	public static LoggerState fromValue(String v) {
		LoggerState[] arr$ = values();
		int len$ = arr$.length;
		for (int i$ = 0; i$ < len$; ++i$) {
			LoggerState c = arr$[i$];
			if (c.value.equals(v)) {
				return c;
			}
		}
		throw new IllegalArgumentException(v);
	}
}