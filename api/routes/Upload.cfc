<cfcomponent rest="true" restpath="/upload">

    <cffunction name="uploadImage" access="remote" returntype="struct" returnformat="json" httpmethod="POST">
        <cfset local.response = { "success" = false, "message" = "", "path" = "" }>
        
        <cftry>
            <cfif NOT structKeyExists(request, "userId")>
                <cfthrow message="Authentication required.">
            </cfif>
            
            <cfset local.uploadDir = expandPath('../uploads/')>
            
            <cfif NOT directoryExists(local.uploadDir)>
                <cfdirectory action="create" directory="#local.uploadDir#">
            </cfif>

            <cfif structKeyExists(form, "file") OR (structKeyExists(getHttpRequestData().content, "file"))> 
                
                <!--- Upload File --->
                <cffile action="upload" 
                        filefield="file" 
                        destination="#local.uploadDir#" 
                        nameconflict="makeunique"
                        accept="image/jpg,image/jpeg,image/png,image/gif"
                        result="local.uploadResult">

                <cfset local.fileName = local.uploadResult.serverFile>
                
                <!--- Check Size (2MB Limit) --->
                <cfif local.uploadResult.fileSize GT 2097152>
                     <cffile action="delete" file="#local.uploadDir##local.fileName#">
                     <cfthrow message="File too large. Max size is 2MB.">
                </cfif>

                <cfset local.response.success = true>
                <cfset local.response.message = "Upload successful.">
                <cfset local.response.path = "/api/uploads/" & local.fileName>
                
            <cfelse>
                <cfthrow message="No file provided.">
            </cfif>

        <cfcatch type="any">
            <cfset local.response.message = "Upload failed: " & cfcatch.message>
        </cfcatch>
        </cftry>

        <cfreturn local.response>
    </cffunction>

</cfcomponent>