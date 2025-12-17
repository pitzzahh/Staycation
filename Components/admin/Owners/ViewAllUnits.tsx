"use client";

import { useState } from "react";
import { Edit, Trash2, Search, Plus, Home } from "lucide-react";

const ViewAllUnits = ({ onAddUnitClick }: any) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data - replace with actual data from API
  const units = [
    {
      id: 1,
      havenName: "Haven 1",
      tower: "Tower A",
      floor: "5th Floor",
      view: "City View",
      sixHourRate: 999,
      tenHourRate: 1599,
      weekdayRate: 1799,
      weekendRate: 1999,
      status: "Available",
    },
    {
      id: 2,
      havenName: "Haven 2",
      tower: "Tower B",
      floor: "8th Floor",
      view: "Pool View",
      sixHourRate: 1200,
      tenHourRate: 1800,
      weekdayRate: 2000,
      weekendRate: 2200,
      status: "Occupied",
    },
    {
      id: 3,
      havenName: "Haven 3",
      tower: "Tower A",
      floor: "12th Floor",
      view: "Ocean View",
      sixHourRate: 1500,
      tenHourRate: 2200,
      weekdayRate: 2500,
      weekendRate: 2800,
      status: "Available",
    },
    {
      id: 4,
      havenName: "Haven 4",
      tower: "Tower C",
      floor: "3rd Floor",
      view: "Garden View",
      sixHourRate: 899,
      tenHourRate: 1499,
      weekdayRate: 1699,
      weekendRate: 1899,
      status: "Maintenance",
    },
    {
      id: 5,
      havenName: "Haven 5",
      tower: "Tower B",
      floor: "10th Floor",
      view: "City View",
      sixHourRate: 1100,
      tenHourRate: 1700,
      weekdayRate: 1900,
      weekendRate: 2100,
      status: "Available",
    },
  ];

  const filteredUnits = units.filter(
    (unit) =>
      unit.havenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.tower.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.view.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700";
      case "Occupied":
        return "bg-red-100 text-red-700";
      case "Maintenance":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleEdit = (id: number) => {
    console.log("Edit unit:", id);
    // TODO: Open edit modal
  };

  const handleDelete = (id: number) => {
    console.log("Delete unit:", id);
    // TODO: Show confirmation dialog then delete
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
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

      {/* Search and Filter Section */}
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
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all">
            <option value="">All Towers</option>
            <option value="tower-a">Tower A</option>
            <option value="tower-b">Tower B</option>
            <option value="tower-c">Tower C</option>
          </select>
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6">
          <p className="text-sm opacity-90 mb-2">Total Units</p>
          <p className="text-4xl font-bold">{units.length}</p>
          <p className="text-sm mt-2 opacity-75">Active properties</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6">
          <p className="text-sm opacity-90 mb-2">Available</p>
          <p className="text-4xl font-bold">
            {units.filter((u) => u.status === "Available").length}
          </p>
          <p className="text-sm mt-2 opacity-75">Ready for booking</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg p-6">
          <p className="text-sm opacity-90 mb-2">Occupied</p>
          <p className="text-4xl font-bold">
            {units.filter((u) => u.status === "Occupied").length}
          </p>
          <p className="text-sm mt-2 opacity-75">Currently booked</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg p-6">
          <p className="text-sm opacity-90 mb-2">Maintenance</p>
          <p className="text-4xl font-bold">
            {units.filter((u) => u.status === "Maintenance").length}
          </p>
          <p className="text-sm mt-2 opacity-75">Under maintenance</p>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                  Haven Name
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                  Location
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                  View
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                  6H Rate
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                  10H Rate
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                  21H Weekday
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                  21H Weekend
                </th>
                <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">
                  Status
                </th>
                <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit, index) => (
                <tr
                  key={unit.id}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors animate-in fade-in duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        <Home className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {unit.havenName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {unit.tower}
                      </p>
                      <p className="text-xs text-gray-500">{unit.floor}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">{unit.view}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-800">
                      ₱{unit.sixHourRate}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-800">
                      ₱{unit.tenHourRate}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-800">
                      ₱{unit.weekdayRate}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-800">
                      ₱{unit.weekendRate}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${getStatusColor(
                        unit.status
                      )}`}
                    >
                      {unit.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(unit.id)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredUnits.length} of {units.length} units
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllUnits;