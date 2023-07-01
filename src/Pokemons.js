import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import { firestore } from './firebase';

const PokemonList = ({ setFoundPokemon }) => {
  const [pokemonList, setPokemonList] = useState([]);
  const [pokemonImages, setPokemonImages] = useState([]);
  const [dropdownItems, setDropdownItems] = useState(['furfrou', 'registeel', 'genesect']);
  const [pokemonPositions, setPokemonPositions] = useState({});
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const containerRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const [dropdownMenuWidth, setDropdownMenuWidth] = useState(0);

  useEffect(() => {
    if (dropdownMenuRef.current) {
      const width = dropdownMenuRef.current.offsetWidth;
      setDropdownMenuWidth(width);
    }
  }, [dropdownItems]);

  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=700');
        setPokemonList(response.data.results);
        fetchPokemonImages(response.data.results);
      } catch (error) {
        console.error('Error fetching Pokemon list:', error);
      }
    };

    fetchPokemonList();
  }, []);

  
  const fetchPokemonImages = async (pokemonList) => {
    const images = await Promise.all(
      pokemonList.map(async (pokemon) => {
        try {
          const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
          return response.data.sprites.front_default;
        } catch (error) {
          console.error(`Error fetching image for ${pokemon.name}:`, error);
          return null;
        }
      })
    );

    setPokemonImages(images);
  };
  useEffect(() => {
  fetchPokemonImages(pokemonList);
}, [pokemonList]);
 

  useEffect(() => {
    const fetchPokemonPositions = async () => {
      const collectionRef = firestore.collection('pokemonPositions');
      const collectionSnapshot = await collectionRef.get();

      const positions = collectionSnapshot.docs.reduce((acc, doc) => {
        const { x, y } = doc.data();
        return { ...acc, [doc.id]: { x, y } };
      }, {});

      setPokemonPositions(positions);
    };

    fetchPokemonPositions();
  }, []);

   const getRandomPosition = useCallback((pokemonName) => {
  const existingPosition = pokemonPositions[pokemonName];
  if (existingPosition) {
    return existingPosition;
  } else {
    const x = Math.floor(Math.random() * 100) + 1;
    const y = Math.floor(Math.random() * 100) + 1;
    return { x, y };
  }
}, [pokemonPositions]);

  useEffect(() => {
    const updatePokemonPosition = async (pokemonName) => {
      const collectionRef = firestore.collection('pokemonPositions');
      const { x, y } = pokemonPositions[pokemonName] || getRandomPosition(pokemonName);
      const docRef = collectionRef.doc(pokemonName);
      await docRef.set({ x, y });
    };

    const updatePokemonPositions = async () => {
      for (const pokemon of pokemonList) {
        await updatePokemonPosition(pokemon.name);
      }
    };

    updatePokemonPositions();
  }, [pokemonList, pokemonPositions, getRandomPosition]);

 

  const handlePokemonClick = (name) => {
    setSelectedPokemon(name);
    console.log(name);
  };

  const handleDropdownItemClick = (value) => {
    if (selectedPokemon === value) {
      setDropdownItems((prevItems) => prevItems.filter((item) => item !== value));
      setFoundPokemon((prevPokemon) => [...prevPokemon, value]);
    }
  };

  const renderPokemon = () => {
    return pokemonList.map((pokemon, index) => {
      const { x, y } = pokemonPositions[pokemon.name] || getRandomPosition(pokemon.name);

      const style = {
        left: `${x}vw`,
        top: `${y}vh`,
        height: '13vh',
        width: '13wv',
        cursor: 'pointer',
        position: 'absolute',
        zIndex: index + 1,
        display: 'inline-block',
        filter:
          selectedPokemon === pokemon.name
            ? 'brightness(1.2) contrast(1.2) saturate(1.5) sepia(0.5) hue-rotate(0deg) opacity(0.8)'
            : 'none',
      };

      const isSelected = selectedPokemon === pokemon.name;

      return (
        <div key={pokemon.name}>
          <img
            onClick={() => handlePokemonClick(pokemon.name)}
            src={pokemonImages[index]}
            alt=""
            style={style}
          />
          {isSelected && (
            <Dropdown.Menu
              show
              className="dropdown-menu-right"
              style={{
                padding: '0',
                backgroundColor: 'gray',
                position: 'absolute',
                left: `${
                  x + 7 + dropdownMenuWidth > 100 ? x - dropdownMenuWidth - 7 : x + 7
                }vw`,
                top: `${y}vh`,
              }}
            >
              {dropdownItems.map((item, index) => (
                <Dropdown.Item
                  key={index}
                  style={{ backgroundColor: 'gray', color: 'white', border: '0.5px solid white' }}
                  onClick={() => handleDropdownItemClick(item)}
                >
                  {item}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        </div>
      );
    });
  };

  return (
    <div ref={containerRef} className="backgroundCont" style={{ zIndex: 100 }}>
      {renderPokemon()}
    </div>
  );
};

export default PokemonList;
