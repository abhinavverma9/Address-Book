<cfcomponent persistent="true" table="refresh_tokens">
    <cfproperty name="id" fieldtype="id" generator="native">
    
    <cfproperty name="user" fieldtype="many-to-one" cfc="User" fkcolumn="user_id">
    
    <cfproperty name="token" ormtype="string" length="500">
    <cfproperty name="expiresAt" column="expires_at" ormtype="timestamp">
    <cfproperty name="createdAt" column="created_at" ormtype="timestamp">
</cfcomponent>