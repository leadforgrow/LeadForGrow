"use client";

import React, { useState, useEffect } from "react";
import { Lock, Database, Search, Edit, Trash2, Plus, Save, X, RefreshCw, LayoutDashboard, Code, LayoutTemplate } from "lucide-react";

export default function LFGAdmin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [data, setData] = useState([]);
  const [schemaDef, setSchemaDef] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [viewMode, setViewMode] = useState("form"); // "form" | "json"
  
  // Data States
  const [formData, setFormData] = useState({});
  const [jsonText, setJsonText] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "listModels" }),
      });
      const result = await res.json();

      if (res.ok && result.data) {
        setIsAuthenticated(true);
        setModels(result.data);
        if (result.data.length > 0) {
          fetchData(result.data[0]);
        }
      } else {
        setError(result.error || "Invalid password");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchData = async (modelName) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "find", modelName }),
      });
      const result = await res.json();
      if (res.ok) {
        setData(result.data || []);
        setSchemaDef(result.schema || {});
        setSelectedModel(modelName);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this deeply? This is permanent.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "delete", modelName: selectedModel, id }),
      });
      if (res.ok) {
        setData(data.filter((doc) => doc._id !== id));
      } else {
        const result = await res.json();
        setError(result.error || "Failed to delete");
      }
    } catch (err) {
       setError(err.message);
    }
    setLoading(false);
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setFormData(doc);
    setJsonText(JSON.stringify(doc, null, 2));
    setViewMode("form"); // default to modern GUI form
    setIsModalOpen(true);
    setError("");
  };

  const openCreateModal = () => {
    let newObj = { createdAt: new Date().toISOString() };
    // Basic init based on schema
    Object.keys(schemaDef).forEach(k => {
       if (k !== "_id" && k !== "createdAt" && k !== "__v") {
          newObj[k] = schemaDef[k].type === "Boolean" ? false : "";
       }
    });
    
    setEditingDoc(null);
    setFormData(newObj);
    setJsonText(JSON.stringify(newObj, null, 2));
    setViewMode("form");
    setIsModalOpen(true);
    setError("");
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      setJsonText(JSON.stringify(updated, null, 2)); // keep JSON in sync
      return updated;
    });
  };

  const handleJsonChange = (val) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setFormData(parsed); // Keep form in sync
    } catch (e) {
      // Ignore parse errors while typing
    }
  };

  const handleSave = async () => {
    let updateData;
    try {
      updateData = JSON.parse(jsonText); // always save the parsed JSON regardless of mode
    } catch (err) {
      setError("Invalid JSON format. Please check the Raw Data tab.");
      return;
    }

    setLoading(true);
    setError("");
    const action = editingDoc ? "update" : "create";
    const id = editingDoc ? editingDoc._id : undefined;

    try {
      const res = await fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action, modelName: selectedModel, id, updateData }),
      });
      const result = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchData(selectedModel); // Refresh
      } else {
        setError(result.error || "Failed to save");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-blue-100 shadow-2xl rounded-3xl p-8 transform transition-all hover:scale-105 duration-500">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">LFG Genesis Panel</h1>
          <p className="text-center text-slate-500 mb-8 font-medium">Enterprise Database Control</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="Enter access code..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-lg shadow-sm"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center space-x-2 text-lg"
            >
              {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <span>Secure Access</span>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getColumns = () => {
    if (data.length === 0) return ["_id"];
    const keys = new Set();
    data.slice(0, 5).forEach(doc => {
      Object.keys(doc).forEach(key => {
        if (key !== "__v" && typeof doc[key] !== "object") keys.add(key);
      });
    });
    let colArray = Array.from(keys).filter(k => k !== "_id");
    return ["_id", ...colArray.slice(0, 5)];
  };
  
  const columns = getColumns();
  
  // Helper for dynamic forms
  const HARDCODED_ENUMS = {
    planName: ["Agency Starter", "Agency Growth", "Agency Pro", "Enterprise", "Free"],
    status: ["active", "suspended", "cancelled"],
    role: ["SUPER_ADMIN", "AGENCY_OWNER", "CLIENT_ADMIN", "TEAM_MEMBER", "VIEW_ONLY", "owner", "admin"],
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Focus Area */}
      <div className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-10 hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">LFG Control</h2>
            <p className="text-xs text-blue-600 font-semibold tracking-wider">ENTERPRISE ADMIN</p>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2 mt-2">Database Models</p>
          {models.map(model => (
            <button
              key={model}
              onClick={() => fetchData(model)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 font-medium ${
                selectedModel === model 
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50 scale-[1.02]" 
                  : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              }`}
            >
              <Database className={`w-4 h-4 ${selectedModel === model ? "text-blue-600" : "text-slate-400"}`} />
              <span>{model}</span>
              {selectedModel === model && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full py-2.5 px-4 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2 font-medium"
          >
            <Lock className="w-4 h-4" /> <span>Lock Session</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white/50 relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="px-8 py-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between z-10 shadow-sm relative">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center space-x-3">
              <span>{selectedModel} Directory</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center">
                 {data.length} Records
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Direct write access to production database</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3 relative">
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-md hover:shadow-lg shadow-blue-500/20 border border-blue-500 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Record</span>
            </button>
            <button
              onClick={() => fetchData(selectedModel)}
              className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-colors shadow-sm bg-white"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table View Component */}
        <div className="flex-1 overflow-auto p-8 relative z-10">
          {error && !isModalOpen && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center text-sm font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-3"></span>
              Error: {error}
            </div>
          )}
          
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    {columns.map(col => (
                      <th key={col} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No records found in {selectedModel}.
                      </td>
                    </tr>
                  ) : (
                    data.map((doc, i) => (
                      <tr key={doc._id || i} className="hover:bg-blue-50/50 transition-colors group">
                        {columns.map(col => (
                          <td key={col} className="px-6 py-4 text-sm text-slate-700 font-medium truncate max-w-[200px]">
                            {typeof doc[col] === "object" ? "[Object]" : String(doc[col] || "")}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(doc)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-block"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative z-20 border border-slate-200 overflow-hidden transform scale-100 transition-transform">
            
            {/* Header with Mode Toggles */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                 {editingDoc ? "Update Record" : "Create Record"}
                 <span className="ml-3 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-mono border border-blue-200">
                   {selectedModel}
                 </span>
              </h3>
              
              <div className="flex items-center space-x-2">
                <div className="bg-slate-200/70 p-1 rounded-lg flex mr-4">
                  <button 
                    onClick={() => setViewMode("form")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center space-x-1 transition-colors ${viewMode === "form" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" /> <span>Visual Form</span>
                  </button>
                  <button 
                    onClick={() => setViewMode("json")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center space-x-1 transition-colors ${viewMode === "json" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Code className="w-3.5 h-3.5" /> <span>Raw Data</span>
                  </button>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body: Switch between Dynamic Form and JSON */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {viewMode === "form" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                   {Object.keys(formData).map((key) => {
                     if (key === "__v") return null;
                     
                     const fieldDef = schemaDef[key] || {};
                     const val = formData[key] === null || formData[key] === undefined ? "" : formData[key];
                     const isId = key === "_id";
                     
                     // Nested Object Fallback - just disable or stringify (very basic fallback)
                     if (!isId && typeof val === "object" && val !== null && !Array.isArray(val)) {
                       return (
                         <div key={key} className="col-span-1 sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">{key} <span className="text-[10px] font-normal text-slate-400">(JSON Object)</span></label>
                            <div className="text-sm bg-slate-100 p-3 rounded-lg border border-slate-200 text-slate-500 font-mono">
                              Complex Object. Use Raw Data tab to edit.
                            </div>
                         </div>
                       );
                     }

                     // If it has enum options, or it's in our HARDCODED_ENUMS
                     const options = HARDCODED_ENUMS[key] || (fieldDef.enumValues?.length > 0 ? fieldDef.enumValues : null);
                     
                     if (options) {
                        return (
                          <div key={key} className="col-span-1">
                             <label className="block text-xs font-bold text-slate-600 mb-1">{key}</label>
                             <select
                               value={val}
                               onChange={(e) => handleFieldChange(key, e.target.value)}
                               className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all"
                             >
                               <option value="">-- Select {key} --</option>
                               {options.map(opt => (
                                 <option key={opt} value={opt}>{opt}</option>
                               ))}
                             </select>
                          </div>
                        );
                     }

                     // Boolean / Checkbox mapping 
                     if (fieldDef.type === "Boolean" || typeof val === "boolean") {
                        return (
                          <div key={key} className="col-span-1 flex items-center mt-6">
                             <input 
                               type="checkbox"
                               checked={Boolean(val)}
                               onChange={(e) => handleFieldChange(key, e.target.checked)}
                               className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                             />
                             <label className="ml-3 text-sm font-bold text-slate-700">{key}</label>
                          </div>
                        );
                     }

                     // Default Text Input
                     return (
                       <div key={key} className={`col-span-1 ${isId ? 'sm:col-span-2' : ''}`}>
                         <label className="block text-xs font-bold text-slate-600 mb-1">
                           {key} {isId && <span className="text-slate-400 font-normal ml-1">(Read Only)</span>}
                         </label>
                         <input 
                           type={fieldDef.type === "Number" || typeof val === "number" ? "number" : "text"}
                           value={val}
                           readOnly={isId}
                           onChange={(e) => handleFieldChange(key, fieldDef.type === "Number" ? Number(e.target.value) : e.target.value)}
                           className={`w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all ${isId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                         />
                       </div>
                     );
                   })}
                   
                   {/* Option to add missing hardcoded enums if not present in schema yet */}
                   {selectedModel === "Agency" && !formData.hasOwnProperty("planName") && (
                     <div className="col-span-1 border border-dashed border-blue-300 p-4 rounded-xl bg-blue-50/50 flex flex-col justify-center">
                        <label className="block text-xs font-bold text-blue-700 mb-1">Add Plan Name</label>
                        <select
                           onChange={(e) => handleFieldChange("planName", e.target.value)}
                           className="w-full bg-white border border-blue-200 px-3 py-2 rounded-lg text-sm text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                         >
                           <option value="">-- Assign a Plan --</option>
                           {HARDCODED_ENUMS.planName.map(opt => (
                             <option key={opt} value={opt}>{opt}</option>
                           ))}
                         </select>
                     </div>
                   )}
                </div>
              ) : (
                <div className="h-full flex flex-col relative rounded-xl overflow-hidden border-2 border-slate-800 shadow-inner">
                   <div className="absolute top-0 right-0 left-0 bg-slate-800 text-slate-300 text-[10px] px-3 py-1 font-mono z-10">
                     VALID JSON REQUIRED
                   </div>
                   <textarea
                     value={jsonText}
                     onChange={(e) => handleJsonChange(e.target.value)}
                     className="flex-1 w-full h-full p-4 pt-8 bg-slate-900 text-green-400 font-mono text-[13px] leading-relaxed resize-none outline-none focus:ring-0 custom-scrollbar"
                     spellCheck="false"
                   />
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-sans font-medium flex items-center shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
                  {error}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end space-x-3 items-center">
              <span className="text-xs text-slate-400 mr-auto font-medium">Auto-synced with raw JSON</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-transform transform active:scale-95 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)]"
              >
                {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{editingDoc ? "Save Changes" : "Create Record"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
