import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';

const PokemonList = ({ setFoundPokemon }) => {
  const [pokemonList, setPokemonList] = useState([]);
  const [pokemonImages, setPokemonImages] = useState([]);
  const [dropdownItems, setDropdownItems] = useState(['heliolisk', 'virizion', 'tsareena']);
  const [pokemonPositions, setPokemonPositions] = useState({});
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=900');
        setPokemonList(response.data.results);
      } catch (error) {
        console.error('Error fetching Pokemon list:', error);
      }
    };

    fetchPokemonList();
  }, []);

  useEffect(() => {
    const fetchPokemonImages = async () => {
      const images = await Promise.all(
        pokemonList.map(async (pokemon) => {
          try {
            const response = await axios.get(pokemon.url);
            return response.data.sprites.front_default;
          } catch (error) {
            console.error('Error fetching Pokemon image:', error);
          }
        })
      );

      setPokemonImages(images);
    };

    fetchPokemonImages();
  }, [pokemonList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current.contains(event.target)) {
        setSelectedPokemon(null);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const storedPositions = localStorage.getItem('pokemonPositions');
    if (storedPositions) {
      setPokemonPositions(JSON.parse(storedPositions));
    }
  }, []);

  useEffect(() => {
    const initialPositions = {};
    const coordinatesArray = [];

    pokemonList.forEach((pokemon) => {
      const storedPosition = localStorage.getItem(pokemon.name);
      if (storedPosition) {
        initialPositions[pokemon.name] = JSON.parse(storedPosition);
      } else {
        const newPosition = getRandomPosition(pokemonPositions, coordinatesArray);
        initialPositions[pokemon.name] = newPosition;
        localStorage.setItem(pokemon.name, JSON.stringify(newPosition));
      }
    });

    setPokemonPositions(initialPositions);
  }, [pokemonList]);

  const getRandomPosition = (existingPositions, coordinatesArray) => {
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const minDistance = 1;

    while (true) {
      const x = Math.floor(Math.random() * (containerWidth - 80));
      const y = Math.floor(Math.random() * (containerHeight - 80));

      let isValidPosition = true;
      for (const position of Object.values(existingPositions)) {
        const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
        if (distance < minDistance) {
          isValidPosition = false;
          break;
        }
      }

      if (isValidPosition) {
        const isNewPositionValid = coordinatesArray.every((coord) => {
          const distance = Math.sqrt((coord.x - x) ** 2 + (coord.y - y) ** 2);
          return distance >= minDistance;
        });

        if (isNewPositionValid) {
          coordinatesArray.push({ x, y });
          return { x, y };
        }
      }
    }
  };

  const handlePokemonClick = (name) => {
    setSelectedPokemon(name);
    console.log(name)
  };
 const handleDropdownItemClick = (value) => {
  if (selectedPokemon === value) {
    setDropdownItems(prevItems => prevItems.filter(item => item !== value));
     setFoundPokemon((prevPokemon) => [...prevPokemon, value]);
  }
};




  const renderPokemon = () => {
    return pokemonList.map((pokemon, index) => {
      const { x, y } = pokemonPositions[pokemon.name] || getRandomPosition(pokemonPositions, []);

      const style = {
        left: `${x}px`,
        top: `${y}px`,
        height: 'fit-content',
        width: 'fit-content',
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
                left: `${x + 130}px`,
                top: `${y}px`,
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
