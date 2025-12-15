<cfcomponent rest="true" restpath="/auth">

    <cffunction name="register" access="remote" returntype="struct" returnformat="json" httpmethod="POST">
        <cfargument name="full_name" type="string" required="true">
        <cfargument name="email" type="string" required="true">
        <cfargument name="username" type="string" required="true">
        <cfargument name="password" type="string" required="true">

        <cfset local.response = { "success" = false, "message" = "" }>
        <cfset local.salt = createUUID()>
        <cfset local.hashedPassword = hash(arguments.password & local.salt, "SHA-512")>

        <cftry>
            <cfquery datasource="#application.datasource#">
                INSERT INTO users (full_name, email, username, password_hash, password_salt)
                VALUES (
                    <cfqueryparam value="#arguments.full_name#" cfsqltype="cf_sql_varchar">,
                    <cfqueryparam value="#arguments.email#" cfsqltype="cf_sql_varchar">,
                    <cfqueryparam value="#arguments.username#" cfsqltype="cf_sql_varchar">,
                    <cfqueryparam value="#local.hashedPassword#" cfsqltype="cf_sql_varchar">,
                    <cfqueryparam value="#local.salt#" cfsqltype="cf_sql_varchar">
                )
            </cfquery>
            
            <cfset local.response.success = true>
            <cfset local.response.message = "User registered successfully.">
            
            <cfcatch type="database">
                <cfif cfcatch.message contains "UNIQUE">
                    <cfset local.response.message = "Username or Email already exists.">
                <cfelse>
                    <cfset local.response.message = "Database error: " & cfcatch.message>
                </cfif>
            </cfcatch>
        </cftry>

        <cfreturn local.response>
    </cffunction>

    <cffunction name="login" access="remote" returntype="struct" returnformat="json" httpmethod="POST">
        <cfargument name="username" type="string" required="true">
        <cfargument name="password" type="string" required="true">

        <cfset local.response = { "success" = false, "message" = "", "token" = "", "refreshToken" = "" }>

        <cfquery name="qUser" datasource="#application.datasource#">
            SELECT id, username, password_hash, password_salt, full_name
            FROM users
            WHERE username = <cfqueryparam value="#arguments.username#" cfsqltype="cf_sql_varchar">
        </cfquery>

        <cfif qUser.recordCount EQ 1>
            <cfset local.hashedInput = hash(arguments.password & qUser.password_salt, "SHA-512")>
            
            <cfif local.hashedInput EQ qUser.password_hash>
                <!--- Generate JWT Access Token (15 mins) --->
                <cfset local.jwtUtil = createObject("component", "api.utils.jwt")>
                <cfset local.payload = {
                    "sub" = qUser.id,
                    "username" = qUser.username,
                    "exp" = dateAdd("n", 15, now()).getTime()
                }>
                <cfset local.accessToken = local.jwtUtil.encode(local.payload, application.jwtSecret)>
                
                <!--- Generate Refresh Token (7 days) --->
                <cfset local.refreshToken = createUUID()>
                <cfset local.expiresAt = dateAdd("d", 7, now())>
                
                <cfquery datasource="#application.datasource#">
                    INSERT INTO refresh_tokens (user_id, token, expires_at)
                    VALUES (
                        <cfqueryparam value="#qUser.id#" cfsqltype="cf_sql_integer">,
                        <cfqueryparam value="#local.refreshToken#" cfsqltype="cf_sql_varchar">,
                        <cfqueryparam value="#local.expiresAt#" cfsqltype="cf_sql_timestamp">
                    )
                </cfquery>

                <cfset local.response.success = true>
                <cfset local.response.message = "Login successful.">
                <cfset local.response.token = local.accessToken>
                <cfset local.response.refreshToken = local.refreshToken>
                <cfset local.response.user = { "id" = qUser.id, "username" = qUser.username, "full_name" = qUser.full_name }>
            <cfelse>
                <cfset local.response.message = "Invalid password.">
            </cfif>
        <cfelse>
            <cfset local.response.message = "User not found.">
        </cfif>

        <cfreturn local.response>
    </cffunction>
    
    <cffunction name="refreshToken" access="remote" returntype="struct" returnformat="json" httpmethod="POST">
        <cfargument name="refreshToken" type="string" required="true">
        
        <cfset local.response = { "success" = false, "message" = "", "token" = "" }>
        
        <cfquery name="qToken" datasource="#application.datasource#">
            SELECT r.user_id, u.username
            FROM refresh_tokens r
            JOIN users u ON r.user_id = u.id
            WHERE r.token = <cfqueryparam value="#arguments.refreshToken#" cfsqltype="cf_sql_varchar">
            AND r.expires_at > <cfqueryparam value="#now()#" cfsqltype="cf_sql_timestamp">
        </cfquery>
        
        <cfif qToken.recordCount EQ 1>
            <!--- Generate New Access Token --->
            <cfset local.jwtUtil = createObject("component", "api.utils.jwt")>
            <cfset local.payload = {
                "sub" = qToken.user_id,
                "username" = qToken.username,
                "exp" = dateAdd("n", 15, now()).getTime()
            }>
            <cfset local.accessToken = local.jwtUtil.encode(local.payload, application.jwtSecret)>
            
            <cfset local.response.success = true>
            <cfset local.response.token = local.accessToken>
        <cfelse>
            <cfset local.response.message = "Invalid or expired refresh token.">
        </cfif>
        
        <cfreturn local.response>
    </cffunction>

    <cffunction name="logout" access="remote" returntype="struct" returnformat="json" httpmethod="POST">
        <cfargument name="refreshToken" type="string" required="true">
        
        <cfset local.response = { "success" = false, "message" = "" }>
        
        <cfquery datasource="#application.datasource#">
            DELETE FROM refresh_tokens
            WHERE token = <cfqueryparam value="#arguments.refreshToken#" cfsqltype="cf_sql_varchar">
        </cfquery>
        
        <cfset local.response.success = true>
        <cfset local.response.message = "Logged out successfully.">
        
        <cfreturn local.response>
    </cffunction>

</cfcomponent>
