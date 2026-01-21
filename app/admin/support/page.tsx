"use client";

import { useState } from "react";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function SupportPage() {
  const [tickets] = useState([
    {
      id: 1,
      title: "Unable to upload image",
      user: "John Doe",
      email: "john@example.com",
      status: "open",
      priority: "high",
      created_at: "2024-01-15T10:30:00",
    },
    {
      id: 2,
      title: "Account verification issue",
      user: "Jane Smith",
      email: "jane@example.com",
      status: "in_progress",
      priority: "medium",
      created_at: "2024-01-15T09:00:00",
    },
    {
      id: 3,
      title: "Cannot claim found item",
      user: "Bob Wilson",
      email: "bob@example.com",
      status: "resolved",
      priority: "low",
      created_at: "2024-01-14T15:20:00",
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1">
            <AlertCircle size={12} />
            Open
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Clock size={12} />
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle size={12} />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage user support requests and issues
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-red-600">
                {tickets.filter((t) => t.status === "open").length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tickets.filter((t) => t.status === "in_progress").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {tickets.filter((t) => t.status === "resolved").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{ticket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {ticket.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.user}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(ticket.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-blue-600 hover:text-blue-900 font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
