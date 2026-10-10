import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Download,
  FileJson,
  Globe2,
  GraduationCap,
  Import,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  LogOut,
} from 'lucide-react';
import { studentService } from '../../services/studentApi';
import { StudentCategory, StudentInstitute } from '../../types/student';
import {
  categorySeoKey,
  citySeoKey,
  downloadSeoConfig,
  instituteSeoKey,
  readSeoDraftConfig,
  removeSeoDraftEntry,
  saveSeoDraftEntry,
  SeoConfig,
  SeoFaq,
  SeoOverride,
  writeSeoDraftConfig,
} from '../../lib/seoAdmin';
import { absoluteUrl, buildCategoryPath, buildCityPath, buildInstitutePath, slugifySeo } from '../../lib/seoUrls';
import { clearSeoAdminSession } from '../../lib/seoAdminAccess';

const emptyEntry: SeoOverride = {
  title: '',
  description: '',
  h1: '',
  intro: '',
  canonical: '',
  index: true,
  faqs: [],
};

type EntityTab = 'city' | 'category' | 'institute';

interface EntityOption {
  key: string;
  label: string;
  subtitle: string;
  autoTitle: string;
  autoDescription: string;
  autoH1: string;
  autoCanonical: string;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
}) {
  const shared =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';

  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700">{label}</span>
        {maxLength ? (
          <span className={`text-[11px] ${value.length > maxLength ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${shared} resize-y`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={shared}
        />
      )}
    </label>
  );
}

