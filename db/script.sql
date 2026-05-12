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
    "details" json NULL,
    "insurance_details" json NULL,
    "salary" character varying NULL,
    "category" character varying NULL,
    "notification_token" character varying NULL
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

CREATE TABLE IF NOT EXISTS "enquiries" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
	"customer_name"  character varying NOT NULL,
	"machine_name"  character varying NOT NULL,
	"existing_machine_id"  character varying NULL,
	"existing_customer_id"  character varying NULL,
    "contact_no" character varying NOT NULL,
    "address" json NULL,
    "gst_no" character varying NULL,
	"enquiry_resource" character varying NULL,
	"enquiry_status" character varying NULL,
	"level1_user" uuid NULL,
	"level2_user" uuid NULL,
  "approval_detail" json NULL,
  "remarks" character varying NULL,
    createdAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "fk_level1_user" FOREIGN KEY(level1_user) REFERENCES users(id),
	CONSTRAINT "fk_level2_user" FOREIGN KEY(level2_user) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS "attendance" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
	"user_id"  uuid NOT NULL,
	"emp_code"  character varying NOT NULL,
	"attendance_date"  character varying NOT NULL,
    "check_in_time" character varying NULL,
	"check_out_time" character varying NULL,
	"total_working_hrs" character varying NULL,
	"location_details" jsonb NULL,
	"is_break" boolean DEFAULT false NOT NULL, 
	"break_time" character varying NULL,
	"total_break_hrs" character varying NULL,
	"is_leave" boolean DEFAULT false NOT NULL,
    createdAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "fk_user" FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS "leave_request" (
    "id" uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
	"user_id"  uuid NOT NULL,
	"emp_code"  character varying NOT NULL,
	"leave_date"  character varying NOT NULL,
	"description"  character varying NOT NULL,
	"status"  character varying NULL,
	"remarks"  character varying NULL,
    createdAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "fk_user" FOREIGN KEY(user_id) REFERENCES users(id)
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

ALTER TABLE users ADD COLUMN IF NOT EXISTS details json null;
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_details json null;
ALTER TABLE users ADD COLUMN IF NOT EXISTS salary character varying null;
ALTER TABLE users ADD COLUMN IF NOT EXISTS category character varying null;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS approval_detail json NULL;

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS quotation_terms jsonb null;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_token character varying NULL;
ALTER TABLE machine_quotation ADD COLUMN IF NOT EXISTS revised_history jsonb NULL;
ALTER TABLE machine_quotation ADD COLUMN IF NOT EXISTS quotation_version int NOT NULL DEFAULT 1;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS video_url jsonb NULL;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS images jsonb NULL;