"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { UserCheck, Shield, Plus, Lock } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function StaffManagementPage() {
  const [staffList] = useState<StaffMember[]>([
    {
      id: "staff-01",
      name: "Aaron Daniel",
      email: "aaron@brightloop.in",
      role: "System Administrator",
      status: "Active",
      created_at: "2026-10-01",
    },
    {
      id: "staff-02",
      name: "Operations Lead",
      email: "staff.ops@brightloop.in",
      role: "Operations Specialist",
      status: "Active",
      created_at: "2026-10-10",
    },
    {
      id: "staff-03",
      name: "Billing Executive",
      email: "finance.ops@brightloop.in",
      role: "Finance Operations",
      status: "Active",
      created_at: "2026-10-15",
    },
  ]);

  const columns = [
    {
      key: "name",
      header: "Staff Member",
      render: (row: StaffMember) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-brand flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-text-primary">{row.name}</p>
            <p className="text-xs text-text-secondary">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Assigned Role",
      render: (row: StaffMember) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-brand border border-indigo-200">
          <Shield className="w-3 h-3" />
          {row.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Account Status",
      render: (row: StaffMember) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {row.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Provisioned On",
      render: (row: StaffMember) => (
        <span className="text-xs text-text-secondary">{row.created_at}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-control flex items-center gap-2 text-xs text-amber-800">
        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Admin Privilege Gate:</strong> In accordance with hackathon requirements, only Administrator identities can provision internal staff accounts. Staff and Customers cannot view or invoke this API.
        </span>
      </div>

      <PageHeader
        title="Internal Staff Provisioning"
        description="Manage internal operations accounts, permissions, and security roles."
        action={
          <Button
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            size="sm"
            onClick={() => alert("Invite staff member modal")}
          >
            Provision Staff Account
          </Button>
        }
      />

      <DataTable columns={columns} data={staffList} />
    </div>
  );
}
