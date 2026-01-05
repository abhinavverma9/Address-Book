<cfcomponent>
    <cffunction name="getServerTime" access="remote" returntype="any" returnformat="json">
        <cfset local.timeData = { "time" = dateTimeFormat(now(), "yyyy-mm-dd HH:nn:ss") }>
        <cfreturn local.timeData>
    </cffunction>

    <cffunction name="testConnection" access="remote" returntype="any" returnformat="json">
        <cfset local.res = { "success" = false, "message" = "" }>
        <cftry>
            <cfquery name="local.q" datasource="addressbook">
                SELECT NOW() as current_time
            </cfquery>
            <cfset local.res.success = true>
            <cfset local.res.message = "Connection successful">
            <cfset local.res.dbTime = local.q.current_time>
        <cfcatch type="any">
            <cfset local.res.success = false>
            <cfset local.res.message = cfcatch.message>
            <cfset local.res.detail = cfcatch.detail>
        </cfcatch>
        </cftry>
        <cfreturn local.res>
    </cffunction>
</cfcomponent>