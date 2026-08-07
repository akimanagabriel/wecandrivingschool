import { useCallback, useRef, useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Mic,
    MicOff,
    Plus,
    Square,
    Trash2,
    Upload,
    X,
    Check,
    FileAudio,
    AlertCircle,
    Save,
    Ban,
    ImageIcon,
} from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import AudioPlayer from '@/components/audio-player';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { WeCanPageProps } from '@/types/wecan';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Category = { id: number; name: string };

type QuestionOption = {
    id?: number;
    option_text: string;
    is_correct: boolean;
    image_path?: string | null;
    image?: File | null;
    remove_image?: boolean;
    preview_url?: string | null; // <-- Added for better preview management
};

type Question = {
    id: number;
    category_id: number;
    question_text: string;
    image_path: string | null;
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
    image: File | null;
    remove_image: boolean;
    explanation_audio: File | null;
    remove_audio: boolean;
    is_active: boolean;
    options: QuestionOption[];
};

export default function QuestionForm({ question, categories }: Props) {
    const isEditing = !!question;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Questions', href: '/admin/questions' },
        { title: isEditing ? 'Edit Question' : 'New Question', href: '#' },
    ];

    const defaultOptions: QuestionOption[] = [
        {
            option_text: '',
            is_correct: false,
            image_path: null,
            image: null,
            remove_image: false,
            preview_url: null,
        },
        {
            option_text: '',
            is_correct: false,
            image_path: null,
            image: null,
            remove_image: false,
            preview_url: null,
        },
        {
            option_text: '',
            is_correct: false,
            image_path: null,
            image: null,
            remove_image: false,
            preview_url: null,
        },
        {
            option_text: '',
            is_correct: false,
            image_path: null,
            image: null,
            remove_image: false,
            preview_url: null,
        },
    ];

    const { data, setData, post, processing, errors } = useForm<FormData>({
        category_id: String(question?.category_id ?? ''),
        question_text: question?.question_text ?? '',
        difficulty: question?.difficulty ?? 'medium',
        explanation: question?.explanation ?? '',
        image: null,
        remove_image: false,
        explanation_audio: null,
        remove_audio: false,
        is_active: question?.is_active ?? true,
        options: question?.options?.length
            ? question.options.map((opt) => ({
                  ...opt,
                  image: null,
                  remove_image: false,
                  preview_url: opt.image_path
                      ? `/storage/${opt.image_path}`
                      : null,
              }))
            : defaultOptions,
    });

    // ── Cleanup object URLs on unmount ────────────────────────────────────────
    useEffect(() => {
        return () => {
            // Revoke any object URLs when component unmounts
            data.options.forEach((opt) => {
                if (opt.preview_url?.startsWith('blob:')) {
                    URL.revokeObjectURL(opt.preview_url);
                }
            });
            if (data.image) {
                URL.revokeObjectURL(URL.createObjectURL(data.image));
            }
        };
    }, []);

    // ── Audio recorder state ────────────────────────────────────────────────────
    type AudioTab = 'upload' | 'record';
    const [audioTab, setAudioTab] = useState<AudioTab>('upload');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Question image preview ──────────────────────────────────────────────────
    const questionImagePreview = data.image
        ? URL.createObjectURL(data.image)
        : data.remove_image
          ? null
          : question?.image_path
            ? `/storage/${question.image_path}`
            : null;

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, {
                    type: 'audio/webm',
                });
                const file = new File([blob], 'explanation_audio.webm', {
                    type: 'audio/webm',
                });
                const url = URL.createObjectURL(blob);
                setRecordedUrl(url);
                setData('explanation_audio', file);
                setData('remove_audio', false);
            };
            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(
                () => setRecordingTime((t) => t + 1),
                1000,
            );
        } catch {
            alert(
                'Microphone access was denied. Please allow it in your browser settings.',
            );
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
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
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

    const fmtTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clean up preview URLs before submit
        const cleanOptions = data.options.map((opt) => {
            const { preview_url, ...rest } = opt;
            return rest;
        });

        // We need to use the original data with files for FormData
        if (isEditing) {
            post(`/admin/questions/${question.id}`, {
                forceFormData: true,
                headers: { 'X-HTTP-Method-Override': 'PUT' },
            });
        } else {
            post('/admin/questions', { forceFormData: true });
        }
    };

    const updateOption = (
        i: number,
        field: keyof QuestionOption,
        value: string | boolean | File | null,
    ) => {
        const opts = [...data.options];

        if (field === 'is_correct') {
            opts.forEach((_, idx) => {
                opts[idx] = { ...opts[idx], is_correct: idx === i };
            });
        } else if (field === 'image') {
            // When setting a new image, create a preview URL
            const file = value as File | null;
            // Revoke old preview URL if it exists and is a blob
            if (opts[i].preview_url?.startsWith('blob:')) {
                URL.revokeObjectURL(opts[i].preview_url!);
            }
            opts[i] = {
                ...opts[i],
                image: file,
                preview_url: file ? URL.createObjectURL(file) : null,
                remove_image: false,
            };
        } else if (field === 'remove_image') {
            // When removing an image, clear the preview
            if (opts[i].preview_url?.startsWith('blob:')) {
                URL.revokeObjectURL(opts[i].preview_url!);
            }
            opts[i] = {
                ...opts[i],
                remove_image: value as boolean,
                preview_url: value ? null : opts[i].preview_url,
            };
        } else {
            opts[i] = { ...opts[i], [field]: value };
        }
        setData('options', opts);
    };

    const addOption = () =>
        setData('options', [
            ...data.options,
            {
                option_text: '',
                is_correct: false,
                image_path: null,
                image: null,
                remove_image: false,
                preview_url: null,
            },
        ]);

    const removeOption = (i: number) => {
        if (data.options.length <= 2) return;
        // Clean up preview URL before removing
        if (data.options[i].preview_url?.startsWith('blob:')) {
            URL.revokeObjectURL(data.options[i].preview_url!);
        }
        setData(
            'options',
            data.options.filter((_, idx) => idx !== i),
        );
    };

    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Question' : 'Add Question'} />
            <div className="p-4 md:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/admin/questions')}
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to
                            Questions
                        </Button>
                        <Heading
                            title={isEditing ? 'Edit Question' : 'New Question'}
                        />
                    </div>
                </div>

                <Card className="border-muted/60 shadow-lg">
                    <CardContent className="p-8">
                        <form onSubmit={submit} className="space-y-8">
                            <div className="space-y-6">
                                {/* Basic Info Section */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="category"
                                            className="text-sm font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            Category *
                                        </Label>
                                        <Select
                                            value={data.category_id}
                                            onValueChange={(value) =>
                                                setData('category_id', value)
                                            }
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.id.toString()}
                                                    >
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.category_id}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                            Difficulty
                                        </Label>
                                        <Select
                                            value={data.difficulty}
                                            onValueChange={(value) =>
                                                setData('difficulty', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a difficulty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="easy">
                                                    Easy
                                                </SelectItem>
                                                <SelectItem value="medium">
                                                    Medium
                                                </SelectItem>
                                                <SelectItem value="hard">
                                                    Hard
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="question_text"
                                        className="text-sm font-bold tracking-wider text-muted-foreground uppercase"
                                    >
                                        Question Content *
                                    </Label>
                                    <Textarea
                                        id="question_text"
                                        rows={4}
                                        value={data.question_text}
                                        onChange={(e) =>
                                            setData(
                                                'question_text',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        placeholder="Type the question as it should appear to students..."
                                    />
                                    <InputError
                                        message={errors.question_text}
                                    />
                                </div>

                                {/* ─── Question Image Section ─── */}
                                <div className="space-y-3 rounded-2xl border border-dashed border-muted/80 bg-muted/10 p-6">
                                    <Label className="flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                        <ImageIcon className="h-4 w-4" />{' '}
                                        Question Image (Optional)
                                    </Label>
                                    <p className="-mt-1 text-xs text-muted-foreground">
                                        Add a road sign, diagram, or any image
                                        related to this question.
                                    </p>

                                    {/* Existing image banner */}
                                    {isEditing &&
                                        question.image_path &&
                                        !data.remove_image &&
                                        !data.image && (
                                            <div className="flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                                                <img
                                                    src={`/storage/${question.image_path}`}
                                                    alt="Question image"
                                                    className="h-24 w-auto rounded-lg border border-blue-200 bg-white object-contain"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-1 text-xs font-black tracking-widest text-blue-600 uppercase">
                                                        Current Image
                                                    </p>
                                                    <p className="truncate text-xs text-blue-500">
                                                        {question.image_path
                                                            .split('/')
                                                            .pop()}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 rounded-lg text-blue-600 hover:bg-red-100 hover:text-red-600"
                                                    onClick={() =>
                                                        setData(
                                                            'remove_image',
                                                            true,
                                                        )
                                                    }
                                                    title="Remove existing image"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                    {/* Image upload zone */}
                                    {(!isEditing ||
                                        !question.image_path ||
                                        data.remove_image ||
                                        data.image) && (
                                        <div className="space-y-4">
                                            <div
                                                className={cn(
                                                    'relative flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all',
                                                    data.image
                                                        ? 'border-blue-400 bg-blue-50/50'
                                                        : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30',
                                                )}
                                            >
                                                {data.image ? (
                                                    <div className="flex w-full flex-col items-center gap-3 p-4 text-center">
                                                        <img
                                                            src={
                                                                questionImagePreview ||
                                                                undefined
                                                            }
                                                            alt="Preview"
                                                            className="max-h-40 w-auto rounded-lg border border-muted object-contain shadow-sm"
                                                        />
                                                        <span className="text-xs font-bold text-blue-700">
                                                            {data.image.name}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:bg-red-50"
                                                            onClick={() => {
                                                                setData(
                                                                    'image',
                                                                    null,
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="mr-1 h-3.5 w-3.5" />{' '}
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground opacity-30" />
                                                        <p className="text-sm font-bold text-muted-foreground">
                                                            Click to upload an
                                                            image
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground/60">
                                                            PNG, JPG, GIF, WebP
                                                            — max 5 MB
                                                        </p>
                                                        <input
                                                            id="question_image"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) =>
                                                                setData(
                                                                    'image',
                                                                    e.target
                                                                        .files?.[0] ??
                                                                        null,
                                                                )
                                                            }
                                                            className="absolute inset-0 cursor-pointer opacity-0"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="link"
                                                            className="mt-1 h-auto py-0 text-[10px] font-black tracking-widest uppercase hover:text-primary"
                                                        >
                                                            Browse Files
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <InputError
                                        message={errors.image as string}
                                    />
                                </div>

                                <div className="flex items-center gap-3 space-y-0 rounded-xl border border-muted/50 bg-muted/30 p-4">
                                    <Input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) =>
                                            setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-5 w-5 rounded-md border-muted text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <Label
                                            htmlFor="is_active"
                                            className="block cursor-pointer font-bold"
                                        >
                                            Active Status
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            When active, this question will
                                            appear in randomized quizzes.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="explanation"
                                        className="text-sm font-bold tracking-wider text-muted-foreground uppercase"
                                    >
                                        Text Explanation (Optional)
                                    </Label>
                                    <Textarea
                                        id="explanation"
                                        rows={2}
                                        value={data.explanation}
                                        onChange={(e) =>
                                            setData(
                                                'explanation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Provide context for the correct answer..."
                                    />
                                </div>

                                {/* Audio Explanation Section - unchanged */}
                                <div className="space-y-3 rounded-2xl border border-dashed border-muted/80 bg-muted/10 p-6">
                                    <Label className="flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                        <Mic className="h-4 w-4" /> Audio
                                        Explanation
                                    </Label>

                                    {/* Existing audio banner */}
                                    {isEditing &&
                                        question.explanation_audio_path &&
                                        !data.remove_audio &&
                                        !data.explanation_audio && (
                                            <div className="flex items-center gap-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-300">
                                                <div className="flex-1">
                                                    <p className="text-xs font-black tracking-widest text-violet-600 uppercase">
                                                        Existing Recording
                                                    </p>
                                                    <AudioPlayer
                                                        url={`/storage/${question.explanation_audio_path}`}
                                                        className="mt-2 border-none bg-transparent p-0 shadow-none"
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-violet-600 hover:bg-red-100 hover:text-red-600"
                                                    onClick={() => {
                                                        setData(
                                                            'remove_audio',
                                                            true,
                                                        );
                                                        discardRecording();
                                                    }}
                                                    title="Remove existing audio"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                    {(!isEditing ||
                                        !question.explanation_audio_path ||
                                        data.remove_audio ||
                                        data.explanation_audio) && (
                                        <div className="space-y-4">
                                            <div className="inline-flex rounded-xl bg-muted/60 p-1">
                                                {(
                                                    [
                                                        'upload',
                                                        'record',
                                                    ] as AudioTab[]
                                                ).map((tab) => (
                                                    <button
                                                        key={tab}
                                                        type="button"
                                                        onClick={() => {
                                                            setAudioTab(tab);
                                                            if (
                                                                tab === 'upload'
                                                            )
                                                                discardRecording();
                                                            else
                                                                setData(
                                                                    'explanation_audio',
                                                                    null,
                                                                );
                                                        }}
                                                        className={cn(
                                                            'rounded-lg px-6 py-2 text-xs font-black tracking-widest uppercase transition-all',
                                                            audioTab === tab
                                                                ? 'bg-background text-foreground shadow-md'
                                                                : 'text-muted-foreground hover:text-foreground',
                                                        )}
                                                    >
                                                        {tab === 'upload' ? (
                                                            <>
                                                                <Upload className="mr-2 inline h-3 w-3" />{' '}
                                                                Upload
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mic className="mr-2 inline h-3 w-3" />{' '}
                                                                Record
                                                            </>
                                                        )}
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
                                                        'relative flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all',
                                                        dragActive
                                                            ? 'scale-[1.01] border-primary bg-primary/5'
                                                            : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30',
                                                        data.explanation_audio &&
                                                            'border-green-400 bg-green-50/50',
                                                    )}
                                                >
                                                    {data.explanation_audio ? (
                                                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                                <Check className="h-6 w-6" />
                                                            </div>
                                                            <span className="text-sm font-bold text-green-700">
                                                                {
                                                                    data
                                                                        .explanation_audio
                                                                        .name
                                                                }
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:bg-red-50"
                                                                onClick={() =>
                                                                    setData(
                                                                        'explanation_audio',
                                                                        null,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-1 h-3.5 w-3.5" />{' '}
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="mb-2 h-8 w-8 text-muted-foreground opacity-30" />
                                                            <p className="text-sm font-bold text-muted-foreground">
                                                                Drag file here
                                                                or click below
                                                            </p>
                                                            <input
                                                                id="explanation_audio"
                                                                type="file"
                                                                accept="audio/*"
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'explanation_audio',
                                                                        e.target
                                                                            .files?.[0] ??
                                                                            null,
                                                                    )
                                                                }
                                                                className="absolute inset-0 cursor-pointer opacity-0"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="link"
                                                                className="mt-1 h-auto py-0 text-[10px] font-black tracking-widest uppercase hover:text-primary"
                                                            >
                                                                Browse Files
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {audioTab === 'record' && (
                                                <div className="flex flex-col items-center justify-center rounded-2xl border border-muted/40 bg-background/50 p-6 shadow-inner">
                                                    {!recordedUrl ? (
                                                        <div className="flex flex-col items-center gap-4">
                                                            {isRecording ? (
                                                                <div className="flex flex-col items-center gap-6">
                                                                    <div className="flex h-12 items-center justify-center gap-1">
                                                                        {[
                                                                            ...Array(
                                                                                6,
                                                                            ),
                                                                        ].map(
                                                                            (
                                                                                _,
                                                                                i,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    className="animate-wave w-1.5 rounded-full bg-red-500"
                                                                                    style={{
                                                                                        animationDelay: `${i * 0.1}s`,
                                                                                        height: `${30 + Math.random() * 70}%`,
                                                                                    }}
                                                                                />
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                    <span className="text-3xl font-black text-red-500 tabular-nums">
                                                                        {fmtTime(
                                                                            recordingTime,
                                                                        )}
                                                                    </span>
                                                                    <Button
                                                                        type="button"
                                                                        className="h-14 rounded-2xl bg-foreground px-8 font-bold text-background shadow-lg shadow-black/10 hover:bg-foreground/90"
                                                                        onClick={
                                                                            stopRecording
                                                                        }
                                                                    >
                                                                        <Square className="mr-2 h-5 w-5 fill-current" />{' '}
                                                                        Stop
                                                                        Recording
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-4 text-center">
                                                                    <div className="group flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 shadow-inner transition-transform active:scale-95">
                                                                        <Mic className="h-8 w-8" />
                                                                    </div>
                                                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                                                        Mic
                                                                        Access
                                                                        Required
                                                                    </p>
                                                                    <Button
                                                                        type="button"
                                                                        className="h-12 rounded-2xl bg-red-600 px-8 font-bold shadow-lg shadow-red-200 hover:bg-red-700 dark:shadow-none"
                                                                        onClick={
                                                                            startRecording
                                                                        }
                                                                    >
                                                                        Start
                                                                        Live
                                                                        Recording
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full space-y-4 text-center">
                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                                                                    <MicOff className="h-5 w-5" />
                                                                </div>
                                                                <span className="text-xs font-black tracking-widest text-green-600 uppercase">
                                                                    Recording
                                                                    Finished (
                                                                    {fmtTime(
                                                                        recordingTime,
                                                                    )}
                                                                    )
                                                                </span>
                                                            </div>
                                                            <AudioPlayer
                                                                url={
                                                                    recordedUrl
                                                                }
                                                                className="mt-2"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-lg border-red-200 text-[10px] font-black tracking-widest text-red-600 uppercase hover:bg-red-50"
                                                                onClick={
                                                                    discardRecording
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" />{' '}
                                                                Discard &
                                                                Re-record
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <InputError
                                        message={
                                            errors.explanation_audio as string
                                        }
                                    />
                                </div>

                                {/* ─── Options Section with Image Support ─── */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                            Answer Options *
                                        </Label>
                                        <Badge
                                            variant="outline"
                                            className="py-0 text-[10px] font-black tracking-widest uppercase"
                                        >{`${data.options.length}/6`}</Badge>
                                    </div>

                                    <div className="space-y-3">
                                        {data.options.map((opt, i) => {
                                            // Use the preview_url which already has the correct path
                                            const previewImage =
                                                opt.preview_url;

                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        'relative flex flex-col gap-3 rounded-2xl border-2 px-5 py-4 transition-all duration-300',
                                                        opt.is_correct
                                                            ? 'scale-[1.01] border-green-400 bg-green-50 shadow-md dark:bg-green-950/20'
                                                            : 'border-muted bg-background hover:border-primary/20',
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <input
                                                                type="radio"
                                                                name="correct_option"
                                                                checked={
                                                                    opt.is_correct
                                                                }
                                                                onChange={() =>
                                                                    updateOption(
                                                                        i,
                                                                        'is_correct',
                                                                        true,
                                                                    )
                                                                }
                                                                className="relative z-10 h-6 w-6 cursor-pointer opacity-0"
                                                            />
                                                            <div
                                                                className={cn(
                                                                    'absolute inset-0 flex items-center justify-center rounded-full border-2 transition-all',
                                                                    opt.is_correct
                                                                        ? 'border-green-600 bg-green-600 text-white'
                                                                        : 'border-muted-foreground/30',
                                                                )}
                                                            >
                                                                {opt.is_correct ? (
                                                                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                                                                ) : (
                                                                    <span className="text-[10px] font-black">
                                                                        {
                                                                            labels[
                                                                                i
                                                                            ]
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            value={
                                                                opt.option_text
                                                            }
                                                            onChange={(e) =>
                                                                updateOption(
                                                                    i,
                                                                    'option_text',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={`Enter option ${labels[i]} here...`}
                                                            required
                                                            className="min-w-0 flex-1 bg-transparent text-[15px] font-medium transition-all outline-none placeholder:text-muted-foreground/50 focus:text-primary"
                                                        />

                                                        {data.options.length >
                                                            2 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeOption(
                                                                        i,
                                                                    )
                                                                }
                                                                className={cn(
                                                                    'rounded-lg p-2 transition-colors',
                                                                    opt.is_correct
                                                                        ? 'text-green-800/40 hover:bg-red-100 hover:text-red-600'
                                                                        : 'text-muted-foreground hover:bg-red-50 hover:text-red-500',
                                                                )}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Option Image Upload */}
                                                    <div className="ml-10 flex items-center gap-3">
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const file =
                                                                        e.target
                                                                            .files?.[0] ||
                                                                        null;
                                                                    updateOption(
                                                                        i,
                                                                        'image',
                                                                        file,
                                                                    );
                                                                }}
                                                                className="absolute inset-0 cursor-pointer opacity-0"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-[10px] font-bold tracking-widest uppercase"
                                                            >
                                                                <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                                                                Add Image
                                                            </Button>
                                                        </div>

                                                        {/* Show preview if image exists */}
                                                        {previewImage && (
                                                            <div className="flex items-center gap-2">
                                                                <img
                                                                    src={
                                                                        previewImage
                                                                    }
                                                                    alt={`Option ${labels[i]}`}
                                                                    className="h-12 w-12 rounded-lg border border-muted bg-white object-contain"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                                                    onClick={() => {
                                                                        // If it's a new file, clear it
                                                                        if (
                                                                            opt.image
                                                                        ) {
                                                                            updateOption(
                                                                                i,
                                                                                'image',
                                                                                null,
                                                                            );
                                                                        }
                                                                        // If it's an existing image, mark for removal
                                                                        else if (
                                                                            opt.image_path
                                                                        ) {
                                                                            updateOption(
                                                                                i,
                                                                                'remove_image',
                                                                                true,
                                                                            );
                                                                        }
                                                                    }}
                                                                    title="Remove image"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Show if image is marked for removal */}
                                                        {opt.remove_image &&
                                                            opt.image_path && (
                                                                <span className="text-[10px] font-bold text-red-500 uppercase">
                                                                    (will be
                                                                    removed)
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <InputError
                                        message={errors.options as string}
                                    />

                                    {data.options.length < 6 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="group h-12 w-full rounded-2xl border-dashed border-primary/30 text-primary transition-all hover:bg-primary/5"
                                            onClick={addOption}
                                        >
                                            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                                            <span className="text-[11px] font-bold tracking-widest uppercase">
                                                Add Another Option
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Fixed-style Actions */}
                            <div className="flex items-center gap-4 border-t border-muted/60 pt-8">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="flex-1 rounded-2xl text-[11px] font-bold tracking-widest uppercase"
                                    onClick={() =>
                                        router.visit('/admin/questions')
                                    }
                                >
                                    <Ban className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="flex-1 rounded-2xl text-[11px] font-bold tracking-widest uppercase shadow-lg shadow-primary/20"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />{' '}
                                            {isEditing
                                                ? 'Save Changes'
                                                : 'Create Question'}
                                        </>
                                    )}
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
