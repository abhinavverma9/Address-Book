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

    <!--- Define Datasource Programmatically (Lucee Syntax) --->
    <cfset this.datasources["addressbook"] = {
        "class": "org.postgresql.Driver",
        "connectionString": "jdbc:postgresql://" & variables.env.DB_HOST & ":" & variables.env.DB_PORT & "/" & variables.env.DB_NAME & "?characterEncoding=UTF-8&ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory",
        "username": variables.env.DB_USER,
        "password": variables.env.DB_PASSWORD
    }>

    <cffunction name="onApplicationStart" returnType="boolean" output="false">
        <cfset application.jwtSecret = this.jwtSecret>
        <cfset application.datasource = this.datasource>
        <cfreturn true>
    </cffunction>

    <cffunction name="onRequestStart" returnType="boolean" output="false">
        <cfargument name="targetPage" type="string" required="true">
        
        <!--- Handle CORS --->
        <cfheader name="Access-Control-Allow-Origin" value="*">
        <cfheader name="Access-Control-Allow-Methods" value="GET,POST,PUT,DELETE,OPTIONS">
        <cfheader name="Access-Control-Allow-Headers" value="Content-Type, Authorization">
        
        <cfif getHttpRequestData().method EQ "OPTIONS">
            <cfabort>
        </cfif>
        
        <cfreturn true>
    </cffunction>

    <!--- Helper to load .env file --->
    <cffunction name="loadEnv" access="private" returntype="struct" output="false">
        <cfset var env = {}>
        <cfset var envFile = expandPath("./.env")>
        
        <!--- Defaults --->
        <cfset env.DB_HOST = "127.0.0.1">
        <cfset env.DB_PORT = "5432">
        <cfset env.DB_NAME = "addressbook">
        <cfset env.DB_USER = "postgres">
        <cfset env.DB_PASSWORD = "">
        <cfset env.JWT_SECRET = "defaultSecret">
        
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
