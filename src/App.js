import React from "react"
import Die from "./components/Die"
import { nanoid } from "nanoid"
import Confetti from 'react-confetti'
export default function App() {

  const [dice, setDice] = React.useState(allNewDice())
  const [tenzies, setTenzies] = React.useState(false)
  const [count, setCount] = React.useState(0)
  const [timer, setTimer] = React.useState(performance.now())
  const [highScore, setHighScore] = React.useState(
    JSON.parse(localStorage.getItem("highScore")) || 0
  )
  // localStorage.removeItem('highScore');
  // console.log(highScore)
  React.useEffect(() => {

    highScore && localStorage.setItem('highScore', JSON.stringify(highScore));
    const allHeld = dice.every(die => die.isHeld)
    const firstValue = dice[0].value
    const allSameValue = dice.every(die => die.value === firstValue)
    let seconds;
    if (allHeld && allSameValue) {
      setTenzies(true)
      setTimer(prevTime => {
        const timeDiff = performance.now() - prevTime;
        seconds = Math.floor(timeDiff / 1000);
        return seconds;
      })
      setHighScore(prevScore => {
        if (prevScore < seconds) {
          if (prevScore !== 0) {
            return prevScore;
          }
          localStorage.setItem('highScore', JSON.stringify(seconds));
        } else {
          localStorage.setItem('highScore', JSON.stringify(seconds));
          return seconds;
        }
      })
    }
  }, [dice, highScore])
  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid()
    }
  }

  function allNewDice() {
    const newDice = []
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie())
    }
    return newDice
  }

  function rollDice() {
    if (!tenzies) {
      setCount(prevCount => prevCount + 1);
      setDice(oldDice => oldDice.map(die => {
        return die.isHeld ?
          die :
          generateNewDie()
      }))
    } else {
      //reset
      setTimer(performance.now())
      setCount(0);
      setTenzies(false)
      setDice(allNewDice())
      setHighScore(highScore)
    }
  }

  function holdDice(id) {
    setDice(oldDice => oldDice.map(die => {
      return die.id === id ?
        { ...die, isHeld: !die.isHeld } :
        die
    }))
  }

  const diceElements = dice.map(die => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
    />
  ))
  const styles = {
    height: tenzies && "500px"
  }
  return (
    <main style={styles}>
      <div className="scores">
        {tenzies && <Confetti />}
        {tenzies && <small> Seconds : {timer}</small>}
        {tenzies && <small> Roll: {count}x</small>}
        <small>Highest score : {highScore} seconds</small>
      </div>
      <h1 className="title">Tenzies</h1>
      <p className="instructions">Roll until all dice are the same.
        Click each die to freeze it at its current value between rolls.</p>
      <div className="dice-container">
        {diceElements}
      </div>
      <button
        className="roll-dice"
        onClick={rollDice}
      >
        {tenzies ? "New Game" : "Roll"}
      </button>
    </main>
  )
}