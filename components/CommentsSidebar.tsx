import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAddComment, useItineraryComments } from "../services/commentService"; // Import useItineraryComments
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { uploadFile } from "@/services/s3Service";
import { useItineraryChat } from '@/hooks/useItineraryChat'; // Import useItineraryChat

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
}

export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({
  isOpen,
  onClose,
  itineraryId,
}) => {
  const { data: session } = useSession();
  const t = useTranslations("CommentsSidebar");
  const [newCommentText, setNewCommentText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addCommentMutation = useAddComment();
  const isPostingComment = addCommentMutation.isPending;

  const { data: comments, isLoading } = useItineraryComments(itineraryId); // Use new hook
  useItineraryChat(itineraryId); // Initialize socket for real-time updates

  if (isLoading) return null;

  const currentComments = comments || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(null);

    const fileUrl = await uploadFile(file);
  
    setImagePreview(fileUrl);
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() && !imagePreview) return;

    try {
      await addCommentMutation.mutateAsync({
        itineraryId,
        text: newCommentText,
        imageUrl: imagePreview || undefined,
      });
      setNewCommentText("");
      setImagePreview(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const formatCommentTime = (isoString: string) => {
    return format(new Date(isoString), "p"); // e.g., 4:54 PM
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed top-24 right-0 bottom-0 w-full md:w-96 bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col"
    >
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-lg text-slate-900">{t("chat")}</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {currentComments.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
            <p>{t("startConversation")}</p>
          </div>
        )}
        {currentComments.map((comment) => {
          const isMe = comment.authorId === session?.user?.id;
          return (
            <div
              key={comment.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200"
                title={comment.author.name ?? ""}
              >
                <img
                  src={comment.author.image ?? 'https://www.gravatar.com/avatar?d=mp'}
                  alt={comment.author.name ?? ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`max-w-[85%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-4 text-sm shadow-sm border ${isMe ? "bg-slate-900 text-white border-slate-900 rounded-lg rounded-tr-none" : "bg-white text-slate-900 border-slate-200 rounded-lg rounded-tl-none"}`}
                >
                  {!isMe && (
                    <div className="text-xs font-bold mb-1 text-slate-500">
                      {comment.author.name}
                    </div>
                  )}

                  {comment.imageUrl && (
                    <div className="mb-2 rounded-sm overflow-hidden">
                      <img
                        src={comment.imageUrl}
                        alt="attachment"
                        className="max-w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {comment.text && (
                    <p className="leading-relaxed">{comment.text}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {formatCommentTime(comment.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white space-y-3">
        {imagePreview && (
          <div className="relative inline-block ml-2">
            <div className="w-16 h-16 rounded-md overflow-hidden border border-slate-200">
              <img
                src={imagePreview}
                className="w-full h-full object-cover"
                alt="preview"
              />
            </div>
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-slate-900 transition-colors shrink-0"
          >
            <ImageIcon size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={t("typeMessage")}
              className="w-full pl-0 pr-12 py-3 bg-transparent border-b border-slate-200 focus:border-slate-900 outline-none transition-all text-sm placeholder-slate-400 text-slate-900"
            />
            <button
              type="submit"
              disabled={
                isPostingComment || (!newCommentText.trim() && !imagePreview)
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-900 hover:text-blue-600 disabled:opacity-30 transition-colors font-bold text-xs uppercase flex items-center gap-1"
            >
              {isPostingComment && (
                <Loader2 size={12} className="animate-spin" />
              )}
              {t("send")}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

