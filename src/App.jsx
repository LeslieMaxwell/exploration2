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

// Keywords to match user input to inventions
const inventionKeywords = {
  "Alarm Clock": ["alarm", "wake up", "woke up", "clock", "time", "morning alarm"],
  "Indoor Plumbing": ["shower", "bath", "toilet", "bathroom", "sink", "faucet", "water", "flush", "plumbing"],
  "Toilet Paper": ["toilet paper", "tp", "wipe", "tissue"],
  "Glasses": ["glasses", "contacts", "see", "vision", "eyeglasses", "spectacles"],
  "Zipper": ["zipper", "zip", "jacket", "jeans", "zip up"],
  "Refrigerator": ["fridge", "refrigerator", "cold", "milk", "juice", "breakfast", "eggs", "food"],
  "Microwave Oven": ["microwave", "heat up", "reheat", "warm up", "nuke"],
  "Toothbrush": ["brush teeth", "toothbrush", "teeth", "dental", "toothpaste"],
  "Electric Light Bulb": ["light", "lights", "lamp", "turn on the light", "switch", "bright"],
  "Umbrella": ["umbrella", "rain", "raining", "wet"],
  "Bicycle": ["bike", "bicycle", "cycle", "ride"],
  "GPS Navigation": ["gps", "maps", "directions", "navigate", "google maps", "waze"],
  "Internet": ["internet", "wifi", "online", "google", "search", "website", "email", "browse"],
  "Video Games": ["video game", "game", "gaming", "xbox", "playstation", "nintendo", "computer game"],
  "Washing Machine": ["laundry", "wash clothes", "washing machine", "washer"],
  "Air Conditioning": ["ac", "air conditioning", "cool", "air conditioner", "cooling"],
  "Ballpoint Pen": ["pen", "write", "writing", "note"],
  "Band-Aids": ["bandaid", "band-aid", "bandage", "cut", "scrape"],
  "Calculator": ["calculator", "calculate", "math"],
  "Canned Food": ["can", "canned", "tin"],
  "Shopping Cart": ["shopping cart", "cart", "grocery", "shopping"],
  "Velcro": ["velcro", "shoes", "sneakers"],
  "Sunscreen": ["sunscreen", "sunblock", "spf"],
  "Coffee": ["coffee", "caffeine", "espresso"],
  "Elevator": ["elevator", "lift"],
  "Seat Belts": ["seatbelt", "seat belt", "buckle"],
  "Rubber Tires": ["car", "drive", "driving", "tires"],
  "Windshield Wipers": ["wipers", "windshield"],
}

