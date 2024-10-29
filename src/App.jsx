import React, { useEffect, useState } from "react";
import md5 from "crypto-js/md5";
import "./App.css";
import CharacterBarChart from "./components/Characterchart.jsx";


const API_KEY = import.meta.env.VITE_APP_API_KEY;
const PRIVATE_API_KEY = import.meta.env.VITE_SERVER_API_KEY;

const CharactersList = () => {
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [mostFeaturedCharacter, setMostFeaturedCharacter] = useState(null);
  const [leastFeaturedCharacter, setLeastFeaturedCharacter] = useState(null);
  const [averageSeriesPerCharacter, setAverageSeriesPerCharacter] = useState(0);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [eventOptions, setEventOptions] = useState([]);

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [characterDetails, setCharacterDetails] = useState(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);


  const publicKey = API_KEY;
  const privateKey = PRIVATE_API_KEY;

  useEffect(() => {
    const fetchCharacters = async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const hash = md5(timestamp + privateKey + publicKey).toString();
      const url = `https://gateway.marvel.com/v1/public/characters?ts=1&apikey=f86505f2d7acb886ab1cfc46bf61712c&hash=fce6ed1d9223b9f8d6b5a4ceb7768b4f`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 200) {
          const charactersData = data.data.results;
          setCharacters(charactersData);
          setTotalCharacters(charactersData.length);

          const sortedCharacters = charactersData.sort(
            (a, b) => b.comics.available - a.comics.available
          );
          setMostFeaturedCharacter(sortedCharacters[0]);
          setLeastFeaturedCharacter(sortedCharacters[sortedCharacters.length - 1]);

          const totalSeries = charactersData.reduce(
            (acc, character) => acc + character.series.available,
            0
          );
          setAverageSeriesPerCharacter(totalSeries / charactersData.length);

          const seriesSet = new Set();
          const eventSet = new Set();
          charactersData.forEach(character => {
            character.series.items.forEach(series => seriesSet.add(series.name));
            character.events.items.forEach(event => eventSet.add(event.name));
          });

          setSeriesOptions(Array.from(seriesSet));
          setEventOptions(Array.from(eventSet));
        } else {
          console.error("Error fetching characters:", data.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleCharacterClick = (character) => {
    // If the same character is clicked, toggle the details view off

    setCharacterDetails(prevDetails => (prevDetails && prevDetails.id === character.id ? null : character));
    setSelectedCharacterId(character.id);
  };

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedSeries ? character.series.items.some(series => series.name === selectedSeries) : true) &&
    (selectedEvent ? character.events.items.some(event => event.name === selectedEvent) : true)
  );

  return (
    <div className="app-container">
      <div className="sidebar">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#comics">Comics</a></li>
          <li><a href="#favorites">Favorites</a></li>
        </ul>
      </div>

      <div className="main-content">
        <header className="app-header">
          <h1>Marvel Dashboard</h1>
        </header>

        <div className="stats">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="card">
                <h2>Total Characters: {totalCharacters}</h2>
                <h3>Most Featured Character: {mostFeaturedCharacter?.name} ({mostFeaturedCharacter?.comics.available} comics)</h3>
                <h3>Least Featured Character: {leastFeaturedCharacter?.name} ({leastFeaturedCharacter?.comics.available} comics)</h3>
                <h3>Average Series per Character: {averageSeriesPerCharacter.toFixed(2)}</h3>
              </div>

              <div className="filters">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by character name..."
                />
                <select onChange={(e) => setSelectedSeries(e.target.value)}>
                  <option value="">Select Series</option>
                  {seriesOptions.map(series => (
                    <option key={series} value={series}>{series}</option>
                  ))}
                </select>
                <select onChange={(e) => setSelectedEvent(e.target.value)}>
                  <option value="">Select Event</option>
                  {eventOptions.map(event => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>

              


              <div className="character-list">
                {filteredCharacters.map((character) => (
                  <div
                    key={character.id}
                    onClick={() => handleCharacterClick(character)}
                    className="character-item"
                  >
                    <img
                      src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                      alt={character.name}
                    />
                    <h3>{character.name}</h3>
                  </div>
                ))}
              </div>

              {characterDetails && (
                <div className="character-details">
                  <h2>{characterDetails.name}</h2>
                  <p>{characterDetails.description || "No description available."}</p>
                  <p>Comics: {characterDetails.comics.available}</p>
                  <p>Stories: {characterDetails.stories.available}</p>
                  <p>Events: {characterDetails.events.available}</p>
                  <p>Series: {characterDetails.series.available}</p>
                  <h4>Comics Featuring {characterDetails.name}:</h4>
                  <ul>
                    {characterDetails.comics.items.map(comic => (
                      <li key={comic.resourceURI}>{comic.name}</li>
                    ))}
                  </ul>
                  <button onClick={() => setCharacterDetails(null)}>Close</button>
                </div>
              )}

             
            <div className="character-bar-chart">
              <h3>Comics per Character</h3>
              <CharacterBarChart characters={characters} />
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharactersList;