export const SeoAdminPage: React.FC = () => {
  const [tab, setTab] = useState<EntityTab>('city');
  const [categories, setCategories] = useState<StudentCategory[]>([]);
  const [institutes, setInstitutes] = useState<StudentInstitute[]>([]);
  const [selectedCategoryCity, setSelectedCategoryCity] = useState('india');
  const [selectedKey, setSelectedKey] = useState('');
  const [search, setSearch] = useState('');
  const [draftConfig, setDraftConfig] = useState<SeoConfig>(() => readSeoDraftConfig());
  const [form, setForm] = useState<SeoOverride>({ ...emptyEntry });
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    Promise.all([studentService.getParentCategories(), studentService.getCollegesByCategoryId()])
      .then(([nextCategories, nextInstitutes]) => {
        if (!active) return;
        setCategories(nextCategories || []);
        setInstitutes(nextInstitutes || []);
      })
      .catch(() => {
        if (!active) return;
        setNotice('Could not load live categories/institutes. Existing SEO drafts are still available.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const cities = useMemo(
    () =>
      Array.from(
        new Set<string>(
          institutes
            .map((institute) => String(institute.address?.city || '').trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [institutes]
  );

  const entityOptions = useMemo<EntityOption[]>(() => {
    if (tab === 'city') {
      return cities.map((city) => ({
        key: citySeoKey(city),
        label: city,
        subtitle: `${institutes.filter((item) => slugifySeo(item.address.city) === slugifySeo(city)).length} institutes`,
        autoTitle: `Best Coaching Institutes in ${city} - Courses, Fees & Reviews`,
        autoDescription: `Explore verified coaching institutes in ${city}. Compare courses, fees, locations and student reviews on Coaching Buddy.`,
        autoH1: `Top Coaching Institutes in ${city}`,
        autoCanonical: absoluteUrl(buildCityPath(city)),
      }));
    }

    if (tab === 'category') {
      const cityName = selectedCategoryCity === 'india' ? 'India' : selectedCategoryCity;
      return categories.map((category) => ({
        key: categorySeoKey(selectedCategoryCity, category.name),
        label: category.name,
        subtitle: selectedCategoryCity === 'india' ? 'All India category page' : `${selectedCategoryCity} category page`,
        autoTitle:
          selectedCategoryCity === 'india'
            ? `Best ${category.name} Coaching Institutes in India`
            : `Best ${category.name} Coaching Institutes in ${cityName}`,
        autoDescription: `Explore verified ${category.name} coaching institutes${
          selectedCategoryCity === 'india' ? ' across India' : ` in ${cityName}`
        }. Compare courses, fees, locations and student reviews.`,
        autoH1:
          selectedCategoryCity === 'india'
            ? `Top Coaching Institutes for ${category.name}`
            : `Top ${category.name} Coaching Institutes in ${cityName}`,
        autoCanonical: absoluteUrl(buildCategoryPath(category.name, selectedCategoryCity)),
      }));
    }

    return institutes
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((institute) => ({
        key: instituteSeoKey(institute.id),
        label: institute.name,
        subtitle: [institute.address?.area, institute.address?.city].filter(Boolean).join(', ') || 'Institute page',
        autoTitle: `${institute.name} Coaching in ${institute.address?.city || 'India'} - Courses, Fees & Reviews`,
        autoDescription: `${institute.name}${institute.address?.area ? ` in ${institute.address.area}` : ''}${
          institute.address?.city ? `, ${institute.address.city}` : ''
        }. Compare available courses, fees, admission details, contact information and student reviews on Coaching Buddy.`,
        autoH1: institute.name,
        autoCanonical: absoluteUrl(buildInstitutePath(institute)),
      }));
  }, [tab, cities, categories, institutes, selectedCategoryCity]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entityOptions;
    return entityOptions.filter((item) => `${item.label} ${item.subtitle}`.toLowerCase().includes(q));
  }, [entityOptions, search]);

  const selectedOption = entityOptions.find((item) => item.key === selectedKey);

  useEffect(() => {
    if (entityOptions.length === 0) {
      setSelectedKey('');
      return;
    }
    if (!entityOptions.some((item) => item.key === selectedKey)) {
      setSelectedKey(entityOptions[0].key);
    }
  }, [entityOptions, selectedKey]);

  useEffect(() => {
    if (!selectedKey) {
      setForm({ ...emptyEntry });
      return;
    }
    const existing = draftConfig.entries[selectedKey];
    setForm({
      ...emptyEntry,
      ...existing,
      index: existing?.index !== false,
      faqs: existing?.faqs || [],
    });
  }, [selectedKey, draftConfig]);

  const updateForm = <K extends keyof SeoOverride>(key: K, value: SeoOverride[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const saveCurrent = () => {
    if (!selectedKey) return;
    const next = saveSeoDraftEntry(selectedKey, form);
    setDraftConfig(next);
    setNotice('SEO draft saved in this browser. Export the JSON when you are ready to publish.');
  };

  const resetCurrent = () => {
    if (!selectedKey) return;
    const next = removeSeoDraftEntry(selectedKey);
    setDraftConfig(next);
    setForm({ ...emptyEntry });
    setNotice('Custom SEO override removed. The page will use its automatic SEO values.');
  };

  const addFaq = () => {
    updateForm('faqs', [...(form.faqs || []), { question: '', answer: '' }]);
  };

  const updateFaq = (index: number, patch: Partial<SeoFaq>) => {
    const next = [...(form.faqs || [])];
    next[index] = { ...next[index], ...patch };
    updateForm('faqs', next);
  };

  const removeFaq = (index: number) => {
    updateForm(
      'faqs',
      (form.faqs || []).filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const handleImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as SeoConfig;
      if (parsed?.version !== 1 || !parsed.entries || typeof parsed.entries !== 'object') {
        throw new Error('Invalid SEO config');
      }
      writeSeoDraftConfig(parsed);
      setDraftConfig(parsed);
      setNotice(`Imported ${Object.keys(parsed.entries).length} SEO override(s).`);
    } catch {
      setNotice('Import failed. Please select a valid CoachingBuddy seo-overrides.json file.');
    }
  };

  const publishedCount = Object.keys(draftConfig.entries || {}).length;
  const previewTitle = form.title?.trim() || selectedOption?.autoTitle || 'Select an SEO page';
  const previewDescription = form.description?.trim() || selectedOption?.autoDescription || '';
  const previewCanonical = form.canonical?.trim() || selectedOption?.autoCanonical || 'https://coachingbuddy.co.in/';

  const tabButton = (value: EntityTab, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => {
        setTab(value);
        setSearch('');
        setSelectedKey('');
      }}
      className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
        tab === value ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">CoachingBuddy SEO Admin</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                  <ShieldCheck className="w-3 h-3" /> Restricted
                </span>
              </div>
              <p className="text-xs text-slate-500">Manage programmatic SEO overrides without editing page components.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImport(file);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50"
            >
              <Import className="w-4 h-4" /> Import JSON
            </button>
            <button
              type="button"
              onClick={() => {
                clearSeoAdminSession();
                window.location.assign('/seo-admin/login');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4" /> SEO Logout
            </button>
            <button
              type="button"
              onClick={() => downloadSeoConfig(draftConfig)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 text-white px-4 py-2.5 text-xs font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700"
            >
              <Download className="w-4 h-4" /> Export Published JSON
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {notice ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Draft Overrides</p>
            <p className="mt-1 text-3xl font-black">{publishedCount}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Cities</p>
            <p className="mt-1 text-3xl font-black">{cities.length}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institutes</p>
            <p className="mt-1 text-3xl font-black">{institutes.length}</p>
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          {tabButton('city', 'City SEO', <MapPin className="w-4 h-4" />)}
          {tabButton('category', 'Category SEO', <GraduationCap className="w-4 h-4" />)}
          {tabButton('institute', 'Institute SEO', <Building2 className="w-4 h-4" />)}
        </section>

        {tab === 'category' ? (
          <section className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-sm font-bold text-slate-700">Category location:</div>
            <select
              value={selectedCategoryCity}
              onChange={(event) => {
                setSelectedCategoryCity(event.target.value);
                setSelectedKey('');
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-teal-500"
            >
              <option value="india">All India</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </section>
        ) : null}

        <section className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-5 items-start">
          <aside className="rounded-3xl bg-white border border-slate-200 overflow-hidden lg:sticky lg:top-24">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search pages..."
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">
                {isLoading ? 'Loading live data…' : `${filteredOptions.length} page(s)`}
              </p>
            </div>
            <div className="max-h-[64vh] overflow-y-auto p-2">
              {filteredOptions.map((item) => {
                const customized = Boolean(draftConfig.entries[item.key]);
                const active = selectedKey === item.key;
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => setSelectedKey(item.key)}
                    className={`w-full text-left rounded-2xl px-3 py-3 mb-1 transition ${
                      active ? 'bg-teal-50 border border-teal-200' : 'border border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-extrabold truncate ${active ? 'text-teal-900' : 'text-slate-800'}`}>{item.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                      </div>
                      {customized ? <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" title="Custom SEO saved" /> : null}
                    </div>
                  </button>
                );
              })}
              {!isLoading && filteredOptions.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No matching pages found.</div>
              ) : null}
            </div>
          </aside>

          <div className="space-y-5">
            {!selectedOption ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center text-slate-500">
                Select a page from the left to edit its SEO settings.
              </div>
            ) : (
              <>
                <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Editing</p>
                      <h2 className="text-2xl font-black mt-1">{selectedOption.label}</h2>
                      <p className="text-xs text-slate-400 mt-1 break-all">{selectedKey}</p>
                    </div>
                    <label className="inline-flex items-center gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={form.index !== false}
                        onChange={(event) => updateForm('index', event.target.checked)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-xs font-bold">Allow indexing</span>
                    </label>
                  </div>

                  <div className="grid xl:grid-cols-2 gap-4">
                    <TextField
                      label="SEO Title"
                      value={form.title || ''}
                      onChange={(value) => updateForm('title', value)}
                      placeholder={selectedOption.autoTitle}
                      maxLength={60}
                    />
                    <TextField
                      label="H1 Heading"
                      value={form.h1 || ''}
                      onChange={(value) => updateForm('h1', value)}
                      placeholder={selectedOption.autoH1}
                    />
                  </div>

                  <TextField
                    label="Meta Description"
                    value={form.description || ''}
                    onChange={(value) => updateForm('description', value)}
                    placeholder={selectedOption.autoDescription}
                    maxLength={160}
                    multiline
                    rows={3}
                  />

                  <TextField
                    label="Intro / SEO Content"
                    value={form.intro || ''}
                    onChange={(value) => updateForm('intro', value)}
                    placeholder="Add useful, unique content specific to this page. Leave blank to use the page's automatic/default copy."
                    multiline
                    rows={5}
                  />

                  <TextField
                    label="Canonical URL Override"
                    value={form.canonical || ''}
                    onChange={(value) => updateForm('canonical', value)}
                    placeholder={selectedOption.autoCanonical}
                  />
                </section>

                <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">FAQ Content</h3>
                      <p className="text-xs text-slate-400">Visible FAQs are also used for FAQ structured data.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-50"
                    >
                      <Plus className="w-4 h-4" /> Add FAQ
                    </button>
                  </div>

                  {(form.faqs || []).map((faq, index) => (
                    <div key={`faq_${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-500">FAQ {index + 1}</span>
                        <button type="button" onClick={() => removeFaq(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        value={faq.question}
                        onChange={(event) => updateFaq(index, { question: event.target.value })}
                        placeholder="Question"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                      />
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(event) => updateFaq(index, { answer: event.target.value })}
                        placeholder="Answer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 resize-y"
                      />
                    </div>
                  ))}
                  {(form.faqs || []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">No custom FAQs yet.</div>
                  ) : null}
                </section>

                <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileJson className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-black">Google snippet preview</h3>
                  </div>
                  <div className="max-w-3xl rounded-2xl border border-slate-200 p-5 bg-white">
                    <p className="text-xs text-emerald-700 truncate">{previewCanonical}</p>
                    <p className="text-xl text-blue-700 mt-1 leading-snug">{previewTitle}</p>
                    <p className="text-sm text-slate-600 mt-1.5 leading-6">{previewDescription}</p>
                    {form.index === false ? <p className="text-xs font-bold text-red-600 mt-3">NOINDEX enabled for this page.</p> : null}
                  </div>
                </section>

                <section className="rounded-3xl bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold">Save this page as a draft</p>
                    <p className="text-xs text-slate-400 mt-1">Export seo-overrides.json after all edits are complete.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={resetCurrent}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold hover:bg-slate-700"
                    >
                      <RefreshCw className="w-4 h-4" /> Use Automatic SEO
                    </button>
                    <button
                      type="button"
                      onClick={saveCurrent}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-black text-white hover:bg-teal-400"
                    >
                      <Save className="w-4 h-4" /> Save Draft
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
          <UploadCloud className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 leading-6">
            <strong>Publishing:</strong> this frontend package does not contain your server-side admin/database source. After editing, export
            <strong> seo-overrides.json</strong>, replace <strong>public/seo-overrides.json</strong> in the project and deploy/build the site. Once a backend SEO endpoint is available, this same dashboard can save directly to the database.
          </div>
        </section>
      </main>
    </div>
  );
};

export default SeoAdminPage;
