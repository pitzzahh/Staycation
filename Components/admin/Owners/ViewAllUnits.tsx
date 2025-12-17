"use client";

import { useState } from "react";
import { Edit, Trash2, Search, Plus, Home } from "lucide-react";
import { useGetAllAdminRoomsQuery } from "@/redux/api/roomApi"; 

const ViewAllUnits = ({ onAddUnitClick }: any) => {
  const [searchQuery, setSearchQuery] = useState("");

  // RTK Query call
  const { data, isLoading, isError } = useGetAllAdminRoomsQuery({});
  const units = data?.data || []; // assuming API returns { success, data: [...] }

  if (isLoading) return <p>Loading units...</p>;
  if (isError) return <p>Error fetching units!</p>;

  // Filter function
  const filteredUnits = units.filter(
    (unit: any) =>
      unit.haven_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.tower.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.view_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-700";
      case "occupied":
        return "bg-red-100 text-red-700";
      case "maintenance":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleEdit = (id: string) => {
    console.log("Edit unit:", id);
    // TODO: Open edit modal
  };

  const handleDelete = (id: string) => {
    console.log("Delete unit:", id);
    // TODO: Confirm then delete
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              All Haven Units
            </h2>
            <p className="text-sm text-gray-600">
              Manage your property units, rates, and availability
            </p>
          </div>
          <button
            onClick={onAddUnitClick}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Haven
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by haven name, tower, or view..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Haven Name</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Tower</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Floor</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">View</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">6H Rate</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">10H Rate</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Weekday Rate</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Weekend Rate</th>
                <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Status</th>
                <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit: any, index: number) => (
                <tr
                  key={unit.uuid_id || unit.id}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors animate-in fade-in duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        <Home className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{unit.haven_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">{unit.tower}</td>
                  <td className="py-4 px-6">{unit.floor}</td>
                  <td className="py-4 px-6">{unit.view_type}</td>
                  <td className="py-4 px-6">₱{unit.six_hour_rate}</td>
                  <td className="py-4 px-6">₱{unit.ten_hour_rate}</td>
                  <td className="py-4 px-6">₱{unit.weekday_rate}</td>
                  <td className="py-4 px-6">₱{unit.weekend_rate}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${getStatusColor(unit.status || "Available")}`}>
                      {unit.status || "Available"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(unit.uuid_id || unit.id)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors group" title="Edit">
                        <Edit className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      </button>
                      <button onClick={() => handleDelete(unit.uuid_id || unit.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors group" title="Delete">
                        <Trash2 className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewAllUnits;