function Header({ currentView, onNavigate }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 onClick={() => onNavigate('day-without')}>
          <span className="header-icon">🕰️</span>
          Life Before...
        </h1>
        <p className="tagline">Discover how different life was before everyday inventions!</p>
        <nav className="nav">
          <button
            className={`nav-btn ${currentView === 'day-without' ? 'active' : ''}`}
            onClick={() => onNavigate('day-without')}
          >
            🌅 A Day Without...
          </button>
          <button
            className={`nav-btn ${currentView === 'explore' ? 'active' : ''}`}
            onClick={() => onNavigate('explore')}
          >
            🗺️ Explore
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

function DayWithoutView({ onSelectInvention }) {
  const [stage, setStage] = useState('intro') // intro, morning, bathroom, breakfast, travel, results
  const [userInput, setUserInput] = useState('')
  const [discoveredInventions, setDiscoveredInventions] = useState([])
  const [currentPrompt, setCurrentPrompt] = useState(null)
  const [conversation, setConversation] = useState([])
  const [missedInventions, setMissedInventions] = useState([])
  const inputRef = useRef(null)

  const prompts = {
    morning: {
      question: "It's 6:30 AM and you need to get ready for school. What's the first thing you do when you wake up?",
      followUp: "What else do you do to get ready in the morning?",
      hints: ["Do you need to see what time it is?", "How do you make sure you wake up on time?", "Can you see clearly when you wake up?"],
      relevantInventions: ["Alarm Clock", "Glasses", "Electric Light Bulb"]
    },
    bathroom: {
      question: "Time to use the bathroom and get cleaned up! Describe what you do.",
      followUp: "Anything else in the bathroom?",
      hints: ["How do you wash yourself?", "What about your teeth?", "Where does the water come from?"],
      relevantInventions: ["Indoor Plumbing", "Toilet Paper", "Toothbrush"]
    },
    breakfast: {
      question: "Now it's breakfast time! What do you eat and how do you prepare it?",
      followUp: "How else do you get your food ready?",
      hints: ["Where do you keep your food cold?", "How do you heat things up quickly?", "What do you drink?"],
      relevantInventions: ["Refrigerator", "Microwave Oven", "Canned Food"]
    },
    travel: {
      question: "Time to head out! How do you get to school or your destination?",
      followUp: "What helps you along the way?",
      hints: ["How do you know which way to go?", "What if it's raining?", "How do you stay safe in a car?"],
      relevantInventions: ["Bicycle", "GPS Navigation", "Umbrella", "Seat Belts", "Rubber Tires"]
    }
  }

  const stages = ['morning', 'bathroom', 'breakfast', 'travel']

  const findInventionsInText = (text) => {
    const found = []
    const lowerText = text.toLowerCase()

    for (const [inventionName, keywords] of Object.entries(inventionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          const invention = inventions.find(i => i.name === inventionName)
          if (invention && !found.find(f => f.id === invention.id)) {
            found.push(invention)
          }
          break
        }
      }
    }
    return found
  }

  const startJourney = () => {
    setStage('morning')
    setCurrentPrompt(prompts.morning)
    setConversation([{
      type: 'system',
      text: prompts.morning.question
    }])
    setDiscoveredInventions([])
    setMissedInventions([])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userInput.trim()) return

    const found = findInventionsInText(userInput)
    const newDiscovered = found.filter(f => !discoveredInventions.find(d => d.id === f.id))

    // Add user message
    const newConversation = [...conversation, { type: 'user', text: userInput }]

    // Add response about found inventions
    if (newDiscovered.length > 0) {
      const inventionNames = newDiscovered.map(i => i.name).join(', ')
      newConversation.push({
        type: 'discovery',
        text: `You mentioned: ${inventionNames}!`,
        inventions: newDiscovered
      })
      setDiscoveredInventions([...discoveredInventions, ...newDiscovered])
    }

    setConversation(newConversation)
    setUserInput('')

    // Check if we should move to next stage or ask follow-up
    setTimeout(() => {
      const currentStageIndex = stages.indexOf(stage)
      const stageInventions = currentPrompt.relevantInventions
      const foundForStage = [...discoveredInventions, ...newDiscovered].filter(d =>
        stageInventions.includes(d.name)
      )

      if (foundForStage.length >= 2 || newConversation.filter(c => c.type === 'user').length >= 2) {
        // Check for missed inventions in this stage
        const missed = stageInventions
          .filter(name => !foundForStage.find(f => f.name === name))
          .map(name => inventions.find(i => i.name === name))
          .filter(Boolean)

        if (missed.length > 0) {
          setConversation(prev => [...prev, {
            type: 'missed',
            text: `Did you think about these?`,
            inventions: missed
          }])
          setMissedInventions(prev => [...prev, ...missed])
        }

        // Move to next stage after a delay
        setTimeout(() => {
          if (currentStageIndex < stages.length - 1) {
            const nextStage = stages[currentStageIndex + 1]
            setStage(nextStage)
            setCurrentPrompt(prompts[nextStage])
            setConversation(prev => [...prev, {
              type: 'system',
              text: prompts[nextStage].question
            }])
          } else {
            setStage('results')
          }
        }, missed.length > 0 ? 2000 : 500)
      } else {
        // Ask follow-up or give hint
        const hint = currentPrompt.hints[Math.floor(Math.random() * currentPrompt.hints.length)]
        setConversation(prev => [...prev, {
          type: 'system',
          text: newDiscovered.length > 0 ? currentPrompt.followUp : hint
        }])
      }
    }, 500)
  }

  const skipToNext = () => {
    const currentStageIndex = stages.indexOf(stage)
    const stageInventions = currentPrompt.relevantInventions
    const foundForStage = discoveredInventions.filter(d => stageInventions.includes(d.name))

    // Add missed inventions
    const missed = stageInventions
      .filter(name => !foundForStage.find(f => f.name === name))
      .map(name => inventions.find(i => i.name === name))
      .filter(Boolean)

    if (missed.length > 0) {
      setMissedInventions(prev => [...prev, ...missed])
    }

    if (currentStageIndex < stages.length - 1) {
      const nextStage = stages[currentStageIndex + 1]
      setStage(nextStage)
      setCurrentPrompt(prompts[nextStage])
      setConversation(prev => [...prev, {
        type: 'system',
        text: prompts[nextStage].question
      }])
    } else {
      setStage('results')
    }
  }

  const conversationEndRef = useRef(null)
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  if (stage === 'intro') {
    return (
      <div className="day-without-view">
        <div className="intro-card">
          <div className="intro-icon">🌅</div>
          <h2>A Day Without Modern Inventions</h2>
          <p>
            Let's walk through your morning routine together. Tell me what you normally do,
            and I'll show you what life was like before those everyday things existed!
          </p>
          <div className="intro-preview">
            <span>🛏️ Waking up</span>
            <span>→</span>
            <span>🚿 Bathroom</span>
            <span>→</span>
            <span>🍳 Breakfast</span>
            <span>→</span>
            <span>🚗 Travel</span>
          </div>
          <button className="start-btn" onClick={startJourney}>
            Start My Morning →
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'results') {
    const allFound = [...discoveredInventions]
    const allMissed = missedInventions.filter(m => !allFound.find(f => f.id === m.id))

    return (
      <div className="day-without-view">
        <div className="results-card">
          <h2>🎉 Journey Complete!</h2>
          <p className="results-summary">
            You discovered <strong>{allFound.length}</strong> inventions in your morning routine!
          </p>

          {allFound.length > 0 && (
            <div className="results-section">
              <h3>✨ Inventions You Found:</h3>
              <div className="results-grid">
                {allFound.map(inv => (
                  <button
                    key={inv.id}
                    className="result-item found"
                    onClick={() => onSelectInvention(inv)}
                  >
                    <span className="result-emoji">{inv.emoji}</span>
                    <span className="result-name">{inv.name}</span>
                    <span className="result-year">{inv.year}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {allMissed.length > 0 && (
            <div className="results-section">
              <h3>🤔 Others You Might Use:</h3>
              <div className="results-grid">
                {allMissed.map(inv => (
                  <button
                    key={inv.id}
                    className="result-item missed"
                    onClick={() => onSelectInvention(inv)}
                  >
                    <span className="result-emoji">{inv.emoji}</span>
                    <span className="result-name">{inv.name}</span>
                    <span className="result-year">{inv.year}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="results-cta">Click any invention to learn what life was like before it existed!</p>

          <button className="start-btn" onClick={() => setStage('intro')}>
            🔄 Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="day-without-view">
      <div className="chat-container">
        <div className="stage-indicator">
          {stages.map((s, idx) => (
            <div key={s} className={`stage-dot ${s === stage ? 'active' : ''} ${stages.indexOf(stage) > idx ? 'completed' : ''}`}>
              {s === 'morning' && '🛏️'}
              {s === 'bathroom' && '🚿'}
              {s === 'breakfast' && '🍳'}
              {s === 'travel' && '🚗'}
            </div>
          ))}
        </div>

        <div className="conversation">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              {msg.type === 'system' && (
                <div className="system-message">
                  <span className="bot-avatar">🕰️</span>
                  <p>{msg.text}</p>
                </div>
              )}
              {msg.type === 'user' && (
                <div className="user-message">
                  <p>{msg.text}</p>
                </div>
              )}
              {msg.type === 'discovery' && (
                <div className="discovery-message">
                  <p>{msg.text}</p>
                  <div className="discovery-items">
                    {msg.inventions.map(inv => (
                      <button
                        key={inv.id}
                        className="discovery-tag"
                        onClick={() => onSelectInvention(inv)}
                      >
                        {inv.emoji} {inv.name} ({inv.year})
                      </button>
                    ))}
                  </div>
                  <p className="discovery-prompt">
                    Click to see what life was like before!
                  </p>
                </div>
              )}
              {msg.type === 'missed' && (
                <div className="missed-message">
                  <p>{msg.text}</p>
                  <div className="discovery-items">
                    {msg.inventions.map(inv => (
                      <button
                        key={inv.id}
                        className="discovery-tag missed"
                        onClick={() => onSelectInvention(inv)}
                      >
                        {inv.emoji} {inv.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={conversationEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type what you do..."
            autoFocus
          />
          <button type="submit" disabled={!userInput.trim()}>
            Send
          </button>
        </form>

        <button className="skip-btn" onClick={skipToNext}>
          Skip to {stages.indexOf(stage) < stages.length - 1 ? 'next part' : 'results'} →
        </button>
      </div>
    </div>
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
        <h2>🗺️ Explore Inventions Through Time</h2>
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

function TimeChallengeView() {
  const [gameState, setGameState] = useState('intro')
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
  const [feedback, setFeedback] = useState(null)
  const [hints, setHints] = useState([])
  const [completed, setCompleted] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const startGame = () => {
    const shuffled = inventions
      .filter(inv => typeof inv.year === 'number')
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)

    // Shuffle until not sorted
    let displayOrder = [...shuffled]
    const correctOrder = [...shuffled].sort((a, b) => getYear(a.year) - getYear(b.year))
    while (JSON.stringify(displayOrder.map(d => d.id)) === JSON.stringify(correctOrder.map(c => c.id))) {
      displayOrder = [...shuffled].sort(() => Math.random() - 0.5)
    }

    setItems(displayOrder)
    setFeedback(null)
    setHints([])
    setCompleted(false)
    setGameState('playing')
  }

  const checkOrder = () => {
    const years = items.map(item => getYear(item.year))
    const sortedYears = [...years].sort((a, b) => a - b)

    // Check each position
    const newHints = items.map((item, index) => {
      const correctIndex = sortedYears.indexOf(getYear(item.year))
      if (index === correctIndex) {
        return 'correct'
      } else if (index < correctIndex) {
        return 'move-right'
      } else {
        return 'move-left'
      }
    })

    setHints(newHints)

    const correctCount = newHints.filter(h => h === 'correct').length

    if (correctCount === items.length) {
      setCompleted(true)
      setFeedback({ type: 'success', message: '🎉 Perfect! You got them all in order!' })
    } else if (correctCount >= 3) {
      setFeedback({ type: 'close', message: `Almost there! ${correctCount} out of ${items.length} are in the right spot. Look at the arrows for hints!` })
    } else if (correctCount >= 1) {
      setFeedback({ type: 'progress', message: `Good start! ${correctCount} in the right spot. The arrows show which way to move the others.` })
    } else {
      setFeedback({ type: 'hint', message: "Not quite! The arrows show which direction each item needs to move." })
    }
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
    setHints([]) // Clear hints when moving
    setFeedback(null)
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
    setHints([]) // Clear hints when moving
    setFeedback(null)
  }

  if (gameState === 'intro') {
    return (
      <div className="sort-view">
        <div className="sort-intro">
          <h2>🎯 Order Through Time</h2>
          <p>Can you put these inventions in order from oldest to newest?</p>
          <div className="sort-instructions">
            <p>📱 Drag and drop the cards, or use the arrow buttons to rearrange them.</p>
            <p>✓ When you check your answer, you'll get hints showing which items need to move!</p>
            <p>🎯 Green = correct position, arrows show which way to move others.</p>
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
              className={`sort-card ${draggedIndex === index ? 'dragging' : ''} ${hints[index] || ''}`}
              draggable={!completed}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {hints[index] && hints[index] !== 'correct' && (
                <div className={`hint-arrow ${hints[index]}`}>
                  {hints[index] === 'move-left' ? '← move left' : 'move right →'}
                </div>
              )}
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

      {feedback && (
        <div className={`sort-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {!completed ? (
        <button className="check-btn" onClick={checkOrder}>
          ✓ Check My Order
        </button>
      ) : (
        <div className="sort-complete">
          <h3>🎉 Well Done!</h3>
          <p>You figured out the correct order!</p>
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
  const [view, setView] = useState('day-without')
  const [selectedInvention, setSelectedInvention] = useState(null)

  return (
    <div className="app">
      <Header currentView={view} onNavigate={setView} />

      <main className="main">
        {view === 'day-without' && (
          <DayWithoutView onSelectInvention={setSelectedInvention} />
        )}
        {view === 'explore' && (
          <ExploreView onSelectInvention={setSelectedInvention} />
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
