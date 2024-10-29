import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import md5 from "crypto-js/md5";

const CharacterDetail = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const publicKey = import.meta.env.VITE_APP_API_KEY;
  const privateKey = import.meta.env.VITE_SERVER_API_KEY;

  useEffect(() => {
    const fetchCharacter = async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const hash = md5(timestamp + privateKey + publicKey).toString();
      const url = `https://gateway.marvel.com/v1/public/characters/${id}?ts=1&apikey=f86505f2d7acb886ab1cfc46bf61712c&hash=fce6ed1d9223b9f8d6b5a4ceb7768b4f}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setCharacter(data.data.results[0]);
      } catch (error) {
        console.error("Error fetching character details:", error);
      }
    };

    fetchCharacter();
  }, [id]);

  if (!character) return <p>Loading...</p>;

  return (
    <div>
      <h2>{character.name}</h2>
      <img src={`${character.thumbnail.path}.${character.thumbnail.extension}`} alt={character.name} />
      <p>{character.description}</p>
    </div>
  );
};

export default CharacterDetail;
