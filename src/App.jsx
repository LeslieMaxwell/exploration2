import { useState, useEffect, useRef } from 'react'
import { inventions, categories } from './data/inventions'
import './App.css'

// Sort inventions for timeline use
const getYear = (year) => typeof year === 'string' ? parseInt(year) : year

const sortedByCategory = categories
  .filter(c => c.id !== 'all')
  .map(category => ({
    ...category,
    items: inventions
      .filter(inv => inv.category === category.id)
      .sort((a, b) => getYear(a.year) - getYear(b.year))
  }))

function Header({ currentView, onNavigate }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 onClick={() => onNavigate('explore')}>
          <span className="header-icon">🕰️</span>
          Life Before...
        </h1>
        <p className="tagline">Travel through time and discover how inventions changed everything!</p>
        <nav className="nav">
          <button
            className={`nav-btn ${currentView === 'explore' ? 'active' : ''}`}
            onClick={() => onNavigate('explore')}
          >
            🗺️ Explore
          </button>
          <button
            className={`nav-btn ${currentView === 'day-without' ? 'active' : ''}`}
            onClick={() => onNavigate('day-without')}
          >
            🌅 A Day Without...
          </button>
          <button
            className={`nav-btn ${currentView === 'time-challenge' ? 'active' : ''}`}
            onClick={() => onNavigate('time-challenge')}
          >
            ⏰ Time Challenge
          </button>
          <button
            className={`nav-btn ${currentView === 'sort-game' ? 'active' : ''}`}
            onClick={() => onNavigate('sort-game')}
          >
            🎯 Order Game
          </button>
        </nav>
      </div>
    </header>
  )
}

