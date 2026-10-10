import React, { useState } from 'react';
import {
  UploadCloud,
  Trash2,
  Maximize2,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

type MediaTab = 'logo' | 'cover' | 'banner' | 'gallery';

export const MediaPage: React.FC = () => {
  const { store, setStoreData } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<MediaTab>('banner');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; tab: MediaTab; index: number }>({
    isOpen: false,
    tab: 'banner',
    index: -1,
  });

  // Media Collections
  const [mediaData, setMediaData] = useState<{
    logo: string[];
    cover: string[];
    banner: string[];
    gallery: string[];
  }>({
    logo: [
      store?.logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80',
    ],
    cover: [
      store?.cover || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    ],
    banner: store?.banner || [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&auto=format&fit=crop&q=80',
    ],
    gallery: store?.gallery || [
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    ],
  });

  const tabs: { id: MediaTab; label: string; count: number; description: string; ratio: string }[] = [
    {
      id: 'banner',
      label: 'Promotional Banners',
      count: mediaData.banner.length,
      description: 'Images displayed on the top interactive carousel on your institute portal and student app.',
      ratio: '16:9 Wide Banner',
    },
    {
      id: 'gallery',
      label: 'Campus Gallery',
      count: mediaData.gallery.length,
      description: 'Photos of classrooms, science labs, faculty sessions, and library facilities.',
      ratio: '4:3 Standard Photo',
    },
    {
      id: 'logo',
      label: 'Brand Logos',
      count: mediaData.logo.length,
      description: 'Square institute emblem and trademark logo.',
      ratio: '1:1 Square',
    },
    {
      id: 'cover',
      label: 'Cover Photo',
      count: mediaData.cover.length,
      description: 'Main background banner displayed behind your institute profile.',
      ratio: '16:9 Landscape',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newUrl = reader.result;
          setMediaData((prev) => {
            const updated = { ...prev, [activeTab]: [newUrl, ...prev[activeTab]] };
            // Sync with global store context if banner or logo
            if (store) {
              setStoreData({
                ...store,
                logo: activeTab === 'logo' ? newUrl : store.logo,
                cover: activeTab === 'cover' ? newUrl : store.cover,
                banner: activeTab === 'banner' ? updated.banner : store.banner,
                gallery: activeTab === 'gallery' ? updated.gallery : store.gallery,
              });
            }
            return updated;
          });
          toast.success('Image Uploaded', `New ${activeTab} photo has been added`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    const { tab, index } = deleteConfirm;
    if (index < 0) return;

    setMediaData((prev) => {
      const updatedList = prev[tab].filter((_, i) => i !== index);
      const updated = { ...prev, [tab]: updatedList };

      if (store) {
        setStoreData({
          ...store,
          banner: tab === 'banner' ? updatedList : store.banner,
          gallery: tab === 'gallery' ? updatedList : store.gallery,
        });
      }
      return updated;
    });

    setDeleteConfirm({ isOpen: false, tab: 'banner', index: -1 });
    toast.success('Image Removed', 'The photo was deleted from your media hub');
  };

  const currentTabInfo = tabs.find((t) => t.id === activeTab)!;
  const currentImages = mediaData[activeTab];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <Header
        title="Media & Gallery Hub"
        subtitle="Manage institute logo, campus cover banners, student discovery banners, and facilities gallery"
        rightAction={
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="primary"
              leftIcon={<UploadCloud className="w-4 h-4" />}
              className="pointer-events-none"
            >
              Upload New Photo
            </Button>
          </label>
        }
      />

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0d9488] text-white shadow-teal'
                : 'bg-white text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B] border border-[#E2E8F0]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#64748B]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Description Banner */}
      <Card className="bg-slate-50 border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
            <span>{currentTabInfo.label}</span>
            <Badge variant="primary" size="sm">
              Recommended: {currentTabInfo.ratio}
            </Badge>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">{currentTabInfo.description}</p>
        </div>

        <label className="cursor-pointer shrink-0">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="pointer-events-none"
          >
            Add to {currentTabInfo.label}
          </Button>
        </label>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
        {/* Upload Action Box */}
        <label className="aspect-video sm:aspect-4/3 rounded-2xl border-2 border-dashed border-[#CBD5E1] hover:border-[#0d9488] bg-white hover:bg-teal-50/20 flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group shadow-xs">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0d9488] group-hover:scale-110 flex items-center justify-center mb-2.5 shadow-xs transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#1E293B]">Upload New {currentTabInfo.label}</p>
          <p className="text-[11px] text-[#64748B] mt-0.5">Click or drag & drop (JPG, PNG, WebP)</p>
        </label>

        {/* Existing Photos */}
        {currentImages.map((imgUrl, index) => (
          <div
            key={index}
            className="relative aspect-video sm:aspect-4/3 rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-card bg-slate-900 group"
          >
            <img
              src={imgUrl}
              alt={`${activeTab} photo ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Top Badge: Primary / Active */}
            {index === 0 && (
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Primary</span>
                </span>
              </div>
            )}

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewImage(imgUrl)}
                className="w-10 h-10 rounded-xl bg-white text-[#1E293B] flex items-center justify-center hover:bg-slate-100 shadow-lg transform hover:scale-110 transition-all"
                title="Preview Image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: true, tab: activeTab, index })}
                className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-lg transform hover:scale-110 transition-all"
                title="Delete Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Image Preview Modal */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title="Image Preview"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-[70vh] flex items-center justify-center">
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              />
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewImage(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, tab: 'banner', index: -1 })}
        onConfirm={handleDeleteImage}
        title="Delete Photo?"
        message="Are you sure you want to remove this photo from your media hub? This action cannot be undone."
        confirmText="Delete Photo"
        variant="danger"
      />
    </div>
  );
};

export default MediaPage;
