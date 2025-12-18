<cfcomponent persistent="true" table="users">
    <cfproperty name="id" fieldtype="id" generator="native">
    <cfproperty name="username" ormtype="string" length="50" unique="true">
    <cfproperty name="password_hash" ormtype="string" length="255">
    <cfproperty name="password_salt" ormtype="string" length="50">
    <cfproperty name="email" ormtype="string" length="100" unique="true">
    <cfproperty name="full_name" ormtype="string" length="100">
    <cfproperty name="created_at" ormtype="timestamp">
</cfcomponent>