function CategoryTimeline({ category, onSelectInvention }) {
  const timelineRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (timelineRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = timelineRef.current
    if (ref) {
      ref.addEventListener('scroll', checkScroll)
      return () => ref.removeEventListener('scroll', checkScroll)
    }
  }, [])

  const scroll = (direction) => {
    if (timelineRef.current) {
      const scrollAmount = 300
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="category-section">
      <div className="category-header">
        <span className="category-icon">{category.emoji}</span>
        <h2>{category.name}</h2>
        <span className="category-count">{category.items.length} inventions</span>
      </div>

      <div className="timeline-wrapper">
        {canScrollLeft && (
          <button className="scroll-btn scroll-left" onClick={() => scroll('left')}>
            ←
          </button>
        )}

        <div className="timeline-track" ref={timelineRef}>
          <div className="timeline-line" />
          {category.items.map((invention, index) => (
            <div
              key={invention.id}
              className="timeline-node"
              onClick={() => onSelectInvention(invention)}
            >
              <div className="node-year">{invention.year}</div>
              <div className="node-dot" />
              <div className="node-card">
                <span className="node-emoji">{invention.emoji}</span>
                <span className="node-name">{invention.name}</span>
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button className="scroll-btn scroll-right" onClick={() => scroll('right')}>
            →
          </button>
        )}
      </div>
    </section>
  )
}

function ExploreView({ onSelectInvention }) {
  return (
    <div className="explore-view">
      <div className="explore-intro">
        <h2>🚀 Explore Inventions Through Time</h2>
        <p>Each category shows inventions in chronological order. Click any invention to discover what life was like before it existed!</p>
      </div>

      {sortedByCategory.map(category => (
        <CategoryTimeline
          key={category.id}
          category={category}
          onSelectInvention={onSelectInvention}
        />
      ))}
    </div>
  )
}

function DayWithoutView({ onSelectInvention }) {
  const [selectedInvention, setSelectedInvention] = useState(null)
  const [currentScenario, setCurrentScenario] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const scenarios = [
    {
      time: "6:00 AM - Wake Up",
      modern: "Your alarm clock wakes you up at exactly 6:00 AM.",
      inventions: ["Alarm Clock"],
      questions: ["How would you wake up on time without an alarm?", "What if you had to be somewhere important early in the morning?"]
    },
    {
      time: "6:15 AM - Bathroom",
      modern: "You head to the bathroom, use the toilet, and take a warm shower.",
      inventions: ["Indoor Plumbing", "Toilet Paper"],
      questions: ["Where would you go to the bathroom?", "How would you clean yourself?"]
    },
    {
      time: "6:45 AM - Getting Ready",
      modern: "You put on your glasses, zip up your jacket, and check yourself in the mirror.",
      inventions: ["Glasses", "Zipper"],
      questions: ["What if you couldn't see clearly?", "How long would it take to button 20 small buttons on your boots?"]
    },
    {
      time: "7:00 AM - Breakfast",
      modern: "You grab milk from the fridge and heat up some oatmeal in the microwave.",
      inventions: ["Refrigerator", "Microwave Oven"],
      questions: ["How would you keep food from spoiling?", "How would you quickly heat up food?"]
    },
    {
      time: "7:30 AM - Heading Out",
      modern: "It's raining, so you grab your umbrella and head out.",
      inventions: ["Umbrella"],
      questions: ["How would you stay dry?", "Would you just... get wet?"]
    },
    {
      time: "12:00 PM - Lunch",
      modern: "You open a can of soup, put a bandage on a paper cut, and write a note with your pen.",
      inventions: ["Canned Food", "Band-Aids", "Ballpoint Pen"],
      questions: ["How would food be preserved for months?", "How would you treat a small cut?"]
    },
    {
      time: "3:00 PM - Travel",
      modern: "You hop on your bike with comfortable rubber tires and use GPS to find your way.",
      inventions: ["Bicycle", "Rubber Tires", "GPS Navigation"],
      questions: ["How would you get around quickly without a horse?", "How would you find your way in an unfamiliar place?"]
    },
    {
      time: "7:00 PM - Evening",
      modern: "As it gets dark, you turn on the lights and play some video games.",
      inventions: ["Electric Light Bulb", "Video Games"],
      questions: ["What would you do when it got dark?", "How would you entertain yourself at night?"]
    }
  ]

  const scenario = scenarios[currentScenario]
  const relatedInventions = inventions.filter(inv =>
    scenario.inventions.includes(inv.name)
  )

  const nextScenario = () => {
    setRevealed(false)
    setCurrentScenario((currentScenario + 1) % scenarios.length)
  }

  const prevScenario = () => {
    setRevealed(false)
    setCurrentScenario((currentScenario - 1 + scenarios.length) % scenarios.length)
  }

  return (
    <div className="day-without-view">
      <div className="day-intro">
        <h2>🌅 A Day Without Modern Inventions</h2>
        <p>Walk through a typical day and discover how different it would be without the things we take for granted!</p>
      </div>

      <div className="scenario-container">
        <div className="scenario-progress">
          {scenarios.map((_, idx) => (
            <div
              key={idx}
              className={`progress-dot ${idx === currentScenario ? 'active' : ''} ${idx < currentScenario ? 'completed' : ''}`}
              onClick={() => { setCurrentScenario(idx); setRevealed(false); }}
            />
          ))}
        </div>

        <div className="scenario-card">
          <div className="scenario-time">{scenario.time}</div>

          <div className="scenario-modern">
            <h3>✨ Today:</h3>
            <p>{scenario.modern}</p>
          </div>

          <div className="scenario-inventions">
            <h4>Inventions used:</h4>
            <div className="invention-tags">
              {relatedInventions.map(inv => (
                <button
                  key={inv.id}
                  className="invention-tag"
                  onClick={() => onSelectInvention(inv)}
                >
                  {inv.emoji} {inv.name}
                </button>
              ))}
            </div>
          </div>

          {!revealed ? (
            <button className="reveal-btn" onClick={() => setRevealed(true)}>
              🤔 What was it like before?
            </button>
          ) : (
            <div className="scenario-before">
              <h3>🕰️ Life Before:</h3>
              <div className="think-questions">
                {scenario.questions.map((q, idx) => (
                  <div key={idx} className="think-question">
                    <span className="question-icon">💭</span>
                    <p>{q}</p>
                  </div>
                ))}
              </div>
              <div className="before-facts">
                {relatedInventions.map(inv => (
                  <div key={inv.id} className="before-fact">
                    <span className="fact-emoji">{inv.emoji}</span>
                    <div>
                      <strong>Before {inv.name}:</strong>
                      <p>{inv.lifeBefore[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="scenario-nav">
            <button onClick={prevScenario} className="nav-arrow">← Earlier</button>
            <span className="scenario-count">{currentScenario + 1} of {scenarios.length}</span>
            <button onClick={nextScenario} className="nav-arrow">Later →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimeChallengeView() {
  const [gameState, setGameState] = useState('intro') // intro, playing, result
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [guess, setGuess] = useState(1900)
  const [showAnswer, setShowAnswer] = useState(false)
  const [questions, setQuestions] = useState([])

  const startGame = () => {
    const shuffled = inventions
      .filter(inv => typeof inv.year === 'number')
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
    setQuestions(shuffled)
    setCurrentQuestion(0)
    setScore(0)
    setGameState('playing')
    setShowAnswer(false)
    setGuess(1900)
  }

  const submitGuess = () => {
    const actual = questions[currentQuestion].year
    const diff = Math.abs(guess - actual)
    let points = 0
    if (diff === 0) points = 100
    else if (diff <= 5) points = 80
    else if (diff <= 10) points = 60
    else if (diff <= 25) points = 40
    else if (diff <= 50) points = 20

    setScore(score + points)
    setShowAnswer(true)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowAnswer(false)
      setGuess(1900)
    } else {
      setGameState('result')
    }
  }

  const getAccuracyMessage = (diff) => {
    if (diff === 0) return "🎯 Perfect! Exactly right!"
    if (diff <= 5) return "🔥 Amazing! So close!"
    if (diff <= 10) return "⭐ Great guess!"
    if (diff <= 25) return "👍 Good thinking!"
    if (diff <= 50) return "🤔 Not bad!"
    return "😅 Way off, but now you know!"
  }

  if (gameState === 'intro') {
    return (
      <div className="challenge-view">
        <div className="challenge-intro">
          <h2>⏰ Time Travel Challenge</h2>
          <p>Can you guess when these inventions were created?</p>
          <div className="challenge-rules">
            <div className="rule">🎯 Exact year = 100 points</div>
            <div className="rule">🔥 Within 5 years = 80 points</div>
            <div className="rule">⭐ Within 10 years = 60 points</div>
            <div className="rule">👍 Within 25 years = 40 points</div>
            <div className="rule">🤔 Within 50 years = 20 points</div>
          </div>
          <button className="start-btn" onClick={startGame}>
            🚀 Start Challenge
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'result') {
    const maxScore = questions.length * 100
    const percentage = Math.round((score / maxScore) * 100)
    return (
      <div className="challenge-view">
        <div className="challenge-result">
          <h2>🏆 Challenge Complete!</h2>
          <div className="final-score">
            <div className="score-big">{score}</div>
            <div className="score-max">out of {maxScore} points</div>
          </div>
          <div className="score-bar">
            <div className="score-fill" style={{ width: `${percentage}%` }} />
          </div>
          <p className="result-message">
            {percentage >= 80 ? "🌟 Time Travel Expert! You really know your history!" :
             percentage >= 60 ? "📚 Great job! You've got a good sense of history!" :
             percentage >= 40 ? "🎓 Not bad! Keep exploring and learning!" :
             "🔍 Keep exploring! History is full of surprises!"}
          </p>
          <button className="start-btn" onClick={startGame}>
            🔄 Play Again
          </button>
        </div>
      </div>
    )
  }

  const invention = questions[currentQuestion]
  const diff = showAnswer ? Math.abs(guess - invention.year) : null

  return (
    <div className="challenge-view">
      <div className="challenge-header">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="challenge-card">
        <div className="challenge-emoji">{invention.emoji}</div>
        <h3>When was the <strong>{invention.name}</strong> invented?</h3>

        <div className="year-slider">
          <span className="year-label">1400</span>
          <input
            type="range"
            min="1400"
            max="2000"
            value={guess}
            onChange={(e) => setGuess(parseInt(e.target.value))}
            disabled={showAnswer}
            className="slider"
          />
          <span className="year-label">2000</span>
        </div>

        <div className="guess-display">
          <span className="guess-year">{guess}</span>
        </div>

        {!showAnswer ? (
          <button className="submit-btn" onClick={submitGuess}>
            Lock In My Guess!
          </button>
        ) : (
          <div className="answer-reveal">
            <div className="answer-message">{getAccuracyMessage(diff)}</div>
            <div className="answer-details">
              <div>Your guess: <strong>{guess}</strong></div>
              <div>Actual year: <strong>{invention.year}</strong></div>
              <div>Difference: <strong>{diff} years</strong></div>
            </div>
            <div className="fun-fact-mini">
              💡 {invention.funFact}
            </div>
            <button className="next-btn" onClick={nextQuestion}>
              {currentQuestion < questions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SortGameView() {
  const [gameState, setGameState] = useState('intro')
  const [items, setItems] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const startGame = () => {
    const shuffled = inventions
      .filter(inv => typeof inv.year === 'number')
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(inv => ({ ...inv, placed: false }))

    // Shuffle the display order
    const displayOrder = [...shuffled].sort(() => Math.random() - 0.5)
    setItems(displayOrder)
    setAttempts(0)
    setCompleted(false)
    setGameState('playing')
  }

  const checkOrder = () => {
    const years = items.map(item => getYear(item.year))
    const sorted = [...years].sort((a, b) => a - b)
    const isCorrect = JSON.stringify(years) === JSON.stringify(sorted)
    setAttempts(attempts + 1)
    if (isCorrect) {
      setCompleted(true)
    }
    return isCorrect
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)
    setItems(newItems)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const moveItem = (fromIndex, direction) => {
    const toIndex = fromIndex + direction
    if (toIndex < 0 || toIndex >= items.length) return

    const newItems = [...items]
    const temp = newItems[fromIndex]
    newItems[fromIndex] = newItems[toIndex]
    newItems[toIndex] = temp
    setItems(newItems)
  }

  if (gameState === 'intro') {
    return (
      <div className="sort-view">
        <div className="sort-intro">
          <h2>🎯 Order Through Time</h2>
          <p>Can you put these inventions in order from oldest to newest?</p>
          <div className="sort-instructions">
            <p>📱 Drag and drop the cards, or use the arrow buttons to rearrange them.</p>
            <p>🎯 Try to get them in the correct order with as few attempts as possible!</p>
          </div>
          <button className="start-btn" onClick={startGame}>
            🚀 Start Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sort-view">
      <div className="sort-header">
        <h2>Put these in order: Oldest → Newest</h2>
        <div className="attempts-display">Attempts: {attempts}</div>
      </div>

      <div className="sort-container">
        <div className="sort-direction">
          <span>⬅️ OLDEST</span>
          <span>NEWEST ➡️</span>
        </div>

        <div className="sort-items">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`sort-card ${draggedIndex === index ? 'dragging' : ''} ${completed ? 'correct' : ''}`}
              draggable={!completed}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="sort-card-content">
                <span className="sort-emoji">{item.emoji}</span>
                <span className="sort-name">{item.name}</span>
                {completed && <span className="sort-year">{item.year}</span>}
              </div>
              {!completed && (
                <div className="sort-arrows">
                  <button onClick={() => moveItem(index, -1)} disabled={index === 0}>←</button>
                  <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>→</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {!completed ? (
        <button className="check-btn" onClick={checkOrder}>
          ✓ Check My Order
        </button>
      ) : (
        <div className="sort-complete">
          <h3>🎉 Correct!</h3>
          <p>You got it in {attempts} {attempts === 1 ? 'try' : 'tries'}!</p>
          <button className="start-btn" onClick={startGame}>
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  )
}

function InventionModal({ invention, onClose }) {
  const [activeTab, setActiveTab] = useState('before')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="modal-header">
          <span className="modal-emoji">{invention.emoji}</span>
          <div>
            <h2>{invention.name}</h2>
            <p className="modal-meta">{invention.year} • {invention.inventor}</p>
          </div>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'before' ? 'active' : ''}`}
            onClick={() => setActiveTab('before')}
          >
            🕰️ Life Before
          </button>
          <button
            className={`tab ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => setActiveTab('impact')}
          >
            ✨ Impact
          </button>
          <button
            className={`tab ${activeTab === 'fact' ? 'active' : ''}`}
            onClick={() => setActiveTab('fact')}
          >
            💡 Fun Fact
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'before' && (
            <div className="before-content">
              <h3>What was life like before {invention.name}?</h3>
              <ul>
                {invention.lifeBefore.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'impact' && (
            <div className="impact-content">
              <h3>Why does this invention matter?</h3>
              <p>{invention.impact}</p>
            </div>
          )}
          {activeTab === 'fact' && (
            <div className="fact-content">
              <h3>Did you know?</h3>
              <p>{invention.funFact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [view, setView] = useState('explore')
  const [selectedInvention, setSelectedInvention] = useState(null)

  return (
    <div className="app">
      <Header currentView={view} onNavigate={setView} />

      <main className="main">
        {view === 'explore' && (
          <ExploreView onSelectInvention={setSelectedInvention} />
        )}
        {view === 'day-without' && (
          <DayWithoutView onSelectInvention={setSelectedInvention} />
        )}
        {view === 'time-challenge' && (
          <TimeChallengeView />
        )}
        {view === 'sort-game' && (
          <SortGameView />
        )}
      </main>

      {selectedInvention && (
        <InventionModal
          invention={selectedInvention}
          onClose={() => setSelectedInvention(null)}
        />
      )}

      <footer className="footer">
        <p>Made for curious minds who wonder about the past 🕰️</p>
      </footer>
    </div>
  )
}

export default App
