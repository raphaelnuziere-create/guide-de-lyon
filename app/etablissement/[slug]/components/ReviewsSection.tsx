'use client'

import { useState } from 'react'
import { Star, ThumbsUp, Calendar, User, MessageSquare } from 'lucide-react'
import type { Review } from '@/lib/services/establishment-service'

interface ReviewsSectionProps {
  reviews: Review[]
  establishmentId: string
}

export default function ReviewsSection({ reviews, establishmentId }: ReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    authorName: ''
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRatingStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          interactive ? 'cursor-pointer hover:text-yellow-400' : ''
        } ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
        onClick={interactive && onRate ? () => onRate(i + 1) : undefined}
      />
    ))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement review submission
    console.log('Submit review:', newReview)
    setShowReviewForm(false)
    setNewReview({ rating: 0, title: '', comment: '', authorName: '' })
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getRatingDistribution = () => {
    const distribution = Array(5).fill(0)
    reviews.forEach(review => {
      distribution[review.rating - 1]++
    })
    return distribution.reverse().map((count, index) => ({
      stars: 5 - index,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    }))
  }

  const averageRating = getAverageRating()
  const ratingDistribution = getRatingDistribution()

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Laisser un avis
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Partagez votre expérience</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre note
              </label>
              <div className="flex items-center space-x-1">
                {getRatingStars(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre nom
              </label>
              <input
                type="text"
                value={newReview.authorName}
                onChange={(e) => setNewReview(prev => ({ ...prev, authorName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez votre nom"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de votre avis
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Résumez votre expérience"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre commentaire
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez votre expérience en détail..."
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Publier l'avis
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {reviews.length > 0 ? (
        <>
          {/* Rating Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {getRatingStars(Math.round(averageRating))}
              </div>
              <div className="text-gray-600">
                Basé sur {reviews.length} avis
              </div>
            </div>
            
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">{stars}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{review.authorName}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(review.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(review.rating)}
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                )}
                
                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Utile ({review.helpful})</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition">
                    <MessageSquare className="h-4 w-4" />
                    <span>Répondre</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Voir tous les avis →
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis pour le moment</h3>
          <p className="text-gray-600 mb-4">
            Soyez le premier à partager votre expérience !
          </p>
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Laisser le premier avis
          </button>
        </div>
      )}
    </div>
  )
}