import React, { useState, useEffect } from "react";
import { X, Check, Copy, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCreateInvite } from "@/services/commentService";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  itineraryId,
}) => {
  const t = useTranslations("InviteModal");
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const createInvite = useCreateInvite();

  // 當 Modal 打開 → call API 拿 inviteUrl
  useEffect(() => {
    if (isOpen) {
      createInvite.mutate(itineraryId, {
        onSuccess: (data) => {
          setInviteUrl(data.inviteUrl);
        },
      });
    } else {
      setInviteUrl("");
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-medium text-xl text-slate-900">
            {t("inviteCollab")}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite Link Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {t("tripLink")}
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={
                  createInvite.isPending
                    ? "Generating link..."
                    : inviteUrl || ""
                }
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm"
              />

              <button
                onClick={handleCopyLink}
                disabled={!inviteUrl}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-md text-slate-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-40"
              >
                {createInvite.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : copied ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
