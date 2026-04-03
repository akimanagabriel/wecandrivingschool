import { useCallback, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, Mic, MicOff, Plus, Square, Trash2, Upload, X, 
    Check, FileAudio, AlertCircle, Save, Ban
} from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { WeCanPageProps } from '@/types/wecan';

type Category = { id: number; name: string };

type QuestionOption = {
    id?: number;
    option_text: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    category_id: number;
    question_text: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation: string | null;
    explanation_audio_path: string | null;
    is_active: boolean;
    options: QuestionOption[];
};

type Props = WeCanPageProps<{
    question?: Question;
    categories: Category[];
}>;

type FormData = {
    category_id: string;
    question_text: string;
    difficulty: string;
    explanation: string;
    explanation_audio: File | null;
    remove_audio: boolean;
    is_active: boolean;
    options: QuestionOption[];
};

export default function QuestionForm({ question, categories }: Props) {
    const isEditing = !!question;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin',     href: '/admin' },
        { title: 'Questions', href: '/admin/questions' },
        { title: isEditing ? 'Edit Question' : 'New Question', href: '#' },
    ];

    const defaultOptions: QuestionOption[] = [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
    ];

    const { data, setData, post, processing, errors } = useForm<FormData>({
        category_id:       String(question?.category_id ?? ''),
        question_text:     question?.question_text ?? '',
        difficulty:        question?.difficulty ?? 'medium',
        explanation:       question?.explanation ?? '',
        explanation_audio: null,
        remove_audio:      false,
        is_active:         question?.is_active ?? true,
        options:           question?.options?.length ? question.options : defaultOptions,
    });

    // ── Audio recorder state ────────────────────────────────────────────────────
    type AudioTab = 'upload' | 'record';
    const [audioTab, setAudioTab]           = useState<AudioTab>('upload');
    const [isRecording, setIsRecording]     = useState(false);
    const [recordedUrl, setRecordedUrl]     = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [dragActive, setDragActive]       = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef        = useRef<Blob[]>([]);
    const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            recorder.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], 'explanation_audio.webm', { type: 'audio/webm' });
                const url  = URL.createObjectURL(blob);
                setRecordedUrl(url);
                setData('explanation_audio', file);
                setData('remove_audio', false);
            };
            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
        } catch {
            alert('Microphone access was denied. Please allow it in your browser settings.');
        }
    }, [setData]);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const discardRecording = useCallback(() => {
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        setRecordedUrl(null);
        setData('explanation_audio', null);
    }, [recordedUrl, setData]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('explanation_audio', e.dataTransfer.files[0]);
        }
    };

    const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            post(`/admin/questions/${question.id}`, {
                forceFormData: true,
                headers: { 'X-HTTP-Method-Override': 'PUT' },
            });
        } else {
            post('/admin/questions', { forceFormData: true });
        }
    };

    const updateOption = (i: number, field: keyof QuestionOption, value: string | boolean) => {
        const opts = [...data.options];
        if (field === 'is_correct') {
            opts.forEach((_, idx) => { opts[idx] = { ...opts[idx], is_correct: idx === i }; });
        } else {
            opts[i] = { ...opts[i], [field]: value };
        }
        setData('options', opts);
    };

    const addOption    = () => setData('options', [...data.options, { option_text: '', is_correct: false }]);
    const removeOption = (i: number) => {
        if (data.options.length <= 2) return;
        setData('options', data.options.filter((_, idx) => idx !== i));
    };

    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Question' : 'Add Question'} />
            <div className="mx-auto max-w-2xl p-4 md:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/admin/questions')}
                            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Questions
                        </Button>
                        <Heading title={isEditing ? 'Edit Question' : 'New Question'} />
                    </div>
                </div>

                <Card className="border-muted/60 shadow-lg">
                    <CardContent className="p-8">
                        <form onSubmit={submit} className="space-y-8">
                            <div className="space-y-6">
                                {/* Basic Info Section */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category *</Label>
                                        <select
                                            id="category"
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            required
                                            className="w-full rounded-xl border-muted bg-background px-4 py-3 text-[15px] transition-all hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.category_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Difficulty</Label>
                                        <select
                                            value={data.difficulty}
                                            onChange={(e) => setData('difficulty', e.target.value)}
                                            className="w-full rounded-xl border-muted bg-background px-4 py-3 text-[15px] transition-all hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="question_text" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Question Content *</Label>
                                    <textarea
                                        id="question_text"
                                        rows={4}
                                        value={data.question_text}
                                        onChange={(e) => setData('question_text', e.target.value)}
                                        required
                                        placeholder="Type the question as it should appear to students..."
                                        className="w-full resize-none rounded-xl border-muted bg-background px-4 py-4 text-[15px] leading-relaxed transition-all hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                    <InputError message={errors.question_text} />
                                </div>

                                <div className="flex items-center gap-3 space-y-0 rounded-xl bg-muted/30 p-4 border border-muted/50">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-5 w-5 rounded-md border-muted text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="is_active" className="cursor-pointer font-bold block">Active Status</Label>
                                        <p className="text-xs text-muted-foreground">When active, this question will appear in randomized quizzes.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="explanation" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Text Explanation (Optional)</Label>
                                    <textarea
                                        id="explanation"
                                        rows={2}
                                        value={data.explanation}
                                        onChange={(e) => setData('explanation', e.target.value)}
                                        placeholder="Provide context for the correct answer..."
                                        className="w-full resize-none rounded-xl border-muted bg-background px-4 py-3 text-[15px] transition-all hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Audio Explanation Section */}
                                <div className="space-y-3 rounded-2xl border border-dashed border-muted/80 bg-muted/10 p-6">
                                    <Label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                        <Mic className="h-4 w-4" /> Audio Explanation
                                    </Label>
                                    
                                    {/* Existing audio banner */}
                                    {isEditing && question.explanation_audio_path && !data.remove_audio && !data.explanation_audio && (
                                        <div className="flex items-center gap-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-300">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-200 dark:bg-violet-900/50">
                                                <FileAudio className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black uppercase tracking-widest text-violet-600">Existing Recording</p>
                                                <p className="text-sm font-medium">Original audio is saved</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-violet-600 hover:bg-red-100 hover:text-red-600 rounded-lg"
                                                onClick={() => { setData('remove_audio', true); discardRecording(); }}
                                                title="Remove existing audio"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}

                                    {(!isEditing || !question.explanation_audio_path || data.remove_audio || data.explanation_audio) && (
                                        <div className="space-y-4">
                                            <div className="inline-flex rounded-xl bg-muted/60 p-1">
                                                {(['upload', 'record'] as AudioTab[]).map((tab) => (
                                                    <button
                                                        key={tab}
                                                        type="button"
                                                        onClick={() => { 
                                                            setAudioTab(tab); 
                                                            if (tab==='upload') discardRecording();
                                                            else setData('explanation_audio', null);
                                                        }}
                                                        className={cn(
                                                            'rounded-lg px-6 py-2 text-xs font-black uppercase tracking-widest transition-all',
                                                            audioTab === tab
                                                                ? 'bg-background shadow-md text-foreground'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        )}
                                                    >
                                                        {tab === 'upload' ? <><Upload className="mr-2 h-3 w-3 inline" /> Upload</> : <><Mic className="mr-2 h-3 w-3 inline" /> Record</>}
                                                    </button>
                                                ))}
                                            </div>

                                            {audioTab === 'upload' && (
                                                <div 
                                                    onDragEnter={handleDrag} 
                                                    onDragLeave={handleDrag} 
                                                    onDragOver={handleDrag} 
                                                    onDrop={handleDrop}
                                                    className={cn(
                                                        "relative flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all",
                                                        dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30",
                                                        data.explanation_audio && "border-green-400 bg-green-50/50"
                                                    )}
                                                >
                                                    {data.explanation_audio ? (
                                                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                                <Check className="h-6 w-6" />
                                                            </div>
                                                            <span className="text-sm font-bold text-green-700">{data.explanation_audio.name}</span>
                                                            <Button 
                                                                type="button" 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="text-red-500 hover:bg-red-50"
                                                                onClick={() => setData('explanation_audio', null)}
                                                            >
                                                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="mb-2 h-8 w-8 text-muted-foreground opacity-30" />
                                                            <p className="text-sm font-bold text-muted-foreground">Drag file here or click below</p>
                                                            <input
                                                                id="explanation_audio"
                                                                type="file"
                                                                accept="audio/*"
                                                                onChange={(e) => setData('explanation_audio', e.target.files?.[0] ?? null)}
                                                                className="absolute inset-0 cursor-pointer opacity-0"
                                                            />
                                                            <Button type="button" variant="link" className="mt-1 h-auto py-0 font-black uppercase text-[10px] tracking-widest hover:text-primary">Browse Files</Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {audioTab === 'record' && (
                                                <div className="flex flex-col items-center justify-center rounded-2xl bg-background/50 p-6 border border-muted/40 shadow-inner">
                                                    {!recordedUrl ? (
                                                        <div className="flex flex-col items-center gap-4">
                                                            {isRecording ? (
                                                                <div className="flex flex-col items-center gap-6">
                                                                    <div className="flex items-center justify-center gap-1 h-12">
                                                                        {[...Array(6)].map((_, i) => (
                                                                            <div key={i} className="w-1.5 bg-red-500 rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s`, height: `${30 + Math.random() * 70}%` }} />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-3xl font-black tabular-nums text-red-500">{fmtTime(recordingTime)}</span>
                                                                    <Button
                                                                        type="button"
                                                                        className="h-14 px-8 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg shadow-black/10"
                                                                        onClick={stopRecording}
                                                                    >
                                                                        <Square className="mr-2 h-5 w-5 fill-current" /> Stop Recording
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-4 text-center">
                                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 shadow-inner group transition-transform active:scale-95">
                                                                        <Mic className="h-8 w-8" />
                                                                    </div>
                                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mic Access Required</p>
                                                                    <Button
                                                                        type="button"
                                                                        className="h-12 px-8 rounded-2xl bg-red-600 hover:bg-red-700 font-bold shadow-lg shadow-red-200 dark:shadow-none"
                                                                        onClick={startRecording}
                                                                    >
                                                                        Start Live Recording
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full space-y-4 text-center">
                                                            <div className="flex justify-center flex-col items-center gap-1">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                                                                    <MicOff className="h-5 w-5" />
                                                                </div>
                                                                <span className="text-xs font-black uppercase tracking-widest text-green-600">Recording Finished ({fmtTime(recordingTime)})</span>
                                                            </div>
                                                            <audio controls src={recordedUrl} className="h-10 w-full rounded-xl" />
                                                            <Button 
                                                                type="button" 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="font-black uppercase text-[10px] tracking-widest border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                                                                onClick={discardRecording}
                                                            >
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Discard & Re-record
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <InputError message={errors.explanation_audio as string} />
                                </div>

                                {/* Options Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Answer Options *</Label>
                                        <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase py-0">{`${data.options.length}/6`}</Badge>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {data.options.map((opt, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'relative flex items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-all duration-300',
                                                    opt.is_correct
                                                        ? 'border-green-400 bg-green-50 shadow-md scale-[1.01] dark:bg-green-950/20'
                                                        : 'border-muted bg-background hover:border-primary/20'
                                                )}
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="radio"
                                                        name="correct_option"
                                                        checked={opt.is_correct}
                                                        onChange={() => updateOption(i, 'is_correct', true)}
                                                        className="h-6 w-6 cursor-pointer opacity-0 z-10 relative"
                                                    />
                                                    <div className={cn(
                                                        "absolute inset-0 flex items-center justify-center rounded-full border-2 transition-all",
                                                        opt.is_correct ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground/30"
                                                    )}>
                                                        {opt.is_correct ? <Check className="h-3.5 w-3.5 stroke-[3px]" /> : <span className="text-[10px] font-black">{labels[i]}</span>}
                                                    </div>
                                                </div>
                                                
                                                <input
                                                    type="text"
                                                    value={opt.option_text}
                                                    onChange={(e) => updateOption(i, 'option_text', e.target.value)}
                                                    placeholder={`Enter option ${labels[i]} here...`}
                                                    required
                                                    className="min-w-0 flex-1 bg-transparent font-medium text-[15px] outline-none placeholder:text-muted-foreground/50 transition-all focus:text-primary"
                                                />
                                                
                                                {data.options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(i)}
                                                        className={cn(
                                                            "rounded-lg p-2 transition-colors",
                                                            opt.is_correct ? "text-green-800/40 hover:bg-red-100 hover:text-red-600" : "text-muted-foreground hover:bg-red-50 hover:text-red-500"
                                                        )}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={errors.options as string} />
                                    
                                    {data.options.length < 6 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-12 border-dashed border-primary/30 text-primary hover:bg-primary/5 rounded-2xl group transition-all"
                                            onClick={addOption}
                                        >
                                            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" /> 
                                            <span className="font-bold uppercase tracking-widest text-[11px]">Add Another Option</span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Fixed-style Actions */}
                            <div className="flex items-center gap-4 pt-8 border-t border-muted/60">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="flex-1 rounded-2xl font-bold uppercase tracking-widest text-[11px]"
                                    onClick={() => router.visit('/admin/questions')}
                                >
                                    <Ban className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className="flex-1 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                                    disabled={processing}
                                >
                                    {processing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Save className="mr-2 h-4 w-4" /> {isEditing ? 'Save Changes' : 'Create Question'}</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            
            <style>{`
                @keyframes wave {
                    0%, 100% { height: 30%; }
                    50% { height: 100%; }
                }
                .animate-wave {
                    animation: wave 0.8s ease-in-out infinite;
                }
            `}</style>
        </AppLayout>
    );
}
