<cfcomponent persistent="true" table="contacts" accessors="true">
    <cfproperty name="id" fieldtype="id" generator="native">
    
    <cfproperty name="user" fieldtype="many-to-one" cfc="User" fkcolumn="user_id">
    
    <cfproperty name="title" ormtype="string" length="20">
    <cfproperty name="firstName" column="first_name" ormtype="string" length="100">
    <cfproperty name="lastName" column="last_name" ormtype="string" length="100">
    <cfproperty name="gender" ormtype="string" length="20">
    <cfproperty name="dob" ormtype="date">
    <cfproperty name="imagePath" column="image_path" ormtype="string" length="255">
    <cfproperty name="address" ormtype="string" length="255">
    <cfproperty name="street" ormtype="string" length="255">
    <cfproperty name="city" ormtype="string" length="100">
    <cfproperty name="state" ormtype="string" length="100">
    <cfproperty name="pincode" ormtype="string" length="20">
    <cfproperty name="email" ormtype="string" length="100">
    <cfproperty name="phone" ormtype="string" length="50" notnull="true">
    <cfproperty name="createdAt" column="created_at" ormtype="timestamp">
</cfcomponent>