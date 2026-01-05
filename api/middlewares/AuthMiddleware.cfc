<cfcomponent output="false" displayname="AuthMiddleware" hint="Handles JWT authentication for API requests">

    <!--- Constructor --->
    <cffunction name="init" access="public" returnType="AuthMiddleware" output="false">
        <cfargument name="jwtSecret" type="string" required="true">
        
        <cfset variables.jwtSecret = arguments.jwtSecret>
        
        <cfset variables.publicEndpoints = [
            "/auth/login",
            "/auth/register",
            "/auth/refreshtoken",
            "/auth/logout",
            "test-db.cfm"
        ]>
        
        <cfset variables.publicMethods = "login,register,refreshtoken,logout,loginwithgoogle">
        
        <cfreturn this>
    </cffunction>

    <!--- Main authentication check method --->
    <cffunction name="authenticate" access="public" returnType="boolean" output="false">
        <cfargument name="path" type="string" required="true">
        <cfargument name="headers" type="struct" required="true">
        <cfargument name="urlScope" type="struct" required="false" default="#structNew()#">
        <cfargument name="formScope" type="struct" required="false" default="#structNew()#">
        
        <!--- Normalize path --->
        <cfset local.path = lCase(trim(arguments.path))>
        
        <!--- Get method from URL or FORM scope --->
        <cfset local.method = "">
        <cfif structKeyExists(arguments.urlScope, "method")>
            <cfset local.method = lCase(trim(arguments.urlScope.method))>
        <cfelseif structKeyExists(arguments.formScope, "method")>
            <cfset local.method = lCase(trim(arguments.formScope.method))>
        </cfif>

        <!--- Check if this is a public endpoint --->
        <cfif isPublicEndpoint(local.path, local.method)>
            <cfreturn true>
        </cfif>

        <!--- Extract and validate JWT token --->
        <cfset local.authHeader = extractAuthHeader(arguments.headers)>
        
        <!--- If no token provided, return 401 --->
        <cfif NOT len(trim(local.authHeader))>
            <cfset sendUnauthorized("Missing authorization token")>
        </cfif>
        
        <!--- Validate Bearer token format --->
        <cfif NOT isValidBearerFormat(local.authHeader)>
            <cfset sendUnauthorized("Invalid authorization header format. Use: Bearer <token>")>
        </cfif>
        
        <!--- Extract token --->
        <cfset local.token = trim(right(local.authHeader, len(local.authHeader) - 7))>
        
        <!--- Validate and decode token --->
        <cfset local.payload = validateToken(local.token)>
        
        <!--- Store user data in request scope --->
        <cfif structKeyExists(local.payload, "sub")>
            <cfset request.userId = local.payload.sub>
        <cfelse>
            <cfset sendUnauthorized("Invalid token payload: missing subject")>
        </cfif>
        
        <!--- Store entire payload for additional claims --->
        <cfset request.jwtPayload = local.payload>
        
        <cfreturn true>
    </cffunction>

    <!--- Check if endpoint is public --->
    <cffunction name="isPublicEndpoint" access="private" returnType="boolean" output="false">
        <cfargument name="path" type="string" required="true">
        <cfargument name="method" type="string" required="false" default="">
        
        <!--- Check path-based public endpoints --->
        <cfloop array="#variables.publicEndpoints#" index="local.endpoint">
            <cfif findNoCase(local.endpoint, arguments.path)>
                <cfreturn true>
            </cfif>
        </cfloop>
        
        <!--- Check method-based public endpoints (for direct CFC calls) --->
        <cfif len(arguments.method) AND findNoCase("auth.cfc", arguments.path)>
            <cfif listFindNoCase(variables.publicMethods, arguments.method)>
                <cfreturn true>
            </cfif>
        </cfif>
        
        <cfreturn false>
    </cffunction>

    <!--- Extract Authorization header (case-insensitive) --->
    <cffunction name="extractAuthHeader" access="private" returnType="string" output="false">
        <cfargument name="headers" type="struct" required="true">
        
        <cfloop collection="#arguments.headers#" item="local.headerName">
            <cfif lCase(local.headerName) EQ "authorization">
                <cfreturn arguments.headers[local.headerName]>
            </cfif>
        </cfloop>
        
        <cfreturn "">
    </cffunction>

    <!--- Validate Bearer token format --->
    <cffunction name="isValidBearerFormat" access="private" returnType="boolean" output="false">
        <cfargument name="authHeader" type="string" required="true">
        
        <cfif len(arguments.authHeader) LT 7>
            <cfreturn false>
        </cfif>
        
        <cfif left(arguments.authHeader, 7) NEQ "Bearer ">
            <cfreturn false>
        </cfif>
        
        <cfreturn true>
    </cffunction>

    <!--- Validate and decode JWT token --->
    <cffunction name="validateToken" access="private" returnType="struct" output="false">
        <cfargument name="token" type="string" required="true">
        
        <cftry>
            <!--- Decode JWT --->
            <cfset local.jwtUtil = createObject("component", "api.utils.jwt")>
            <cfset local.payload = local.jwtUtil.decode(arguments.token, variables.jwtSecret)>
            
            <!--- Check token expiration --->
            <cfif structKeyExists(local.payload, "exp")>
                <cfset local.currentTime = dateDiff("s", dateConvert("utc2Local", "January 1 1970 00:00"), now())>
                
                <cfif local.payload.exp LT local.currentTime>
                    <cfset sendUnauthorized("Token has expired")>
                </cfif>
            </cfif>
            
            <cfreturn local.payload>
            
        <cfcatch type="any">
            <!--- Handle JWT decode errors --->
            <cfif findNoCase("expired", cfcatch.message)>
                <cfset sendUnauthorized("Token has expired")>
            <cfelseif findNoCase("invalid", cfcatch.message) OR findNoCase("signature", cfcatch.message)>
                <cfset sendUnauthorized("Invalid token signature")>
            <cfelseif findNoCase("malformed", cfcatch.message)>
                <cfset sendUnauthorized("Malformed token")>
            <cfelse>
                <cfset sendUnauthorized("Authentication failed: " & cfcatch.message)>
            </cfif>
        </cfcatch>
        </cftry>
    </cffunction>

    <!--- Send 401 Unauthorized response --->
    <cffunction name="sendUnauthorized" access="private" returnType="void" output="false">
        <cfargument name="message" type="string" default="Unauthorized">
        
        <cfheader statuscode="401" statustext="Unauthorized">
        <cfcontent type="application/json" reset="true">
        <cfoutput>#serializeJSON({
            'success' = false,
            'error' = 'Unauthorized',
            'message' = arguments.message,
            'timestamp' = now()
        })#</cfoutput>
        <cfabort>
    </cffunction>

    <cffunction name="addPublicEndpoint" access="public" returnType="void" output="false">
        <cfargument name="endpoint" type="string" required="true">
        
        <cfset arrayAppend(variables.publicEndpoints, lCase(trim(arguments.endpoint)))>
    </cffunction>

    <cffunction name="getPublicEndpoints" access="public" returnType="array" output="false">
        <cfreturn variables.publicEndpoints>
    </cffunction>

</cfcomponent>