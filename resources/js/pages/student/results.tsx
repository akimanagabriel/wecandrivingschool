import { useState, useRef, useEffect, memo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle, CheckCircle, ChevronDown, ChevronUp,
    Clock, Home, Mic, RotateCcw, Trophy, Volume2, XCircle,
    Play, Pause, FastForward, Rewind, Lightbulb, Ban
} from 'lucide-react';
import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { AnswerReview, QuizResultAttempt, WeCanPageProps } from '@/types/wecan';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/student/dashboard' },
    { title: 'Results',   href: '#' },
];

type Props = WeCanPageProps<{
    attempt: QuizResultAttempt;
    answers:  AnswerReview[];
}>;

type FilterType = 'all' | 'correct' | 'incorrect';

// ── Custom Audio Player Component ──────────────────────────────────────────
const CustomAudioPlayer = memo(({ url }: { url: string }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const onTimeUpdate = () => {
        if (!audioRef.current) return;
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    };

    const onLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
    };

    const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const seekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
        audioRef.current.currentTime = seekTime;
        setProgress(parseFloat(e.target.value));
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-2 rounded-xl bg-violet-50 p-4 shadow-inner dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40">
            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onEnded}
                preload="none"
            />
            <div className="flex items-center gap-3">
                <button
                    onClick={togglePlay}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-md transition hover:bg-violet-700 hover:scale-105 active:scale-95"
                >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                </button>
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                        <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-violet-200 accent-violet-600 dark:bg-violet-800"
                    />
                </div>
            </div>
        </div>
    );
});
CustomAudioPlayer.displayName = 'CustomAudioPlayer';

