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
            <cfset local.user = entityNew("User")>
            <cfset local.user.setFull_name(arguments.full_name)>
            <cfset local.user.setEmail(arguments.email)>
            <cfset local.user.setUsername(arguments.username)>
            <cfset local.user.setPassword_hash(local.hashedPassword)>
            <cfset local.user.setPassword_salt(local.salt)>
            
            <cfset entitySave(local.user)>
            
            <cfset local.response.success = true>
            <cfset local.response.message = "User registered successfully.">
            
            <cfcatch type="database">
                <cfif cfcatch.message contains "UNIQUE">
                    <cfset local.response.message = "Username or Email already exists.">
                <cfelse>
                    <cfset local.response.message = "Database error: " & cfcatch.message>
                </cfif>
            </cfcatch>
            <cfcatch type="any">
                 <cfset local.response.message = "Error: " & cfcatch.message>
            </cfcatch>
        </cftry>

        <cfreturn local.response>
    </cffunction>

    <cffunction name="login" access="remote" returntype="struct" returnformat="json" httpmethod="POST">
        <cfargument name="username" type="string" required="true">
        <cfargument name="password" type="string" required="true">

        <cfset local.response = { "success" = false, "message" = "", "token" = "", "refreshToken" = "" }>

        <cfset local.users = entityLoad("User", { username = arguments.username })>

        <cfif arrayLen(local.users) EQ 1>
            <cfset local.user = local.users[1]>
            <cfset local.hashedInput = hash(arguments.password & local.user.getPassword_salt(), "SHA-512")>
            
            <cfif local.hashedInput EQ local.user.getPassword_hash()>
                <!--- Generate JWT Access Token (15 mins) --->
                <cfset local.jwtUtil = createObject("component", "api.utils.jwt")>
                <cfset local.payload = {
                    "sub" = local.user.getId(),
                    "username" = local.user.getUsername(),
                    "exp" = dateAdd("n", 15, now()).getTime()
                }>
                <cfset local.accessToken = local.jwtUtil.encode(local.payload, application.jwtSecret)>
                
                <cfset local.refreshTokenStr = createUUID()>
                <cfset local.expiresAt = dateAdd("d", 7, now())>
                
                <cfset local.rtEntity = entityNew("RefreshToken")>
                <cfset local.rtEntity.setUser(local.user)>
                <cfset local.rtEntity.setToken(local.refreshTokenStr)>
                <cfset local.rtEntity.setExpiresAt(local.expiresAt)>
                
                <cfset entitySave(local.rtEntity)>

                <cfset local.response.success = true>
                <cfset local.response.message = "Login successful.">
                <cfset local.response.token = local.accessToken>
                <cfset local.response.refreshToken = local.refreshTokenStr>
                <cfset local.response.user = { "id" = local.user.getId(), "username" = local.user.getUsername(), "full_name" = local.user.getFull_name() }>
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
        
        <cfset local.tokens = entityLoad("RefreshToken", { token = arguments.refreshToken })>
        
        <cfif arrayLen(local.tokens) EQ 1>
            <cfset local.rtEntity = local.tokens[1]>
            
            <cfif local.rtEntity.getExpiresAt() GT now()>
                <cfset local.user = local.rtEntity.getUser()>
                
                <!--- Generate New Access Token --->
                <cfset local.jwtUtil = createObject("component", "api.utils.jwt")>
                <cfset local.payload = {
                    "sub" = local.user.getId(),
                    "username" = local.user.getUsername(),
                    "exp" = dateAdd("n", 15, now()).getTime()
                }>
                <cfset local.accessToken = local.jwtUtil.encode(local.payload, application.jwtSecret)>
                
                <cfset local.response.success = true>
                <cfset local.response.token = local.accessToken>
            <cfelse>
                <cfset local.response.message = "Refresh token expired.">
            </cfif>
        <cfelse>
            <cfset local.response.message = "Invalid refresh token.">
        </cfif>
        
        <cfreturn local.response>
    </cffunction>

    <cffunction name="logout" access="remote" returntype="struct" returnformat="json" httpmethod="POST">
        <cfargument name="refreshToken" type="string" required="true">
        
        <cfset local.response = { "success" = false, "message" = "" }>
        
        <cfset local.tokens = entityLoad("RefreshToken", { token = arguments.refreshToken })>
        
        <cfif arrayLen(local.tokens) EQ 1>
            <cfset entityDelete(local.tokens[1])>
            <cfset local.response.success = true>
            <cfset local.response.message = "Logged out successfully.">
        <cfelse>
            <cfset local.response.message = "Token not found.">
        </cfif>
        
        <cfreturn local.response>
    </cffunction>

    <cffunction name="me" access="remote" returntype="struct" returnformat="json" httpmethod="GET">
        <cfset local.response = { "success" = false, "message" = "", "user" = {} }>
        
        <cfset local.userId = request.userId>
        
        <cftry>
            <cfset local.user = entityLoadByPK("User", local.userId)>
            
            <cfif isNull(local.user)>
                    <cfset local.response.message = "User not found.">
            <cfelse>
                <cfset local.response.success = true>
                <cfset local.response.user = {
                    "id" = local.user.getId(),
                    "username" = local.user.getUsername(),
                    "email" = local.user.getEmail(),
                    "full_name" = local.user.getFull_name()
                }>
            </cfif>
            
        <cfcatch type="any">
            <cfset local.response.message = "Error: " & cfcatch.message>
        </cfcatch>
        </cftry>
        
        <cfreturn local.response>
    </cffunction>

</cfcomponent>
