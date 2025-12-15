<cfcomponent output="false">

    <cffunction name="encode" access="public" returntype="string" output="false">
        <cfargument name="payload" type="struct" required="true">
        <cfargument name="secret" type="string" required="true">
        
        <cfset local.header = { "alg" = "HS256", "typ" = "JWT" }>
        <cfset local.base64Header = base64UrlEncode(serializeJSON(local.header))>
        <cfset local.base64Payload = base64UrlEncode(serializeJSON(arguments.payload))>
        
        <cfset local.signatureInput = local.base64Header & "." & local.base64Payload>
        <cfset local.signature = hmac(local.signatureInput, arguments.secret, "HmacSHA256")>
        <cfset local.base64Signature = base64UrlEncode(binaryDecode(local.signature, "hex"))>
        
        <cfreturn local.signatureInput & "." & local.base64Signature>
    </cffunction>

    <cffunction name="decode" access="public" returntype="struct" output="false">
        <cfargument name="token" type="string" required="true">
        <cfargument name="secret" type="string" required="true">
        
        <cfset local.parts = listToArray(arguments.token, ".")>
        
        <cfif arrayLen(local.parts) NEQ 3>
            <cfthrow type="InvalidToken" message="Token structure is invalid">
        </cfif>
        
        <cfset local.header = deserializeJSON(base64UrlDecode(local.parts[1]))>
        <cfset local.payload = deserializeJSON(base64UrlDecode(local.parts[2]))>
        <cfset local.providedSignature = local.parts[3]>
        
        <cfset local.signatureInput = local.parts[1] & "." & local.parts[2]>
        <cfset local.calculatedSignatureHex = hmac(local.signatureInput, arguments.secret, "HmacSHA256")>
        <cfset local.calculatedSignature = base64UrlEncode(binaryDecode(local.calculatedSignatureHex, "hex"))>
        
        <cfif local.providedSignature NEQ local.calculatedSignature>
             <cfthrow type="InvalidSignature" message="Token signature verification failed">
        </cfif>
        
        <cfreturn local.payload>
    </cffunction>
    
    <cffunction name="base64UrlEncode" access="private" returntype="string" output="false">
        <cfargument name="str" type="any" required="true">
        <cfset local.base64 = "">
        
        <cfif isBinary(arguments.str)>
            <cfset local.base64 = binaryEncode(arguments.str, "base64")>
        <cfelse>
            <cfset local.base64 = toBase64(arguments.str, "utf-8")>
        </cfif>
        
        <cfset local.base64 = replace(local.base64, "+", "-", "all")>
        <cfset local.base64 = replace(local.base64, "/", "_", "all")>
        <cfset local.base64 = replace(local.base64, "=", "", "all")>
        <cfreturn local.base64>
    </cffunction>
    
    <cffunction name="base64UrlDecode" access="private" returntype="string" output="false">
        <cfargument name="str" type="string" required="true">
        <cfset local.base64 = replace(arguments.str, "-", "+", "all")>
        <cfset local.base64 = replace(local.base64, "_", "/", "all")>
        
        <cfset local.padding = (4 - (len(local.base64) % 4)) % 4>
        <cfset local.base64 = local.base64 & repeatString("=", local.padding)>
        
        <cfreturn toString(binaryDecode(local.base64, "base64"))>
    </cffunction>

</cfcomponent>
