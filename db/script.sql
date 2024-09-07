CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "roles" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    "roleName" character varying NOT NULL,
    "roleCode" character varying NOT NULL,
    isActive boolean DEFAULT true NOT NULL,
    "screens" jsonb DEFAULT '[]'::jsonb NULL,
    createdAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
	"empName"  character varying NOT NULL,
	"empCode"  character varying NOT NULL,
    "password" character varying NOT NULL,
    isActive boolean DEFAULT true NOT NULL,
	roleId uuid,
    createdAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "fk_role" FOREIGN KEY(roleId) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS "process" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
	"processName"  character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendors" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
	"vendorName"  character varying NOT NULL,
	"vendorCode"  character varying NOT NULL,
	"vendorAddress"  character varying NOT NULL,
	"vendorGST"  character varying NOT NULL,
	"vendorMobileNo1"  character varying NOT NULL,
	"vendorMobileNo2"  character varying NULL,
	"vendorLocation"  character varying NOT NULL,
	"vendorAccountNo"  character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendorprocess" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
	"vendorId"  character varying NOT NULL,
	"processId"  character varying NOT NULL,
	"processName"  character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "suppliers" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
	"supplierName"  character varying NOT NULL,
	"supplierCode"  character varying NOT NULL,
	"supplierAddress"  character varying NOT NULL,
	"supplierMobileNo1"  character varying NOT NULL,
	"supplierMobileNo2"  character varying NULL,
	"supplierLocation"  character varying NOT NULL,
	"supplierAccountNo"  character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO public.roles(
	id, "roleName", "roleCode", is_active, screens)
	VALUES ('9cf85834-0841-4c25-adf8-b4d2e077ec4b', 'Super Admin', 'R001', 'true', '[]');

INSERT INTO public.users(
	id, "empName", "empCode", password)
	VALUES ('64f62c4e-0766-49f6-9a6b-e3a8bc6a1562', 'admin', 'admin', 'admin');