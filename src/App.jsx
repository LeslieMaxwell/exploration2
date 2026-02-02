import { useState, useEffect } from 'react'
import { inventions, categories } from './data/inventions'
import './App.css'

function Header({ onNavigate, currentView }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
          <span className="header-emoji">🕰️</span> Life Before...
        </h1>
        <p className="tagline">Discover how different life was before these amazing inventions!</p>
        <nav className="nav-buttons">
          <button
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            🏠 Explore
          </button>
          <button
            className={`nav-btn ${currentView === 'timeline' ? 'active' : ''}`}
            onClick={() => onNavigate('timeline')}
          >
            📅 Timeline
          </button>
          <button
            className={`nav-btn ${currentView === 'quiz' ? 'active' : ''}`}
            onClick={() => onNavigate('quiz')}
          >
            🎯 Quiz Me!
          </button>
          <button
            className={`nav-btn ${currentView === 'random' ? 'active' : ''}`}
            onClick={() => onNavigate('random')}
          >
            🎲 Surprise Me!
          </button>
        </nav>
      </div>
    </header>
  )
}

function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="category-filter">
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`category-btn ${selected === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          <span className="cat-emoji">{cat.emoji}</span>
          <span className="cat-name">{cat.name}</span>
        </button>
      ))}
    </div>
  )
}

function InventionCard({ invention, onClick }) {
  return (
    <div className="invention-card" onClick={() => onClick(invention)}>
      <div className="card-emoji">{invention.emoji}</div>
      <h3 className="card-title">{invention.name}</h3>
      <p className="card-year">{invention.year}</p>
      <p className="card-teaser">Click to discover life before this existed!</p>
    </div>
  )
}

function InventionDetail({ invention, onClose }) {
  const [showFact, setShowFact] = useState(false)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="detail-header">
          <span className="detail-emoji">{invention.emoji}</span>
          <div>
            <h2>{invention.name}</h2>
            <p className="detail-meta">Invented in {invention.year} by {invention.inventor}</p>
          </div>
        </div>

        <div className="life-before-section">
          <h3>🤔 Life BEFORE {invention.name}:</h3>
          <ul className="life-before-list">
            {invention.lifeBefore.map((item, index) => (
              <li key={index} className="life-before-item">
                <span className="bullet">→</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="impact-section">
          <h3>✨ Why It Matters:</h3>
          <p>{invention.impact}</p>
        </div>

        <div className="fun-fact-section">
          <button
            className="fun-fact-btn"
            onClick={() => setShowFact(!showFact)}
          >
            {showFact ? '🙈 Hide Fun Fact' : '🎉 Show Fun Fact!'}
          </button>
          {showFact && (
            <div className="fun-fact-content">
              <p>💡 {invention.funFact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Timeline({ inventions, onSelect }) {
  const sorted = [...inventions].sort((a, b) => {
    const yearA = typeof a.year === 'string' ? parseInt(a.year) : a.year
    const yearB = typeof b.year === 'string' ? parseInt(b.year) : b.year
    return yearA - yearB
  })

  return (
    <div className="timeline-container">
      <h2 className="timeline-title">📅 Timeline of Inventions</h2>
      <p className="timeline-subtitle">See how inventions changed history through time!</p>
      <div className="timeline">
        {sorted.map((invention, index) => (
          <div
            key={invention.id}
            className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
            onClick={() => onSelect(invention)}
          >
            <div className="timeline-content">
              <span className="timeline-emoji">{invention.emoji}</span>
              <div className="timeline-info">
                <span className="timeline-year">{invention.year}</span>
                <span className="timeline-name">{invention.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Quiz({ inventions }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [questions, setQuestions] = useState([])
  const [quizComplete, setQuizComplete] = useState(false)

  useEffect(() => {
    generateQuestions()
  }, [])

  const generateQuestions = () => {
    const shuffled = [...inventions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 5)

    const newQuestions = selected.map(invention => {
      const questionTypes = [
        {
          question: `What did people do before ${invention.name} existed?`,
          correct: invention.lifeBefore[0],
          wrong: inventions
            .filter(i => i.id !== invention.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(i => i.lifeBefore[0])
        },
        {
          question: `When was the ${invention.name} invented?`,
          correct: String(invention.year),
          wrong: [
            String(invention.year - Math.floor(Math.random() * 50) - 20),
            String(invention.year + Math.floor(Math.random() * 50) + 20),
            String(invention.year - Math.floor(Math.random() * 100) - 50)
          ]
        },
        {
          question: `Which emoji represents the ${invention.name}?`,
          correct: invention.emoji,
          wrong: inventions
            .filter(i => i.id !== invention.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(i => i.emoji)
        }
      ]

      const chosen = questionTypes[Math.floor(Math.random() * questionTypes.length)]
      const answers = [chosen.correct, ...chosen.wrong].sort(() => Math.random() - 0.5)

      return {
        ...chosen,
        answers,
        invention
      }
    })

    setQuestions(newQuestions)
    setCurrentQuestion(0)
    setScore(0)
    setQuizComplete(false)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    if (answer === questions[currentQuestion].correct) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  if (questions.length === 0) {
    return <div className="quiz-loading">Loading quiz...</div>
  }

  if (quizComplete) {
    return (
      <div className="quiz-container">
        <div className="quiz-complete">
          <h2>🎉 Quiz Complete!</h2>
          <div className="score-display">
            <span className="score-number">{score}</span>
            <span className="score-total">/ {questions.length}</span>
          </div>
          <p className="score-message">
            {score === questions.length ? "Perfect! You're an invention expert! 🏆" :
             score >= questions.length * 0.6 ? "Great job! You know your history! ⭐" :
             "Keep exploring and learning! 📚"}
          </p>
          <button className="play-again-btn" onClick={generateQuestions}>
            🔄 Play Again
          </button>
        </div>
      </div>
    )
  }

  const q = questions[currentQuestion]

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <span className="quiz-progress">Question {currentQuestion + 1} of {questions.length}</span>
        <span className="quiz-score">Score: {score}</span>
      </div>

      <div className="quiz-question">
        <span className="question-emoji">{q.invention.emoji}</span>
        <h3>{q.question}</h3>
      </div>

      <div className="quiz-answers">
        {q.answers.map((answer, index) => (
          <button
            key={index}
            className={`answer-btn ${
              showResult
                ? answer === q.correct
                  ? 'correct'
                  : answer === selectedAnswer
                    ? 'wrong'
                    : ''
                : ''
            }`}
            onClick={() => !showResult && handleAnswer(answer)}
            disabled={showResult}
          >
            {answer}
          </button>
        ))}
      </div>

      {showResult && (
        <div className="quiz-feedback">
          {selectedAnswer === q.correct ? (
            <p className="feedback-correct">✅ Correct! Great job!</p>
          ) : (
            <p className="feedback-wrong">❌ Not quite! The answer was: {q.correct}</p>
          )}
          <button className="next-btn" onClick={nextQuestion}>
            {currentQuestion < questions.length - 1 ? 'Next Question →' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  )
}

function RandomInvention({ inventions, onSelect }) {
  const [current, setCurrent] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const spin = () => {
    setIsSpinning(true)
    let count = 0
    const maxCount = 15

    const interval = setInterval(() => {
      const random = inventions[Math.floor(Math.random() * inventions.length)]
      setCurrent(random)
      count++

      if (count >= maxCount) {
        clearInterval(interval)
        setIsSpinning(false)
      }
    }, 100)
  }

  return (
    <div className="random-container">
      <h2>🎲 Random Invention Discovery!</h2>
      <p>Click the button to discover a random invention from history!</p>

      <button
        className={`spin-btn ${isSpinning ? 'spinning' : ''}`}
        onClick={spin}
        disabled={isSpinning}
      >
        {isSpinning ? '🌀 Spinning...' : '🎲 Surprise Me!'}
      </button>

      {current && (
        <div className={`random-result ${isSpinning ? 'spinning' : ''}`}>
          <div className="random-emoji">{current.emoji}</div>
          <h3>{current.name}</h3>
          <p className="random-year">Invented in {current.year}</p>
          {!isSpinning && (
            <button className="learn-more-btn" onClick={() => onSelect(current)}>
              Learn More →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SearchBar({ value, onChange }) {
  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Search inventions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="clear-search" onClick={() => onChange('')}>✕</button>
      )}
    </div>
  )
}

function App() {
  const [view, setView] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedInvention, setSelectedInvention] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredInventions = inventions.filter(inv => {
    const matchesCategory = selectedCategory === 'all' || inv.category === selectedCategory
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.lifeBefore.some(lb => lb.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleNavigate = (newView) => {
    setView(newView)
    if (newView === 'home') {
      setSelectedCategory('all')
      setSearchTerm('')
    }
  }

  return (
    <div className="app">
      <Header onNavigate={handleNavigate} currentView={view} />

      <main className="main-content">
        {view === 'home' && (
          <>
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

            <div className="inventions-grid">
              {filteredInventions.map(invention => (
                <InventionCard
                  key={invention.id}
                  invention={invention}
                  onClick={setSelectedInvention}
                />
              ))}
            </div>

            {filteredInventions.length === 0 && (
              <div className="no-results">
                <p>🔍 No inventions found. Try a different search!</p>
              </div>
            )}
          </>
        )}

        {view === 'timeline' && (
          <Timeline inventions={inventions} onSelect={setSelectedInvention} />
        )}

        {view === 'quiz' && (
          <Quiz inventions={inventions} />
        )}

        {view === 'random' && (
          <RandomInvention inventions={inventions} onSelect={setSelectedInvention} />
        )}
      </main>

      {selectedInvention && (
        <InventionDetail
          invention={selectedInvention}
          onClose={() => setSelectedInvention(null)}
        />
      )}

      <footer className="footer">
        <p>Made with ❤️ for curious minds everywhere</p>
        <p className="footer-note">Click on any invention to learn what life was like before it existed!</p>
      </footer>
    </div>
  )
}

export default App
