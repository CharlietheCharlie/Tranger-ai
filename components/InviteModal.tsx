
import React, { useState } from 'react';
import { X, Mail, Check, Copy, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAddCollaborator } from '../services/commentService'; // Import react-query hook

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, itineraryId }) => {
  const t = useTranslations("InviteModal");
  const addCollaboratorMutation = useAddCollaborator(); // Use the mutation hook
  const [email, setEmail] = useState('');
  const [invited, setInvited] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
        try {
            await addCollaboratorMutation.mutateAsync({ itineraryId, email });
            setInvited(true);
            setTimeout(() => {
                setInvited(false);
                setEmail('');
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to invite collaborator:', error);
            // Optionally, set an error state here to display to the user
        }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInviting = addCollaboratorMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="font-medium text-xl text-slate-900">{t('inviteCollab')}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 space-y-6">
            
            <form onSubmit={handleInvite} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Invite by Email</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('emailPlaceholder')}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isInviting}
                        className={`px-4 py-2 rounded-md font-medium text-white transition-all flex items-center gap-2 ${invited ? 'bg-green-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                        {isInviting && <Loader2 size={18} className="animate-spin" />}
                        {invited ? <Check size={18} /> : t('send')}
                    </button>
                </div>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">{t('orLink')}</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('tripLink')}</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        readOnly
                        value={window.location.href}
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm"
                    />
                    <button 
                        onClick={handleCopyLink}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-md text-slate-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        {copied ? t('copied') : t('copy')}
                    </button>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};