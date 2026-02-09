// src/pages/admin/AdminHeroImages.tsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { projectId } from "../../utils/supabase/info";
import { Plus, Trash2, Upload, Image as ImageIcon, X, Eye, EyeOff, GripVertical, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { optimizeImage } from "../../utils/optimizeImage";
import { uploadToCloudinary } from "../../utils/cloudinary";
import AdminLayout from "../../components/admin/AdminLayout";

interface HeroImage {
    id: string;
    title: string;
    imageUrl: string;
    imageUrlMobile?: string;
    page?: string;
    linkUrl?: string; 
    order: number;
    active: boolean;
    createdAt: string;
}

const HERO_PAGES = [
    { value: "home", label: "Home Page" },
    { value: "spiritual", label: "Spiritual Art Gallery" },
    { value: "lighting", label: "Lighting (Neon Signs)" },
    { value: "acrylic", label: "Acrylic Art Gallery" },
    { value: "new-arrivals", label: "New Art Gallery" },
    { value: "decor-by-room", label: "Decor Your Space" },
    { value: "shop", label: "Shop (General)" },
];

export default function AdminHeroImages() {
    const { accessToken } = useContext(AuthContext);

    const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingImage, setEditingImage] = useState<HeroImage | null>(null);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedFilesMobile, setSelectedFilesMobile] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [previewUrlsMobile, setPreviewUrlsMobile] = useState<string[]>([]);
    const [formData, setFormData] = useState({ title: "", page: "", linkUrl: "" });

    useEffect(() => {
        fetchHeroImages();
    }, []);

    const fetchHeroImages = async () => {
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/hero-images/all`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data = await response.json();
            setHeroImages(data.heroImages || []);
        } catch {
            toast.error("Failed to load hero images");
        } finally {
            setLoading(false);
        }
    };

    // Handle multiple file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
        if (imageFiles.length === 0) return toast.error("No valid images selected");

        if (type === 'desktop') {
            setSelectedFiles(prev => [...prev, ...imageFiles]);
            setPreviewUrls(prev => [...prev, ...imageFiles.map(f => URL.createObjectURL(f))]);
        } else {
            setSelectedFilesMobile(prev => [...prev, ...imageFiles]);
            setPreviewUrlsMobile(prev => [...prev, ...imageFiles.map(f => URL.createObjectURL(f))]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFiles.length === 0 && !editingImage) return toast.error("Please select at least one desktop image");
        setUploading(true);

        try {
            // If editing single image
            if (editingImage) {
                let imageUrl = editingImage.imageUrl;
                let imageUrlMobile = editingImage.imageUrlMobile || "";

                if (selectedFiles.length) imageUrl = await uploadToCloudinary(selectedFiles[0], accessToken!);
                if (selectedFilesMobile.length) imageUrlMobile = await uploadToCloudinary(selectedFilesMobile[0], accessToken!);

                const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/hero-images/${editingImage.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                            title: formData.title,
                            page: formData.page,
                            linkUrl: formData.linkUrl,
                            imageUrl,
                            imageUrlMobile,
                        }),
                    }
                );

                if (!response.ok) throw new Error("Update failed");
                toast.success("Hero image updated successfully");
            } else {
                // Upload multiple new images
                const uploadedUrls = await Promise.all(selectedFiles.map(file => uploadToCloudinary(file, accessToken!)));
                const uploadedMobileUrls = await Promise.all(selectedFilesMobile.map((file, idx) => uploadToCloudinary(file, accessToken!)));

                await Promise.all(uploadedUrls.map((url, idx) => {
                    const payload: any = {
                        title: formData.title || `Slide ${idx + 1}`,
                        page: formData.page,
                        linkUrl: formData.linkUrl,
                        imageUrl: url,
                        imageUrlMobile: uploadedMobileUrls[idx] || "",
                        order: heroImages.length + idx,
                        active: true,
                    };
                    return fetch(`https://${projectId}.supabase.co/functions/v1/make-server-52d68140/hero-images`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(payload),
                    });
                }));

                toast.success("Hero images added successfully");
            }

            setShowAddModal(false);
            resetForm();
            fetchHeroImages();
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: "", page: "", linkUrl: "" });
        setPreviewUrls([]);
        setPreviewUrlsMobile([]);
        setSelectedFiles([]);
        setSelectedFilesMobile([]);
        setEditingImage(null);
    };

    const handleEdit = (image: HeroImage) => {
        setEditingImage(image);
        setFormData({
            title: image.title || "",
            page: image.page || "home",
            linkUrl: image.linkUrl || ""
        });
        setPreviewUrls([image.imageUrl]);
        setPreviewUrlsMobile(image.imageUrlMobile ? [image.imageUrlMobile] : []);
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this hero image?")) return;
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/hero-images/${id}`,
                { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (!response.ok) throw new Error("Delete failed");
            toast.success("Deleted successfully");
            fetchHeroImages();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const toggleActive = async (item: HeroImage) => {
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/hero-images/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ active: !item.active }),
                }
            );
            if (!response.ok) throw new Error("Failed to update");
            toast.success(item.active ? "Image hidden" : "Image visible");
            fetchHeroImages();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const moveImage = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= heroImages.length) return;

        const items = [...heroImages];
        const [moved] = items.splice(index, 1);
        items.splice(newIndex, 0, moved);

        try {
            await Promise.all(items.map((item, idx) =>
                fetch(`https://${projectId}.supabase.co/functions/v1/make-server-52d68140/hero-images/${item.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ order: idx }),
                })
            ));
            fetchHeroImages();
        } catch {
            toast.error("Failed to reorder");
        }
    };

    return (
        <AdminLayout
            title="Hero Images"
            actions={
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2 hover:bg-teal-700 transition shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Hero Image
                </button>
            }
        >
            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-800 text-sm">
                    <strong>💡 Tip:</strong> Upload high-quality images (1500x800 for desktop, 800x600 for mobile).
                    You can select multiple images at once.
                </p>
            </div>

            {/* Hero Images List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 border-b-2 rounded-full animate-spin border-teal-600" />
                </div>
            ) : heroImages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Hero Images</h3>
                    <p className="text-slate-500">Upload images to display in the hero carousels across various pages.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {HERO_PAGES.map(page => {
                        const pageImages = heroImages.filter(h => h.page === page.value || (!h.page && page.value === 'home'));
                        if (pageImages.length === 0) return null;

                        return (
                            <div key={page.value} className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-teal-500 rounded-full" />
                                    {page.label}
                                </h2>
                                <div className="space-y-3">
                                    {pageImages.map((item, localIdx) => {
                                        const originalIdx = heroImages.findIndex(h => h.id === item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                className={`bg-white rounded-xl shadow-sm border overflow-hidden flex items-center gap-4 p-4 ${item.active ? "border-slate-200" : "border-red-200 bg-red-50/50"
                                                    }`}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => moveImage(originalIdx, 'up')}
                                                        disabled={localIdx === 0}
                                                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                                    >
                                                        ▲
                                                    </button>
                                                    <GripVertical className="w-5 h-5 text-slate-400" />
                                                    <button
                                                        onClick={() => moveImage(originalIdx, 'down')}
                                                        disabled={localIdx === pageImages.length - 1}
                                                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>

                                                <div className="w-48 h-28 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                                    <ImageWithFallback
                                                        src={optimizeImage(item.imageUrl, 400)}
                                                        className="w-full h-full object-cover"
                                                        alt={item.title || "Hero image"}
                                                    />
                                                </div>

                                                {item.imageUrlMobile && (
                                                    <div className="w-20 h-28 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                                        <ImageWithFallback
                                                            src={optimizeImage(item.imageUrlMobile, 200)}
                                                            className="w-full h-full object-cover"
                                                            alt={`${item.title || "Hero"} mobile`}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">{item.title || `Slide ${localIdx + 1}`}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">Page: {page.label} | Order: {item.order + 1}</p>
                                                    {!item.active && (
                                                        <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                                            Hidden
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                                                        title="Edit hero image"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleActive(item)}
                                                        className={`p-2 rounded-lg transition ${item.active
                                                            ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                            }`}
                                                        title={item.active ? "Hide image" : "Show image"}
                                                    >
                                                        {item.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b bg-gradient-to-r from-teal-50 to-cyan-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{editingImage ? "Edit Hero Image" : "Add Hero Image"}</h2>
                                <p className="text-sm text-gray-600 mt-1">Images upload to Cloudinary. You can select multiple images.</p>
                            </div>
                            <button
                                onClick={() => { setShowAddModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form onSubmit={handleUpload} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Title (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-900"
                                        placeholder="e.g. Summer Collection"
                                    />
                                </div>

                                {/* Target Page */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Target Page <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.page}
                                        onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-900"
                                        required
                                    >
                                        <option value="" disabled>Select Target Page</option>
                                        {HERO_PAGES.map(page => (
                                            <option key={page.value} value={page.value}>{page.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Link URL */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Link URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-900"
                                        placeholder="e.g. https://decorizz.com/shop/123"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Make the image clickable by adding a URL.</p>
                                </div>

                                {/* Desktop Images */}
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-2">
                                        Desktop Images <span className="text-red-500">*</span>
                                        <span className="text-xs text-slate-500 font-normal ml-2">Recommended: 1500x800</span>
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        id="desktopFiles"
                                        onChange={(e) => handleFileSelect(e, 'desktop')}
                                    />
                                    <label htmlFor="desktopFiles" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100">
                                        <Upload className="w-10 h-10 mb-3 text-slate-400" />
                                        <p className="text-sm text-slate-600 font-medium">Click to upload desktop images</p>
                                    </label>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="relative w-40 h-28">
                                                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover rounded-xl border" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
                                                        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Images */}
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-2">
                                        Mobile Images (optional)
                                        <span className="text-xs text-slate-500 font-normal ml-2">Recommended: 800x600</span>
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        id="mobileFiles"
                                        onChange={(e) => handleFileSelect(e, 'mobile')}
                                    />
                                    <label htmlFor="mobileFiles" className="flex flex-col items-center justify-center w-40 h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100">
                                        <Upload className="w-6 h-6 mb-2 text-slate-400" />
                                        <p className="text-xs text-slate-600">Mobile</p>
                                    </label>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {previewUrlsMobile.map((url, idx) => (
                                            <div key={idx} className="relative w-40 h-28">
                                                <img src={url} alt={`Mobile Preview ${idx}`} className="w-full h-full object-cover rounded-xl border" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreviewUrlsMobile(prev => prev.filter((_, i) => i !== idx));
                                                        setSelectedFilesMobile(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-4 border-t">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 py-3 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition disabled:opacity-50"
                                    >
                                        {uploading ? "Saving..." : (editingImage ? "Update Hero Image" : "Upload Hero Images")}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() => { setShowAddModal(false); resetForm(); }}
                                        className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
