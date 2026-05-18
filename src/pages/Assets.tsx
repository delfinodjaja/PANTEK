import React, { useState } from 'react';
import { useChain, Supplier, Warehouse } from '../context/ChainContext';
import { 
  BarChart3, 
  Plus, 
  MoreVertical, 
  MapPin, 
  Clock, 
  Zap, 
  Archive,
  X,
  Trash2,
  Edit2,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AssetCard = ({ item, type, onEdit, onDelete }: any) => {
  const isSupplier = type === 'supplier';
  const val1 = isSupplier ? item.reliability : item.stock;
  const val2 = item.capacity;

  return (
    <div className="bg-panel border border-border p-6 rounded-2xl group hover:border-accent transition-all relative overflow-hidden flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden ${
            item.status === 'normal' ? 'bg-success/10 text-success' :
            item.status === 'warning' ? 'bg-warning/10 text-warning' :
            'bg-error/10 text-error'
          }`}>
            {item.imageUrl ? (
              <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              isSupplier ? <Zap size={24} /> : <Archive size={24} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-primary tracking-tight">{item.name}</h3>
            <div className="flex items-center gap-3 text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">
              <span className="flex items-center gap-1"><MapPin size={10} /> {item.region}</span>
              <span className="flex items-center gap-1">{item.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
            item.status === 'normal' ? 'bg-success/10 border-success/20 text-success' :
            item.status === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' :
            'bg-error/10 border-error/20 text-error'
          }`}>
            {item.status}
          </span>
          <div className="relative group/menu">
            <button className="p-2 hover:bg-card rounded-lg transition-colors text-muted">
              <MoreVertical size={16} />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-panel border border-border rounded-xl shadow-xl py-2 min-w-[120px] invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 transition-all z-20">
              <button onClick={() => onEdit(item)} className="w-full text-left px-4 py-2 text-xs font-bold text-muted hover:text-accent flex items-center gap-2 tracking-tight">
                <Edit2 size={12} /> Edit Asset
              </button>
              <button onClick={() => onDelete(item.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-muted hover:text-error flex items-center gap-2 tracking-tight">
                <Trash2 size={12} /> Delete Asset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2 items-center">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-[9px] font-black uppercase text-muted tracking-widest">{isSupplier ? 'Reliability' : 'Inventory'}</span>
            <span className="text-sm font-black text-primary">{val1}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${val1}%` }}
               className={`h-full ${val1 > 80 ? 'bg-success' : val1 > 40 ? 'bg-warning' : 'bg-error'}`} 
             />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-[9px] font-black uppercase text-muted tracking-widest">Capacity</span>
            <span className="text-sm font-black text-primary">{val2}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${val2}%` }}
               className="h-full bg-accent" 
             />
          </div>
        </div>

        <div className="flex items-center gap-6 justify-center md:justify-end">
           <div className="text-center">
             <div className="text-[9px] font-black uppercase text-muted tracking-widest mb-1">{isSupplier ? 'Lead Time' : 'Turnover'}</div>
             <div className="text-sm font-black text-primary flex items-center gap-1">
               <Clock size={14} className="text-accent" /> {isSupplier ? `${item.lead}d` : '12.4d'}
             </div>
           </div>
           <div className="w-px h-8 bg-border" />
           <div className="text-center">
             <div className="text-[9px] font-black uppercase text-muted tracking-widest mb-1">Risk Rank</div>
             <div className="text-sm font-black text-primary">#{Math.floor(Math.random() * 20)+1}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export const Assets = () => {
  const { suppliers, warehouses, setSuppliers, setWarehouses, addEvent } = useChain();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'warehouses' | 'media'>('suppliers');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formRegion, setFormRegion] = useState('');
  const [formLead, setFormLead] = useState(14);
  const [formReliability, setFormReliability] = useState(80);
  const [formStock, setFormStock] = useState(50);
  const [formLat, setFormLat] = useState(0);
  const [formLng, setFormLng] = useState(0);

  const [mediaList, setMediaList] = useState<any[]>([
    { id: 'm1', name: 'Factory_Schematic.pdf', type: 'document', size: '2.4 MB', date: '2024-05-10' },
    { id: 'm2', name: 'Logistics_Route_Map.png', type: 'image', size: '1.1 MB', date: '2024-05-12' },
  ]);

  const handleDelete = (id: string) => {
    if (activeTab === 'suppliers') setSuppliers(prev => prev.filter(s => s.id !== id));
    else if (activeTab === 'warehouses') setWarehouses(prev => prev.filter(w => w.id !== id));
    else setMediaList(prev => prev.filter(m => m.id !== id));
    addEvent(`Asset removed: ${id}`, 'crit');
  };

  const resetForm = (asset?: any) => {
    setFormName(asset?.name || '');
    setFormId(asset?.id || '');
    setFormRegion(asset?.region || '');
    setFormLead(asset?.lead || 14);
    setFormReliability(asset?.reliability || 80);
    setFormStock(asset?.stock || 50);
    setFormLat(asset?.lat || 0);
    setFormLng(asset?.lng || 0);
  };

  const handleEdit = (asset: any) => {
    setEditingAsset(asset);
    resetForm(asset);
    setDrawerOpen(true);
  };

  const handleConfirm = () => {
    if (!formName || !formId || !formRegion) {
      addEvent('Please fill all required fields', 'warn');
      return;
    }

    if (activeTab === 'suppliers') {
      const newSupplier: Supplier = {
        id: formId,
        name: formName,
        region: formRegion,
        status: editingAsset?.status || 'normal',
        lat: Number(formLat),
        lng: Number(formLng),
        type: 'supplier',
        criticality: editingAsset?.criticality || 70,
        geopoliticalRiskScore: editingAsset?.geopoliticalRiskScore || 10,
        lead: Number(formLead),
        reliability: Number(formReliability),
        capacity: editingAsset?.capacity || 80,
        lastUpdated: editingAsset?.lastUpdated || new Date().toISOString()
      };

      if (editingAsset) {
        setSuppliers(prev => prev.map(s => s.id === editingAsset.id ? newSupplier : s));
      } else {
        setSuppliers(prev => [...prev, newSupplier]);
      }
    } else if (activeTab === 'warehouses') {
      const newWarehouse: Warehouse = {
        id: formId,
        name: formName,
        region: formRegion,
        status: editingAsset?.status || 'normal',
        lat: Number(formLat),
        lng: Number(formLng),
        type: 'warehouse',
        criticality: editingAsset?.criticality || 60,
        geopoliticalRiskScore: editingAsset?.geopoliticalRiskScore || 5,
        stock: Number(formStock),
        capacity: editingAsset?.capacity || 150,
        demandForecast: editingAsset?.demandForecast || Array.from({ length: 30 }, () => Math.floor(Math.random() * 15) + 5),
        lastUpdated: editingAsset?.lastUpdated || new Date().toISOString()
      };

      if (editingAsset) {
        setWarehouses(prev => prev.map(w => w.id === editingAsset.id ? newWarehouse : w));
      } else {
        setWarehouses(prev => [...prev, newWarehouse]);
      }
    }

    addEvent(`${editingAsset ? 'Updated' : 'Added'} ${activeTab.slice(0, -1)}: ${formName}`, 'ok');
    setDrawerOpen(false);
    resetForm();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMedia = {
        id: `m-${Date.now()}`,
        name: file.name,
        type: file.type.includes('image') ? 'image' : 'document',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toLocaleDateString()
      };
      setMediaList(prev => [newMedia, ...prev]);
      addEvent(`Media uploaded: ${file.name}`, 'ok');
    }
  };

  const currentData = activeTab === 'suppliers' ? suppliers : (activeTab === 'warehouses' ? warehouses : []);

  return (
    <div className="flex-1 overflow-y-auto h-full p-8 max-w-6xl mx-auto pb-32">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Network Assets</h1>
          <p className="text-muted font-medium">Manage and monitor supply chain infrastructure and technical documentation.</p>
        </div>
        <div className="flex gap-4">
          {activeTab === 'media' ? (
            <label className="bg-accent text-white px-6 py-3 rounded-2xl shadow-lg shadow-accent/20 hover:shadow-xl flex items-center gap-2 font-black uppercase text-xs tracking-widest cursor-pointer transition-all">
              <Upload size={18} /> Upload Media
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          ) : (
            <button 
              onClick={() => { 
                setEditingAsset(null); 
                resetForm();
                setDrawerOpen(true); 
              }}
              className="bg-accent text-white px-6 py-3 rounded-2xl shadow-lg shadow-accent/20 hover:shadow-xl flex items-center gap-2 font-black uppercase text-xs tracking-widest transition-all"
            >
              <Plus size={18} /> New Asset
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-panel border border-border rounded-2xl w-fit mb-8 shadow-inner transition-colors">
        <button 
          onClick={() => { setActiveTab('suppliers'); resetForm(); }}
          className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'suppliers' ? 'bg-card text-accent shadow-sm' : 'text-muted hover:text-primary'
          }`}
        >
          Suppliers
        </button>
        <button 
          onClick={() => { setActiveTab('warehouses'); resetForm(); }}
          className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'warehouses' ? 'bg-card text-accent shadow-sm' : 'text-muted hover:text-primary'
          }`}
        >
          Warehouses
        </button>
        <button 
          onClick={() => { setActiveTab('media'); resetForm(); }}
          className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'media' ? 'bg-card text-accent shadow-sm' : 'text-muted hover:text-primary'
          }`}
        >
          Media Library
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {activeTab === 'media' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaList.map((media) => (
                <motion.div
                  key={media.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-panel border border-border p-4 rounded-2xl flex items-center gap-4 hover:border-accent transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted">
                    {media.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-primary text-sm truncate">{media.name}</div>
                    <div className="text-[10px] text-muted font-bold uppercase tracking-tight">{media.size} • {media.date}</div>
                  </div>
                  <button onClick={() => handleDelete(media.id)} className="p-2 text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            currentData.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <AssetCard 
                  item={item} 
                  type={activeTab === 'suppliers' ? 'supplier' : 'warehouse'} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {(activeTab !== 'media' && currentData.length === 0) || (activeTab === 'media' && mediaList.length === 0) ? (
          <div className="py-20 text-center bg-panel border-2 border-dashed border-border rounded-3xl">
            <Archive size={48} className="text-muted/30 mx-auto mb-4" />
            <div className="font-bold text-muted">No entries defined in current segment.</div>
          </div>
        ) : null}
      </div>


      {/* Slide-in Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-panel border-l border-border shadow-2xl z-[101] p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-primary tracking-tight">
                  {editingAsset ? 'Update' : 'Register'} {activeTab === 'suppliers' ? 'Supplier' : 'Warehouse'}
                </h2>
                <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-card rounded-full text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-6 flex-1 overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest">Display Name</label>
                  <input 
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all placeholder:text-muted/60" 
                    placeholder="e.g. Shenzhen Manufacturing" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Code ID</label>
                    <input 
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all font-mono placeholder:text-muted/60" 
                      placeholder="SHZ" 
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Region</label>
                    <input 
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all placeholder:text-muted/60" 
                      placeholder="China" 
                      value={formRegion}
                      onChange={(e) => setFormRegion(e.target.value)}
                    />
                  </div>
                </div>
                {activeTab === 'suppliers' ? (
                   <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest">Lead Time (d)</label>
                     <input 
                       type="number" 
                       className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all" 
                       value={formLead}
                       onChange={(e) => setFormLead(Number(e.target.value))}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest">Reliability (%)</label>
                     <input 
                       type="number" 
                       className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all" 
                       value={formReliability}
                       onChange={(e) => setFormReliability(Number(e.target.value))}
                     />
                   </div>
                 </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Stock Level (%)</label>
                    <input 
                      type="number" 
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all" 
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all" 
                      value={formLat}
                      onChange={(e) => setFormLat(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all" 
                      value={formLng}
                      onChange={(e) => setFormLng(Number(e.target.value))}
                    />
                  </div>
                </div>
              </form>

              <div className="pt-8 border-t border-border mt-auto">
                <button 
                  onClick={handleConfirm}
                  className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-accent/20 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Confirm Configuration
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
