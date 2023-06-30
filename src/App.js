import React, { useState, useEffect,  } from 'react';
import axios from 'axios';

import './App.css';
import PokemonList from './Pokemons';
import { Container, Navbar, Button, Modal } from 'react-bootstrap';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(null);
  const [time, setTime] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [pokemonImages, setPokemonImages] = useState([]);
  const pokemons = ['Heliolisk', 'Virizion', 'Tsareena'];
  const [foundPokemon, setFoundPokemon] = useState([]);
 const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
  



  useEffect(() => {
    const fetchPokemonImages = async () => {
      const images = await Promise.all(
        pokemons.map(async (pokemon) => {
          try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`);
            return response.data.sprites.front_default;
          } catch (error) {
            console.error('Error fetching Pokemon image:', error);
            return null;
          }
        })
      );

      setPokemonImages(images);
    };

    fetchPokemonImages();
  }, [pokemons]);
  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleStartGame = () => {
    setShowModal(false);
    setIsGameStarted(true);
    startTimer();
  };

  const startTimer = () => {
    setTimer(
      setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000)
    );
  };

  useEffect(() => {
    return () => {
      clearInterval(timer);
    };
  }, [timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showModal]);

  useEffect(() => {
    if (foundPokemon.length === pokemons.length) {
      clearInterval(timer);
      setShowCongratulationsModal(true);
    }
  }, [foundPokemon, pokemons.length, timer]);
  return (
    <div>
      <Navbar bg="danger" variant="dark" sticky="top" className="justify-content-between">
  <Navbar.Brand className="ms-5 text-center" style={{ fontSize: '1.2rem' }}>
    Where's that Pokemon??
  </Navbar.Brand>

  <div className="d-flex align-items-center">
  {isGameStarted && pokemonImages.map((image, index) => (
    image && (
      <div key={index} style={{ color: 'white' }} className={`d-flex flex-column align-items-center ms-5 ${foundPokemon.includes(pokemons[index].toLowerCase()) ? 'found-pokemon' : ''}`}>
        <img
          style={{ height: '50px', width: '50px' }}
          src={image}
          alt={`Pokemon ${index + 1}`}
          className="pokemon-image"
        />
        <span className="pokemon-name">{pokemons[index]}</span>
      </div>
    )
  ))}
</div>



  {isGameStarted && (
    <div className="timer" style={{ color: 'white', marginLeft: 'auto', marginRight: '20px' }}>
      Timer: {formatTime(time)}
    </div>
  )}
</Navbar>


      
<Modal  centered onHide={() => setShowModal(false)} show={showModal} className="custom-modal">
  <Modal.Header className="justify-content-center">
    <Modal.Title>Find this 3 Pokemons!</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {pokemonImages.map((image, index) => (
      image && (
        <div key={index} className="d-flex align-items-center justify-content-center mb-3">
          <img
            style={{ height: '80px', width: '80px', fontSize: '2rem' }}
            src={image}
            alt={`Pokemon ${index + 1}`}
            className="pokemon-image"
          />
          <span style={{ fontSize: '2rem' }}className="ms-2">{pokemons[index]}</span>
        </div>
      )
    ))}
  </Modal.Body>
  <Modal.Footer className="justify-content-center">
    <Button variant="primary" onClick={handleStartGame}>
      Start the Game!
    </Button>
  </Modal.Footer>
</Modal>


      

     
        <PokemonList setFoundPokemon={setFoundPokemon} />

       <Modal show={showCongratulationsModal} onHide={() => setShowCongratulationsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Congratulations!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontSize: '1.5rem'}}>
          You found all the Pokemons in {formatTime(time)}!
        </Modal.Body>
        <Modal.Footer className='justify-content-center'>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Play Again
          </Button>
        </Modal.Footer>
      </Modal>
      
      <footer className="bg-dark text-white py-2 fixed-bottom">
        <Container className="d-flex align-items-center justify-content-center">
          <p className="m-0 text-center" style={{ fontSize: '1rem' }}>
            Rights Zdeslav Zaksek
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
