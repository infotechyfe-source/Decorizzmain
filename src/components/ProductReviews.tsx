import React, { useState, useEffect, useContext, memo } from 'react';
import { Star, User, Send, Loader2, MessageSquare, CheckCircle2, ThumbsUp, ThumbsDown, Camera, Film, X, Play, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';
import { uploadToCloudinary, uploadVideoToCloudinary } from '../utils/cloudinary';
import { projectId } from '../utils/supabase/info';

const BACKEND_URL = `https://${projectId}.supabase.co/functions/v1/make-server-52d68140`;

interface Review {
    id: string;
    user_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
    image_url?: string;
    video_url?: string;
    helpful_count?: number;
    not_helpful_count?: number;
}

interface ProductReviewsProps {
    productId: string;
}

export const ProductReviews = memo(({ productId }: ProductReviewsProps) => {
    const { user, accessToken } = useContext(AuthContext);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});

    // Media Upload State
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchReviews();
        if (user) {
            fetchUserVotes();
        }
    }, [productId, user]);

    const fetchReviews = async () => {
        if (!productId) {
            console.warn('No product ID provided for reviews');
            setIsLoading(false);
            setReviews([]);
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/reviews/${productId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch reviews');
            }

            setReviews(data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserVotes = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('review_votes')
            .select('review_id, vote_type')
            .eq('user_id', user.id);

        if (data) {
            const votes: Record<string, 'up' | 'down'> = {};
            data.forEach((v: any) => {
                votes[v.review_id] = v.vote_type;
            });
            setUserVotes(votes);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                toast.error('Video size should be less than 20MB');
                return;
            }
            setSelectedVideo(file);
            const reader = new FileReader();
            reader.onloadend = () => setVideoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to write a review');
            return;
        }

        if (!newComment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            let uploadedImageUrl = '';
            let uploadedVideoUrl = '';

            // 1. Handle Image Upload to Cloudinary
            if (selectedImage) {
                uploadedImageUrl = await uploadToCloudinary(
                    selectedImage,
                    accessToken || undefined,
                    (progress) => setUploadProgress(progress)
                );
            }

            // 2. Handle Video Upload to Cloudinary
            if (selectedVideo) {
                uploadedVideoUrl = await uploadVideoToCloudinary(
                    selectedVideo,
                    accessToken || undefined,
                    (progress) => setUploadProgress(progress)
                );
            }

            // 3. Save Review via Backend
            const response = await fetch(`${BACKEND_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    product_id: productId,
                    rating: newRating,
                    comment: newComment.trim(),
                    image_url: uploadedImageUrl || null,
                    video_url: uploadedVideoUrl || null,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to submit review');

            toast.success('Review submitted successfully!');

            // Reset form
            setNewComment('');
            setNewRating(5);
            setSelectedImage(null);
            setSelectedVideo(null);
            setImagePreview(null);
            setVideoPreview(null);
            setShowReviewForm(false);
            setUploadProgress(0);

            fetchReviews(); // Refresh list
        } catch (error: any) {
            console.error('Error submitting review:', error);
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!user) return;

        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await fetch(`${BACKEND_URL}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to delete review');

            toast.success('Review deleted successfully');
            fetchReviews();
        } catch (error: any) {
            console.error('Error deleting review:', error);
            toast.error(error.message || 'Failed to delete review');
        }
    };

    const handleVote = async (reviewId: string, type: 'up' | 'down') => {
        if (!user) {
            toast.error('Please login to vote');
            return;
        }

        const currentVote = userVotes[reviewId];

        // Optimistic update
        setReviews(prev => prev.map(r => {
            if (r.id === reviewId) {
                let newHelpful = r.helpful_count || 0;
                let newNotHelpful = r.not_helpful_count || 0;

                if (currentVote === type) {
                    // Toggle off
                    if (type === 'up') newHelpful = Math.max(0, newHelpful - 1);
                    else newNotHelpful = Math.max(0, newNotHelpful - 1);
                } else if (currentVote) {
                    // Switch
                    if (type === 'up') {
                        newHelpful++;
                        newNotHelpful = Math.max(0, newNotHelpful - 1);
                    } else {
                        newNotHelpful++;
                        newHelpful = Math.max(0, newHelpful - 1);
                    }
                } else {
                    // New vote
                    if (type === 'up') newHelpful++;
                    else newNotHelpful++;
                }

                return { ...r, helpful_count: newHelpful, not_helpful_count: newNotHelpful };
            }
            return r;
        }));

        // Update local vote state
        setUserVotes(prev => {
            const newVotes = { ...prev };
            if (currentVote === type) {
                delete newVotes[reviewId];
            } else {
                newVotes[reviewId] = type;
            }
            return newVotes;
        });

        try {
            const response = await fetch(`${BACKEND_URL}/reviews/${reviewId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ type }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to record vote');
        } catch (error) {
            console.error('Error voting:', error);
            toast.error('Failed to record vote');
            fetchReviews();
            fetchUserVotes();
        }
    };

    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <section className="w-full rounded-lg mx-auto px-4 py-8 bg-white" id="reviews">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 border border-gray-100 rounded-xl shadow-sm bg-white">

                    {/* Left Column: Summary & Stats */}
                    <div className="lg:w-1/4 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/20">
                        <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-teal rounded-full" />
                            Summary
                        </h2>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex flex-col items-center justify-center bg-white w-20 h-20 rounded-2xl border-2 border-teal/10 shadow-sm">
                                <span className="text-3xl font-black text-gray-900">{averageRating}</span>
                                <div className="flex mt-1">
                                    <Star className="w-3 h-3 fill-teal text-teal" />
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-900 font-bold text-sm">Verified Ratings</p>
                                <p className="text-gray-500 text-[11px] uppercase tracking-wider">
                                    {reviews.length} reviews
                                </p>
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="mb-8">
                            <h4 className="text-[10px] uppercase font-black text-gray-400 mb-4 tracking-widest px-1">Top Highlights</h4>
                            <div className="flex flex-wrap gap-2">
                                {['Look', 'Quality', 'Design', 'Value'].map((tag) => (
                                    <span key={tag} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg cursor-default hover:border-teal hover:text-teal transition-all shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="w-full btn-glow-teal px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl text-white shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            {showReviewForm ? 'Close Form' : 'Write a Review'}
                        </button>
                    </div>

                    {/* Right Column: Reviews List & Form */}
                    <div className="flex-1 p-6">

                        {/* Write a Review Form - Premium Redesign */}
                        <div className={`mb-12 p-10 bg-white rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in duration-500 ${showReviewForm ? 'block' : 'hidden'}`}>
                            {user ? (
                                <form onSubmit={handleSubmitReview} className="space-y-8">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Overall Rating</h3>
                                        <div className="flex gap-2 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="focus:outline-none transition-all hover:scale-110 active:scale-95"
                                                >
                                                    <Star
                                                        className={`w-10 h-10 transition-colors ${star <= (hoverRating || newRating)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-gray-200 fill-gray-50'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {newRating === 5 ? 'Excellent!' : newRating === 4 ? 'Great' : newRating === 3 ? 'Good' : newRating === 2 ? 'Fair' : 'Poor'}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Your Review</label>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Tell others about your experience..."
                                            className="w-full px-8 py-6 rounded-3xl border-2 border-gray-50 text-gray-900 focus:outline-none focus:border-teal/30 focus:bg-white transition-all min-h-[160px] text-sm bg-gray-50/50 leading-relaxed"
                                        />
                                    </div>

                                    {/* Media Upload Selection - Modern Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="relative">
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="review-image" />
                                            <label htmlFor="review-image" className={`flex flex-col items-center justify-center h-28 border-2 rounded-3xl cursor-pointer transition-all ${imagePreview ? 'border-teal bg-teal/5' : 'border-gray-50 bg-gray-50/50 hover:border-teal/30 hover:bg-white'}`}>
                                                {imagePreview ? (
                                                    <div className="flex items-center gap-4 px-6 w-full">
                                                        <div className="relative">
                                                            <img src={imagePreview} className="w-16 h-16 object-cover rounded-2xl shadow-sm" alt="P" />
                                                            <div className="absolute -top-1 -right-1 bg-teal text-white rounded-full p-0.5 shadow-sm border-2 border-white">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <span className="text-[10px] font-black uppercase text-teal tracking-tight flex items-center gap-1">
                                                                Ready to upload
                                                            </span>
                                                            <span className="text-[11px] font-bold text-gray-500 truncate">{selectedImage?.name}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedImage(null); setImagePreview(null); }}
                                                            className="p-2 hover:bg-red-50 rounded-full transition-colors group/delete"
                                                        >
                                                            <X className="w-4 h-4 text-gray-300 group-hover/delete:text-red-400" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="p-3 bg-white rounded-2xl shadow-sm"><Camera className="w-5 h-5 text-teal" /></div>
                                                        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Add Photo</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" id="review-video" />
                                            <label htmlFor="review-video" className={`flex flex-col items-center justify-center h-28 border-2 rounded-3xl cursor-pointer transition-all ${videoPreview ? 'border-teal bg-teal/5' : 'border-gray-50 bg-gray-50/50 hover:border-teal/30 hover:bg-white'}`}>
                                                {videoPreview ? (
                                                    <div className="flex items-center gap-4 px-6 w-full">
                                                        <div className="relative">
                                                            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg"><Film className="w-6 h-6 text-white" /></div>
                                                            <div className="absolute -top-1 -right-1 bg-teal text-white rounded-full p-0.5 shadow-sm border-2 border-white">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <span className="text-[10px] font-black uppercase text-teal tracking-tight flex items-center gap-1">
                                                                Ready to upload
                                                            </span>
                                                            <span className="text-[11px] font-bold text-gray-500 truncate">{selectedVideo?.name}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedVideo(null); setVideoPreview(null); }}
                                                            className="p-2 hover:bg-red-50 rounded-full transition-colors group/delete"
                                                        >
                                                            <X className="w-4 h-4 text-gray-300 group-hover/delete:text-red-400" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="p-3 bg-white rounded-2xl shadow-sm"><Film className="w-5 h-5 text-teal" /></div>
                                                        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Add Video</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                                <span>Uploading Media...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-gradient-to-r from-teal to-teal-400 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-16 btn-glow-teal text-white font-black text-[12px] uppercase tracking-[0.3em] rounded-3xl disabled:opacity-70 transition-all shadow-[0_15px_30px_rgba(20,184,166,0.3)] hover:shadow-[0_20px_40px_rgba(20,184,166,0.4)] flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mt-0.5" />
                                                Submit Review
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-12 px-6 bg-gray-50/50 rounded-[2rem] border border-gray-100/50">
                                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-gray-900 font-black uppercase text-sm tracking-widest mb-2">Join the Conversation</h3>
                                    <p className="text-gray-400 text-xs mb-8">Login to share your feedback and media with the community.</p>
                                    <button disabled className="px-10 py-4 bg-white border border-gray-100 text-gray-300 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-not-allowed shadow-sm">Authentication Required</button>
                                </div>
                            )}
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-8">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-[2rem] border-2 border-dashed border-gray-100">
                                    <Loader2 className="w-8 h-8 text-teal animate-spin mb-4" />
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading Reviews...</p>
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500 relative flex flex-col h-full">
                                            {/* Header: Rating + Actions */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-100 fill-gray-100'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">
                                                        {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                {(user?.id === review.user_id || user?.role === 'admin') && (
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Review"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Body: Media & Comment */}
                                            <div className="flex-1 space-y-6">
                                                {/* Media Gallery */}
                                                {(review.image_url || review.video_url) && (
                                                    <div className="flex flex-wrap gap-4">
                                                        {review.image_url && (
                                                            <div className="relative group/media cursor-zoom-in overflow-hidden rounded-2xl shadow-sm">
                                                                <img
                                                                    src={review.image_url}
                                                                    alt="User review"
                                                                    className="w-24 h-24 object-cover transition-transform duration-500 group-hover/media:scale-110"
                                                                    onClick={() => window.open(review.image_url, '_blank')}
                                                                />
                                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <ImageIcon className="w-5 h-5 text-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {review.video_url && (
                                                            <div className="relative group/media cursor-pointer overflow-hidden rounded-2xl shadow-sm">
                                                                <video
                                                                    src={review.video_url}
                                                                    className="w-24 h-24 object-cover transition-transform duration-500 group-hover/media:scale-110"
                                                                    onClick={() => window.open(review.video_url, '_blank')}
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                                    <Play className="w-6 h-6 text-white fill-current opacity-80" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                                    {review.comment}
                                                </p>
                                            </div>

                                            {/* Footer: User & Voting */}
                                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal font-black text-[10px] uppercase">
                                                        {review.user_name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{review.user_name}</span>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3 text-teal" />
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Purchase</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleVote(review.id, 'up')}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${userVotes[review.id] === 'up'
                                                            ? 'bg-teal/10 text-teal'
                                                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                                            }`}
                                                    >
                                                        <ThumbsUp className={`w-3.5 h-3.5 ${userVotes[review.id] === 'up' ? 'fill-current' : ''}`} />
                                                        <span className="text-[11px] font-black">{review.helpful_count || 0}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleVote(review.id, 'down')}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${userVotes[review.id] === 'down'
                                                            ? 'bg-red-50 text-red-500'
                                                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                                            }`}
                                                    >
                                                        <ThumbsDown className={`w-3.5 h-3.5 ${userVotes[review.id] === 'down' ? 'fill-current' : ''}`} />
                                                        <span className="text-[11px] font-black">{review.not_helpful_count || 0}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-200">
                                        <MessageSquare className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});