export default function Results({ attempt, answers }: Props) {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [filter, setFilter]     = useState<FilterType>('all');

    const isPassed  = attempt.is_passed;
    const filtered  = answers.filter((a) =>
        filter === 'all' ? true : filter === 'correct' ? a.is_correct : !a.is_correct,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quiz Results" />
            <div className="mx-auto flex max-w-4xl flex-col gap-8 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <Heading title="Your Performance" />
                    <Badge variant={isPassed ? 'secondary' : 'destructive'} className="text-sm px-4 py-1">
                        Attempt #{attempt.id}
                    </Badge>
                </div>

                {/* Timeout banner */}
                {attempt.is_timed_out && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <Clock className="h-4 w-4" />
                        <AlertDescription className="font-medium">
                            Timer Expired: This quiz was automatically submitted when the 20-minute limit was reached.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Master Score Card — Premium Glassmorphism Design */}
                <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl transition-all duration-500">
                    {/* Dynamic Background Gradients */}
                    <div className={cn(
                        "absolute inset-0 -z-10 opacity-10 blur-3xl",
                        isPassed ? "bg-linear-to-br from-green-400 to-emerald-600" : "bg-linear-to-br from-red-400 to-rose-600"
                    )} />
                    
                    <Card className={cn(
                        'border-none bg-background/60 backdrop-blur-xl',
                        isPassed ? 'dark:bg-emerald-950/20' : 'dark:bg-rose-950/20'
                    )}>
                        <CardContent className="p-10 text-center">
                            <div className="mb-6 flex justify-center">
                                <div className={cn(
                                    "flex h-24 w-24 items-center justify-center rounded-3xl shadow-xl transition-transform duration-500 hover:rotate-12",
                                    isPassed ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40"
                                )}>
                                    {isPassed
                                        ? <Trophy className="h-14 w-14 text-yellow-500 drop-shadow-md" />
                                        : <AlertCircle className="h-14 w-14 text-red-500 drop-shadow-md" />
                                    }
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <p className={cn('text-7xl font-black tracking-tighter drop-shadow-sm', isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                    {attempt.score}%
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <h2 className={cn('text-2xl font-bold uppercase tracking-widest', isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                        {isPassed ? 'PASSED' : 'FAILED'}
                                    </h2>
                                </div>
                                <p className="text-muted-foreground font-medium">
                                    {isPassed 
                                        ? 'Amazing work! You\'ve demonstrated excellent knowledge of the rules.' 
                                        : 'Don\'t give up. Review your answers below and try again to improve.'}
                                </p>
                            </div>

                            <div className="mx-auto mt-10 grid max-w-sm grid-cols-3 gap-4">
                                <div className="rounded-2xl bg-green-50 p-4 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                                    <p className="text-3xl font-black text-green-600">{attempt.correct_answers}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-700/70 dark:text-green-400/70">Correct</p>
                                </div>
                                <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
                                    <p className="text-3xl font-black text-red-500">{attempt.incorrect_answers}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-700/70 dark:text-red-400/70">Wrong</p>
                                </div>
                                <div className="rounded-2xl bg-muted/50 p-4 border border-border/50">
                                    <p className="text-3xl font-black">{attempt.total_questions}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                                <Button 
                                    size="lg" 
                                    className="h-14 px-8 rounded-2xl shadow-lg transition-all hover:shadow-xl active:scale-95"
                                    onClick={() => router.post('/quiz/start')}
                                >
                                    <RotateCcw className="mr-2 h-5 w-5" /> Retake Quiz
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="h-14 px-8 rounded-2xl shadow-sm hover:bg-background/80"
                                    onClick={() => router.visit('/student/dashboard')}
                                >
                                    <Home className="mr-2 h-5 w-5" /> Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Answer review section */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            Detailed Breakdown
                        </h3>
                        
                        <div className="inline-flex rounded-xl bg-muted/50 p-1 backdrop-blur-sm border border-border/50">
                            {(['all', 'correct', 'incorrect'] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => { setFilter(f); setExpanded(null); }}
                                    className={cn(
                                        'rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all',
                                        filter === f
                                            ? 'bg-background shadow-md text-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Card className="overflow-hidden border-muted/60 shadow-sm">
                        <CardContent className="p-0">
                            <div className="divide-y divide-muted/60">
                                {filtered.map((ans, i) => (
                                    <div key={ans.question_id} className="group overflow-hidden transition-colors hover:bg-muted/5">
                                        <button
                                            className="flex w-full items-start gap-4 px-6 py-5 text-left transition-all"
                                            onClick={() => setExpanded(expanded === i ? null : i)}
                                        >
                                            <span className={cn(
                                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110",
                                                ans.is_correct ? "text-green-500" : "text-red-500"
                                            )}>
                                                {ans.is_correct ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[15px] font-semibold leading-relaxed group-hover:text-primary transition-colors">
                                                    {ans.question_text}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2 py-0 border-muted-foreground/20">
                                                        {ans.category}
                                                    </Badge>
                                                    {!ans.is_correct && ans.explanation_audio_url && (
                                                        <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 text-[10px] uppercase font-black tracking-widest px-2">
                                                            <Mic className="mr-1 h-3 w-3" /> Audio
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-1 flex flex-col items-center">
                                                {expanded === i
                                                    ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                    : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                }
                                            </div>
                                        </button>

                                        {/* Animated Disclosure Panel */}
                                        <div className={cn(
                                            "overflow-hidden transition-all duration-300 ease-in-out",
                                            expanded === i ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                        )}>
                                            <div className="mx-6 mb-6 mt-2 space-y-4 rounded-2xl bg-muted/40 p-6 border border-muted/50">
                                                <div className="grid gap-3">
                                                    {ans.all_options.map((opt, oi) => {
                                                        const isSel = opt.text === ans.selected_option;
                                                        const isCor = opt.is_correct;
                                                        return (
                                                            <div
                                                                key={oi}
                                                                className={cn(
                                                                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all shadow-sm',
                                                                    isCor            && 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300',
                                                                    isSel && !isCor  && 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
                                                                    !isCor && !isSel && 'border-muted/50 bg-background text-muted-foreground opacity-60',
                                                                )}
                                                            >
                                                                {isCor && <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />}
                                                                {isSel && !isCor && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                                                                {!isCor && !isSel && <div className="h-4 w-4 shrink-0" />}
                                                                
                                                                <span className="flex-1">{opt.text}</span>
                                                                
                                                                {isCor && <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-black uppercase">Correct</Badge>}
                                                                {isSel && !isCor && <Badge variant="destructive" className="text-[10px] font-black uppercase">Your Choice</Badge>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {!ans.selected_option && (
                                                    <div className="flex items-center gap-2 rounded-xl bg-orange-100/50 p-3 text-xs font-bold text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
                                                        <Ban className="h-4 w-4" /> NOT ANSWERED
                                                    </div>
                                                )}

                                                {ans.explanation && (
                                                    <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-sm leading-relaxed text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                                                        <div className="mb-2 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-blue-700/70 dark:text-blue-400/70">
                                                            <Lightbulb className="h-4 w-4" /> Explanation
                                                        </div>
                                                        {ans.explanation}
                                                    </div>
                                                )}

                                                {/* Audio explanation — for incorrect answers */}
                                                {!ans.is_correct && ans.explanation_audio_url && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-violet-700 dark:text-violet-400">
                                                            <Mic className="h-4 w-4" /> Listen to Explanation
                                                        </div>
                                                        <CustomAudioPlayer url={ans.explanation_audio_url} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                                    <Ban className="mb-4 h-12 w-12" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No answers to display</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
