CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--TItle for Script file
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
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_vendor" FOREIGN KEY("vendorId") REFERENCES vendors(id)
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
	id, "role_name", "role_code", is_active, screens)
	VALUES ('9cf85834-0841-4c25-adf8-b4d2e077ec4b', 'Super Admin', 'R001', 'true', '[]');

INSERT INTO public.users(
	id, "emp_name", "emp_code", password,role_id)
	VALUES ('64f62c4e-0766-49f6-9a6b-e3a8bc6a1562', 'admin', 'admin', 'admin', '9cf85834-0841-4c25-adf8-b4d2e077ec4b');

insert into roles(is_active,role_name,role_code,screens) values
('true', 'Super Admin', 'R001', '[
  {
    "name": "Dashboard",
    "type": "home",
    "screen": "dashboard",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Roles",
    "type": "home",
    "screen": "roles",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Users",
    "type": "home",
    "screen": "users",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Vendors",
    "type": "vendor",
    "screen": "vendor",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Suppliers",
    "type": "vendor",
    "screen": "supplier",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Customers",
    "type": "vendor",
    "screen": "customer",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Process",
    "type": "part",
    "screen": "process",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Parts",
    "type": "part",
    "screen": "parts",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Boughtouts",
    "type": "part",
    "screen": "boughtouts",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Sub Assembly",
    "type": "part",
    "screen": "subAssembly",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Machines",
    "type": "part",
    "screen": "machines",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Quotations",
    "type": "order",
    "screen": "quotations",
    "permission": [
      "view",
      "edit",
      "approve"
    ]
  },
  {
    "name": "Orders",
    "type": "order",
    "screen": "orders",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Assembly",
    "type": "order",
    "screen": "assembly",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Stores",
    "type": "home",
    "screen": "stores",
    "permission": [
      "view",
      "edit"
    ]
  }
]');

insert into roles(is_active,role_name,role_code,screens) values
('true', 'Admin', 'R002', '[
  {
    "name": "Dashboard",
    "type": "home",
    "screen": "dashboard",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Users",
    "type": "home",
    "screen": "users",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Roles",
    "type": "home",
    "screen": "roles",
    "permission": [
      "view"
    ]
  },
  {
    "name": "Vendors",
    "type": "vendor",
    "screen": "vendor",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Suppliers",
    "type": "vendor",
    "screen": "supplier",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Quotations",
    "type": "order",
    "screen": "quotations",
    "permission": [
      "view",
      "edit"
    ]
  }
]');

 insert into roles(is_active,role_name,role_code,screens) values
('true', 'Stores', 'R003', '[
  {
    "name": "Dashboard",
    "type": "home",
    "screen": "dashboard",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Vendors",
    "type": "vendor",
    "screen": "vendor",
    "permission": [
      "view"
    ]
  },
  {
    "name": "Suppliers",
    "type": "vendor",
    "screen": "supplier",
    "permission": [
      "view"
    ]
  },
  {
    "name": "Orders",
    "type": "order",
    "screen": "orders",
    "permission": [
      "view"
    ]
  },
  {
    "name": "Stores",
    "type": "home",
    "screen": "stores",
    "permission": [
      "view",
      "edit"
    ]
  }
]');

 insert into roles(is_active,role_name,role_code,screens) values
('true', 'Engineer', 'R004', '[
  {
    "name": "Dashboard",
	"type": "home",
    "screen": "dashboard",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Process",
	"type": "part",
    "screen": "process",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Parts",
	"type": "part",
    "screen": "parts",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Boughtouts",
	"type": "part",
    "screen": "boughtouts",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Sub Assembly",
	"type": "part",
    "screen": "subAssembly",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Machines",
	"type": "part",
    "screen": "machines",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Assembly",
    "type": "order",
    "screen": "assembly",
    "permission": [
      "view",
      "edit"
    ]
  },
  {
    "name": "Orders",
	"type": "order",
    "screen": "orders",
    "permission": [
      "view",
      "edit"
    ]
  }
]');