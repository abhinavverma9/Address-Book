<cftry>
    <cfquery name="test" datasource="addressbook">
        SELECT version();
    </cfquery>
    <cfdump var="#test#">
    <cfoutput>Connection successful!</cfoutput>
    
    <cfcatch type="any">
        <cfdump var="#cfcatch#">
    </cfcatch>
</cftry>