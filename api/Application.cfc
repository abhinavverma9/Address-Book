<cfcomponent output="false">
    <cfset this.name = "address_book_api">
    <cfset this.applicationTimeout = createTimeSpan(0, 2, 0, 0)>
    <cfset this.sessionManagement = true>
    <cfset this.sessionTimeout = createTimeSpan(0, 0, 30, 0)>
    
    <!--- Load .env file --->
    <cfset variables.env = loadEnv()>
    
    <cfset this.datasource = "addressbook">
    <!--- Custom property for JWT Secret --->
    <cfset this.jwtSecret = variables.env.JWT_SECRET>

    <!--- ORM Configuration --->
    <cfset this.ormEnabled = true>
    <cfset this.ormSettings = {
        datasource = "addressbook",
        logsql = true,
        dbcreate = "update",
        cfclocation = "models",
        dialect = "PostgreSQL",
        flushAtRequestEnd = true,
        autoManageSession = true,
        eventHandling = true,
        skipCFCWithError = true
    }>

    <!--- Define Datasource --->
    <cfset this.datasources["addressbook"] = {
        "class": "org.postgresql.Driver",
        "connectionString": "jdbc:postgresql://" & variables.env.DB_HOST & ":" & variables.env.DB_PORT & "/" & variables.env.DB_NAME & "?TimeZone=UTC",
        "username": variables.env.DB_USER,
        "password": variables.env.DB_PASSWORD
    }>

    <cffunction name="onApplicationStart" returnType="boolean" output="false">
        <cfset application.jwtSecret = this.jwtSecret>
        <cfset application.datasource = this.datasource>
        
        <cfset application.authMiddleware = createObject("component", "api.middlewares.AuthMiddleware").init(jwtSecret=application.jwtSecret)>
        
        <cftry>
            <cfquery datasource="#this.datasource#">
                SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM users;
                SELECT setval(pg_get_serial_sequence('contacts', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM contacts;
                SELECT setval(pg_get_serial_sequence('refresh_tokens', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM refresh_tokens;
            </cfquery>
        <cfcatch type="any">
            <!--- Log error but don't fail application start --->
            <cflog file="application" text="Error resetting sequences: #cfcatch.message#">
        </cfcatch>
        </cftry>
        <cfreturn true>
    </cffunction>

    <cffunction name="onError" returnType="void" output="false">
        <cfargument name="exception" required="true">
        <cfargument name="eventname" type="string" required="true">
        
        <!--- Log error to file --->
        <cflog file="error" text="Error in #arguments.eventname#: #arguments.exception.message# - #arguments.exception.detail#">
        <cfsavecontent variable="local.errorDump">
            <cfdump var="#arguments.exception#">
        </cfsavecontent>
        <cffile action="write" file="#getDirectoryFromPath(getCurrentTemplatePath())#/error.log" output="#local.errorDump#">

        <cfheader statuscode="500" statustext="Internal Server Error">
        <cfcontent type="application/json" reset="true">
        <cfoutput>#serializeJSON({
            "success": false,
            "message": "An unexpected error occurred.",
            "error": arguments.exception.message,
            "detail": arguments.exception.detail ?: "",
            "type": arguments.exception.type ?: ""
        })#</cfoutput>
        <cfabort>
    </cffunction>

    <cffunction name="onRequestStart" returnType="boolean" output="false">
        <cfargument name="targetPage" type="string" required="true">
        
        <!--- Handle CORS --->
        <cfheader name="Access-Control-Allow-Origin" value="*">
        <cfheader name="Access-Control-Allow-Methods" value="GET,POST,PUT,DELETE,OPTIONS">
        <cfheader name="Access-Control-Allow-Headers" value="Content-Type, Authorization">
        
        <cfif structKeyExists(url, "reinit")>
            <cfset onApplicationStart()>
            <cfset ormReload()>
        </cfif>

        <cfif getHttpRequestData().method EQ "OPTIONS">
            <cfabort>
        </cfif>
        
        <!--- Auth Middleware --->
        <cfset application.authMiddleware.authenticate(
            path=CGI.SCRIPT_NAME & CGI.PATH_INFO,
            headers=getHttpRequestData().headers,
            urlScope=url,
            formScope=form
        )>

        <cfreturn true>
    </cffunction>

    <!--- Helper to load .env file --->
    <cffunction name="loadEnv" access="private" returntype="struct" output="false">
        <cfset var env = {}>
        <cfset var envFile = getDirectoryFromPath(getCurrentTemplatePath()) & ".env">
        
        <cfset env.DB_HOST = "">
        <cfset env.DB_PORT = "">
        <cfset env.DB_NAME = "">
        <cfset env.DB_USER = "">
        <cfset env.DB_PASSWORD = "">
        <cfset env.JWT_SECRET = "">
        <cfset env.DB_URL = "">
        
        <cfif fileExists(envFile)>
            <cfset var fileContent = fileRead(envFile)>
            <cfset var lines = listToArray(fileContent, chr(10))>
            
            <cfloop array="#lines#" index="local.line">
                <cfset local.line = trim(local.line)>
                <cfif len(local.line) GT 0 AND left(local.line, 1) NEQ "##">
                    <cfset var parts = listToArray(local.line, "=")>
                    <cfif arrayLen(parts) GE 1>
                        <cfset var key = trim(parts[1])>
                        <cfset var value = "">
                        <cfif arrayLen(parts) GE 2>
                            <cfset value = trim(mid(local.line, len(key) + 2, len(local.line)))>
                        </cfif>
                        <cfset env[key] = value>
                    </cfif>
                </cfif>
            </cfloop>
        </cfif>
        
        <cfreturn env>
    </cffunction>

</cfcomponent>