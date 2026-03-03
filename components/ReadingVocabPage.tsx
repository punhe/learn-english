import React, { useState, useEffect } from 'react';
import { ReadingVocab } from '../types';
import { parseVocabularyWithGemini } from '../services/geminiService';
import { addMultipleVocabulary, getAllVocabulary, deleteVocabulary } from '../services/firebase';

interface ReadingVocabPageProps {
    onStartFlashcards: (vocabs: ReadingVocab[]) => void;
}

const SAMPLE_INPUT = `testify chứng tỏ

Từ/Cấu trúc liên quan: testify to something
Giải thích nghĩa tiếng Việt: Trong đoạn văn, "testifies" được sử dụng để diễn tả việc bờ kè chống lũ là bằng chứng cho thấy con sông có xu hướng tự nhiên bị lũ lụt.
Ví dụ:
His success testifies to his hard work. (Thành công của anh ấy chứng tỏ sự chăm chỉ của anh ấy.)
The ancient ruins testify to a powerful civilization. (Những tàn tích cổ xưa chứng tỏ một nền văn minh hùng mạnh.)`;

type TabType = 'add' | 'list';

const ReadingVocabPage: React.FC<ReadingVocabPageProps> = ({ onStartFlashcards }) => {
    const [activeTab, setActiveTab] = useState<TabType>('add');
    const [rawInput, setRawInput] = useState('');
    const [parsedItems, setParsedItems] = useState<ReadingVocab[]>([]);
    const [savedVocabs, setSavedVocabs] = useState<ReadingVocab[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    // Load saved vocabulary on mount and when switching to list tab
    useEffect(() => {
        if (activeTab === 'list') {
            loadSavedVocabs();
        }
    }, [activeTab]);

    const loadSavedVocabs = async () => {
        setIsLoading(true);
        try {
            const vocabs = await getAllVocabulary();
            setSavedVocabs(vocabs);
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            setErrorMessage('Không thể tải từ vựng. Kiểm tra cấu hình Firebase.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleParse = async () => {
        if (!rawInput.trim()) return;
        setIsParsing(true);
        setErrorMessage('');
        try {
            const items = await parseVocabularyWithGemini(rawInput);
            setParsedItems(items);
            setShowPreview(true);
        } catch (error) {
            console.error('Error parsing:', error);
            setErrorMessage('Lỗi khi phân tích. API có thể bị giới hạn (429). Vui lòng đợi vài giây rồi thử lại.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleSave = async () => {
        if (parsedItems.length === 0) return;
        setIsSaving(true);
        setErrorMessage('');
        try {
            await addMultipleVocabulary(parsedItems);
            setSuccessMessage(`Đã lưu ${parsedItems.length} từ vựng thành công!`);
            setRawInput('');
            setParsedItems([]);
            setShowPreview(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error saving:', error);
            setErrorMessage('Lỗi khi lưu: Firestore từ chối quyền truy cập. Hãy cập nhật Security Rules trong Firebase Console (cho phép read/write).');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteVocabulary(id);
            setSavedVocabs(prev => prev.filter(v => v.id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
            setErrorMessage('Không thể xóa từ vựng.');
        }
    };

    const toggleExpandCard = (id: string) => {
        setExpandedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredVocabs = savedVocabs.filter(v =>
        v.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.explanation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartReviewAll = () => {
        if (savedVocabs.length > 0) {
            onStartFlashcards(savedVocabs);
        }
    };

    const handleStartReviewFiltered = () => {
        if (filteredVocabs.length > 0) {
            onStartFlashcards(filteredVocabs);
        }
    };

    const removeParsedItem = (index: number) => {
        setParsedItems(prev => prev.filter((_, i) => i !== index));
    };

    const loadSample = () => {
        setRawInput(SAMPLE_INPUT);
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Tab Navigation */}
            <div className="glass rounded-2xl shadow-card p-2 flex gap-2">
                <button
                    onClick={() => setActiveTab('add')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer ${activeTab === 'add'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md'
                        : 'text-text-secondary hover:bg-muted'
                        }`}
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm từ vựng</span>
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer ${activeTab === 'list'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md'
                        : 'text-text-secondary hover:bg-muted'
                        }`}
                >
                    <i className="fa-solid fa-book-open"></i>
                    <span>Kho từ vựng ({savedVocabs.length})</span>
                </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="flex items-center gap-3 p-4 bg-secondary-50 border border-secondary-200 rounded-xl animate-fade-in">
                    <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-check text-secondary-600"></i>
                    </div>
                    <p className="text-sm font-medium text-secondary-700">{successMessage}</p>
                </div>
            )}

            {errorMessage && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-exclamation text-red-600"></i>
                    </div>
                    <p className="text-sm font-medium text-red-700">{errorMessage}</p>
                    <button onClick={() => setErrorMessage('')} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* ===== ADD TAB ===== */}
            {activeTab === 'add' && (
                <div className="space-y-6">
                    {/* Input Section */}
                    <div className="glass rounded-2xl shadow-card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-text font-outfit">
                                    <i className="fa-solid fa-pen-to-square text-primary-500 mr-2"></i>
                                    Nhập từ vựng Reading
                                </h3>
                                <p className="text-sm text-text-secondary mt-1">
                                    Dán từ vựng từ bài đọc, Gemini AI sẽ tự động format cho bạn
                                </p>
                            </div>
                            <button
                                onClick={loadSample}
                                className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                                <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                                Xem mẫu
                            </button>
                        </div>

                        {/* Format Guide */}
                        <div className="bg-muted rounded-xl p-4 border border-border">
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                                <i className="fa-solid fa-circle-info mr-1"></i>
                                Định dạng mẫu
                            </p>
                            <pre className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-mono">
                                {`[từ tiếng Anh] [nghĩa tiếng Việt ngắn]

Từ/Cấu trúc liên quan: ...
Giải thích nghĩa tiếng Việt: ...
Ví dụ:
[Câu ví dụ 1]. ([Nghĩa tiếng Việt])
[Câu ví dụ 2]. ([Nghĩa tiếng Việt])`}
                            </pre>
                        </div>

                        <textarea
                            value={rawInput}
                            onChange={(e) => setRawInput(e.target.value)}
                            placeholder="Dán từ vựng vào đây... (có thể nhập nhiều từ, cách nhau bởi dòng trống)"
                            className="w-full h-64 p-4 rounded-xl bg-white border-2 border-border focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all text-sm font-mono leading-relaxed resize-none"
                            aria-label="Vocabulary input"
                        />

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleParse}
                                disabled={!rawInput.trim() || isParsing}
                                className="flex-1 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isParsing ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        <span>Đang phân tích...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                                        <span>Phân tích với AI</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => { setRawInput(''); setParsedItems([]); setShowPreview(false); }}
                                className="py-3.5 px-5 bg-surface border-2 border-border text-text-secondary font-bold rounded-xl hover:border-red-300 hover:text-red-500 transition-all cursor-pointer"
                            >
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {showPreview && parsedItems.length > 0 && (
                        <div className="glass rounded-2xl shadow-card p-6 space-y-4 animate-slide-up">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-text font-outfit">
                                    <i className="fa-solid fa-eye text-secondary-500 mr-2"></i>
                                    Xem trước ({parsedItems.length} từ)
                                </h3>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white font-bold rounded-xl hover:from-secondary-700 hover:to-secondary-600 shadow-md shadow-secondary-500/20 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            <span>Đang lưu...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-cloud-arrow-up"></i>
                                            <span>Lưu vào kho</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {parsedItems.map((item, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-border p-5 hover:shadow-card transition-all group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-sm font-bold text-primary-600">{idx + 1}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-extrabold text-text font-outfit">{item.term}</h4>
                                                    <span className="text-primary-600 font-semibold text-sm">{item.meaning}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeParsedItem(idx)}
                                                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all cursor-pointer p-1"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>

                                        {item.relatedStructure && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-accent-500 uppercase tracking-wider bg-accent-50 px-2 py-0.5 rounded">Cấu trúc</span>
                                                <code className="text-sm font-mono text-text bg-muted px-2 py-0.5 rounded">{item.relatedStructure}</code>
                                            </div>
                                        )}

                                        {item.explanation && (
                                            <p className="text-sm text-text-secondary leading-relaxed mb-3 pl-4 border-l-2 border-primary-200">
                                                {item.explanation}
                                            </p>
                                        )}

                                        {item.examples.length > 0 && (
                                            <div className="space-y-1.5">
                                                {item.examples.map((ex, exIdx) => (
                                                    <div key={exIdx} className="flex items-start gap-2 text-sm">
                                                        <i className="fa-solid fa-quote-left text-[10px] text-secondary-400 mt-1.5 flex-shrink-0"></i>
                                                        <p className="text-text-secondary italic leading-relaxed">{ex}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===== LIST TAB ===== */}
            {activeTab === 'list' && (
                <div className="space-y-4">
                    {/* Search & Actions */}
                    <div className="glass rounded-2xl shadow-card p-5 space-y-4">
                        <div className="relative">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm từ vựng..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none transition-all text-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-text-secondary">
                                <span className="font-bold text-primary-600">{filteredVocabs.length}</span> từ vựng
                                {searchQuery && ` cho "${searchQuery}"`}
                            </p>
                            <div className="flex gap-2">
                                {searchQuery && filteredVocabs.length > 0 && (
                                    <button
                                        onClick={handleStartReviewFiltered}
                                        className="px-4 py-2 text-xs font-semibold text-secondary-700 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                        <i className="fa-solid fa-filter"></i>
                                        <span>Ôn lọc ({filteredVocabs.length})</span>
                                    </button>
                                )}
                                {savedVocabs.length > 0 && (
                                    <button
                                        onClick={handleStartReviewAll}
                                        className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 rounded-lg shadow-md shadow-primary-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                        <i className="fa-solid fa-bolt"></i>
                                        <span>Ôn tập tất cả</span>
                                    </button>
                                )}
                                <button
                                    onClick={loadSavedVocabs}
                                    className="px-3 py-2 text-xs font-semibold text-text-secondary bg-muted hover:bg-border rounded-lg transition-all cursor-pointer"
                                >
                                    <i className="fa-solid fa-rotate"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-20 glass rounded-2xl">
                            <i className="fa-solid fa-spinner fa-spin text-3xl text-primary-500 mb-4"></i>
                            <p className="text-text-secondary font-medium">Đang tải từ vựng...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredVocabs.length === 0 && (
                        <div className="text-center py-20 glass rounded-2xl border-2 border-dashed border-border">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-book-open text-2xl text-text-muted"></i>
                            </div>
                            <p className="text-text-secondary font-semibold mb-1">
                                {searchQuery ? 'Không tìm thấy từ phù hợp' : 'Chưa có từ vựng nào'}
                            </p>
                            <p className="text-sm text-text-muted mb-4">
                                {searchQuery ? 'Thử thay đổi từ khóa' : 'Thêm từ vựng từ bài reading để bắt đầu'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="text-primary-600 font-semibold text-sm hover:underline cursor-pointer"
                                >
                                    <i className="fa-solid fa-plus mr-1"></i>
                                    Thêm từ vựng đầu tiên
                                </button>
                            )}
                        </div>
                    )}

                    {/* Vocabulary Cards */}
                    {!isLoading && filteredVocabs.length > 0 && (
                        <div className="space-y-3">
                            {filteredVocabs.map((vocab) => {
                                const isExpanded = expandedCards.has(vocab.id || '');
                                return (
                                    <div
                                        key={vocab.id}
                                        className="glass rounded-xl overflow-hidden shadow-sm hover:shadow-card transition-all border border-transparent hover:border-primary-200"
                                    >
                                        {/* Header - always visible */}
                                        <button
                                            onClick={() => toggleExpandCard(vocab.id || '')}
                                            className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
                                        >
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-white font-bold text-sm font-outfit">
                                                    {vocab.term.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-bold text-text font-outfit truncate">{vocab.term}</h4>
                                                    {vocab.relatedStructure && (
                                                        <code className="text-[10px] font-mono text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded hidden sm:inline">
                                                            {vocab.relatedStructure}
                                                        </code>
                                                    )}
                                                </div>
                                                <p className="text-sm text-primary-600 font-semibold">{vocab.meaning}</p>
                                            </div>
                                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-text-muted text-sm transition-transform`}></i>
                                        </button>

                                        {/* Expanded content */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-border pt-3">
                                                {vocab.relatedStructure && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-accent-500 uppercase tracking-wider bg-accent-50 px-2 py-0.5 rounded">Cấu trúc</span>
                                                        <code className="text-sm font-mono text-text bg-muted px-2 py-0.5 rounded">{vocab.relatedStructure}</code>
                                                    </div>
                                                )}

                                                {vocab.explanation && (
                                                    <p className="text-sm text-text-secondary leading-relaxed pl-4 border-l-2 border-primary-200">
                                                        {vocab.explanation}
                                                    </p>
                                                )}

                                                {vocab.examples.length > 0 && (
                                                    <div className="space-y-1.5 bg-secondary-50/50 rounded-lg p-3">
                                                        <p className="text-[10px] font-bold text-secondary-600 uppercase tracking-wider mb-1">Ví dụ</p>
                                                        {vocab.examples.map((ex, exIdx) => (
                                                            <div key={exIdx} className="flex items-start gap-2 text-sm">
                                                                <i className="fa-solid fa-quote-left text-[10px] text-secondary-400 mt-1.5 flex-shrink-0"></i>
                                                                <p className="text-text-secondary italic leading-relaxed">{ex}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-[10px] text-text-muted">
                                                        {new Date(vocab.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(vocab.id || ''); }}
                                                        className="text-xs text-text-muted hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                        <span>Xóa</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReadingVocabPage;
