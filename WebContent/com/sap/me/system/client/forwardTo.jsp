<html><body><script language="JavaScript">

	var requestPath = "<%=(String) session.getAttribute ("REQUEST_URL")%>";

	window.location.href = requestPath;

	<% 
	    session.setAttribute("REQUEST_URL", "");
	%>
	
</script></body></html>
