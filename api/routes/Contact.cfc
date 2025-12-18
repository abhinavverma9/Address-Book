<cfcomponent rest="true" restpath="/contacts">

    <cffunction name="getContacts" access="remote" returntype="struct" returnformat="json" httpmethod="GET">
        <cfset local.response = { "success" = false, "message" = "", "contacts" = [] }>
        
        <cftry>
            <cfif NOT structKeyExists(request, "userId")>
                <cfthrow message="User ID missing. Authentication failed or bypassed.">
            </cfif>
            <cfset local.userId = request.userId>

            <cfset local.user = entityLoadByPK("User", local.userId)>
            <cfif isNull(local.user)>
                <cfset local.response.message = "User not found">
                <cfreturn local.response>
            </cfif>

            <cfset local.contactEntities = entityLoad("Contact", { user = local.user }, "firstName ASC")>
            
            <cfset local.contacts = []>
            <cfloop array="#local.contactEntities#" index="local.contact">
                <cfset arrayAppend(local.contacts, {
                    "id" = local.contact.getId(),
                    "title" = local.contact.getTitle() ?: "",
                    "firstName" = local.contact.getFirstName(),
                    "lastName" = local.contact.getLastName(),
                    "gender" = local.contact.getGender(),
                    "dob" = dateFormat(local.contact.getDob(), "yyyy-mm-dd"),
                    "imagePath" = local.contact.getImagePath(),
                    "address" = local.contact.getAddress(),
                    "street" = local.contact.getStreet(),
                    "city" = local.contact.getCity() ?: "",
                    "state" = local.contact.getState() ?: "",
                    "pincode" = local.contact.getPincode() ?: "",
                    "email" = local.contact.getEmail() ?: "",
                    "phone" = local.contact.getPhone() ?: "",
                    "name" = local.contact.getFirstName() & " " & local.contact.getLastName()
                })>
            </cfloop>

            <cfset local.response.success = true>
            <cfset local.response.contacts = local.contacts>
        <cfcatch type="any">
            <cfset local.response.message = "Error fetching contacts: " & cfcatch.message>
        </cfcatch>
        </cftry>

        <cfreturn local.response>
    </cffunction>

    <cffunction name="createContact" access="remote" returntype="struct" returnformat="json" httpmethod="POST">
        <cfargument name="title" type="string" required="false" default="">
        <cfargument name="firstName" type="string" required="true">
        <cfargument name="lastName" type="string" required="true">
        <cfargument name="gender" type="string" required="true">
        <cfargument name="dob" type="string" required="true">
        <cfargument name="address" type="string" required="true">
        <cfargument name="street" type="string" required="true">
        <cfargument name="city" type="string" required="false" default="">
        <cfargument name="state" type="string" required="false" default="">
        <cfargument name="pincode" type="string" required="false" default="">
        <cfargument name="email" type="string" required="false" default="">
        <cfargument name="phone" type="string" required="true">
        <cfargument name="image" type="string" required="false" default=""> 

        <cfset local.response = { "success" = false, "message" = "" }>
        
        <cftry>
            <cfif NOT structKeyExists(request, "userId")>
                <cfthrow message="User ID missing. Authentication failed or bypassed.">
            </cfif>
            <cfset local.userId = request.userId>

            <cfset local.user = entityLoadByPK("User", local.userId)>
            <cfif isNull(local.user)>
                <cfset local.response.message = "User not found">
                <cfreturn local.response>
            </cfif>

            <!--- Validation --->
            <cfif NOT len(trim(arguments.firstName))>
                <cfthrow message="First Name is required.">
            </cfif>
            <cfif NOT len(trim(arguments.lastName))>
                <cfthrow message="Last Name is required.">
            </cfif>
             <cfif NOT len(trim(arguments.gender))>
                <cfthrow message="Gender is required.">
            </cfif>
            <cfif NOT len(trim(arguments.dob))>
                <cfthrow message="Date of Birth is required.">
            </cfif>
            <cfif NOT len(trim(arguments.address))>
                <cfthrow message="Address is required.">
            </cfif>
            <cfif NOT len(trim(arguments.street))>
                <cfthrow message="Street is required.">
            </cfif>
            <cfif NOT len(trim(arguments.phone))>
                <cfthrow message="Phone is required.">
            </cfif>

            <cfif len(trim(arguments.email)) AND NOT isValid("email", arguments.email)>
                 <cfthrow message="Invalid email format.">
            </cfif>
            <cfif len(trim(arguments.phone)) AND (NOT isNumeric(arguments.phone) OR len(trim(arguments.phone)) NEQ 10)>
                 <cfthrow message="Phone must be a 10-digit number.">
            </cfif>
             <cfif len(trim(arguments.pincode)) AND (NOT isNumeric(arguments.pincode) OR len(trim(arguments.pincode)) NEQ 6)>
                 <cfthrow message="Pincode must be a 6-digit number.">
            </cfif>

            <cfset local.contact = entityNew("Contact")>
            <cfset local.contact.setUser(local.user)>
            <cfset local.contact.setTitle(arguments.title)>
            <cfset local.contact.setFirstName(arguments.firstName)>
            <cfset local.contact.setLastName(arguments.lastName)>
            <cfset local.contact.setGender(arguments.gender)>
            <cfset local.contact.setDob(parseDate(arguments.dob))>
            <cfset local.contact.setAddress(arguments.address)>
            <cfset local.contact.setStreet(arguments.street)>
            <cfset local.contact.setCity(arguments.city)>
            <cfset local.contact.setState(arguments.state)>
            <cfset local.contact.setPincode(arguments.pincode)>
            <cfset local.contact.setEmail(arguments.email)>
            <cfset local.contact.setPhone(arguments.phone)>
            <cfset local.contact.setImagePath(arguments.image)>
            
            <cfset entitySave(local.contact)>
            
            <cfset local.response.success = true>
            <cfset local.response.message = "Contact created successfully.">

            <cfcatch type="any">
                <cfset local.response.message = "Error creating contact: " & cfcatch.message>
            </cfcatch>
        </cftry>

        <cfreturn local.response>
    </cffunction>

    <cffunction name="updateContact" access="remote" returntype="struct" returnformat="json" httpmethod="PUT">
        <cfargument name="id" type="numeric" required="true">
        <cfargument name="title" type="string" required="false" default="">
        <cfargument name="firstName" type="string" required="true">
        <cfargument name="lastName" type="string" required="true">
        <cfargument name="gender" type="string" required="true">
        <cfargument name="dob" type="string" required="true">
        <cfargument name="address" type="string" required="true">
        <cfargument name="street" type="string" required="true">
        <cfargument name="city" type="string" required="false" default="">
        <cfargument name="state" type="string" required="false" default="">
        <cfargument name="pincode" type="string" required="false" default="">
        <cfargument name="email" type="string" required="false" default="">
        <cfargument name="phone" type="string" required="true">

        <cfset local.response = { "success" = false, "message" = "" }>
        
        <cftry>
            <cfif NOT structKeyExists(request, "userId")>
                <cfthrow message="User ID missing. Authentication failed or bypassed.">
            </cfif>
            <cfset local.userId = request.userId>

            <cfset local.contact = entityLoadByPK("Contact", arguments.id)>
            
            <cfif isNull(local.contact)>
                <cfset local.response.message = "Contact not found">
                <cfreturn local.response>
            </cfif>

            <!--- Check ownership --->
            <cfif local.contact.getUser().getId() NEQ local.userId>
                <cfset local.response.message = "Unauthorized to update this contact">
                <cfreturn local.response>
            </cfif>

            <!--- Validation --->
            <cfif NOT len(trim(arguments.firstName))>
                <cfthrow message="First Name is required.">
            </cfif>
            <cfif NOT len(trim(arguments.lastName))>
                <cfthrow message="Last Name is required.">
            </cfif>
             <cfif NOT len(trim(arguments.gender))>
                <cfthrow message="Gender is required.">
            </cfif>
            <cfif NOT len(trim(arguments.dob))>
                <cfthrow message="Date of Birth is required.">
            </cfif>
            <cfif NOT len(trim(arguments.address))>
                <cfthrow message="Address is required.">
            </cfif>
            <cfif NOT len(trim(arguments.street))>
                <cfthrow message="Street is required.">
            </cfif>
            <cfif NOT len(trim(arguments.phone))>
                <cfthrow message="Phone is required.">
            </cfif>

            <cfif len(trim(arguments.email)) AND NOT isValid("email", arguments.email)>
                 <cfthrow message="Invalid email format.">
            </cfif>
            <cfif len(trim(arguments.phone)) AND (NOT isNumeric(arguments.phone) OR len(trim(arguments.phone)) NEQ 10)>
                 <cfthrow message="Phone must be a 10-digit number.">
            </cfif>
             <cfif len(trim(arguments.pincode)) AND (NOT isNumeric(arguments.pincode) OR len(trim(arguments.pincode)) NEQ 6)>
                 <cfthrow message="Pincode must be a 6-digit number.">
            </cfif>

            <cfset local.contact.setTitle(arguments.title)>
            <cfset local.contact.setFirstName(arguments.firstName)>
            <cfset local.contact.setLastName(arguments.lastName)>
            <cfset local.contact.setGender(arguments.gender)>
            <cfset local.contact.setDob(parseDate(arguments.dob))>
            <cfset local.contact.setAddress(arguments.address)>
            <cfset local.contact.setStreet(arguments.street)>
            <cfset local.contact.setCity(arguments.city)>
            <cfset local.contact.setState(arguments.state)>
            <cfset local.contact.setPincode(arguments.pincode)>
            <cfset local.contact.setEmail(arguments.email)>
            <cfset local.contact.setPhone(arguments.phone)>
            
            <cfset entitySave(local.contact)>

            <cfset local.response.success = true>
            <cfset local.response.message = "Contact updated successfully.">

            <cfcatch type="any">
                <cfset local.response.message = "Error updating contact: " & cfcatch.message>
            </cfcatch>
        </cftry>

        <cfreturn local.response>
    </cffunction>

    <cffunction name="deleteContact" access="remote" returntype="struct" returnformat="json" httpmethod="DELETE">
        <cfargument name="id" type="numeric" required="true">

        <cfset local.response = { "success" = false, "message" = "" }>
        
        <cftry>
            <cfif NOT structKeyExists(request, "userId")>
                <cfthrow message="User ID missing. Authentication failed or bypassed.">
            </cfif>
            <cfset local.userId = request.userId>

            <cfset local.contact = entityLoadByPK("Contact", arguments.id)>
            
            <cfif isNull(local.contact)>
                <cfset local.response.message = "Contact not found">
                <cfreturn local.response>
            </cfif>

            <cfif local.contact.getUser().getId() NEQ local.userId>
                <cfset local.response.message = "Unauthorized to delete this contact">
                <cfreturn local.response>
            </cfif>

            <cfset entityDelete(local.contact)>

            <cfset local.response.success = true>
            <cfset local.response.message = "Contact deleted successfully.">

            <cfcatch type="any">
                <cfset local.response.message = "Error deleting contact: " & cfcatch.message>
            </cfcatch>
        </cftry>

        <cfreturn local.response>
    </cffunction>
    
    <cffunction name="parseDate" access="private" returntype="date">
        <cfargument name="dateStr" type="string" required="true">
        <cfreturn lsParseDateTime(arguments.dateStr)>
    </cffunction>

</cfcomponent>