<cfcomponent>
    <cffunction name="getServerTime" access="remote" returntype="any" returnformat="json">
        <cfset local.timeData = { "time" = dateTimeFormat(now(), "yyyy-mm-dd HH:nn:ss") }>
        <cfreturn local.timeData>
    </cffunction>
</cfcomponent>