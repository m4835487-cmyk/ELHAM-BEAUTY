import { useState, type ChangeEvent } from 'react';
import { Loader2, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import type { Language, LocalizedText } from '../../types.ts';
import { UI_STRINGS } from '../../lib/i18n.ts';
import { uploadAdminImage } from '../../lib/api.ts';
import { SafeImage } from '../SafeImage.tsx';

interface LocalizedInputProps {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
}

export function LocalizedInput({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: LocalizedInputProps) {
  const [activeTab, setActiveTab] = useState<Language>('ar');

  const tabs: Array<{ code: Language; label: string; dir: 'rtl' | 'ltr' }> = [
    { code: 'ar', label: 'العربية', dir: 'rtl' },
    { code: 'tr', label: 'Türkçe', dir: 'ltr' },
    { code: 'en', label: 'English', dir: 'ltr' },
  ];

  const activeDir = tabs.find((t) => t.code === activeTab)?.dir || 'rtl';

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold text-[#2A1620]">{label}</label>
        <div className="inline-flex items-center p-0.5 bg-[#FFF7FA] border border-[#F4DAE4] rounded-lg">
          {tabs.map((tab) => {
            const filled = Boolean(value[tab.code]?.trim());
            return (
              <button
                key={tab.code}
                type="button"
                onClick={() => setActiveTab(tab.code)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === tab.code
                    ? 'bg-[#CC4B7C] text-white'
                    : filled
                    ? 'text-[#2A1620] hover:bg-white'
                    : 'text-[#9C7D8B] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {multiline ? (
        <textarea
          rows={rows}
          dir={activeDir}
          value={value[activeTab] || ''}
          onChange={(e) => onChange({ ...value, [activeTab]: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
        />
      ) : (
        <input
          type="text"
          dir={activeDir}
          value={value[activeTab] || ''}
          onChange={(e) => onChange({ ...value, [activeTab]: e.target.value })}
          className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
        />
      )}
    </div>
  );
}

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  lang: Language;
}

export function SingleImageField({ label, value, onChange, lang }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const t = UI_STRINGS[lang].admin.actions;

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadAdminImage(file);
      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[#2A1620]">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="w-24 h-20 rounded-xl overflow-hidden border border-[#F4DAE4] bg-[#FFF7FA] shrink-0">
          <SafeImage src={value} alt={label} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 w-full space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className="min-h-[38px] px-3.5 py-1.5 bg-[#FFF7FA] hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors">
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#CC4B7C]" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-[#CC4B7C]" />
              )}
              <span>{uploading ? t.uploading : t.uploadImage}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-[#FFF7FA] border border-[#F4DAE4] text-[#6E515E] text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.cancel}</span>
              </button>
            )}
          </div>
          <input
            type="text"
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or /uploads/..."
            className="w-full min-h-[38px] px-3 py-1.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-xs text-[#2A1620] focus:outline-none focus:border-[#CC4B7C]"
          />
          {error && <p className="text-xs text-[#9D2F5A]">{error}</p>}
        </div>
      </div>
    </div>
  );
}

interface MultiImageFieldProps {
  label: string;
  images: string[];
  onChange: (next: string[]) => void;
  lang: Language;
}

export function MultiImageField({ label, images, onChange, lang }: MultiImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const t = UI_STRINGS[lang].admin.actions;

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const res = await uploadAdminImage(file);
        uploadedUrls.push(res.url);
      }
      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlInput('');
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-[#2A1620]">{label}</label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={`${img}-${idx}`}
              className="relative group aspect-square rounded-xl overflow-hidden border border-[#F4DAE4] bg-[#FFF7FA]"
            >
              <SafeImage src={img} alt={`${label} ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => onChange(images.filter((_, i) => i !== idx))}
                className="absolute top-1.5 end-1.5 w-7 h-7 rounded-full bg-white/95 border border-[#F4DAE4] text-[#9D2F5A] flex items-center justify-center hover:bg-[#CC4B7C] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <label className="min-h-[40px] px-4 py-2 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-xs font-medium rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors">
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>{uploading ? t.uploading : t.uploadImage}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <div className="flex-1 flex gap-2">
          <input
            type="text"
            dir="ltr"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 min-h-[40px] px-3 py-1.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-xs text-[#2A1620] focus:outline-none focus:border-[#CC4B7C]"
          />
          <button
            type="button"
            onClick={addUrl}
            className="min-h-[40px] px-3 py-1.5 bg-[#FFF7FA] hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-xs font-medium rounded-lg inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-[#9D2F5A]">{error}</p>}
    </div>
  );
}

interface ConfirmDeleteButtonProps {
  onConfirm: () => void | Promise<void>;
  lang: Language;
  busy?: boolean;
}

export function ConfirmDeleteButton({ onConfirm, lang, busy = false }: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const t = UI_STRINGS[lang].admin.actions;

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            await onConfirm();
            setConfirming(false);
          }}
          className="min-h-[34px] px-2.5 py-1 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-xs font-medium rounded-md cursor-pointer"
        >
          {t.confirmDelete}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="min-h-[34px] px-2.5 py-1 bg-white border border-[#F4DAE4] text-[#6E515E] text-xs rounded-md cursor-pointer"
        >
          {t.cancel}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="min-h-[34px] px-2.5 py-1 bg-white hover:bg-[#FFF7FA] border border-[#F4DAE4] text-[#9D2F5A] text-xs font-medium rounded-md inline-flex items-center gap-1 cursor-pointer"
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>{t.delete}</span>
    </button>
  );
}

export function AiAssistBadge({
  loading,
  label,
  onClick,
}: {
  loading: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="min-h-[38px] px-3.5 py-1.5 bg-[#FCE8F0] hover:bg-[#CC4B7C] text-[#9D2F5A] hover:text-white border border-[#F4DAE4] text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </button>
  );
}
