import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
} from "lucide-react";
import { Itinerary } from "../types";
import { useTranslations } from "next-intl";
import {
  useUpdateItinerary,
  useDeleteItinerary,
} from "../services/itineraryService";
import { deleteFile, uploadFile } from "@/services/s3Service";

interface EditItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Itinerary;
}

export const EditItineraryModal: React.FC<EditItineraryModalProps> = ({
  isOpen,
  onClose,
  itinerary,
}) => {
  const t = useTranslations("EditItineraryModal");

  const updateItineraryMutation = useUpdateItinerary();
  const deleteItineraryMutation = useDeleteItinerary();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 原本的圖片，用來判斷 Save 時要不要刪
  const [initialCoverImage, setInitialCoverImage] = useState<string | null>(
    null
  );

  // 編輯輸入資料
  const [formData, setFormData] = useState<Partial<Itinerary>>({});
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (itinerary) {
      setInitialCoverImage(itinerary.coverImage || null);

      setFormData({
        name: itinerary.name,
        destination: itinerary.destination,
        startDate: itinerary.startDate,
        coverImage: itinerary.coverImage,
      });

      setPreview(itinerary.coverImage || null);
    }
  }, [itinerary]);

  if (!isOpen) return null;

  /**
   * Save 時才刪掉舊圖片
   */
  const handleSave = async () => {
    try {
      // 如果舊圖片存在 且 改成了新的圖片 → 刪掉舊的
      if (
        initialCoverImage &&
        initialCoverImage !== formData.coverImage &&
        initialCoverImage !== null
      ) {
        await deleteFile(initialCoverImage);
      }

      await updateItineraryMutation.mutateAsync({
        id: itinerary.id,
        updates: {
          ...formData,
          startDate: formData.startDate,
        },
      });

      onClose();
    } catch (error) {
      console.error("Failed to update itinerary:", error);
    }
  };

  /**
   * 刪整個 itinerary（順便刪 S3）
   */
  const handleDelete = async () => {
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      if (initialCoverImage) await deleteFile(initialCoverImage);
      await deleteItineraryMutation.mutateAsync(itinerary.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete itinerary:", error);
    }
  };

  /**
   * 上傳新的封面圖（先上傳，但不刪舊圖）
   */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = await uploadFile(file);

    setFormData({
      ...formData,
      coverImage: fileUrl,
    });

    setPreview(URL.createObjectURL(file));
  };

  /**
   * 使用者按 remove，但不刪 S3（等 Save 才刪）
   */
  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    setFormData({
      ...formData,
      coverImage: undefined,
    });

    setPreview(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSaving = updateItineraryMutation.isPending;
  const isDeleting = deleteItineraryMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-xl text-slate-900">
            {t("tripSettings")}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 bg-slate-50/50">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              {t("tripName")}
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-slate-900 outline-none text-lg text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Destination */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              {t("destination")}
            </label>
            <input
              type="text"
              value={formData.destination || ""}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-slate-900 outline-none text-slate-900"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              {t("startDate")}
            </label>
            <div className="relative group">
              <div className="flex items-center justify-between w-full py-2 border-b border-slate-200 group-hover:border-slate-900 cursor-pointer transition-colors">
                <span className="text-slate-900">
                  {formData.startDate
                    ? new Date(formData.startDate).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "long", day: "numeric" }
                      )
                    : t("selectDate")}
                </span>
                <Calendar size={16} className="text-slate-400" />
              </div>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              {t("coverImage")}
            </label>

            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {formData.coverImage ? (
                <div className="relative h-40 w-full bg-slate-100 rounded-md overflow-hidden border border-slate-200 group">
                  <img
                    src={preview ?? formData.coverImage ?? ""}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Hover Buttons */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/40 transition-colors text-xs font-medium flex items-center gap-1.5"
                    >
                      <Upload size={14} />
                      {t("change")}
                    </button>

                    <button
                      onClick={removeImage}
                      className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-rose-500/80 hover:text-white transition-colors text-xs font-medium flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      {t("remove")}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 w-full border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer gap-2"
                >
                  <ImageIcon size={24} />
                  <span className="text-xs font-medium">
                    {t("uploadImage")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-rose-600 hover:text-rose-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            {isDeleting && <Loader2 className="animate-spin" size={14} />}
            {t("deleteTrip")}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-medium"
            >
              {t("cancel")}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2"
            >
              {isSaving && <Loader2 className="animate-spin" size={16} />}
              {t("saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
