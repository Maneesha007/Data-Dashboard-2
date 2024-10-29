import React, { useEffect, useState } from "react";
import md5 from "crypto-js/md5";
import "./App.css";

const API_KEY = import.meta.env.VITE_APP_API_KEY;
const PRIVATE_API_KEY = import.meta.env.VITE_SERVER_API_KEY;

const ComicsList = () => {
  const [comics, setComics] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedComicType, setSelectedComicType] = useState("");

  const [totalCharacters, setTotalCharacters] = useState(0);
  const [mostFeaturedCharacter, setMostFeaturedCharacter] = useState(null);
  const [leastFeaturedCharacter, setLeastFeaturedCharacter] = useState(null);
  const [averageSeriesPerCharacter, setAverageSeriesPerCharacter] = useState(0);

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

          // Calculate most and least featured characters
          const sortedCharacters = charactersData.sort(
            (a, b) => b.comics.available - a.comics.available
          );
          setMostFeaturedCharacter(sortedCharacters[0]);
          setLeastFeaturedCharacter(sortedCharacters[sortedCharacters.length - 1]);

          // Calculate average series per character
          const totalSeries = charactersData.reduce(
            (acc, character) => acc + character.series.available,
            0
          );
          setAverageSeriesPerCharacter(totalSeries / charactersData.length);
        } else {
          console.error("Error fetching characters:", data.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComics = async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const hash = md5(timestamp + privateKey + publicKey).toString();
      const url = `http://gateway.marvel.com/v1/public/comics?ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 200) {
          setComics(data.data.results);
        } else {
          console.error("Error fetching comics:", data.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchCharacters();
    fetchComics();
  }, []);

  const filteredComics = comics.filter((comic) => {
    return (
      comic.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCharacter
        ? comic.characters.items.some(
            (character) => character.name === selectedCharacter
          )
        : true) &&
      (selectedComicType ? comic.type === selectedComicType : true)
    );
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Marvel Dashboard</h1>
      </header>

      <nav className="navbar">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#comics">Comics</a></li>
          <li><a href="#favorites">Favorites</a></li>
        </ul>
      </nav>

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
                placeholder="Search by title..."
              />

              <select onChange={(e) => setSelectedCharacter(e.target.value)}>
                <option value="">Select Character</option>
                {characters.map((character) => (
                  <option key={character.id} value={character.name}>
                    {character.name}
                  </option>
                ))}
              </select>

              <select onChange={(e) => setSelectedComicType(e.target.value)}>
                <option value="">Select Comic Type</option>
                <option value="comic">Comic</option>
                <option value="graphic novel">Graphic Novel</option>
                <option value="trade paperback">Trade Paperback</option>
              </select>
            </div>

            <div className="comics-list">
              {filteredComics.map((comic) => (
                <div className="comic-card" key={comic.id}>
                  <h3>{comic.title}</h3>
                  <img
                    src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                    alt={comic.title}
                    className="comic-image"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComicsList;
