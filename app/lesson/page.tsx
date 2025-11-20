'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

interface Quiz {
  id: string
  question: string
  options: string[]
  answer: number
}

interface Lesson {
  id: string
  title: string
  content: string
  day: number
  quiz: Quiz
}

interface ReferenceLink {
  url: string
  title: string
}

const getQuizReferences = (day: number): ReferenceLink[] => {
  switch (day) {
    case 1: // Dana Darurat
      return [
        {
          url: 'https://www.shariaknowledgecentre.id/id/news/dana-darurat-keuangan-syariah-halal-hadapi-krisis/',
          title: 'Dana Darurat Keuangan Syariah Halal Hadapi Krisis - Sharia Knowledge Centre'
        },
        {
          url: 'https://www.youtube.com/watch?v=EXP2Hd11FBY',
          title: 'Video: Dana Darurat - YouTube'
        },
        {
          url: 'https://www.megasyariah.co.id/id/artikel/edukasi-tips/simpanan/dana-darurat',
          title: 'Dana Darurat - Mega Syariah'
        },
        {
          url: 'https://bmt.hsi.id/artikel/25-cara-cerdas-membangun-dana-darurat',
          title: '25 Cara Cerdas Membangun Dana Darurat - BMT HSI'
        }
      ]
    case 2: // Investasi untuk Pemula
      return [
        {
          url: 'https://www.youtube.com/watch?v=G8CmgjVz6zM',
          title: 'Video: Investasi untuk Pemula - YouTube'
        },
        {
          url: 'https://www.cimbniaga.co.id/id/inspirasi/perencanaan/memahami-lebih-dalam-apa-itu-fintech-syariah',
          title: 'Memahami Lebih Dalam Apa Itu Fintech Syariah - CIMB Niaga'
        }
      ]
    case 3: // Mengelola Utang
      return [
        {
          url: 'https://www.cimbniaga.co.id/id/inspirasi/perencanaan/memahami-lebih-dalam-apa-itu-fintech-syariah',
          title: 'Memahami Lebih Dalam Apa Itu Fintech Syariah - CIMB Niaga'
        }
      ]
    case 4: // Fintech Syariah
      return [
        {
          url: 'https://www.cimbniaga.co.id/id/inspirasi/perencanaan/memahami-lebih-dalam-apa-itu-fintech-syariah',
          title: 'Memahami Lebih Dalam Apa Itu Fintech Syariah - CIMB Niaga'
        },
        {
          url: 'https://www.shariaknowledgecentre.id/id/news/dana-darurat-keuangan-syariah-halal-hadapi-krisis/',
          title: 'Dana Darurat Keuangan Syariah - Sharia Knowledge Centre'
        }
      ]
    case 5: // Perencanaan Keuangan
      return [
        {
          url: 'https://www.megasyariah.co.id/id/artikel/edukasi-tips/simpanan/dana-darurat',
          title: 'Dana Darurat - Mega Syariah'
        },
        {
          url: 'https://www.cimbniaga.co.id/id/inspirasi/perencanaan/memahami-lebih-dalam-apa-itu-fintech-syariah',
          title: 'Memahami Lebih Dalam Apa Itu Fintech Syariah - CIMB Niaga'
        }
      ]
    case 6: // Manajemen Risiko
      return [
        {
          url: 'https://www.youtube.com/watch?v=G8CmgjVz6zM',
          title: 'Video: Manajemen Risiko Investasi - YouTube'
        },
        {
          url: 'https://www.cimbniaga.co.id/id/inspirasi/perencanaan/memahami-lebih-dalam-apa-itu-fintech-syariah',
          title: 'Memahami Lebih Dalam Apa Itu Fintech Syariah - CIMB Niaga'
        }
      ]
    case 7: // Pajak dan Investasi
      return [
        {
          url: 'https://www.cimbniaga.co.id/id/inspirasi/perencanaan/memahami-lebih-dalam-apa-itu-fintech-syariah',
          title: 'Memahami Lebih Dalam Apa Itu Fintech Syariah - CIMB Niaga'
        }
      ]
    case 8: // Perencanaan Pensiun
      return [
        {
          url: 'https://bmt.hsi.id/artikel/25-cara-cerdas-membangun-dana-darurat',
          title: '25 Cara Cerdas Membangun Dana Darurat - BMT HSI'
        },
        {
          url: 'https://www.cimbniaga.co.id/id/inspirasi/perencanaan/memahami-lebih-dalam-apa-itu-fintech-syariah',
          title: 'Memahami Lebih Dalam Apa Itu Fintech Syariah - CIMB Niaga'
        }
      ]
    default:
      return [
        {
          url: 'https://www.cimbniaga.co.id/id/inspirasi/perencanaan/memahami-lebih-dalam-apa-itu-fintech-syariah',
          title: 'Memahami Lebih Dalam Apa Itu Fintech Syariah - CIMB Niaga'
        }
      ]
  }
}

export default function LessonPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchTodayLesson()
  }, [session, status, router])

  const fetchTodayLesson = async () => {
    try {
      const response = await fetch('/api/lessons/today')
      if (response.ok) {
        const data = await response.json()
        setLesson(data)
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    setShowQuiz(true)
  }

  const handleSubmitQuiz = async () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === lesson?.quiz.answer
    const score = isCorrect ? 100 : 0
    setQuizScore(score)
    setQuizSubmitted(true)

    // Save progress
    try {
      await fetch('/api/progress/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: lesson?.id,
          quizScore: score
        })
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat pelajaran...</p>
        </div>
      </div>
    )
  }

  if (!session || !lesson) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pelajaran Hari {lesson.day}
            </h1>
            <p className="text-gray-600">Mari belajar keuangan bersama!</p>
          </div>
        </div>

        {!showQuiz ? (
          /* Lesson Content */
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">{lesson.title}</CardTitle>
              <CardDescription>
                Pelajaran keuangan untuk meningkatkan literasi finansial Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {lesson.content}
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button 
                size="lg" 
                onClick={handleStartQuiz}
                className="w-full"
              >
                Mulai Quiz
              </Button>
            </div>
          </Card>
        ) : (
          /* Quiz Section */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Quiz: {lesson.title}</CardTitle>
              <CardDescription>
                Pilih jawaban yang paling tepat untuk pertanyaan berikut
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg font-medium">
                {lesson.quiz.question}
              </div>
              
              {getQuizReferences(lesson.day).length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Referensi:</strong> Pelajari lebih lanjut tentang topik ini
                  </p>
                  <div className="space-y-1">
                    {getQuizReferences(lesson.day).map((ref, index) => (
                      <a 
                        key={index}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {ref.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                disabled={quizSubmitted}
                className="space-y-3"
              >
                {lesson.quiz.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className={`flex-1 p-3 rounded-md border cursor-pointer transition-colors ${
                        quizSubmitted 
                          ? index === lesson.quiz.answer 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : selectedAnswer === index
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-gray-50 border-gray-200'
                          : selectedAnswer === index
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {quizSubmitted && (
                <div className="mt-6 p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    {quizScore === 100 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`font-medium ${
                      quizScore === 100 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {quizScore === 100 ? 'Benar!' : 'Salah!'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {quizScore === 100 
                      ? 'Selamat! Anda telah memahami materi dengan baik.' 
                      : 'Jangan menyerah! Pelajari kembali materi dan coba lagi.'}
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
                {!quizSubmitted ? (
                  <Button 
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswer === null}
                    className="flex-1"
                  >
                    Submit Jawaban
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push('/')}
                    className="flex-1"
                  >
                    Kembali ke Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
